import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "50-30-20 Budget Calculator | FinanceCalc",
  description:
    "Check if your budget follows the 50-30-20 rule. See how much you should spend on needs, wants and savings.",
};

export default function BudgetPage() {
  return (
    <CalculatorUI
      title="Budget / 50-30-20 Rule Calculator"
      description="Compare your current allocation with the 50-30-20 budgeting framework."
      endpoint="/api/budget"
      fields={[
        {
          name: "monthly_income",
          label: "Monthly Take-Home Income (₹)",
          placeholder: "80000",
          min: 1000,
          max: 1000000,
          showSlider: true,
        },
        { name: "needs", label: "Monthly Needs — rent, food, bills (₹)", placeholder: "40000", min: 0 },
        { name: "wants", label: "Monthly Wants — dining, shopping (₹)", placeholder: "20000", min: 0 },
        { name: "savings", label: "Monthly Savings/Investments (₹)", placeholder: "15000", min: 0 },
      ]}
    />
  );
}
