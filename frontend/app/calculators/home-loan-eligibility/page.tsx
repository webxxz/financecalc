import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "Home Loan Eligibility Calculator | FinanceCalc",
  description: "Estimate maximum home loan eligibility based on income and obligations.",
};

export default function HomeLoanEligibilityCalculatorPage() {
  return (
    <CalculatorUI
      title="Home Loan Eligibility Calculator"
      description="Estimate your eligible home loan amount using monthly income, obligations, interest rate, and tenure."
      endpoint="/api/home-loan-eligibility"
      fields={[
        { name: "monthly_income", label: "Monthly Income (₹)", placeholder: "100000", min: 1000 },
        { name: "monthly_obligations", label: "Existing Monthly Obligations (₹)", placeholder: "15000", min: 0 },
        { name: "annual_interest_rate", label: "Annual Interest Rate (%)", placeholder: "8.5", min: 0.1, step: 0.01 },
        { name: "tenure_years", label: "Tenure (Years)", placeholder: "20", min: 1 },
      ]}
    />
  );
}
