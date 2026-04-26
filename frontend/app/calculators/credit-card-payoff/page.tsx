import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";
import FAQSchema from "@/components/FAQSchema";

export const metadata: Metadata = {
  title: "Credit Card Payoff Calculator",
  description: "Estimate debt-free date, total interest paid, and accelerated payoff targets for revolving credit card balances.",
};

export const revalidate = 3600;

const faqItems = [
  {
    question: "How does this credit card payoff calculator estimate payoff time?",
    answer: "It simulates monthly interest and principal reduction from your current balance, APR, and fixed monthly payment.",
  },
  {
    question: "Why can payoff take much longer than expected?",
    answer: "When your payment is close to monthly interest, only a small amount goes to principal and debt declines slowly.",
  },
  {
    question: "What does the 36-month target payment mean?",
    answer: "It estimates the fixed monthly payment needed to clear the current balance in about 36 months under the same APR assumption.",
  },
];

export default function CreditCardPayoffPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinanceCalc Credit Card Payoff Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: "https://financecalc.app/calculators/credit-card-payoff",
    description: "Credit card payoff calculator with payoff timeline, interest outflow, and accelerated repayment guidance.",
  };

  return (
    <div className="space-y-8">
      <FAQSchema faqs={faqItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CalculatorUI
        title="Credit Card Payoff Calculator"
        description="Estimate months to debt-free, total interest paid, and the payment required for a faster payoff plan."
        endpoint="/api/credit-card-payoff"
        fields={[
          { name: "current_balance", label: "Current Balance", min: 1 },
          { name: "annual_interest_rate", label: "Annual Interest Rate (APR %)", min: 0, step: 0.01 },
          { name: "monthly_payment", label: "Monthly Payment", min: 1, step: 0.01 },
        ]}
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <h1>Credit Card Payoff Calculator: Debt Elimination Planning</h1>
        <p>
          Credit card balances can compound quickly when APR is high and monthly payments are set too close to the
          interest charge. This calculator converts those assumptions into a payoff timeline and total interest cost so
          you can choose a more efficient repayment strategy.
        </p>
        <p>
          Use it to compare baseline repayment versus an accelerated payment target. The 36-month payment reference is
          useful for setting a practical debt-clear deadline and reducing total borrowing cost.
        </p>
      </article>

    </div>
  );
}
