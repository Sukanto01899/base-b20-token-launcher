"use client";

import { useState } from "react";

type Heart = { id: number; x: number; emoji: string };

const EMOJIS = ["❤️", "🩷", "💛", "🤍", "💙"];
let _id = 0;

export function Footer() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  function spawnHearts() {
    const batch = Array.from({ length: 7 }, () => ({
      id: ++_id,
      x: Math.random() * 100 - 50,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setHearts((h) => [...h, ...batch]);
    setTimeout(
      () => setHearts((h) => h.filter((n) => !batch.find((b) => b.id === n.id))),
      1100,
    );
  }

  return (
    <>
      <style>{`
        @keyframes b20-gradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .b20-grad {
          background: linear-gradient(90deg, #fff 0%, #fde68a 20%, #f9a8d4 45%, #a5f3fc 70%, #fff 100%);
          background-size: 250% auto;
          animation: b20-gradient 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @keyframes b20-float {
          0%   { transform: translateY(0) scale(1);    opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-72px) scale(0.3); opacity: 0; }
        }
        .b20-heart {
          position: absolute;
          bottom: 100%;
          pointer-events: none;
          user-select: none;
          font-size: 1.15rem;
          line-height: 1;
          animation: b20-float 1.05s ease-out forwards;
        }
        @keyframes b20-show-x {
          0%, 38%  { opacity: 1; }
          48%, 92% { opacity: 0; }
          100%     { opacity: 1; }
        }
        @keyframes b20-show-follow {
          0%, 38%  { opacity: 0; }
          48%, 92% { opacity: 1; }
          100%     { opacity: 0; }
        }
        .b20-icon-x      { animation: b20-show-x      3.5s ease-in-out infinite; }
        .b20-icon-follow { animation: b20-show-follow  3.5s ease-in-out infinite; }
      `}</style>

      <footer className="flex flex-col items-center gap-3 border-t border-primary bg-primary px-6 py-4 text-sm text-white sm:flex-row sm:justify-between sm:gap-4">

        {/* Left — gradient name + Connect button */}
        <div className="relative flex items-center gap-2">
          {/* "Built by Sukanto" — gradient text, spawns hearts on click */}
          <button
            onClick={spawnHearts}
            className="select-none font-semibold"
            aria-label="Built by Sukanto"
          >
            <span className="b20-grad">Built by Sukanto</span>
          </button>

          {/* Connect button — animated X ↔ Follow icon */}
          <a
            href="https://x.com/sukanto018"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
          >
            <span className="relative inline-block h-3 w-3">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="b20-icon-x absolute inset-0 h-full w-full fill-white">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="b20-icon-follow absolute inset-0 h-full w-full">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </span>
            Connect
          </a>

          {hearts.map((h) => (
            <span
              key={h.id}
              className="b20-heart"
              style={{ left: `calc(50% + ${h.x}px)` }}
            >
              {h.emoji}
            </span>
          ))}
        </div>

        {/* Right — nav links */}
        <div className="flex items-center gap-4">
          <a href="/blog" className="text-white underline hover:text-white/80">
            Blog
          </a>
          <a href="/mcp" className="text-white underline hover:text-white/80">
            B20 MCP
          </a>
          <a
            href="https://docs.base.org/get-started/launch-b20-token"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:text-white/80"
          >
            Docs
          </a>
        </div>

      </footer>
    </>
  );
}
