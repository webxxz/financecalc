import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "Loan Interest Rate Calculator | FinanceCalc",
  description: "Find implied loan interest rate from EMI, tenure, and loan amount.",
};

export default function LoanInterestRateCalculatorPage() {
  return (
    <CalculatorUI
      title="Loan Interest Rate Finder"
      description="Infer annual interest rate from loan amount, EMI, and tenure using reducing-balance math."
      endpoint="/api/loan-interest-rate"
      fields={[
        { name: "loan_amount", label: "Loan Amount (₹)", placeholder: "1000000", min: 1000 },
        { name: "monthly_emi", label: "Monthly EMI (₹)", placeholder: "22000", min: 1 },
        { name: "tenure_months", label: "Tenure (Months)", placeholder: "60", min: 1 },
      ]}
    />
  );
}
