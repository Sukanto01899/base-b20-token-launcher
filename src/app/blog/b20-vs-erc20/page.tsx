import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "B20 vs ERC-20: What's the Difference?",
  description:
    "ERC-20 is the most widely used token standard, but B20 takes it further. Learn what B20 adds, why it runs cheaper on Base, and when to choose one over the other.",
  alternates: { canonical: "https://www.deployb20.xyz/blog/b20-vs-erc20" },
  openGraph: {
    title: "B20 vs ERC-20: What's the Difference?",
    description: "B20 is Base's native ERC-20 superset. Learn what it adds, why it's cheaper, and when to use it over standard ERC-20.",
    url: "https://www.deployb20.xyz/blog/b20-vs-erc20",
  },
};

export default function B20VsErc20() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <article className="w-full max-w-2xl px-6 py-12">
        <Link href="/blog" className="text-sm text-primary hover:underline">← Blog</Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">B20 vs ERC-20: What's the Difference?</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <time dateTime="2026-07-09">July 9, 2026</time>
            <span>·</span>
            <span>5 min read</span>
          </div>
        </header>

        <div className="mt-8 text-zinc-700">
          <p className="text-lg text-zinc-600">
            ERC-20 defined how fungible tokens work on Ethereum and its L2s. B20 is Base's answer to the question: what if those features were built into the protocol itself?
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">ERC-20 in a nutshell</h2>
          <p className="mt-3">
            ERC-20 is a standard interface — a set of functions (<code>transfer</code>, <code>approve</code>, <code>balanceOf</code>, etc.) that every token must implement. Each token is a separate smart contract that developers write, test, and deploy. The standard is minimal by design, which means teams add access control, supply caps, pausing, and other features themselves, usually by pulling in OpenZeppelin libraries.
          </p>
          <p className="mt-3">
            This approach works, but it has costs: auditing custom logic, paying gas to deploy a full contract, and trusting that whoever wrote the extensions did so correctly.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">What B20 changes</h2>
          <p className="mt-3">
            B20 is not a library or a contract template — it is a <strong>precompile</strong> built into Base's execution environment. You call a single factory function on Base itself to create a token; there is no contract bytecode to deploy or audit for the core functionality.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">ERC-20</th>
                  <th className="px-4 py-3">B20</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-foreground">
                {[
                  ["Transfer cost", "Standard gas", "Lower (precompile)"],
                  ["Role-based minting", "Custom / OpenZeppelin", "Built in"],
                  ["Supply cap", "Custom", "Built in"],
                  ["Pausing", "Custom", "Built in"],
                  ["Onchain memo", "Not standard", "Built in (transferWithMemo)"],
                  ["Permit (EIP-2612)", "Custom", "Built in"],
                  ["ERC-20 compatible", "✅", "✅"],
                  ["Deploy cost", "Full contract deploy", "Single factory call"],
                  ["Audit scope", "Your contract code", "Protocol-level only"],
                ].map(([feature, erc20, b20]) => (
                  <tr key={feature}>
                    <td className="px-4 py-3 font-medium text-foreground">{feature}</td>
                    <td className="px-4 py-3 text-zinc-500">{erc20}</td>
                    <td className="px-4 py-3 text-primary font-medium">{b20}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-foreground">When to use ERC-20</h2>
          <p className="mt-3">
            If you need to deploy on multiple EVM chains (not just Base), or need fully custom logic that goes beyond B20's feature set, a standard ERC-20 contract is the right choice. The existing tooling, audits, and integrations are unmatched.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">When to use B20</h2>
          <p className="mt-3">
            If you are building on Base and want a token with roles, supply caps, pausing, and memos without writing and auditing any Solidity, B20 is the better choice. It costs less gas per transfer, requires no custom contract, and the core behaviour is maintained by Base itself.
          </p>
          <p className="mt-3">
            B20 is especially well-suited for: loyalty tokens, stablecoins, in-game currencies, payment tokens, and any token that will primarily live on Base.
          </p>

          <h2 className="mt-8 text-xl font-semibold text-foreground">Are B20 tokens ERC-20 compatible?</h2>
          <p className="mt-3">
            Yes. B20 tokens implement the full ERC-20 interface. MetaMask, Uniswap, Aerodrome, block explorers, and any other tool that works with ERC-20 tokens will work with B20 tokens automatically.
          </p>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-8">
          <p className="text-sm text-zinc-500">Deploy your own B20 token in under a minute.</p>
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
