"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { postCalculator, type CalculatorResponse } from "@/lib/api";

type FieldConfig = { key: string; label: string };

const ASSET_FIELDS: FieldConfig[] = [
  { key: "cash_and_savings", label: "Cash and Savings (₹)" },
  { key: "investments", label: "Investments — stocks, MF, FD (₹)" },
  { key: "property_value", label: "Property Value (₹)" },
  { key: "vehicle_value", label: "Vehicle Value (₹)" },
  { key: "other_assets", label: "Other Assets (₹)" },
];

const LIABILITY_FIELDS: FieldConfig[] = [
  { key: "home_loan_outstanding", label: "Home Loan Outstanding (₹)" },
  { key: "personal_loan_outstanding", label: "Personal Loan Outstanding (₹)" },
  { key: "car_loan_outstanding", label: "Car Loan Outstanding (₹)" },
  { key: "credit_card_debt", label: "Credit Card Debt (₹)" },
  { key: "other_liabilities", label: "Other Liabilities (₹)" },
];

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function NetWorthClient() {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries([...ASSET_FIELDS, ...LIABILITY_FIELDS].map((field) => [field.key, "0"])),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<CalculatorResponse | null>(null);

  const totals = useMemo(() => {
    const totalAssets = ASSET_FIELDS.reduce((sum, field) => sum + toNumber(values[field.key] ?? "0"), 0);
    const totalLiabilities = LIABILITY_FIELDS.reduce((sum, field) => sum + toNumber(values[field.key] ?? "0"), 0);
    const netWorth = totalAssets - totalLiabilities;
    const ratio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    return { totalAssets, totalLiabilities, netWorth, ratio };
  }, [values]);

  const onGetAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, toNumber(value)]));
      const data = await postCalculator("/api/net-worth", payload);
      setResponse(data);
      toast.success("Analysis generated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to analyze net worth";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold tracking-tight">Net Worth Calculator</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Calculate your assets, liabilities, net worth, and debt-to-asset ratio in real time.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Assets</h2>
          {ASSET_FIELDS.map((field) => (
            <label key={field.key} className="block text-sm">
              <span className="mb-1 block font-medium">{field.label}</span>
              <input
                type="number"
                min={0}
                step="any"
                value={values[field.key] ?? "0"}
                onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          ))}
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Liabilities</h2>
          {LIABILITY_FIELDS.map((field) => (
            <label key={field.key} className="block text-sm">
              <span className="mb-1 block font-medium">{field.label}</span>
              <input
                type="number"
                min={0}
                step="any"
                value={values[field.key] ?? "0"}
                onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-950">
        <h3 className="text-lg font-semibold">Live Calculation</h3>
        <div className="mt-2 space-y-1 text-sm">
          <p>Total Assets: {formatMoney(totals.totalAssets)}</p>
          <p>Total Liabilities: {formatMoney(totals.totalLiabilities)}</p>
          <p className="font-semibold">Net Worth: {formatMoney(totals.netWorth)}</p>
          <p>Debt-to-Asset Ratio: {totals.ratio.toFixed(2)}%</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onGetAnalysis}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Get Full Analysis"}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {response ? (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Summary</h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{response.summary}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Insights</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {response.insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
