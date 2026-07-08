export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "what-is-b20-token",
    title: "What is a B20 Token on Base?",
    description:
      "B20 is Base's native token standard — an ERC-20 superset built as a precompile with built-in roles, supply caps, pausing, and memos. Here's everything you need to know.",
    date: "2026-07-09",
    readTime: "4 min read",
  },
  {
    slug: "b20-vs-erc20",
    title: "B20 vs ERC-20: What's the Difference?",
    description:
      "ERC-20 is the most widely used token standard, but B20 takes it further. Learn what B20 adds, why it runs cheaper, and when you should choose one over the other.",
    date: "2026-07-09",
    readTime: "5 min read",
  },
  {
    slug: "deploy-token-base-no-code",
    title: "How to Deploy a Token on Base Without Code",
    description:
      "A step-by-step guide to deploying your own B20 token on Base Mainnet or Sepolia using a wallet — no Solidity, no CLI, no backend required.",
    date: "2026-07-09",
    readTime: "3 min read",
  },
  {
    slug: "create-stablecoin-base",
    title: "How to Create a Stablecoin on Base",
    description:
      "The B20 STABLECOIN variant lets you deploy a fiat-pegged token with a permanent currency code and fixed 6 decimals. Here's how to do it.",
    date: "2026-07-09",
    readTime: "4 min read",
  },
  {
    slug: "what-is-mint-role",
    title: "What is MINT_ROLE in B20 Tokens?",
    description:
      "B20 uses role-based access control. MINT_ROLE is the permission that lets an address issue new supply. Learn why it exists separately from admin rights and how to manage it.",
    date: "2026-07-09",
    readTime: "3 min read",
  },
  {
    slug: "ai-deploy-crypto-tokens",
    title: "How to Deploy Crypto Tokens Using AI (Claude + B20 MCP)",
    description:
      "The B20 MCP server lets Claude and other AI assistants deploy tokens, mint supply, and send payments on Base using plain English — no wallet UI needed.",
    date: "2026-07-09",
    readTime: "5 min read",
  },
];
