import type { Metadata } from "next";

import TaxCalculatorClient from "./tax-calculator-client";

export const metadata: Metadata = {
  title: "Income Tax Calculator FY2025-26 | FinanceCalc",
  description: "Calculate your income tax for FY 2025-26 under old and new regime with 87A rebate.",
};

export default function TaxCalculatorPage() {
  return <TaxCalculatorClient />;
}
