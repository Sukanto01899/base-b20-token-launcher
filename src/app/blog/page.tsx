import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "./articles";

export const metadata: Metadata = {
  title: "Blog — B20 Token Guides & Tutorials",
  description:
    "Guides, tutorials, and explainers about B20 tokens on Base — how to deploy, mint, create stablecoins, and use AI to interact with tokens on Base blockchain.",
  alternates: { canonical: "https://www.deployb20.xyz/blog" },
};

export default function BlogIndex() {
  return (
    <div className="flex flex-1 flex-col bg-white">

      {/* Hero */}
      <section className="border-b border-zinc-100 bg-gradient-to-br from-primary/5 via-white to-white px-6 py-14 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          B20 on Base
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
          Guides &amp; Tutorials
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-500">
          Everything you need to know about deploying, minting, and using B20 tokens on Base — from first principles to AI-powered workflows.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <time dateTime={article.date}>
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>·</span>
                <span>{article.readTime}</span>
              </div>

              <h2 className="mt-3 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                {article.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                {article.description}
              </p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Read article
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
