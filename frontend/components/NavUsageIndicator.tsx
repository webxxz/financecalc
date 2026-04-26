"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useUsage } from "@/lib/usage-context";

export default function NavUsageIndicator() {
  const { aiQueriesRemaining, isProUser } = useUsage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isProUser) {
    return (
      <Link href="/pro" className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        Pro ✓
      </Link>
    );
  }

  const remaining = aiQueriesRemaining === Infinity ? 5 : aiQueriesRemaining;

  return (
    <Link href="/pro" className="text-xs text-zinc-500 hover:underline dark:text-zinc-400">
      {remaining}/5 AI queries left
    </Link>
  );
}
