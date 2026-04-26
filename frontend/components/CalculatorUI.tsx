"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { askAssistant, postCalculator, saveCalculation, type CalculatorResponse } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency-context";
import { auth } from "@/lib/firebase-client";
import { useUsage } from "@/lib/usage-context";
import ChartCard from "@/components/ChartCard";

const EmiBreakdownChart = dynamic(() => import("@/components/charts/EmiBreakdownChart"), { ssr: false });
const GrowthLineChart = dynamic(() => import("@/components/charts/GrowthLineChart"), { ssr: false });
const YearlyBreakdownTable = dynamic(() => import("@/components/charts/YearlyBreakdownTable"), { ssr: false });
const ExportPDFButton = dynamic(() => import("@/components/ExportPDFButton"), { ssr: false });
const ShareResult = dynamic(() => import("@/components/ShareResult"), { ssr: false });

type FieldConfig = {
  name: string;
  label: string;
  type?: "number" | "text";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
};

type CalculatorUIProps = {
  title: string;
  description: string;
  endpoint:
    | "/api/car-loan"
    | "/api/credit-card-payoff"
    | "/api/emi"
    | "/api/fd"
    | "/api/home-loan-eligibility"
    | "/api/investment-growth"
    | "/api/loan-interest-rate"
    | "/api/loan-tenure"
    | "/api/mortgage"
    | "/api/mortgage-refinance"
    | "/api/ppf"
    | "/api/rd"
    | "/api/retirement-withdrawal"
    | "/api/sip"
    | "/api/tax";
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
  "car_price",
  "cess",
  "annual_property_tax",
  "annual_home_insurance",
  "current_savings",
  "deductions",
  "estimated_returns",
  "estimated_tax",
  "future_value",
  "gross_income",
  "funded_surplus",
  "funding_gap",
  "initial_investment",
  "investment_gain",
  "monthly_contribution",
  "monthly_payment",
  "payment_needed_for_36_month_payoff",
  "required_nest_egg",
  "sustainable_annual_withdrawal_from_current",
  "sustainable_monthly_withdrawal_from_current",
  "total_amount_paid",
  "total_contributed",
  "total_interest_paid",
  "future_value_contributions",
  "future_value_current_savings",
  "loan_principal",
  "monthly_emi",
  "monthly_home_insurance",
  "monthly_investment",
  "monthly_mortgage_payment",
  "monthly_emi_at_max",
  "monthly_property_tax",
  "net_income_after_tax",
  "recommended_down_payment",
  "max_eligible_loan",
  "max_property_value",
  "maturity_amount",
  "monthly_take_home",
  "projected_retirement_corpus",
  "property_price",
  "target_amount",
  "tax_before_cess",
  "tax_saved_80c",
  "taxable_income",
  "total_deposited",
  "total_interest",
  "total_invested",
  "total_monthly_housing_cost",
  "total_payment",
  "total_tax",
]);

function formatINRCurrency(value: number): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const [intPart, decPart] = abs.toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const remaining = intPart.slice(0, -3);
  const formatted =
    remaining.length > 0
      ? remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return (isNegative ? "-" : "") + "₹" + formatted + "." + decPart;
}

function formatFieldValue(
  key: string,
  value: unknown,
  currency: (typeof SUPPORTED_CURRENCIES)[number]
): string {
  if (typeof value !== "number") return String(value);
  const normalizedKey = key.toLowerCase();
  const isMoneyLike = MONEY_FIELDS.has(normalizedKey);

  if (isMoneyLike) {
    let formatted: string;
    if (currency === "INR") {
      formatted = formatINRCurrency(value);
      if (value >= 10000000) {
        formatted += " (" + (value / 10000000).toFixed(2) + " Cr)";
      } else if (value >= 100000) {
        formatted += " (" + (value / 100000).toFixed(2) + " L)";
      }
    } else {
      formatted = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    }
    return formatted;
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
  const { currency, setCurrency } = useCurrency();
  const { consumeAIQuery } = useUsage();

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

    try {
      const data = await postCalculator(endpoint, payload);
      setResult(data);
      trackEvent("calculator_used", {
        calculator_type: title,
        currency,
      });

      if (auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        await saveCalculation(token, {
          calculator_type: title,
          input_data: payload,
          output_data: data.result,
        });
        toast.success("Calculation complete and saved to your dashboard history.");
      } else {
        toast.success("Calculation complete.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to calculate";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onAskAssistant = async () => {
    if (!result) return;
    if (!consumeAIQuery()) {
      const message = "AI free limit reached. Upgrade to Pro for unlimited AI usage.";
      setError(message);
      toast.error(message);
      return;
    }
    setAssistantLoading(true);
    setAssistant(null);
    setError("");
    try {
      const inputSummary = JSON.stringify(payload).slice(0, MAX_SUMMARY_LENGTH);
      const outputSummary = JSON.stringify(result.result).slice(0, MAX_SUMMARY_LENGTH);
      const aiQuery = `Explain this ${title} result in plain language and suggest next steps. Input summary: ${inputSummary}. Output summary: ${outputSummary}.`;
      const response = await askAssistant(aiQuery);
      setAssistant(response);
      toast.success("AI explanation ready.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to get AI explanation";
      setError(message);
      toast.error(message);
    } finally {
      setAssistantLoading(false);
    }
  };

  const growthData =
    result && Array.isArray(result.result["yearly_growth"])
      ? (result.result["yearly_growth"] as Array<{
          year: number;
          invested: number;
          value: number;
        }>)
      : null;

  const scheduleData =
    result && Array.isArray(result.result["yearly_schedule"])
      ? (result.result["yearly_schedule"] as Array<{
          year: number;
          principal_paid: number;
          interest_paid: number;
          balance: number;
        }>)
      : null;

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
        {fields.map((field) => {
          const sliderEnabled = field.showSlider && field.type !== "text";
          const currentValue = values[field.name] ?? "";
          const sliderDefaultValue = field.min !== undefined ? String(field.min) : "";
          const sliderValue = currentValue === "" ? sliderDefaultValue : currentValue;

          return (
            <div key={field.name} className="text-sm">
            <label htmlFor={`${field.name}-input`} className="mb-1 block font-medium">
              {field.label}
            </label>
            <input
              id={`${field.name}-input`}
              type={field.type || "number"}
              min={field.min}
              max={field.max}
              step={field.step ?? "any"}
              placeholder={field.placeholder}
              value={sliderEnabled ? sliderValue : currentValue}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950"
            />
            {sliderEnabled ? (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {field.label}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    {sliderValue}
                  </span>
                </div>
                <input
                  id={`${field.name}-slider`}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step ?? "any"}
                  value={sliderValue}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  aria-label={`${field.label} value`}
                  className="mt-1 w-full accent-indigo-600"
                />
              </div>
            ) : null}
            </div>
          );
        })}

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
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Summary</h2>
              <ExportPDFButton
                title={title}
                inputs={payload as Record<string, unknown>}
                result={result}
                currency={currency}
              />
            </div>
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

          <ShareResult title={`${title} Result`} summary={result.summary} />

          {typeof result.result["monthly_emi"] === "number" && typeof result.result["total_interest"] === "number" ? (
            <ChartCard title="EMI Payment Breakdown">
              <EmiBreakdownChart
                principal={(result.result["total_payment"] as number) - (result.result["total_interest"] as number)}
                totalInterest={result.result["total_interest"] as number}
                currency={currency}
              />
            </ChartCard>
          ) : null}

          {endpoint === "/api/car-loan" && typeof result.result["monthly_emi"] === "number" && typeof result.result["total_interest_paid"] === "number" ? (
            <ChartCard title="Car Loan Payment Breakdown">
              <EmiBreakdownChart
                principal={result.result["loan_amount"] as number}
                totalInterest={result.result["total_interest_paid"] as number}
                currency={currency}
              />
            </ChartCard>
          ) : null}

          {growthData && growthData.length > 0 ? (
            <ChartCard title="Yearly Growth">
              <GrowthLineChart data={growthData} currency={currency} />
            </ChartCard>
          ) : null}

          {scheduleData && scheduleData.length > 0 ? (
            <ChartCard title="Yearly Amortisation Schedule">
              <YearlyBreakdownTable rows={scheduleData} currency={currency} />
            </ChartCard>
          ) : null}

          <div id="ai-assistant" className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
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
