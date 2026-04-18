"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import ChartCard from "@/components/ChartCard";
import { postCalculator, saveCalculation, type CalculatorResponse } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";
import { auth } from "@/lib/firebase-client";

const CompareRegimesChart = dynamic(() => import("@/components/charts/CompareRegimesChart"), { ssr: false });

const SUPPORTED_CURRENCIES = ["USD", "INR", "EUR", "GBP"] as const;
const CURRENCY_LOCALE: Record<(typeof SUPPORTED_CURRENCIES)[number], string> = {
  USD: "en-US",
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};
const CURRENCY_FIELDS = new Set([
  "gross_income",
  "taxable_income",
  "tax_before_cess",
  "cess",
  "total_tax",
  "net_income_after_tax",
  "monthly_take_home",
]);

function formatValue(key: string, value: unknown, currency: (typeof SUPPORTED_CURRENCIES)[number]): string {
  if (typeof value !== "number") return String(value);
  if (key === "effective_tax_rate") {
    return `${value.toFixed(2)}%`;
  }
  if (CURRENCY_FIELDS.has(key)) {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], { maximumFractionDigits: 2 }).format(value);
}

export default function TaxCalculatorClient() {
  const { currency, setCurrency } = useCurrency();
  const [annualIncome, setAnnualIncome] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");
  const [regime, setRegime] = useState<"new" | "old">("new");
  const [result, setResult] = useState<CalculatorResponse | null>(null);
  const [comparisonResult, setComparisonResult] = useState<CalculatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(
    () => ({
      annual_income: Number(annualIncome) || 0,
      other_deductions: Number(otherDeductions) || 0,
      regime,
    }),
    [annualIncome, otherDeductions, regime],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setComparisonResult(null);

    try {
      const data = await postCalculator("/api/tax", payload);
      setResult(data);

      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        await saveCalculation(token, {
          calculator_type: "Income Tax Calculator",
          input_data: payload,
          output_data: data.result,
        });
        toast.success("Calculation complete and saved to your dashboard history.");
      } else {
        toast.success("Calculation complete.");
      }

      const oppositeRegime: "new" | "old" = regime === "new" ? "old" : "new";
      setComparisonLoading(true);
      void (async () => {
        try {
          const comparison = await postCalculator("/api/tax", {
            annual_income: payload.annual_income,
            other_deductions: payload.other_deductions,
            regime: oppositeRegime,
          });
          setComparisonResult(comparison);
        } catch {
          toast.error("Unable to load regime comparison.");
        } finally {
          setComparisonLoading(false);
        }
      })();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to calculate tax";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Income Tax Calculator</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Calculate FY 2025-26 taxes under old and new regimes, including cess and rebate impact.
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2">Currency</span>
          <select
            className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Annual Income</span>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="800000"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Other Deductions</span>
          <input
            type="number"
            min={0}
            step="any"
            placeholder="150000"
            value={otherDeductions}
            onChange={(e) => setOtherDeductions(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Tax Regime</span>
          <select
            value={regime}
            onChange={(e) => setRegime(e.target.value as "new" | "old")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="new">New Regime (Default)</option>
            <option value="old">Old Regime</option>
          </select>
        </label>

        <div className="text-sm">
          <span className="mb-1 block font-medium">Financial Year</span>
          <div className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">FY 2025-26</div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading && !result ? (
        <div className="mt-6 space-y-3">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-16 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : null}

      {result ? (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Result</h3>
            <div className="mt-2 space-y-2 rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-950">
              {Object.entries(result.result).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="font-medium capitalize text-zinc-700 dark:text-zinc-300">{key.replace(/_/g, " ")}</span>
                  <span className="text-right">{formatValue(key, value, currency)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Insights</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {result.insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <ChartCard title="Old vs New Regime Tax Comparison">
            {comparisonLoading ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading comparison...</p>
            ) : comparisonResult ? (
              <CompareRegimesChart
                oldRegimeTax={regime === "old" ? (result.result["total_tax"] as number) : (comparisonResult.result["total_tax"] as number)}
                newRegimeTax={regime === "new" ? (result.result["total_tax"] as number) : (comparisonResult.result["total_tax"] as number)}
                currency={currency}
              />
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Comparison unavailable.</p>
            )}
          </ChartCard>
        </div>
      ) : null}
    </section>
  );
}
