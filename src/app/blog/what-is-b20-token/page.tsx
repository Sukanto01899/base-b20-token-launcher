import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is a B20 Token on Base?",
  description:
    "B20 is Base's native token standard — an ERC-20 superset built as a precompile with built-in roles, supply caps, pausing, and memos. Here's everything you need to know.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/what-is-b20-token" },
  openGraph: {
    title: "What is a B20 Token on Base?",
    description: "B20 is Base's native ERC-20 superset with built-in roles, supply caps, pausing, and memos — running as a precompile for cheaper, faster transfers.",
    url: "https://www.deployb20.xyz/blog/what-is-b20-token",
  },
};

export default function WhatIsB20Token() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">What is a B20 Token on Base?</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>4 min read</span>
          </div>
        </header>

        <div className="prose mt-8 text-zinc-700">
          <p className="lead text-lg text-zinc-600">
            B20 is Base's native token standard — a superset of ERC-20 that ships as a precompile on the Base blockchain. Instead of deploying a smart contract, you call a built-in function on Base itself to create a token.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Why does B20 exist?</h2>
          <p className="mt-3">
            ERC-20 tokens are powerful but bare-bones. Every team that launches one has to write, audit, and deploy the same features over and over: role-based minting, supply caps, pausing, permit signatures, onchain payment memos. B20 bakes all of this in at the protocol level.
          </p>
          <p className="mt-3">
            Because B20 runs as a precompile — part of Base's execution environment — it is cheaper and faster than an equivalent smart contract. Transfers cost less gas, and there is no contract bytecode to audit for the core functionality.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What B20 tokens can do</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2">
            <li><strong>Role-based access control</strong> — DEFAULT_ADMIN_ROLE and MINT_ROLE are built in. No extra contract or library needed.</li>
            <li><strong>Supply caps</strong> — set a maximum total supply at creation; the protocol enforces it on every mint.</li>
            <li><strong>Pausing</strong> — freeze transfers, minting, or both with a single call.</li>
            <li><strong>Onchain memos</strong> — attach a 32-byte reference (e.g. an order ID) to any payment via <code>transferWithMemo</code>.</li>
            <li><strong>ERC-20 compatible</strong> — wallets, DEXes, and block explorers treat B20 tokens exactly like normal ERC-20 tokens.</li>
            <li><strong>Permit (EIP-2612)</strong> — gasless approvals built in.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Two variants: ASSET and STABLECOIN</h2>
          <p className="mt-3">B20 comes in two flavours:</p>

          <h3 className="mt-5 text-base font-semibold text-foreground">ASSET</h3>
          <p className="mt-2">
            The general-purpose variant. You choose decimals between 6 and 18 at creation. Good for loyalty points, in-game currencies, governance tokens, or any token where you want full control over precision and batch operations.
          </p>

          <h3 className="mt-5 text-base font-semibold text-foreground">STABLECOIN</h3>
          <p className="mt-2">
            Fixed at 6 decimals with an immutable currency code (e.g. <code>USD</code>) set permanently at creation. Designed for fiat-pegged tokens where integrators depend on a standardised decimal count and a currency identity that can never change after launch.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">How to deploy a B20 token</h2>
          <p className="mt-3">
            You can deploy directly from your browser using <Link href="/" className="text-primary underline">deployb20.xyz</Link> — connect your wallet, fill in a name, symbol, and variant, and click Deploy. No Solidity, no CLI, no backend required.
          </p>
          <p className="mt-3">
            Alternatively, use the <Link href="/mcp" className="text-primary underline">B20 MCP server</Link> to deploy via Claude or any MCP-compatible AI assistant using natural language.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Where are B20 tokens live?</h2>
          <p className="mt-3">
            B20 is currently available on Base Sepolia (testnet) and coming to Base Mainnet. You can check live activation status anytime at <Link href="/" className="text-primary underline">deployb20.xyz</Link>.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Ready to deploy?</p>
          <Link
            href="/"
            className="mt-2 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Deploy a B20 Token →
          </Link>
        </div>
      </article>
    </div>
  );
}
