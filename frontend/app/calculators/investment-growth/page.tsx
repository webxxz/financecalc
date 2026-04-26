import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";
import FAQSchema from "@/components/FAQSchema";

export const metadata: Metadata = {
  title: "Investment Growth Calculator",
  description: "Project future portfolio value from initial capital, recurring contributions, and annual return assumptions.",
};

export const revalidate = 3600;

const faqItems = [
  {
    question: "What does this investment growth calculator include?",
    answer: "It combines compounded growth of initial capital and monthly contributions using your annual return assumption and time horizon.",
  },
  {
    question: "Is this a guaranteed return projection?",
    answer: "No. Results are scenario estimates for planning and should be stress-tested with conservative return assumptions.",
  },
  {
    question: "Why are recurring contributions important?",
    answer: "Regular contributions improve long-term outcomes by increasing invested capital and compounding base over time.",
  },
];

export default function InvestmentGrowthPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinanceCalc Investment Growth Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: "https://financecalc.app/calculators/investment-growth",
    description: "Investment growth calculator for future value, contribution tracking, and projected gains.",
  };

  return (
    <div className="space-y-8">
      <FAQSchema faqs={faqItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <CalculatorUI
        title="Investment Growth Calculator"
        description="Model long-term portfolio value from lump-sum capital, monthly contributions, and expected annual return."
        endpoint="/api/investment-growth"
        fields={[
          { name: "initial_investment", label: "Initial Investment", min: 0, step: 0.01 },
          { name: "monthly_contribution", label: "Monthly Contribution", min: 0, step: 0.01 },
          { name: "annual_return_rate", label: "Expected Annual Return (%)", min: 0, step: 0.01 },
          { name: "years", label: "Years", min: 1, step: 1 },
        ]}
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <h1>Investment Growth Calculator: Compounding and Contribution Planning</h1>
        <p>
          Portfolio growth depends on return assumptions, contribution discipline, and investment horizon. This
          calculator helps evaluate those variables together by separating growth from initial capital and recurring
          monthly additions.
        </p>
        <p>
          Run conservative and optimistic scenarios to understand planning ranges. For most users, extending horizon and
          increasing contribution consistency have a larger impact than trying to time short-term market moves.
        </p>
      </article>

    </div>
  );
}
