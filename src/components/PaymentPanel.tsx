"use client";

import { useEffect, useMemo, useState } from "react";
import { formatUnits, isAddress, parseUnits, stringToHex, type Address, type Hex } from "viem";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { BUILDER_CODE_DATA_SUFFIX, b20TokenAbi, formatContractError } from "@/lib/b20";
import { getDeployedTokens } from "@/lib/storage";

function safeMemoToHex(memo: string): Hex | null {
  if (!memo) return "0x0000000000000000000000000000000000000000000000000000000000000000";
  try {
    return stringToHex(memo, { size: 32 });
  } catch {
    return null;
  }
}

function safeParseUnits(value: string, decimals: number): bigint | null {
  try {
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
}

export function PaymentPanel() {
  const { address: account } = useAccount();
  const savedTokens = useMemo(() => getDeployedTokens(), []);

  const [selectedAddress, setSelectedAddress] = useState<string>(savedTokens[0]?.address ?? "");
  const [manualMode, setManualMode] = useState(savedTokens.length === 0);
  const [manualAddress, setManualAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

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
      {
        address: tokenAddress as Address,
        abi: b20TokenAbi,
        functionName: "balanceOf",
        args: account ? [account] : undefined,
      },
    ],
    query: { enabled: isValidAddress && !!account },
  });

  useEffect(() => {
    setAmount("");
    setMemo("");
  }, [tokenAddress]);

  const [name, symbol, decimals, balance] = tokenData ?? [];
  const tokenLoaded =
    name?.status === "success" &&
    symbol?.status === "success" &&
    decimals?.status === "success" &&
    balance?.status === "success";

  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const amountBigInt = tokenLoaded && amount ? safeParseUnits(amount, decimals!.result!) : null;
  const memoHex = safeMemoToHex(memo);
  const memoTooLong = memo.length > 0 && memoHex === null;
  const exceedsBalance = tokenLoaded && amountBigInt !== null && amountBigInt > balance!.result!;

  const canSend =
    tokenLoaded &&
    isAddress(recipient) &&
    amountBigInt !== null &&
    amountBigInt > 0n &&
    !exceedsBalance &&
    memoHex !== null &&
    !isPending &&
    !isConfirming;

  function handleMax() {
    if (!tokenLoaded) return;
    setAmount(formatUnits(balance!.result!, decimals!.result!));
  }

  function handleSend() {
    if (!canSend || !isAddress(tokenAddress) || !isAddress(recipient) || amountBigInt === null || !memoHex) return;
    writeContract({
      address: tokenAddress,
      abi: b20TokenAbi,
      functionName: "transferWithMemo",
      args: [recipient, amountBigInt, memoHex],
      dataSuffix: BUILDER_CODE_DATA_SUFFIX,
    });
  }

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
            Your balance: {formatUnits(balance!.result!, decimals!.result!)} {symbol!.result}
          </div>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Recipient address
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              placeholder="0x..."
              className="rounded-lg border border-zinc-200 px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Amount
            <div className="flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleMax}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:border-primary hover:text-primary"
              >
                Max
              </button>
            </div>
          </label>

          {exceedsBalance && <p className="text-xs text-red-600">That exceeds your balance.</p>}

          <label className="flex flex-col gap-1 text-sm text-foreground">
            Memo (optional — attached onchain with the transfer)
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="order-42"
              maxLength={32}
              className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
            />
          </label>

          {memoTooLong && <p className="text-xs text-red-600">Memo is too long — keep it within 32 bytes.</p>}

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "Confirm in wallet..." : isConfirming ? "Sending..." : "Send Payment"}
          </button>

          {writeError && <p className="text-sm text-red-600">{formatContractError(writeError)}</p>}

          {isSuccess && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              Payment sent successfully.
              {hash && (
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                >
                  View transaction
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  reset();
                  setAmount("");
                  setMemo("");
                  refetch();
                }}
                className="ml-2 underline"
              >
                Send another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
