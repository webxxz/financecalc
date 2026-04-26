import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "Debt Payoff Calculator | Snowball vs Avalanche",
  description:
    "Compare debt snowball and avalanche payoff strategies. Find out which saves more interest and pays off your debt faster.",
};

export default function DebtPayoffPage() {
  return (
    <CalculatorUI
      title="Debt Payoff Calculator"
      description="Compare snowball vs avalanche debt payoff strategies with your monthly payment budget."
      endpoint="/api/debt-payoff"
      fields={[
        { name: "monthly_payment_budget", label: "Total Monthly Payment Budget (₹)", placeholder: "15000", min: 500 },
        { name: "debt_1_name", label: "Debt 1 Name", type: "text", placeholder: "Credit Card" },
        { name: "debt_1_balance", label: "Debt 1 Balance (₹)", placeholder: "50000", min: 0 },
        { name: "debt_1_rate", label: "Debt 1 Rate (%)", placeholder: "36", min: 0, max: 100, step: 0.1 },
        { name: "debt_2_name", label: "Debt 2 Name (optional)", type: "text", placeholder: "Personal Loan" },
        { name: "debt_2_balance", label: "Debt 2 Balance (₹)", placeholder: "0", min: 0 },
        { name: "debt_2_rate", label: "Debt 2 Rate (%)", placeholder: "0", min: 0, max: 100, step: 0.1 },
        { name: "debt_3_name", label: "Debt 3 Name (optional)", type: "text", placeholder: "Car Loan" },
        { name: "debt_3_balance", label: "Debt 3 Balance (₹)", placeholder: "0", min: 0 },
        { name: "debt_3_rate", label: "Debt 3 Rate (%)", placeholder: "0", min: 0, max: 100, step: 0.1 },
      ]}
    />
  );
}
