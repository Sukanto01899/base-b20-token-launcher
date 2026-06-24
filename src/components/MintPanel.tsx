"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUnits, isAddress, parseUnits, type Address } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { DEFAULT_ADMIN_ROLE, MINT_ROLE, NO_SUPPLY_CAP, b20TokenAbi, formatContractError } from "@/lib/b20";
import { getDeployedTokens } from "@/lib/storage";

export function MintPanel() {
  const { address: account } = useAccount();
  const savedTokens = useMemo(() => getDeployedTokens(), []);

  const [selectedAddress, setSelectedAddress] = useState<string>(savedTokens[0]?.address ?? "");
  const [manualMode, setManualMode] = useState(savedTokens.length === 0);
  const [manualAddress, setManualAddress] = useState("");
  const [amount, setAmount] = useState("");

  const tokenAddress = manualMode ? manualAddress : selectedAddress;
  const isValidAddress = isAddress(tokenAddress);

  const {
    data: tokenData,
    isLoading: isReading,
    isError: isReadError,
    refetch,
  } = useReadContracts({
    contracts: [
      { address: tokenAddress as Address, abi: b20TokenAbi, functionName: "name" },
      { address: tokenAddress as Address, abi: b20TokenAbi, functionName: "symbol" },
      { address: tokenAddress as Address, abi: b20TokenAbi, functionName: "decimals" },
      { address: tokenAddress as Address, abi: b20TokenAbi, functionName: "totalSupply" },
      { address: tokenAddress as Address, abi: b20TokenAbi, functionName: "supplyCap" },
      {
        address: tokenAddress as Address,
        abi: b20TokenAbi,
        functionName: "hasRole",
        args: account ? [MINT_ROLE, account] : undefined,
      },
      {
        address: tokenAddress as Address,
        abi: b20TokenAbi,
        functionName: "hasRole",
        args: account ? [DEFAULT_ADMIN_ROLE, account] : undefined,
      },
    ],
    query: { enabled: isValidAddress && !!account },
  });

  const [grantAddress, setGrantAddress] = useState("");

  useEffect(() => {
    setAmount("");
    setGrantAddress(account ?? "");
  }, [tokenAddress, account]);

  const [name, symbol, decimals, totalSupply, supplyCap, hasMintRole, isAdmin] = tokenData ?? [];
  const tokenLoaded =
    name?.status === "success" &&
    symbol?.status === "success" &&
    decimals?.status === "success" &&
    totalSupply?.status === "success" &&
    supplyCap?.status === "success" &&
    hasMintRole?.status === "success" &&
    isAdmin?.status === "success";

  const isUnlimited = tokenLoaded && supplyCap!.result === NO_SUPPLY_CAP;
  const remaining = tokenLoaded && !isUnlimited ? supplyCap!.result! - totalSupply!.result! : null;

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const {
    writeContract: writeGrant,
    data: grantHash,
    isPending: isGrantPending,
    error: grantError,
  } = useWriteContract();
  const { isLoading: isGrantConfirming, isSuccess: isGrantSuccess } = useWaitForTransactionReceipt({
    hash: grantHash,
  });

  useEffect(() => {
    if (isGrantSuccess) refetch();
  }, [isGrantSuccess, refetch]);

  function handleMax() {
    if (!tokenLoaded || remaining === null) return;
    setAmount(formatUnits(remaining, decimals!.result!));
  }

  function handleGrant() {
    if (!tokenLoaded || !isAddress(tokenAddress) || !isAddress(grantAddress)) return;
    writeGrant({
      address: tokenAddress,
      abi: b20TokenAbi,
      functionName: "grantRole",
      args: [MINT_ROLE, grantAddress],
    });
  }

  function handleMint() {
    if (!account || !tokenLoaded || !isAddress(tokenAddress)) return;
    const amountBigInt = parseUnits(amount || "0", decimals!.result!);
    writeContract({
      address: tokenAddress,
      abi: b20TokenAbi,
      functionName: "mint",
      args: [account, amountBigInt],
    });
  }

  const amountBigInt = tokenLoaded && amount ? safeParseUnits(amount, decimals!.result!) : null;
  const exceedsCap = remaining !== null && amountBigInt !== null && amountBigInt > remaining;
  const canMint =
    tokenLoaded &&
    hasMintRole!.result === true &&
    amountBigInt !== null &&
    amountBigInt > 0n &&
    !exceedsCap &&
    !isPending &&
    !isConfirming;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5">
      {!manualMode && savedTokens.length > 0 ? (
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Token
          <select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
          >
            {savedTokens.map((t) => (
              <option key={t.address} value={t.address}>
                {t.symbol} — {t.address.slice(0, 6)}...{t.address.slice(-4)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setManualMode(true)}
            className="mt-1 self-start text-xs text-primary underline"
          >
            Enter a different address
          </button>
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Token contract address
          <input
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value.trim())}
            placeholder="0x..."
            className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
          />
          {savedTokens.length > 0 && (
            <button
              type="button"
              onClick={() => setManualMode(false)}
              className="mt-1 self-start text-xs text-primary underline"
            >
              Choose from your deployed tokens
            </button>
          )}
        </label>
      )}

      {tokenAddress && !isValidAddress && (
        <p className="text-xs text-red-600">That doesn&apos;t look like a valid address.</p>
      )}

      {isValidAddress && isReading && <p className="text-sm text-zinc-500">Reading token...</p>}

      {isValidAddress && isReadError && !isReading && (
        <p className="text-sm text-red-600">
          Couldn&apos;t read this address as a B20 token. Double-check it&apos;s correct and on the right network.
        </p>
      )}

      {tokenLoaded && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3">
          <div className="text-sm font-medium text-foreground">
            {name!.result} ({symbol!.result})
          </div>
          <div className="text-xs text-zinc-500">
            Minted so far: {formatUnits(totalSupply!.result!, decimals!.result!)}
            {isUnlimited ? " (no supply cap)" : ` / ${formatUnits(supplyCap!.result!, decimals!.result!)}`}
          </div>

          {!hasMintRole!.result && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-red-600">
                This address does not have MINT_ROLE for this token — you cannot mint. Grant MINT_ROLE first.
              </p>

              {isAdmin!.result && (
                <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3">
                  <p className="text-xs text-zinc-500">
                    You hold the admin role for this token — grant MINT_ROLE to an address:
                  </p>
                  <input
                    value={grantAddress}
                    onChange={(e) => setGrantAddress(e.target.value.trim())}
                    placeholder="0x..."
                    className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGrant}
                    disabled={!isAddress(grantAddress) || isGrantPending || isGrantConfirming}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                  >
                    {isGrantPending
                      ? "Confirm in wallet..."
                      : isGrantConfirming
                        ? "Granting..."
                        : "Grant MINT_ROLE"}
                  </button>
                  {grantError && <p className="text-xs text-red-600">{formatContractError(grantError)}</p>}
                  {isGrantSuccess && <p className="text-xs text-emerald-700">Granted — you can mint now.</p>}
                </div>
              )}
            </div>
          )}

          {hasMintRole!.result && (
            <>
              <label className="flex flex-col gap-1 text-sm text-foreground">
                Amount
                <div className="flex gap-2">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                  {!isUnlimited && (
                    <button
                      type="button"
                      onClick={handleMax}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:border-primary hover:text-primary"
                    >
                      Max
                    </button>
                  )}
                </div>
              </label>

              {exceedsCap && <p className="text-xs text-red-600">That exceeds the remaining supply cap.</p>}

              <button
                onClick={handleMint}
                disabled={!canMint}
                className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isPending ? "Confirm in wallet..." : isConfirming ? "Minting..." : "Mint"}
              </button>

              {writeError && <p className="text-sm text-red-600">{formatContractError(writeError)}</p>}

              {isSuccess && (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                  Minted successfully.
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setAmount("");
                      refetch();
                    }}
                    className="ml-2 underline"
                  >
                    Mint more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function safeParseUnits(value: string, decimals: number): bigint | null {
  try {
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
}
