"use client";

import { useUsage } from "@/lib/usage-context";

export default function NavUsageIndicator() {
  const { aiQueriesRemaining, isProUser } = useUsage();

  if (isProUser) {
    return <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Pro ✓</span>;
  }

  return <span className="text-xs text-zinc-500 dark:text-zinc-400">{aiQueriesRemaining} AI queries left</span>;
}
