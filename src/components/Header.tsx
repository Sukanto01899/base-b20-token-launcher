"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
        <Image
          src="/B20-logo.png"
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
        <ConnectButton />
      </div>
    </header>
  );
}
