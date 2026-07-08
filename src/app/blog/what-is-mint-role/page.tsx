import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is MINT_ROLE in B20 Tokens?",
  description:
    "B20 uses role-based access control. MINT_ROLE is the permission that lets an address issue new supply. Learn why it exists separately from admin rights and how to manage it.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/what-is-mint-role" },
  openGraph: {
    title: "What is MINT_ROLE in B20 Tokens?",
    description: "MINT_ROLE controls who can issue new supply in B20 tokens. Learn how it works and why it's separate from admin rights.",
    url: "https://www.deployb20.xyz/blog/what-is-mint-role",
  },
};

export default function WhatIsMintRole() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">What is MINT_ROLE in B20 Tokens?</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>3 min read</span>
          </div>
        </header>

        <div className="mt-8 text-zinc-700">
          <p className="text-lg text-zinc-600">
            B20 tokens use role-based access control built into the protocol. The two most important roles are <strong>DEFAULT_ADMIN_ROLE</strong> and <strong>MINT_ROLE</strong> — and they are intentionally separate.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">The two core roles</h2>

          <h3 className="mt-5 text-base font-semibold text-foreground">DEFAULT_ADMIN_ROLE</h3>
          <p className="mt-2 text-sm">
            This is the top-level admin role. Whoever holds it can grant or revoke any other role on the token — including MINT_ROLE. When you deploy a B20 token, your wallet automatically receives DEFAULT_ADMIN_ROLE.
          </p>
          <p className="mt-2 text-sm">
            <strong>Important:</strong> DEFAULT_ADMIN_ROLE does not let you mint tokens. It only lets you manage who has what roles.
          </p>

          <h3 className="mt-5 text-base font-semibold text-foreground">MINT_ROLE</h3>
          <p className="mt-2 text-sm">
            MINT_ROLE is the permission that allows an address to call <code>mint(to, amount)</code> and issue new supply. Without MINT_ROLE, even the token creator cannot mint — they can only grant the role to themselves or others.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Why are they separate?</h2>
          <p className="mt-3 text-sm">
            Separating admin rights from minting rights enables safer architectures. Common patterns:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm">
            <li><strong>Multisig admin, hot wallet minter</strong> — keep DEFAULT_ADMIN_ROLE in a Gnosis Safe for security, but grant MINT_ROLE to a hot wallet or smart contract for daily operations.</li>
            <li><strong>Smart contract minter</strong> — grant MINT_ROLE to a staking contract or a payment processor so it can issue rewards or redemptions automatically.</li>
            <li><strong>No minting after launch</strong> — deploy without granting MINT_ROLE to anyone. The supply cap is enforced at the protocol level and no new tokens can ever be minted.</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Grant myself MINT_ROLE at deploy time</h2>
          <p className="mt-3 text-sm">
            When deploying via <Link href="/" className="text-primary underline">deployb20.xyz</Link>, there is a checkbox: <strong>Grant myself MINT_ROLE</strong>. Ticking it adds a <code>grantRole(MINT_ROLE, yourAddress)</code> call into the same deployment transaction — so you can mint immediately after deploy without a second transaction.
          </p>
          <p className="mt-3 text-sm">
            If you leave it unchecked, you will need to call <code>grantRole</code> separately, either through the Mint tab's "Grant MINT_ROLE" option or directly on Basescan.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">How to check if an address has MINT_ROLE</h2>
          <p className="mt-3 text-sm">
            Use <code>hasRole(MINT_ROLE, address)</code> on the token contract. On deployb20.xyz, the <strong>Mint</strong> tab will tell you if your connected wallet has MINT_ROLE before you try to mint. You can also use the <Link href="/mcp" className="text-primary underline">B20 MCP server</Link>:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`Read token info for 0xYourToken on Base Sepolia.
Also check if 0xYourWallet has MINT_ROLE.`}
          </pre>

          <h2 className="mt-8 text-xl font-semibold text-foreground">How to grant MINT_ROLE to another address</h2>
          <p className="mt-3 text-sm">
            If you hold DEFAULT_ADMIN_ROLE, you can grant MINT_ROLE to any address. Use the <strong>Grant MINT_ROLE</strong> tab on deployb20.xyz, or via the MCP server:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`Grant MINT_ROLE on token 0xYourToken to 0xContractAddress`}
          </pre>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Deploy a token and manage roles from your browser.</p>
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
