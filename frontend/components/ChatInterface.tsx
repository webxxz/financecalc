"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";

import { type DecisionResponse, runDecision } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useUsage } from "@/lib/usage-context";

const UpgradePrompt = dynamic(() => import("@/components/UpgradePrompt"), { ssr: false });

export default function ChatInterface() {
  const { aiQueriesRemaining, isProUser, consumeAIQuery } = useUsage();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    const allowed = consumeAIQuery();
    if (!allowed) {
      setError("__limit_reached__");
      setLoading(false);
      return;
    }

    try {
      const data = await runDecision({ message });
      setResult(data);
      trackEvent("ai_query", {
        calculator_type: "decision_engine",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to get AI decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold">Ask AI</h2>
      <form onSubmit={sendMessage} className="mt-3 space-y-3">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe your financial decision..."
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />

        {!isProUser ? (
          <p className="mt-1 text-center text-xs text-zinc-400">
            {aiQueriesRemaining} free AI {aiQueriesRemaining === 1 ? "query" : "queries"} remaining today
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Get Decision"}
        </button>
      </form>

      {error === "__limit_reached__" ? (
        <div className="mt-3 max-w-[90%]">
          <UpgradePrompt reason="ai_limit" />
        </div>
      ) : error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}

      {result ? <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{result.verdict_label ?? result.verdict}</p> : null}
    </section>
  );
}
