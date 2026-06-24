"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function NetworkSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-foreground"
      >
        Testnet
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-zinc-200 bg-white p-1 text-xs shadow-lg">
          <div className="flex items-center rounded-md bg-primary/5 px-2 py-1.5 font-medium text-primary">
            Testnet
          </div>
          <div
            title="Mainnet support is coming soon"
            className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-2 py-1.5 text-zinc-400"
          >
            Mainnet
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px]">
              Soon
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
        <Image
          src="/B20.png"
          alt="B20"
          width={640}
          height={310}
          priority
          className="h-6 w-auto sm:h-8"
        />
        <span className="text-[11px] text-zinc-500 sm:text-lg sm:font-semibold sm:text-foreground">
          Token Launcher
        </span>
      </div>
      <div className="flex items-center gap-2">
        <NetworkSwitcher />
        <ConnectButton />
      </div>
    </header>
  );
}
