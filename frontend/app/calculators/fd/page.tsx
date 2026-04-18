import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "FD Calculator | FinanceCalc",
  description: "Calculate Fixed Deposit maturity amount and interest earned.",
};

export default function FDCalculatorPage() {
  return (
    <CalculatorUI
      title="Fixed Deposit (FD) Calculator"
      description="Calculate your FD maturity amount and total interest earned based on principal, rate, and tenure."
      endpoint="/api/fd"
      fields={[
        { name: "principal", label: "Principal Amount (₹)", placeholder: "100000", min: 1000 },
        { name: "annual_interest_rate", label: "Annual Interest Rate (%)", placeholder: "7.1", min: 0.1, step: 0.01 },
        { name: "tenure_years", label: "Tenure (Years)", placeholder: "3", min: 0.5, step: 0.5 },
        { name: "compounding_frequency", label: "Compounding Frequency (per year)", placeholder: "4", min: 1 },
      ]}
    />
  );
}
