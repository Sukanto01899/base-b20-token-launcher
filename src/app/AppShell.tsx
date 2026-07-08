"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatEther, keccak256, toBytes } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { CheckMemoPanel } from "@/components/CheckMemoPanel";
import { MintPanel } from "@/components/MintPanel";
import { PaymentPanel } from "@/components/PaymentPanel";
import { B20_DEPLOYER_ADDRESSES, FEATURES } from "@/lib/config";
import { saveDeployedToken } from "@/lib/storage";
import {
  B20Variant,
  B20_FACTORY_ADDRESS,
  BUILDER_CODE_DATA_SUFFIX,
  MINT_ROLE,
  NO_SUPPLY_CAP,
  b20DeployerAbi,
  b20FactoryAbi,
  encodeAssetCreateParams,
  encodeGrantRole,
  encodeStablecoinCreateParams,
  encodeUpdateSupplyCap,
  extractTokenAddress,
  formatContractError,
  isUserRejection,
} from "@/lib/b20";

export const VARIANT_INFO = {
  ASSET: {
    what: "The general-purpose B20 variant. Decimals are configurable from 6 to 18 at creation, and it supports a balance multiplier, extra metadata announcements, and batched mint/clawback across many holders in a single call.",
    why: "Choose ASSET for in-game currencies, loyalty points, reward tokens, or any token where you control decimal precision and want built-in batch issuance and clawback tooling.",
  },
  STABLECOIN: {
    what: "Fixed at 6 decimals with an immutable, self-declared currency code (3 uppercase letters, e.g. USD) set permanently at creation.",
    why: "Choose STABLECOIN for fiat-pegged or cash-equivalent tokens, where integrators need to rely on a standardized decimal count and a permanent currency identity that can never change after launch.",
  },
} as const;

export const MINT_INFO = {
  what: "Minting issues new supply of a B20 token you already deployed, sent directly to your wallet. It calls the token's mint function — it's a separate transaction from deployment.",
  why: "Use this after deploying (or for any token where you hold MINT_ROLE) to actually put tokens in circulation. Deploying alone only sets up the token and its supply cap — it never mints anything by itself.",
} as const;

export const PAYMENT_MODE_INFO = {
  send: {
    what: "Sends a B20 token to any address with an onchain memo attached — a bytes32 reference (like an order ID) that's emitted alongside the transfer in a Memo event.",
    why: "Use this to test paying with B20 and tagging payments to orders, the same pattern apps use to match incoming payments to what they're for, without a backend database.",
  },
  check: {
    what: "Looks up a transaction by its hash and reads back the Memo event from it — who sent it, from which token, and what the memo says.",
    why: "Use this to verify a payment actually carried the memo you expect, e.g. confirming a customer's transaction is tagged with the right order ID.",
  },
} as const;

type TabId = "deploy" | "mint" | "payment";

const TAB_LABELS: Record<TabId, string> = {
  deploy: "Deploy B20",
  mint: "Mint Tokens",
  payment: "Payment",
};

const SUPPLY_CAP_PRESETS = [
  { label: "1M", value: "1000000" },
  { label: "100M", value: "100000000" },
  { label: "1B", value: "1000000000" },
  { label: "10B", value: "10000000000" },
  { label: "100B", value: "100000000000" },
] as const;

function FaqButton({ faqId }: { faqId: string }) {
  function openFaqAndScroll() {
    const el = document.getElementById(`faq-${faqId}`) as HTMLDetailsElement | null;
    if (!el) return;
    el.open = true;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openFaqAndScroll(); }}
      aria-label="Learn more"
      className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-semibold text-zinc-500 hover:border-primary hover:text-primary"
    >
      ?
    </button>
  );
}

export function AppShell() {
  const { address, isConnected, chainId } = useAccount();

  const visibleTabs: TabId[] = FEATURES.paymentWithMemo
    ? ["deploy", "mint", "payment"]
    : ["deploy", "mint"];
  const [activeTab, setActiveTab] = useState<TabId>("deploy");
  const [paymentMode, setPaymentMode] = useState<"send" | "check">("send");
  const [variant, setVariant] = useState<"ASSET" | "STABLECOIN">("ASSET");
  const [name, setName] = useState("My Token");
  const [symbol, setSymbol] = useState("MYT");
  const [decimals, setDecimals] = useState(18);
  const [currency, setCurrency] = useState("USD");
  const [grantMint, setGrantMint] = useState(true);
  const [noCap, setNoCap] = useState(true);
  const [supplyCap, setSupplyCap] = useState("1000000");

  const deployerAddress = chainId ? B20_DEPLOYER_ADDRESSES[chainId] : undefined;

  const { data: deployFee = 0n } = useReadContract({
    address: deployerAddress,
    abi: b20DeployerAbi,
    functionName: "deployFee",
    query: { enabled: !!deployerAddress },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  const tokenAddress = useMemo(
    () => (receipt ? extractTokenAddress(receipt.logs, deployerAddress) : null),
    [receipt, deployerAddress],
  );
  const onWrongNetwork = isConnected && chainId !== baseSepolia.id && chainId !== base.id;

  function basescanUrl(addr: string) {
    return chainId === base.id
      ? `https://basescan.org/address/${addr}`
      : `https://sepolia.basescan.org/address/${addr}`;
  }

  useEffect(() => {
    if (isSuccess && tokenAddress && address && chainId) {
      saveDeployedToken({
        address: tokenAddress,
        name,
        symbol,
        deployer: address,
        chainId,
        deployedAt: Date.now(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, tokenAddress]);

  useEffect(() => {
    reset();
  }, [variant, name, symbol, decimals, currency, grantMint, noCap, supplyCap, chainId, reset]);

  function handleDeploy() {
    if (!address) return;

    const salt = keccak256(toBytes(`${symbol}-${Date.now()}-${Math.random()}`));

    const params =
      variant === "ASSET"
        ? encodeAssetCreateParams(name, symbol, address, decimals)
        : encodeStablecoinCreateParams(name, symbol, address, currency.toUpperCase());

    const tokenDecimals = variant === "STABLECOIN" ? 6 : decimals;
    const cap = noCap
      ? NO_SUPPLY_CAP
      : BigInt(supplyCap || "0") * 10n ** BigInt(tokenDecimals);

    const initCalls: `0x${string}`[] = [];
    if (grantMint) initCalls.push(encodeGrantRole(MINT_ROLE, address));
    initCalls.push(encodeUpdateSupplyCap(cap));

    if (deployerAddress) {
      writeContract({
        address: deployerAddress,
        abi: b20DeployerAbi,
        functionName: "deployB20Token",
        args: [B20Variant[variant], salt, params, initCalls],
        value: deployFee,
        dataSuffix: BUILDER_CODE_DATA_SUFFIX,
      });
    } else {
      writeContract({
        address: B20_FACTORY_ADDRESS,
        abi: b20FactoryAbi,
        functionName: "createB20",
        args: [B20Variant[variant], salt, params, initCalls],
        dataSuffix: BUILDER_CODE_DATA_SUFFIX,
      });
    }
  }

  const info = VARIANT_INFO[variant];

  const activeTabIndex = visibleTabs.indexOf(activeTab);
  const tabSwitcher = (
    <div className="relative flex w-full max-w-md rounded-full border border-zinc-200 p-1">
      <div
        className="absolute inset-y-1 rounded-full bg-primary transition-transform duration-300 ease-out"
        style={{
          left: "0.25rem",
          width: `calc(${100 / visibleTabs.length}% - 0.25rem)`,
          transform: `translateX(${activeTabIndex * 100}%)`,
        }}
      />
      {visibleTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative z-10 flex-1 whitespace-nowrap rounded-full px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
            activeTab === tab ? "text-white" : "text-zinc-600"
          }`}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );

  const selectorBlock = (
    <div>
      {activeTab === "deploy" && (
        <>
          <h1 className="text-2xl font-semibold text-foreground">
            Deploy a Base B20 Token
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Pick a variant to get started.</p>
          <div className="mt-4 flex gap-2">
            {(["ASSET", "STABLECOIN"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  variant === v
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === "mint" && (
        <>
          <h1 className="text-2xl font-semibold text-foreground">
            Mint Deployed B20 Tokens
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Issue more supply for a token you control.
          </p>
        </>
      )}
      {activeTab === "payment" && (
        <>
          <h1 className="text-2xl font-semibold text-foreground">Pay with B20</h1>
          <p className="mt-1 text-sm text-zinc-500">Send a token with a memo attached.</p>
          <div className="mt-4 flex gap-2">
            {(["send", "check"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  paymentMode === mode
                    ? "border-primary bg-primary text-white"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                {mode === "send" ? "Send Payment" : "Check Memo"}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const explanationBlock =
    activeTab === "deploy" ? (
      <div>
        <h2 className="text-sm font-semibold text-foreground">What is {variant}?</h2>
        <p className="mt-1 text-sm text-zinc-600">{info.what}</p>
        <h2 className="mt-4 text-sm font-semibold text-foreground">Why choose it?</h2>
        <p className="mt-1 text-sm text-zinc-600">{info.why}</p>
      </div>
    ) : activeTab === "mint" ? (
      <div>
        <h2 className="text-sm font-semibold text-foreground">What is minting?</h2>
        <p className="mt-1 text-sm text-zinc-600">{MINT_INFO.what}</p>
        <h2 className="mt-4 text-sm font-semibold text-foreground">Why use it?</h2>
        <p className="mt-1 text-sm text-zinc-600">{MINT_INFO.why}</p>
      </div>
    ) : (
      <div>
        <h2 className="text-sm font-semibold text-foreground">What is this?</h2>
        <p className="mt-1 text-sm text-zinc-600">{PAYMENT_MODE_INFO[paymentMode].what}</p>
        <h2 className="mt-4 text-sm font-semibold text-foreground">Why use it?</h2>
        <p className="mt-1 text-sm text-zinc-600">{PAYMENT_MODE_INFO[paymentMode].why}</p>
      </div>
    );

  const deployFormBlock = (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      <label className="flex flex-col gap-1 text-sm text-foreground">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-foreground">
        Symbol
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
        />
      </label>

      {variant === "ASSET" ? (
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Decimals (6-18)
          <input
            type="number"
            min={6}
            max={18}
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Currency code (e.g. USD)
          <input
            value={currency}
            maxLength={3}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </label>
      )}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={grantMint}
          onChange={(e) => setGrantMint(e.target.checked)}
        />
        Grant myself MINT_ROLE
        <FaqButton faqId="mint-role" />
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={noCap}
          onChange={(e) => setNoCap(e.target.checked)}
        />
        No supply cap
        <FaqButton faqId="supply-cap" />
      </label>

      {!noCap && (
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Supply cap (whole tokens)
          <input
            value={supplyCap}
            onChange={(e) => setSupplyCap(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
          <div className="mt-1 flex gap-2">
            {SUPPLY_CAP_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setSupplyCap(preset.value)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-primary hover:text-primary"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </label>
      )}

      <button
        onClick={handleDeploy}
        disabled={!isConnected || onWrongNetwork || isPending || isConfirming}
        className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {isPending
          ? "Confirm in wallet..."
          : isConfirming
            ? "Deploying..."
            : "Deploy B20 Token"}
      </button>

      {deployFee > 0n && !isSuccess && (
        <p className="text-center text-xs text-zinc-500">
          A small deploy fee of{" "}
          <span className="font-medium text-red-500">{formatEther(deployFee)} ETH</span>{" "}
          is required.
        </p>
      )}

      {error && (
        <p className={`text-sm ${isUserRejection(error) ? "text-zinc-400" : "text-red-600"}`}>
          {formatContractError(error)}
        </p>
      )}

      {isSuccess && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Token deployed!
          {tokenAddress && (
            <a
              href={basescanUrl(tokenAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all font-mono underline"
            >
              {tokenAddress}
            </a>
          )}
          <button
            type="button"
            onClick={() => setActiveTab("mint")}
            className="mt-1 block underline"
          >
            Mint some now
          </button>
        </div>
      )}
    </div>
  );

  const rightPanel =
    activeTab === "deploy" ? (
      deployFormBlock
    ) : activeTab === "mint" ? (
      <MintPanel />
    ) : paymentMode === "send" ? (
      <PaymentPanel />
    ) : (
      <CheckMemoPanel />
    );

  return (
    <>
      {/* Mobile */}
      <div className="flex flex-col gap-8 lg:hidden">
        {tabSwitcher}
        {selectorBlock}
        {rightPanel}
        {explanationBlock}
      </div>
      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="mb-8">{tabSwitcher}</div>
        <div className="flex lg:items-start lg:gap-8">
          <div className="flex flex-1 flex-col gap-8">
            {selectorBlock}
            {explanationBlock}
          </div>
          <div className="flex-1">{rightPanel}</div>
        </div>
      </div>
    </>
  );
}
