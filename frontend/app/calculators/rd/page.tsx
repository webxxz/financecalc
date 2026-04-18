import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "RD Calculator | FinanceCalc",
  description: "Calculate Recurring Deposit maturity amount and interest earnings.",
};

export default function RDCalculatorPage() {
  return (
    <CalculatorUI
      title="Recurring Deposit (RD) Calculator"
      description="Estimate your RD maturity value, total deposited amount, and interest earned over the chosen period."
      endpoint="/api/rd"
      fields={[
        { name: "monthly_deposit", label: "Monthly Deposit (₹)", placeholder: "5000", min: 500 },
        { name: "annual_interest_rate", label: "Annual Interest Rate (%)", placeholder: "6.7", min: 0.1, step: 0.01 },
        { name: "tenure_months", label: "Tenure (Months)", placeholder: "24", min: 6 },
      ]}
    />
  );
}
