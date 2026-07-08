import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Create a Stablecoin on Base",
  description:
    "The B20 STABLECOIN variant lets you deploy a fiat-pegged token with a permanent currency code and fixed 6 decimals on Base. Here's how to do it.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/create-stablecoin-base" },
  openGraph: {
    title: "How to Create a Stablecoin on Base",
    description: "Deploy a fiat-pegged B20 STABLECOIN on Base with a permanent currency code and fixed 6 decimals — no code required.",
    url: "https://www.deployb20.xyz/blog/create-stablecoin-base",
  },
};

export default function CreateStablecoinBase() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">How to Create a Stablecoin on Base</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </header>

        <div className="mt-8 text-zinc-700">
          <p className="text-lg text-zinc-600">
            B20's STABLECOIN variant is purpose-built for fiat-pegged tokens. It locks in 6 decimals and a permanent currency code at creation — the same standard USDC and USDT follow — so wallets, DEXes, and payment apps can trust the token's identity forever.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What makes STABLECOIN different from ASSET?</h2>
          <p className="mt-3">
            Both B20 variants share the same core features: roles, supply caps, pausing, memos, permit. The key differences in STABLECOIN:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm">
            <li><strong>Fixed 6 decimals</strong> — set at creation, can never be changed. This matches USD-denominated stablecoins like USDC.</li>
            <li><strong>Permanent currency code</strong> — a 3-letter ISO code (e.g. <code>USD</code>, <code>EUR</code>, <code>GBP</code>) embedded at creation. Immutable after deploy.</li>
            <li><strong>No decimal configuration</strong> — you do not choose decimals; 6 is always the value.</li>
          </ul>
          <p className="mt-3 text-sm">
            These constraints exist by design. Integrators building payment flows can rely on the decimal count and currency identity without querying the contract.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What currency codes can I use?</h2>
          <p className="mt-3 text-sm">
            Any 3-letter uppercase string — but meaningful choices follow ISO 4217: <code>USD</code>, <code>EUR</code>, <code>GBP</code>, <code>JPY</code>, <code>SGD</code>, etc. Choose the currency your stablecoin is pegged to. This code is permanently associated with the token contract, so choose carefully.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Who should use STABLECOIN?</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm">
            <li>Businesses issuing their own USD or EUR-backed tokens</li>
            <li>Projects building payment rails on Base that need a house stablecoin</li>
            <li>Developers testing stablecoin payment flows before integrating with USDC</li>
            <li>Protocols that need a currency-tagged token for accounting purposes</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-foreground">How to deploy a stablecoin on Base</h2>
          <ol className="mt-3 list-decimal pl-5 space-y-3 text-sm">
            <li>Go to <Link href="/" className="text-primary underline">deployb20.xyz</Link> and connect your wallet.</li>
            <li>Select <strong>STABLECOIN</strong> as the variant.</li>
            <li>Enter your token name (e.g. <em>My Dollar</em>) and symbol (e.g. <em>MUSD</em>).</li>
            <li>Enter your <strong>currency code</strong> — e.g. <code>USD</code>. This is permanent.</li>
            <li>Decide whether to grant yourself MINT_ROLE immediately (recommended) and set a supply cap if needed.</li>
            <li>Click <strong>Deploy B20 Token</strong> and confirm in your wallet.</li>
          </ol>
          <p className="mt-4 text-sm">
            After deployment, switch to the Mint tab to issue your first tokens.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Important: the peg is your responsibility</h2>
          <p className="mt-3 text-sm">
            B20 STABLECOIN gives you the token infrastructure — it does not manage the peg. Maintaining a 1:1 backing with real assets, setting up redemption mechanisms, and complying with relevant regulations are entirely up to you. The STABLECOIN variant is the technical foundation; the economic model is yours to build.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Sending stablecoin payments with memos</h2>
          <p className="mt-3 text-sm">
            B20 stablecoins support <code>transferWithMemo</code> — attach a 32-byte reference to any payment. This is useful for matching payments to invoices or orders without a centralised backend. Use the <strong>Payment</strong> tab on deployb20.xyz to try it.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Deploy your stablecoin on Base now.</p>
          <Link
            href="/"
            className="mt-2 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Deploy a B20 Stablecoin →
          </Link>
        </div>
      </article>
    </div>
  );
}
