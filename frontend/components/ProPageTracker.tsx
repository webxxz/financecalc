"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

export default function ProPageTracker() {
  useEffect(() => {
    trackEvent("pro_page_viewed");
  }, []);

  return null;
}
