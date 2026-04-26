import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "Inflation Calculator India | FinanceCalc",
  description:
    "Calculate how inflation erodes your purchasing power and how much you need in the future to match today's value.",
};

export default function InflationPage() {
  return (
    <CalculatorUI
      title="Inflation Calculator"
      description="Estimate future equivalent amount and purchasing power erosion due to inflation."
      endpoint="/api/inflation"
      fields={[
        {
          name: "current_amount",
          label: "Current Amount (₹)",
          placeholder: "100000",
          min: 1,
          max: 10000000,
          showSlider: true,
        },
        {
          name: "annual_inflation_rate",
          label: "Annual Inflation Rate (%)",
          placeholder: "6",
          min: 1,
          max: 20,
          step: 0.1,
          showSlider: true,
        },
        {
          name: "tenure_years",
          label: "Time Period (Years)",
          placeholder: "10",
          min: 1,
          max: 50,
          step: 1,
          showSlider: true,
        },
      ]}
    />
  );
}
