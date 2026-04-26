"use client";

import dynamic from "next/dynamic";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { runScenario, type ScenarioResponse } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency-context";
import { useUsage } from "@/lib/usage-context";

const UpgradePrompt = dynamic(() => import("@/components/UpgradePrompt"), { ssr: false });
const ScenarioResultDisplay = dynamic(() => import("@/components/ScenarioResultDisplay"), { ssr: false });

type Props = {
  scenario: string;
};

type ScenarioField = {
  name: string;
  label: string;
  type?: "number" | "checkbox";
  min?: number;
  step?: number;
};

type ScenarioConfig = {
  title: string;
  description: string;
  fields: ScenarioField[];
  defaults: Record<string, string>;
};

const SCENARIO_CONFIGS: Record<string, ScenarioConfig> = {
  rent_vs_buy: {
    title: "Rent vs Buy",
    description: "Compare net financial outcomes of buying vs renting over your chosen time horizon.",
    fields: [
      { name: "monthly_rent", label: "Monthly Rent", type: "number", min: 0, step: 1 },
      { name: "property_price", label: "Property Price", type: "number", min: 1, step: 1 },
      { name: "down_payment", label: "Down Payment", type: "number", min: 0, step: 1 },
      { name: "annual_interest_rate", label: "Mortgage Interest Rate (%)", type: "number", min: 0, step: 0.01 },
      { name: "tenure_years", label: "Analysis Horizon (Years)", type: "number", min: 1, step: 1 },
      { name: "annual_property_appreciation", label: "Property Appreciation (%)", type: "number", min: 0, step: 0.01 },
      { name: "annual_investment_return", label: "Investment Return (%)", type: "number", min: 0, step: 0.01 },
    ],
    defaults: {
      monthly_rent: "25000",
      property_price: "10000000",
      down_payment: "2000000",
      annual_interest_rate: "8.5",
      tenure_years: "20",
      annual_property_appreciation: "5",
      annual_investment_return: "10",
    },
  },
  debt_vs_invest: {
    title: "Debt vs Invest",
    description: "Decide whether surplus cash should prepay debt or be invested.",
    fields: [
      { name: "loan_outstanding", label: "Outstanding Loan", type: "number", min: 1, step: 1 },
      { name: "loan_interest_rate", label: "Loan Interest Rate (%)", type: "number", min: 0, step: 0.01 },
      { name: "monthly_surplus", label: "Monthly Surplus", type: "number", min: 0, step: 1 },
      { name: "expected_investment_return", label: "Expected Investment Return (%)", type: "number", min: 0, step: 0.01 },
      { name: "loan_tenure_remaining_months", label: "Remaining Loan Tenure (Months)", type: "number", min: 1, step: 1 },
      { name: "tax_bracket", label: "Tax Bracket (%)", type: "number", min: 0, step: 0.01 },
      { name: "is_home_loan", label: "Is this a home loan?", type: "checkbox" },
    ],
    defaults: {
      loan_outstanding: "2500000",
      loan_interest_rate: "10",
      monthly_surplus: "25000",
      expected_investment_return: "12",
      loan_tenure_remaining_months: "120",
      tax_bracket: "30",
      is_home_loan: "false",
    },
  },
  lumpsum_vs_sip: {
    title: "Lump Sum vs SIP",
    description: "Compare investing all at once versus spreading monthly contributions.",
    fields: [
      { name: "total_amount", label: "Total Amount to Invest", type: "number", min: 1, step: 1 },
      { name: "expected_return_rate", label: "Expected Annual Return (%)", type: "number", min: 0, step: 0.01 },
      { name: "tenure_years", label: "Tenure (Years)", type: "number", min: 1, step: 1 },
    ],
    defaults: {
      total_amount: "1200000",
      expected_return_rate: "12",
      tenure_years: "10",
    },
  },
  early_retirement: {
    title: "Early Retirement Readiness",
    description: "Estimate whether your current savings plan can fund early retirement.",
    fields: [
      { name: "current_age", label: "Current Age", type: "number", min: 18, step: 1 },
      { name: "target_retirement_age", label: "Target Retirement Age", type: "number", min: 19, step: 1 },
      { name: "current_savings", label: "Current Savings", type: "number", min: 0, step: 1 },
      { name: "monthly_savings", label: "Monthly Savings", type: "number", min: 0, step: 1 },
      { name: "monthly_expenses_today", label: "Monthly Expenses Today", type: "number", min: 1, step: 1 },
      { name: "expected_return_rate", label: "Pre-Retirement Return (%)", type: "number", min: 0, step: 0.01 },
      { name: "post_retirement_return", label: "Post-Retirement Return (%)", type: "number", min: 0, step: 0.01 },
      { name: "inflation_rate", label: "Inflation (%)", type: "number", min: 0, step: 0.01 },
      { name: "life_expectancy", label: "Life Expectancy", type: "number", min: 50, step: 1 },
    ],
    defaults: {
      current_age: "30",
      target_retirement_age: "50",
      current_savings: "2000000",
      monthly_savings: "50000",
      monthly_expenses_today: "70000",
      expected_return_rate: "10",
      post_retirement_return: "6",
      inflation_rate: "6",
      life_expectancy: "85",
    },
  },
  loan_comparison: {
    title: "Loan Offer Comparison",
    description: "Compare two loan options by EMI and total lifetime cost including fees.",
    fields: [
      { name: "loan_amount", label: "Loan Amount", type: "number", min: 1, step: 1 },
      { name: "loan_a_rate", label: "Loan A Rate (%)", type: "number", min: 0, step: 0.01 },
      { name: "loan_a_tenure", label: "Loan A Tenure (Months)", type: "number", min: 1, step: 1 },
      { name: "loan_a_fees", label: "Loan A Fees", type: "number", min: 0, step: 1 },
      { name: "loan_b_rate", label: "Loan B Rate (%)", type: "number", min: 0, step: 0.01 },
      { name: "loan_b_tenure", label: "Loan B Tenure (Months)", type: "number", min: 1, step: 1 },
      { name: "loan_b_fees", label: "Loan B Fees", type: "number", min: 0, step: 1 },
    ],
    defaults: {
      loan_amount: "3000000",
      loan_a_rate: "8.5",
      loan_a_tenure: "240",
      loan_a_fees: "25000",
      loan_b_rate: "8.1",
      loan_b_tenure: "300",
      loan_b_fees: "40000",
    },
  },
};

export default function ScenarioCard({ scenario }: Props) {
  const { consumeScenarioRun } = useUsage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [error, setError] = useState("");
  const { currency } = useCurrency();
  const config = SCENARIO_CONFIGS[scenario];
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!config) return;
    setValues(config.defaults);
    setResult(null);
    setError("");
  }, [scenario, config]);

  const scenarioInputs = useMemo(() => {
    if (!config) return {};
    return config.fields.reduce<Record<string, unknown>>((acc, field) => {
      const value = values[field.name] ?? config.defaults[field.name] ?? "";
      if (typeof value === "string" && value.trim() === "") {
        return acc;
      }
      if (field.type === "checkbox") {
        acc[field.name] = value === "true";
      } else {
        const numeric = Number(value);
        acc[field.name] = Number.isFinite(numeric) ? numeric : value;
      }
      return acc;
    }, {});
  }, [config, values]);

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
      const data = await runScenario({ scenario, inputs: scenarioInputs });
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

  if (!config) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-base font-semibold">Scenario unavailable</h3>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-base font-semibold">{config.title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{config.description}</p>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        {config.fields.map((field) =>
          field.type === "checkbox" ? (
            <label key={field.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(values[field.name] ?? config.defaults[field.name]) === "true"}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, [field.name]: event.target.checked ? "true" : "false" }))
                }
              />
              {field.label}
            </label>
          ) : (
            <label key={field.name} className="space-y-1 text-sm">
              <span className="block text-zinc-700 dark:text-zinc-200">{field.label}</span>
              <input
                type="number"
                min={field.min}
                step={field.step ?? "any"}
                value={values[field.name] ?? config.defaults[field.name] ?? ""}
                onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                required
              />
            </label>
          ),
        )}

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

      {result ? (
        <div className="mt-4">
          <ScenarioResultDisplay result={result} currency={currency} />
        </div>
      ) : null}
    </section>
  );
}
