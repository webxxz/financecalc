"use client";

import dynamic from "next/dynamic";
import { type ScenarioResponse } from "@/lib/api";
import ChartCard from "@/components/ChartCard";

const GrowthLineChart = dynamic(() => import("@/components/charts/GrowthLineChart"), { ssr: false });

type Props = {
  result: ScenarioResponse;
  currency: string;
  onAskAI?: () => void;
};

type ValueRecord = Record<string, unknown>;
type LumpsumVsSipYear = { year: number; lumpsum: number; sip: number; sip_invested: number };

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};

function asRecord(value: unknown): ValueRecord | null {
  return typeof value === "object" && value !== null ? (value as ValueRecord) : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function formatLabel(label: string): string {
  return label
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function renderMetric(label: string, value: number | null, formatCurrency: (amount: number) => string) {
  return (
    <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="text-sm font-semibold">{value === null ? "—" : formatCurrency(value)}</p>
    </div>
  );
}

export default function ScenarioResultDisplay({ result, currency, onAskAI }: Props) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const bannerTone =
    result.verdict === "on_track" || result.verdict === "buy" || result.verdict === "lumpsum" || result.verdict === "loan_a"
      ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-200"
      : result.verdict === "gap_exists" || result.verdict === "rent" || result.verdict === "sip" || result.verdict === "loan_b"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
        : "border-indigo-200 bg-indigo-50 text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-200";

  const data = asRecord(result.data) ?? {};
  const buy = asRecord(data.buy);
  const rent = asRecord(data.rent);
  const prepay = asRecord(data.prepay);
  const invest = asRecord(data.invest);
  const lumpsum = asRecord(data.lumpsum);
  const sip = asRecord(data.sip);
  const coveragePercent = asNumber(data.coverage_percent);

  const yearlyComparison = Array.isArray(data.yearly_comparison)
    ? (data.yearly_comparison as LumpsumVsSipYear[])
    : [];

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${bannerTone}`}>{result.verdict_label}</div>

      {result.scenario === "rent_vs_buy" ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Buy" className={result.verdict === "buy" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "buy" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <div className="grid grid-cols-1 gap-2">{[
                  renderMetric("Monthly Cost", asNumber(buy?.monthly_cost), formatCurrency),
                  renderMetric("Total Cost Over Period", asNumber(buy?.total_cost_over_period), formatCurrency),
                  renderMetric("Property Value At End", asNumber(buy?.property_value_at_end), formatCurrency),
                  renderMetric("Net Position", asNumber(buy?.net_position), formatCurrency),
                ]}</div>
              </div>
            </ChartCard>

            <ChartCard title="Rent" className={result.verdict === "rent" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "rent" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <div className="grid grid-cols-1 gap-2">{[
                  renderMetric("Monthly Cost", asNumber(rent?.monthly_cost), formatCurrency),
                  renderMetric("Total Rent Over Period", asNumber(rent?.total_rent_over_period), formatCurrency),
                  renderMetric("Investment Value At End", asNumber(rent?.investment_value_at_end), formatCurrency),
                  renderMetric("Net Position", asNumber(rent?.net_position), formatCurrency),
                ]}</div>
              </div>
            </ChartCard>
          </div>

          {asNumber(data.break_even_year) !== null ? (
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              📅 Break-even: buying beats renting after {asNumber(data.break_even_year)} years
            </p>
          ) : null}
        </div>
      ) : null}

      {result.scenario === "debt_vs_invest" ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Prepay Loan" className={result.verdict === "prepay" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "prepay" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200">
                  {asBoolean(prepay?.guaranteed_return) ? "Guaranteed ✓" : "Market risk ⚠"}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {renderMetric("Interest Saved", asNumber(prepay?.interest_saved), formatCurrency)}
                  {renderMetric("Effective Loan Rate", asNumber(prepay?.effective_loan_rate), (value) => `${value.toFixed(2)}%`)}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Invest Surplus" className={result.verdict === "invest" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "invest" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  {asBoolean(invest?.guaranteed_return) ? "Guaranteed ✓" : "Market risk ⚠"}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {renderMetric("Investment Value", asNumber(invest?.investment_value), formatCurrency)}
                  {renderMetric("Net Gain", asNumber(invest?.net_gain), formatCurrency)}
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/40 dark:text-indigo-200">
            Difference: {asNumber(data.difference) === null ? "—" : formatCurrency(asNumber(data.difference) as number)}
          </div>
        </div>
      ) : null}

      {result.scenario === "lumpsum_vs_sip" ? (
        <div className="space-y-4">
          {yearlyComparison.length > 0 ? (
            <ChartCard title="Yearly Comparison">
              <GrowthLineChart
                data={yearlyComparison.map((item) => ({ year: item.year, value: item.lumpsum, invested: item.sip }))}
                currency={currency}
              />
            </ChartCard>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Lump Sum" className={result.verdict === "lumpsum" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "lumpsum" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <div className="grid grid-cols-1 gap-2">
                  {renderMetric("Invested", asNumber(lumpsum?.invested), formatCurrency)}
                  {renderMetric("Final Value", asNumber(lumpsum?.final_value), formatCurrency)}
                  {renderMetric("Total Gain", asNumber(lumpsum?.total_gain), formatCurrency)}
                </div>
              </div>
            </ChartCard>

            <ChartCard title="SIP" className={result.verdict === "sip" ? "border-2 border-indigo-500" : ""}>
              <div className="space-y-3">
                {result.verdict === "sip" ? (
                  <span className="inline-flex rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                    ✓ Better
                  </span>
                ) : null}
                <div className="grid grid-cols-1 gap-2">
                  {renderMetric("Monthly Amount", asNumber(sip?.monthly_amount), formatCurrency)}
                  {renderMetric("Final Value", asNumber(sip?.final_value), formatCurrency)}
                  {renderMetric("Total Gain", asNumber(sip?.total_gain), formatCurrency)}
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      ) : null}

      {result.scenario === "early_retirement" ? (
        <div className="space-y-4">
          <ChartCard title="Retirement Readiness">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Coverage</span>
                <span className="font-semibold">{coveragePercent === null ? "—" : `${coveragePercent}%`}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className={`h-full ${
                    (coveragePercent ?? 0) >= 100 ? "bg-green-500" : (coveragePercent ?? 0) >= 70 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(coveragePercent ?? 0, 100))}%` }}
                />
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Object.entries({
                  projected_corpus: "Projected Corpus",
                  required_corpus: "Required Corpus",
                  corpus_gap: "Corpus Gap",
                  additional_monthly_savings_needed: "Additional Monthly Savings Needed",
                }).map(([key, label]) => renderMetric(label, asNumber(data[key]), formatCurrency))}
              </div>
            </div>
          </ChartCard>
        </div>
      ) : null}

      {result.insights.length > 0 ? (
        <ChartCard title="Insights">
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            {result.insights.map((insight, index) => (
              <li key={`${result.scenario}-insight-${index}`}>{insight}</li>
            ))}
          </ul>
        </ChartCard>
      ) : null}

      {onAskAI ? (
        <button
          type="button"
          onClick={onAskAI}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Ask AI for next steps
        </button>
      ) : null}

      {!["rent_vs_buy", "debt_vs_invest", "lumpsum_vs_sip", "early_retirement"].includes(result.scenario) ? (
        <ChartCard title="Scenario Summary">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {formatLabel(result.scenario)} result is available. Detailed UI for this scenario will be added in the next step.
          </p>
        </ChartCard>
      ) : null}
    </div>
  );
}
