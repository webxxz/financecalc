"use client";

import { FormEvent, useMemo, useState } from "react";

import { askAssistant, postCalculator, saveCalculation, type CalculatorResponse } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";
import { auth } from "@/lib/firebase-client";

type FieldConfig = {
  name: string;
  label: string;
  type?: "number" | "text";
  placeholder?: string;
  min?: number;
  step?: number;
};

type CalculatorUIProps = {
  title: string;
  description: string;
  endpoint: "/api/emi" | "/api/sip" | "/api/mortgage";
  fields: FieldConfig[];
};

const SUPPORTED_CURRENCIES = ["USD", "INR", "EUR", "GBP"] as const;
const MAX_SUMMARY_LENGTH = 600;
const CURRENCY_LOCALE: Record<(typeof SUPPORTED_CURRENCIES)[number], string> = {
  USD: "en-US",
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};
const MONEY_FIELDS = new Set([
  "annual_contribution",
  "annual_income",
  "annual_property_tax",
  "annual_home_insurance",
  "current_savings",
  "deductions",
  "estimated_returns",
  "estimated_tax",
  "future_value",
  "future_value_contributions",
  "future_value_current_savings",
  "loan_principal",
  "monthly_emi",
  "monthly_home_insurance",
  "monthly_investment",
  "monthly_mortgage_payment",
  "monthly_property_tax",
  "net_income_after_tax",
  "projected_retirement_corpus",
  "property_price",
  "target_amount",
  "total_interest",
  "total_invested",
  "total_monthly_housing_cost",
  "total_payment",
]);

function formatFieldValue(key: string, value: unknown, currency: (typeof SUPPORTED_CURRENCIES)[number]): string {
  if (typeof value !== "number") return String(value);
  const normalizedKey = key.toLowerCase();
  const isMoneyLike = MONEY_FIELDS.has(normalizedKey);
  if (isMoneyLike) {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], { maximumFractionDigits: 2 }).format(value);
}

export default function CalculatorUI({ title, description, endpoint, fields }: CalculatorUIProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assistant, setAssistant] = useState<CalculatorResponse | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const { currency, setCurrency } = useCurrency();

  const payload = useMemo(() => {
    const converted: Record<string, number | string> = {};
    for (const [key, value] of Object.entries(values)) {
      if (value.trim() === "") continue;
      const numeric = Number(value);
      converted[key] = Number.isFinite(numeric) ? numeric : value;
    }
    return converted;
  }, [values]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setAssistant(null);
    setSaveMessage("");

    try {
      const data = await postCalculator(endpoint, payload);
      setResult(data);

      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        await saveCalculation(token, {
          calculator_type: title,
          input_data: payload,
          output_data: data.result,
        });
        setSaveMessage("Saved to your dashboard history.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate");
    } finally {
      setLoading(false);
    }
  };

  const onAskAssistant = async () => {
    if (!result) return;
    setAssistantLoading(true);
    setAssistant(null);
    setError("");
    try {
      const inputSummary = JSON.stringify(payload).slice(0, MAX_SUMMARY_LENGTH);
      const outputSummary = JSON.stringify(result.result).slice(0, MAX_SUMMARY_LENGTH);
      const aiQuery = `Explain this ${title} result in plain language and suggest next steps. Input summary: ${inputSummary}. Output summary: ${outputSummary}.`;
      const response = await askAssistant(aiQuery);
      setAssistant(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to get AI explanation");
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
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
        {fields.map((field) => (
          <label key={field.name} className="text-sm">
            <span className="mb-1 block font-medium">{field.label}</span>
            <input
              type={field.type || "number"}
              min={field.min}
              step={field.step ?? "any"}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
        ))}

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
      {saveMessage ? <p className="mt-4 text-sm text-emerald-600">{saveMessage}</p> : null}

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
                  <span className="font-medium text-zinc-700 capitalize dark:text-zinc-300">{key.replace(/_/g, " ")}</span>
                  <span className="text-right">{formatFieldValue(key, value, currency)}</span>
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

          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Ask AI About This Result</h3>
              <button
                type="button"
                onClick={onAskAssistant}
                disabled={assistantLoading}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {assistantLoading ? "Asking AI..." : "Explain This Result"}
              </button>
            </div>
            {assistant ? (
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300">{assistant.summary}</p>
                <ul className="list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
                  {assistant.insights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40">
            <p className="text-sm font-semibold">Partner Suggestion</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              Compare home loan offers, rates, and processing fees from lending partners before finalizing your decision.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
