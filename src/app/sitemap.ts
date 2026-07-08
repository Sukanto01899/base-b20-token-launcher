import type { MetadataRoute } from "next";

const BLOG_SLUGS = [
  "what-is-b20-token",
  "b20-vs-erc20",
  "deploy-token-base-no-code",
  "create-stablecoin-base",
  "what-is-mint-role",
  "ai-deploy-crypto-tokens",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.deployb20.xyz",
      lastModified: new Date("2026-07-09"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.deployb20.xyz/mcp",
      lastModified: new Date("2026-07-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.deployb20.xyz/blog",
      lastModified: new Date("2026-07-09"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...BLOG_SLUGS.map((slug) => ({
      url: `https://www.deployb20.xyz/blog/${slug}`,
      lastModified: new Date("2026-07-09"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
