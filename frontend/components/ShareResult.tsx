"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";

type Props = {
  title: string;
  summary: string;
  url?: string;
};

export default function ShareResult({ title, summary, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const shareText = `${title}\n${summary}\n\n${shareUrl}`;

  const handleCopy = async () => {
    trackEvent("share_clicked", { share_method: "copy_link" });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link manually:", shareUrl);
    }
  };

  const handleWhatsApp = () => {
    trackEvent("share_clicked", { share_method: "whatsapp" });
    const waUrl = "https://wa.me/?text=" + encodeURIComponent(shareText);
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    trackEvent("share_clicked", { share_method: "download" });
    const blob = new Blob([shareText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = `${safeTitle || "financecalc"}-result.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="mb-3 text-sm font-semibold">Share this result</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          type="button"
          onClick={handleWhatsApp}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Share on WhatsApp
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Download TXT
        </button>
      </div>
    </div>
  );
}
