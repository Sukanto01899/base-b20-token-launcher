import { AppShell } from "./AppShell";

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

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-white">
      <main className="w-full max-w-5xl px-6 py-12">

        {/* Interactive app — client component */}
        <AppShell />

        {/* FAQ — server-rendered so Google can index it */}
        <div className="mt-12 flex flex-col gap-3">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.id}
              id={`faq-${item.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground">
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
