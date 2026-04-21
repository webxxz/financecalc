"use client";

import Link from "next/link";

type Props = {
  reason: "ai_limit" | "scenario_limit";
  compact?: boolean;
};

export default function UpgradePrompt({ reason, compact }: Props) {
  const messages = {
    ai_limit: "You have used your 5 free AI queries for today.",
    scenario_limit: "You have used your 10 free scenario analyses for today.",
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/20">
        <p className="text-xs text-amber-700 dark:text-amber-300">{messages[reason]}</p>
        <Link
          href="/pro"
          className="shrink-0 rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-amber-700"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
      <p className="font-semibold text-amber-800 dark:text-amber-300">{messages[reason]}</p>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
        Upgrade to Pro for unlimited AI queries, saved goals, and PDF export.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href="/pro"
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          Upgrade to Pro — ₹299/month
        </Link>
        <p className="text-xs text-amber-600 dark:text-amber-400">Free queries reset at midnight.</p>
      </div>
    </div>
  );
}
