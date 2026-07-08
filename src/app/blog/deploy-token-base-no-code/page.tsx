import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Deploy a Token on Base Without Code",
  description:
    "A step-by-step guide to deploying your own B20 token on Base Mainnet or Sepolia using a wallet — no Solidity, no CLI, no backend required.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/deploy-token-base-no-code" },
  openGraph: {
    title: "How to Deploy a Token on Base Without Code",
    description: "Step-by-step: deploy your own B20 token on Base using just a wallet. No Solidity, no CLI, no backend.",
    url: "https://www.deployb20.xyz/blog/deploy-token-base-no-code",
  },
};

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {n}
      </div>
      <div className="min-w-0 flex-1 pb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="mt-1 text-sm text-zinc-600">{children}</div>
      </div>
    </div>
  );
}

export default function DeployTokenBaseNoCode() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">How to Deploy a Token on Base Without Code</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>3 min read</span>
          </div>
        </header>

        <div className="mt-8 text-zinc-700">
          <p className="text-lg text-zinc-600">
            Deploying a token on Base used to require writing Solidity, running a CLI, and managing private keys in terminal. With B20, you can do it entirely from your browser in under a minute.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What you need</h2>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm">
            <li>A wallet (MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet)</li>
            <li>A small amount of ETH on Base Sepolia (testnet) or Base Mainnet for gas</li>
            <li>A token name and symbol</li>
          </ul>

          <p className="mt-4 text-sm">
            If you're testing, you can get free Sepolia ETH from a Base faucet. No real money needed.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Step-by-step guide</h2>
          <div className="mt-6 flex flex-col">
            <Step n={1} title="Open Deploy B20">
              Go to <Link href="/" className="text-primary underline">deployb20.xyz</Link> in your browser.
            </Step>
            <Step n={2} title="Connect your wallet">
              Click the Connect Wallet button in the top right. Choose your wallet and approve the connection. Make sure you are on Base Sepolia (for testing) or Base Mainnet.
            </Step>
            <Step n={3} title="Choose a variant">
              <p>Select <strong>ASSET</strong> or <strong>STABLECOIN</strong>:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>ASSET</strong> — general-purpose token, you choose decimals (6–18)</li>
                <li><strong>STABLECOIN</strong> — fixed 6 decimals, requires a 3-letter currency code like USD</li>
              </ul>
            </Step>
            <Step n={4} title="Fill in token details">
              Enter your token name (e.g. <em>Game Points</em>) and symbol (e.g. <em>GP</em>). For ASSET, pick your decimal count. For STABLECOIN, enter your currency code.
            </Step>
            <Step n={5} title="Set permissions and supply">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Grant myself MINT_ROLE</strong> — tick this so you can mint tokens immediately after deploy. If unchecked, you will need to grant the role in a second transaction.</li>
                <li><strong>No supply cap</strong> — leave ticked for unlimited supply, or untick and enter a cap to set a maximum total supply.</li>
              </ul>
            </Step>
            <Step n={6} title="Deploy">
              Click <strong>Deploy B20 Token</strong>. Your wallet will ask you to confirm the transaction. Once confirmed, your token address will appear on screen with a link to Basescan.
            </Step>
            <Step n={7} title="Mint your first tokens">
              Switch to the <strong>Mint Tokens</strong> tab, paste your new token address, enter an amount, and hit Mint. Tokens will land in your wallet.
            </Step>
          </div>

          <h2 className="mt-4 text-xl font-semibold text-foreground">What happens on-chain?</h2>
          <p className="mt-3 text-sm">
            Deploy B20 calls the B20 factory precompile on Base — <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">0xB20f000000000000000000000000000000000000</code> — with your token parameters. The factory creates the token, runs the init calls (grant MINT_ROLE, set supply cap), and returns the new token address. No contract bytecode is deployed from your side.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Can I do this with AI instead?</h2>
          <p className="mt-3 text-sm">
            Yes. The <Link href="/mcp" className="text-primary underline">B20 MCP server</Link> lets you deploy a token by describing it in plain English to Claude or another AI assistant. The AI encodes the transaction and Base MCP sends it from your wallet.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Ready? Deploy your first token now.</p>
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
