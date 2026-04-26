"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import { useUsage } from "@/lib/usage-context";

const ScenarioCard = dynamic(() => import("@/components/ScenarioCard"), { ssr: false });
const SCENARIOS = ["rent_vs_buy", "debt_vs_invest", "lumpsum_vs_sip", "early_retirement", "loan_comparison"] as const;

export default function DecidePage() {
  const { aiQueriesRemaining, isProUser } = useUsage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="space-y-6">
      {!isProUser && mounted && aiQueriesRemaining <= 2 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/40">
          <p className="font-medium text-amber-900 dark:text-amber-200">
            You have {aiQueriesRemaining} free AI {aiQueriesRemaining === 1 ? "query" : "queries"} left today.
          </p>
          <p className="mt-1 text-amber-800 dark:text-amber-300">
            Upgrade for unlimited AI usage.{" "}
            <Link href="/pro" className="font-semibold underline">
              Go Pro
            </Link>
          </p>
        </div>
      ) : null}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Decision Lab</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Ask a financial question and run scenario comparisons.
        </p>
      </div>
      <ChatInterface />
      <div className="grid gap-4 md:grid-cols-2">
        {SCENARIOS.map((scenario) => (
          <ScenarioCard key={scenario} scenario={scenario} />
        ))}
      </div>
    </section>
  );
}
