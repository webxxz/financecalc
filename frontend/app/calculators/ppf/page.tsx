import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "PPF Calculator | FinanceCalc",
  description: "Plan Public Provident Fund growth, interest, and tax benefits.",
};

export default function PPFCalculatorPage() {
  return (
    <CalculatorUI
      title="PPF Calculator"
      description="Estimate PPF maturity amount, invested principal, interest earned, and tax savings under Section 80C."
      endpoint="/api/ppf"
      fields={[
        { name: "annual_investment", label: "Annual Investment (₹)", placeholder: "150000", min: 500 },
        { name: "tenure_years", label: "Investment Period (Years)", placeholder: "15", min: 15 },
        { name: "current_ppf_rate", label: "Current PPF Rate (%)", placeholder: "7.1", min: 1, step: 0.01 },
      ]}
    />
  );
}
