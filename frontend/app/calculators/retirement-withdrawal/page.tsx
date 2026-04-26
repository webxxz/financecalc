import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";
import FAQSchema from "@/components/FAQSchema";

export const metadata: Metadata = {
  title: "Retirement Withdrawal Calculator (4% Rule)",
  description: "Estimate required retirement portfolio size and funding gap using the 4% rule or a custom safe withdrawal rate.",
};

export const revalidate = 3600;

const faqItems = [
  {
    question: "What is the 4% rule?",
    answer: "The 4% rule is a planning heuristic that estimates sustainable annual withdrawals at roughly 4% of portfolio value.",
  },
  {
    question: "Can I use a different withdrawal rate?",
    answer: "Yes. You can test a lower or higher safe withdrawal rate to see how required portfolio size and funding gap change.",
  },
  {
    question: "Should this be my only retirement decision input?",
    answer: "No. Include taxes, inflation, spending volatility, and sequence-of-returns risk in full retirement planning.",
  },
];

export default function RetirementWithdrawalPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinanceCalc Retirement Withdrawal Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: "https://financecalc.app/calculators/retirement-withdrawal",
    description: "Retirement withdrawal planner using 4% rule assumptions and funding gap analysis.",
  };

  return (
    <div className="space-y-8">
      <FAQSchema faqs={faqItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CalculatorUI
        title="Retirement Withdrawal Calculator (4% Rule)"
        description="Estimate required nest egg, coverage ratio, and funding gap for your retirement spending target."
        endpoint="/api/retirement-withdrawal"
        fields={[
          { name: "annual_spending_needed", label: "Annual Spending Needed", min: 1, step: 0.01 },
          { name: "current_retirement_savings", label: "Current Retirement Savings", min: 0, step: 0.01 },
          { name: "safe_withdrawal_rate", label: "Safe Withdrawal Rate (%)", min: 1, step: 0.01 },
        ]}
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <h1>Retirement Withdrawal Calculator: 4% Rule Readiness Check</h1>
        <p>
          Retirement income planning starts with a simple question: how large should your portfolio be to support annual
          spending needs? This calculator applies the 4% rule framework to estimate a required nest egg and compare it
          with your current retirement assets.
        </p>
        <p>
          The output helps you identify funding gaps early so you can adjust contribution rate, retirement timing, or
          withdrawal assumptions. Use lower withdrawal scenarios for conservative planning and review assumptions annually.
        </p>
      </article>

    </div>
  );
}
