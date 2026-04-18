import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "Loan Tenure Calculator | FinanceCalc",
  description: "Estimate loan repayment tenure from loan amount, EMI, and interest rate.",
};

export default function LoanTenureCalculatorPage() {
  return (
    <CalculatorUI
      title="Loan Tenure Finder"
      description="Calculate repayment period in years and months using loan amount, interest rate, and EMI."
      endpoint="/api/loan-tenure"
      fields={[
        { name: "loan_amount", label: "Loan Amount (₹)", placeholder: "1000000", min: 1000 },
        { name: "annual_interest_rate", label: "Annual Interest Rate (%)", placeholder: "9.5", min: 0.1, step: 0.01 },
        { name: "monthly_emi", label: "Monthly EMI (₹)", placeholder: "20000", min: 1 },
      ]}
    />
  );
}
