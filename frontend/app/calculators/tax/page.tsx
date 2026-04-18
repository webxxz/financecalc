import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "Income Tax Calculator | FinanceCalc",
  description: "Calculate FY 2025-26 income tax under old or new regime.",
};

export default function TaxCalculatorPage() {
  return (
    <CalculatorUI
      title="Income Tax Calculator"
      description="Estimate taxable income, total tax, and take-home pay under old vs new tax regime for FY 2025-26."
      endpoint="/api/tax"
      fields={[
        { name: "annual_income", label: "Annual Income (₹)", placeholder: "800000", min: 0 },
        { name: "other_deductions", label: "Other Deductions u/s 80C etc. (₹)", placeholder: "150000", min: 0 },
        // TODO: replace with a dropdown/select input for regime selection.
        { name: "regime", label: "Tax Regime", type: "text", placeholder: "new" },
      ]}
    />
  );
}
