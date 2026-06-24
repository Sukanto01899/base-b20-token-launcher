"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keccak256, toBytes } from "viem";
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { MintPanel } from "@/components/MintPanel";
import { saveDeployedToken } from "@/lib/storage";
import {
  B20Variant,
  B20_FACTORY_ADDRESS,
  BUILDER_CODE_DATA_SUFFIX,
  MINT_ROLE,
  NO_SUPPLY_CAP,
  b20FactoryAbi,
  encodeAssetCreateParams,
  encodeGrantRole,
  encodeStablecoinCreateParams,
  encodeUpdateSupplyCap,
  extractTokenAddress,
} from "@/lib/b20";

const VARIANT_INFO = {
  ASSET: {
    what: "The general-purpose B20 variant. Decimals are configurable from 6 to 18 at creation, and it supports a balance multiplier, extra metadata announcements, and batched mint/clawback across many holders in a single call.",
    why: "Choose ASSET for in-game currencies, loyalty points, reward tokens, or any token where you control decimal precision and want built-in batch issuance and clawback tooling.",
  },
  STABLECOIN: {
    what: "Fixed at 6 decimals with an immutable, self-declared currency code (3 uppercase letters, e.g. USD) set permanently at creation.",
    why: "Choose STABLECOIN for fiat-pegged or cash-equivalent tokens, where integrators need to rely on a standardized decimal count and a permanent currency identity that can never change after launch.",
  },
} as const;

const MINT_INFO = {
  what: "Minting issues new supply of a B20 token you already deployed, sent directly to your wallet. It calls the token's mint function — it's a separate transaction from deployment.",
  why: "Use this after deploying (or for any token where you hold MINT_ROLE) to actually put tokens in circulation. Deploying alone only sets up the token and its supply cap — it never mints anything by itself.",
} as const;

const SUPPLY_CAP_PRESETS = [
  { label: "1M", value: "1000000" },
  { label: "100M", value: "100000000" },
  { label: "1B", value: "1000000000" },
  { label: "10B", value: "10000000000" },
  { label: "100B", value: "100000000000" },
] as const;

const FAQ_ITEMS = [
  {
    id: "b20",
    question: "What is B20?",
    answer:
      "B20 is an ERC-20 superset that runs as a native precompile on Base, instead of a regular smart contract. It gives cheaper, higher-throughput transfers while staying fully ERC-20 compatible, and bakes in features most tokens have to build and audit themselves: roles, supply caps, pausing, policy gating, memos, and permit.",
  },
  {
    id: "mint-role",
    question: "What is Grant myself MINT_ROLE?",
    answer:
      "B20 tokens use a role-based permission system. Holding the token's DEFAULT_ADMIN_ROLE (which you get automatically as the creator) lets you grant or revoke roles, but it does not by itself let you mint new tokens — minting requires the separate MINT_ROLE. Checking this box grants MINT_ROLE to your own wallet in the same transaction that creates the token, so you can mint immediately without a second transaction.",
  },
  {
    id: "supply-cap",
    question: "What is a supply cap?",
    answer:
      "The supply cap is the maximum total supply your token can ever reach — minting beyond it reverts. \"No supply cap\" sets it to the protocol's unbounded sentinel value (the maximum uint128), meaning there's effectively no limit. Setting a specific number fixes your token's lifetime maximum supply; it can still be changed later by whoever holds the role that calls updateSupplyCap.",
  },
] as const;

function FaqButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      aria-label="Learn more"
      className="flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 text-[10px] font-semibold text-zinc-500 hover:border-primary hover:text-primary"
    >
      ?
    </button>
  );
}

export default function Home() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [activeTab, setActiveTab] = useState<"deploy" | "mint">("deploy");
  const [variant, setVariant] = useState<"ASSET" | "STABLECOIN">("STABLECOIN");
  const [name, setName] = useState("My Token");
  const [symbol, setSymbol] = useState("MYT");
  const [decimals, setDecimals] = useState(18);
  const [currency, setCurrency] = useState("USD");
  const [grantMint, setGrantMint] = useState(true);
  const [noCap, setNoCap] = useState(true);
  const [supplyCap, setSupplyCap] = useState("1000000");

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
    () => (receipt ? extractTokenAddress(receipt.logs) : null),
    [receipt],
  );
  const onWrongNetwork = isConnected && chainId !== baseSepolia.id;

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
    // Only run when the deploy transitions to confirmed — not on every name/symbol edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, tokenAddress]);

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const faqRefs = useRef<Record<string, HTMLDetailsElement | null>>({});

  function openFaqAndScroll(id: string) {
    setOpenFaq(id);
    requestAnimationFrame(() => {
      faqRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  useEffect(() => {
    reset();
  }, [
    variant,
    name,
    symbol,
    decimals,
    currency,
    grantMint,
    noCap,
    supplyCap,
    reset,
  ]);

  function handleDeploy() {
    if (!address) return;

    const salt = keccak256(toBytes(`${symbol}-${Date.now()}-${Math.random()}`));

    const params =
      variant === "ASSET"
        ? encodeAssetCreateParams(name, symbol, address, decimals)
        : encodeStablecoinCreateParams(
            name,
            symbol,
            address,
            currency.toUpperCase(),
          );

    const tokenDecimals = variant === "STABLECOIN" ? 6 : decimals;
    const cap = noCap
      ? NO_SUPPLY_CAP
      : BigInt(supplyCap || "0") * 10n ** BigInt(tokenDecimals);

    const initCalls: `0x${string}`[] = [];
    if (grantMint) initCalls.push(encodeGrantRole(MINT_ROLE, address));
    initCalls.push(encodeUpdateSupplyCap(cap));

    writeContract({
      address: B20_FACTORY_ADDRESS,
      abi: b20FactoryAbi,
      functionName: "createB20",
      args: [B20Variant[variant], salt, params, initCalls],
      dataSuffix: BUILDER_CODE_DATA_SUFFIX,
    });
  }

  const info = VARIANT_INFO[variant];

  // Defined once and reused in both layouts below so mobile (flat order) and desktop
  // (grouped columns) can have different groupings without duplicating state/logic.
  // Each block is only ever visible in one layout at a time (the other is `hidden`),
  // and a flex column's items size independently — no shared row tracks like CSS grid,
  // so the Form's height never shifts the Selector/Explanation position.
  const tabSwitcher = (
    <div className="relative flex w-full max-w-xs rounded-full border border-zinc-200 p-1">
      <div
        className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-300 ease-out"
        style={{ transform: activeTab === "mint" ? "translateX(100%)" : "translateX(0%)" }}
      />
      {(["deploy", "mint"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative z-10 flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab ? "text-white" : "text-zinc-600"
          }`}
        >
          {tab === "deploy" ? "Deploy B20" : "Mint Tokens"}
        </button>
      ))}
    </div>
  );

  const selectorBlock = (
    <div>
      {activeTab === "deploy" ? (
        <>
          <h1 className="text-2xl font-semibold text-foreground">Deploy a Base B20 Token</h1>
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
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-foreground">Mint Deployed B20 Tokens</h1>
          <p className="mt-1 text-sm text-zinc-500">Issue more supply for a token you control.</p>
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
    ) : (
      <div>
        <h2 className="text-sm font-semibold text-foreground">What is minting?</h2>
        <p className="mt-1 text-sm text-zinc-600">{MINT_INFO.what}</p>
        <h2 className="mt-4 text-sm font-semibold text-foreground">Why use it?</h2>
        <p className="mt-1 text-sm text-zinc-600">{MINT_INFO.why}</p>
      </div>
    );

  const deployFormBlock = (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5">
      {onWrongNetwork && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Wrong network — switch to Base Sepolia.
          <button
            onClick={() => switchChain({ chainId: baseSepolia.id })}
            disabled={isSwitching}
            className="ml-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
          >
            Switch
          </button>
        </div>
      )}

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
        <FaqButton onClick={() => openFaqAndScroll("mint-role")} />
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={noCap}
          onChange={(e) => setNoCap(e.target.checked)}
        />
        No supply cap
        <FaqButton onClick={() => openFaqAndScroll("supply-cap")} />
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

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      {isSuccess && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Token deployed!
          {tokenAddress && (
            <a
              href={`https://sepolia.basescan.org/address/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all font-mono underline"
            >
              {tokenAddress}
            </a>
          )}
          <button type="button" onClick={() => setActiveTab("mint")} className="mt-1 block underline">
            Mint some now
          </button>
        </div>
      )}
    </div>
  );

  const rightPanel = activeTab === "deploy" ? deployFormBlock : <MintPanel />;

  return (
    <div className="flex flex-1 justify-center bg-white">
      <main className="w-full max-w-5xl px-6 py-12">
        {/* Mobile: flat stack, switcher leads, Form sits between Selector and Explanation */}
        <div className="flex flex-col gap-8 lg:hidden">
          {tabSwitcher}
          {selectorBlock}
          {rightPanel}
          {explanationBlock}
        </div>

        {/* Desktop: switcher sits above the two-column row (its own block, not part of
            the row's flex alignment), so it can never overlap or skew column heights. */}
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

        {/* FAQ accordion */}
        <div className="mt-12 flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.id}
              ref={(el) => {
                faqRefs.current[item.id] = el;
              }}
              open={openFaq === item.id}
              className="group rounded-xl border border-zinc-200 bg-white p-4"
            >
              <summary
                onClick={(e) => {
                  e.preventDefault();
                  setOpenFaq((prev) => (prev === item.id ? null : item.id));
                }}
                className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground"
              >
                {item.question}
                <span className="ml-2 text-zinc-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
