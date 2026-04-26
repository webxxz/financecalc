import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "Compound Interest Calculator | FinanceCalc",
  description:
    "Calculate compound interest growth with different compounding frequencies. See how your money grows over time.",
};

export default function CompoundInterestPage() {
  return (
    <CalculatorUI
      title="Compound Interest Calculator"
      description="Estimate maturity value, total interest, and effective annual return for a lump-sum investment."
      endpoint="/api/compound-interest"
      fields={[
        { name: "principal", label: "Principal Amount", placeholder: "100000", min: 1000, max: 10000000, showSlider: true },
        {
          name: "annual_rate",
          label: "Annual Interest Rate (%)",
          placeholder: "8",
          min: 1,
          max: 30,
          step: 0.1,
          showSlider: true,
        },
        { name: "tenure_years", label: "Tenure (Years)", placeholder: "10", min: 1, max: 40, showSlider: true },
        { name: "compounding_frequency", label: "Compounding (times/year)", placeholder: "12", min: 1, step: 1 },
      ]}
    />
  );
}
