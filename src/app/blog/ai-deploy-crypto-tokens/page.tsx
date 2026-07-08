import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Deploy Crypto Tokens Using AI (Claude + B20 MCP)",
  description:
    "The B20 MCP server lets Claude and other AI assistants deploy tokens, mint supply, and send payments on Base using plain English — no wallet UI needed.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/ai-deploy-crypto-tokens" },
  openGraph: {
    title: "How to Deploy Crypto Tokens Using AI (Claude + B20 MCP)",
    description: "Use Claude and the B20 MCP server to deploy tokens, mint, and send payments on Base using plain English.",
    url: "https://www.deployb20.xyz/blog/ai-deploy-crypto-tokens",
  },
};

export default function AiDeployCryptoTokens() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">
            How to Deploy Crypto Tokens Using AI (Claude + B20 MCP)
          </h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>5 min read</span>
          </div>
        </header>

        <div className="mt-8 text-zinc-700">
          <p className="text-lg text-zinc-600">
            MCP (Model Context Protocol) lets AI assistants like Claude call external tools and APIs. The B20 MCP server exposes B20 token operations as tools — so you can deploy a token, mint supply, or send a payment by describing what you want in plain English.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What is MCP?</h2>
          <p className="mt-3 text-sm">
            Model Context Protocol is an open standard that lets AI models connect to external servers and use their tools. Instead of copy-pasting calldata or writing scripts, you describe your intent to the AI and it calls the right tool automatically.
          </p>
          <p className="mt-3 text-sm">
            Claude Code, Claude Desktop, and other MCP-compatible assistants support this natively.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What the B20 MCP server does</h2>
          <p className="mt-3 text-sm">
            The B20 MCP server at <code className="rounded bg-zinc-100 px-1 py-0.5">https://www.deployb20.xyz/api/mcp</code> is a <strong>calldata builder</strong>. It encodes your intent into a blockchain transaction — but never holds a private key. Your wallet signs and sends.
          </p>
          <p className="mt-3 text-sm">
            Paired with <a href="https://mcp.base.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">Base MCP</a> (which gives Claude a wallet), you get a full end-to-end flow: AI encodes → Base MCP signs → Base confirms.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs">
            <span className="text-primary">You</span>
            {" → "}
            <span className="text-primary">Claude</span>
            {" → "}
            <span className="text-primary">B20 MCP</span>
            {" (encode) → "}
            <span className="text-primary">Base MCP</span>
            {" (sign & send) → "}
            <span className="text-primary">Base</span>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Setup: Claude Code or Claude Desktop</h2>
          <p className="mt-3 text-sm">Run these two commands once in your terminal:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`claude mcp add b20 --transport http https://www.deployb20.xyz/api/mcp
claude mcp add base-mcp --transport http https://mcp.base.org`}
          </pre>
          <p className="mt-3 text-sm">That's it. Claude now has B20 tools and a wallet.</p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Example: deploy a token</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`Deploy a B20 ASSET token called GameCoin with symbol GC,
18 decimals, on Base Sepolia. My wallet is 0xYourAddress.`}
          </pre>
          <p className="mt-3 text-sm">
            Claude will check B20 activation on the chain, encode the deployment, and use Base MCP to send the transaction from your wallet.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Example: mint tokens</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`Mint 10000 GC tokens to 0xRecipientAddress on Base Sepolia.
Token address is 0xYourTokenAddress, decimals 18.`}
          </pre>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Example: send a payment with memo</h2>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-xs text-zinc-100">
{`Send 50 GC to 0xShopAddress with memo "order-42".
Token: 0xYourTokenAddress, decimals 18, on Base Sepolia.`}
          </pre>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Available tools</h2>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm">
            <li><strong>b20_encode_deploy</strong> — encode a token deployment (ASSET or STABLECOIN)</li>
            <li><strong>b20_encode_mint</strong> — encode a mint call (checks activation first)</li>
            <li><strong>b20_encode_payment</strong> — encode transferWithMemo</li>
            <li><strong>b20_encode_grant_mint_role</strong> — encode a MINT_ROLE grant</li>
            <li><strong>b20_read_token</strong> — read token name, supply, cap, roles (no wallet needed)</li>
            <li><strong>b20_check_activation</strong> — check if B20 is live on a chain</li>
          </ul>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Does it work without a wallet?</h2>
          <p className="mt-3 text-sm">
            Read-only tools (<code>b20_read_token</code>, <code>b20_check_activation</code>) work without any wallet. For deploying, minting, or sending, you need Base MCP or another wallet connector that can sign and send transactions.
          </p>
          <p className="mt-3 text-sm">
            For a full setup guide and Claude Web instructions, see the <Link href="/mcp" className="text-primary underline">B20 MCP guide</Link>.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Set up B20 MCP and start deploying with AI.</p>
          <Link
            href="/mcp"
            className="mt-2 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            B20 MCP Setup Guide →
          </Link>
        </div>
      </article>
    </div>
  );
}
