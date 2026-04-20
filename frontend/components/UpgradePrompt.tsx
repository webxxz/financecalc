"use client";

import Link from "next/link";

type UpgradePromptProps = {
  reason?: "ai_limit" | "scenario_limit" | "pdf_export";
  compact?: boolean;
};

export default function UpgradePrompt({ reason = "ai_limit", compact = false }: UpgradePromptProps) {
  const copyByReason: Record<NonNullable<UpgradePromptProps["reason"]>, string> = {
    ai_limit: "You have reached your free AI usage limit.",
    scenario_limit: "You have reached your free scenario limit.",
    pdf_export: "PDF export is available for Pro users.",
  };

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30 ${compact ? "text-sm" : ""}`}
    >
      <p className="font-semibold text-amber-900 dark:text-amber-200">Upgrade to Pro</p>
      <p className="mt-1 text-amber-800 dark:text-amber-300">{copyByReason[reason]}</p>
      <Link
        href="/pro"
        className="mt-3 inline-flex rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
      >
        View Pro Plans
      </Link>
    </div>
  );
}
