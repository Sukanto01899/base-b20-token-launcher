"use client";

import { useState } from "react";

export function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="group relative mt-2">
      <pre className="overflow-x-auto rounded-lg bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-100">
        <code>{children}</code>
      </pre>
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy"}
        className="absolute right-2 top-2 rounded p-1.5 text-zinc-400 transition-all hover:bg-zinc-700 hover:text-zinc-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        {copied ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
