"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENT } from "@/lib/config";

const STORAGE_KEY = "b20-announcement-dismissed";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === ANNOUNCEMENT.id);
  }, []);

  if (!ANNOUNCEMENT.enabled || dismissed) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-sm font-medium text-white">
      <span>{ANNOUNCEMENT.message}</span>
      <button
        type="button"
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT.id);
          setDismissed(true);
        }}
        aria-label="Dismiss announcement"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
