"use client";

import { FormEvent, useMemo, useState } from "react";

import { postCalculator, type CalculatorResponse } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";

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

export default function CalculatorUI({ title, description, endpoint, fields }: CalculatorUIProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalculatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

    try {
      const data = await postCalculator(endpoint, payload);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate");
    } finally {
      setLoading(false);
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

      {result ? (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Summary</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{result.summary}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Result</h3>
            <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-950">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Insights</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {result.insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
