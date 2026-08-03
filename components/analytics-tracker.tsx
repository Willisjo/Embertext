"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const TRACKED_KEY = "embertext_tracked_pages";

function getTrackedPages(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = sessionStorage.getItem(TRACKED_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

function markPageTracked(pathname: string) {
  if (typeof window === "undefined") return;
  try {
    const tracked = getTrackedPages();
    tracked.add(pathname);
    sessionStorage.setItem(TRACKED_KEY, JSON.stringify([...tracked]));
  } catch {
    // Silently fail
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const tracked = getTrackedPages();
    if (tracked.has(pathname)) return;

    const track = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "visitor",
            data: {
              pagePath: pathname,
              referrer: document.referrer || "",
            },
          }),
        });
        markPageTracked(pathname);
      } catch {
        // Silently fail tracking
      }
    };

    track();
  }, [pathname]);

  return null;
}
