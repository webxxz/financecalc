"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";

import { runScenario, type ScenarioResponse } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useUsage } from "@/lib/usage-context";

const UpgradePrompt = dynamic(() => import("@/components/UpgradePrompt"), { ssr: false });

type Props = {
  scenario: string;
};

export default function ScenarioCard({ scenario }: Props) {
  const { consumeScenarioRun } = useUsage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    const allowed = consumeScenarioRun();
    if (!allowed) {
      setError("__limit_reached__");
      setLoading(false);
      return;
    }

    try {
      const data = await runScenario({ scenario, inputs: {} });
      setResult(data);
      trackEvent("scenario_run", {
        scenario_type: scenario,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to run scenario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-semibold">Scenario: {scenario}</h3>
      <form className="mt-3" onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "Running..." : "Run Scenario"}
        </button>
      </form>

      {error === "__limit_reached__" ? (
        <div className="mt-3">
          <UpgradePrompt reason="scenario_limit" />
        </div>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}

      {result ? <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{result.verdict_label}</p> : null}
    </section>
  );
}
