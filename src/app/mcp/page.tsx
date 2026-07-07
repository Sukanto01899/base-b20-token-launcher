import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B20 MCP — AI Integration Guide",
  description: "Connect any AI assistant to B20 tokens on Base using the B20 MCP server.",
};

const MCP_URL = "https://www.deployb20.xyz/api/mcp";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="mt-1 text-sm text-zinc-600">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-3 font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

export default function McpPage() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <main className="w-full max-w-3xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Badge>MCP Server</Badge>
          <h1 className="mt-3 text-3xl font-bold text-foreground">B20 MCP</h1>
          <p className="mt-2 text-zinc-500">
            Connect Claude, or any MCP-compatible AI, to B20 tokens on Base.
            Deploy tokens, mint supply, send payments — all from natural language.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2">
            <span className="text-xs text-zinc-500">Server URL</span>
            <code className="flex-1 text-xs font-medium text-foreground">{MCP_URL}</code>
          </div>
        </div>

        {/* What can it do */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">What can it do?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Deploy B20 token", desc: "ASSET or STABLECOIN, any name/symbol" },
              { title: "Mint tokens", desc: "Issue supply to any address" },
              { title: "Send payment", desc: "Transfer with onchain memo attached" },
              { title: "Grant MINT_ROLE", desc: "Give minting permission to an address" },
              { title: "Read token info", desc: "Name, supply, cap, roles — no wallet needed" },
              { title: "Check activation", desc: "See if B20 is live on mainnet/testnet" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-zinc-200 p-3">
                <div className="text-sm font-medium text-foreground">{item.title}</div>
                <div className="mt-0.5 text-xs text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Claude Code / Claude Desktop */}
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Claude Code / Claude Desktop</h2>
          <p className="mb-4 text-sm text-zinc-500">Best experience — Claude can deploy and send transactions using Base MCP wallet.</p>

          <div className="flex flex-col gap-5">
            <Step n={1} title="Add B20 MCP">
              Run this once in your terminal:
              <Code>{`claude mcp add b20 --transport http ${MCP_URL}`}</Code>
            </Step>

            <Step n={2} title="Add Base MCP (for sending transactions)">
              Base MCP gives Claude a wallet so it can actually send the transactions:
              <Code>{`claude mcp add base-mcp --transport http https://mcp.base.org`}</Code>
            </Step>

            <Step n={3} title="Start chatting">
              You can now tell Claude to deploy, mint, or pay:
              <Code>{`Deploy a B20 token called GameCoin with symbol GC on Base Sepolia.
My wallet is 0x4b2f...74A6b`}</Code>
              <Code>{`Mint 1000 GC tokens to 0xRecipient...`}</Code>
              <Code>{`Send 50 GC to 0xShop... with memo "order-42"`}</Code>
            </Step>
          </div>
        </section>

        {/* Claude web */}
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Claude Web (claude.ai)</h2>
          <p className="mb-4 text-sm text-zinc-500">Works for reading token info and encoding calldata. Transaction sending requires a wallet connector.</p>

          <div className="flex flex-col gap-5">
            <Step n={1} title="Go to connector settings">
              Open claude.ai → Settings → Connectors → Add custom connector
            </Step>
            <Step n={2} title="Paste the server URL">
              <Code>{MCP_URL}</Code>
            </Step>
            <Step n={3} title="Try it">
              <Code>{`Check if B20 is activated on Base Mainnet`}</Code>
              <Code>{`Read token info for 0xTokenAddress on Base Sepolia`}</Code>
            </Step>
          </div>
        </section>

        {/* Other AI / API */}
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Other AI agents (API)</h2>
          <p className="mb-4 text-sm text-zinc-500">Any app that supports MCP over HTTP can connect to this server.</p>

          <Card title="MCP JSON-RPC — list tools">
            <Code>{`curl -X POST ${MCP_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'`}</Code>
          </Card>

          <div className="mt-3">
            <Card title="Call a tool — encode a deploy">
              <Code>{`curl -X POST ${MCP_URL} \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 2,
    "params": {
      "name": "b20_encode_deploy",
      "arguments": {
        "name": "GameCoin",
        "symbol": "GC",
        "variant": "ASSET",
        "initialAdmin": "0xYourWallet",
        "chainId": 84532
      }
    }
  }'`}</Code>
              <p className="mt-2 text-xs text-zinc-500">Returns <code className="rounded bg-zinc-100 px-1 py-0.5">&#123;to, data, value&#125;</code> — pass to your wallet to send.</p>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-foreground">How it works</h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
            <p>The B20 MCP server is a <strong className="text-foreground">calldata builder</strong> — it encodes your intent into blockchain transactions but never holds a private key.</p>
            <p className="mt-2">Your AI (e.g. Claude + Base MCP) takes the encoded calldata and signs/sends the transaction using <strong className="text-foreground">your own wallet</strong>. You stay in full control.</p>
            <div className="mt-4 rounded-lg bg-white p-3 font-mono text-xs">
              <span className="text-primary">AI</span>
              {" → "}
              <span className="text-primary">B20 MCP</span>
              {" (encode) → "}
              <span className="text-primary">Base MCP</span>
              {" (sign & send) → "}
              <span className="text-primary">Base</span>
            </div>
          </div>
        </section>

        {/* Tools reference */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Tools reference</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">What it does</th>
                  <th className="px-4 py-3">Wallet needed?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-foreground">
                {[
                  ["b20_encode_deploy", "Encode token deployment (routes through platform contract)", "Yes"],
                  ["b20_encode_mint", "Encode mint call", "Yes"],
                  ["b20_encode_payment", "Encode transferWithMemo", "Yes"],
                  ["b20_encode_grant_mint_role", "Encode MINT_ROLE grant", "Yes"],
                  ["b20_read_token", "Read token name / supply / cap", "No"],
                  ["b20_check_activation", "Check if B20 is active on chain", "No"],
                ].map(([tool, desc, wallet]) => (
                  <tr key={tool}>
                    <td className="px-4 py-3 font-mono text-xs text-primary">{tool}</td>
                    <td className="px-4 py-3 text-zinc-600">{desc}</td>
                    <td className="px-4 py-3">{wallet === "Yes" ? "✅ Yes" : "❌ No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
