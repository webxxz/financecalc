"use client";

import { useEffect } from "react";

export default function ProPageTracker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "gtag" in window) {
      try {
        (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag("event", "pro_page_viewed");
      } catch {
        // silent
      }
    }
  }, []);

  return null;
}
