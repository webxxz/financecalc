import CalculatorUI from "@/components/CalculatorUI";

export const metadata = {
  title: "Car Loan EMI Calculator | FinanceCalc",
  description: "Calculate car loan EMI, total payment, and interest cost.",
};

export default function CarLoanCalculatorPage() {
  return (
    <CalculatorUI
      title="Car Loan EMI Calculator"
      description="Estimate monthly car loan EMI based on car price, down payment, interest rate, and tenure."
      endpoint="/api/car-loan"
      fields={[
        { name: "car_price", label: "Car Price (₹)", placeholder: "1200000", min: 10000 },
        { name: "down_payment", label: "Down Payment (₹)", placeholder: "240000", min: 0 },
        { name: "annual_interest_rate", label: "Annual Interest Rate (%)", placeholder: "9.5", min: 0.1, step: 0.01 },
        { name: "tenure_months", label: "Tenure (Months)", placeholder: "60", min: 6 },
      ]}
    />
  );
}
