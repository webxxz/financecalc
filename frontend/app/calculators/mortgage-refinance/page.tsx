import type { Metadata } from "next";
import dynamic from "next/dynamic";

import CalculatorUI from "@/components/CalculatorUI";
import FAQSchema from "@/components/FAQSchema";

const AffiliateSection = dynamic(() => import("@/components/AffiliateSection"));

export const metadata: Metadata = {
  title: "Mortgage Refinance Calculator",
  description:
    "Estimate refinance savings, break-even months, and net benefit after closing costs using FinanceCalc backend logic.",
};

export const revalidate = 3600;

const faqItems = [
  {
    question: "How does this mortgage refinance calculator decide if refinancing is worth it?",
    answer:
      "It compares your remaining interest on the current loan versus the projected interest on a new loan, then subtracts closing costs to estimate net savings and break-even timing.",
  },
  {
    question: "What is a good break-even period for refinancing?",
    answer:
      "A break-even period is generally considered favorable when it is shorter than how long you expect to keep the property or loan, because costs are recovered sooner.",
  },
  {
    question: "Can refinancing still help if monthly payment does not drop much?",
    answer:
      "Yes, in some cases refinance can still reduce total interest over the life of the loan, but the calculator helps you verify whether net savings remain positive after closing costs.",
  },
];

export default function MortgageRefinancePage() {
  return (
    <div className="space-y-8">
      <FAQSchema faqs={faqItems} />
      <CalculatorUI
        title="Mortgage Refinance Calculator"
        description="Compare your current loan against a refinance offer using backend-validated calculations for monthly savings, total interest, and break-even timing."
        endpoint="/api/mortgage-refinance"
        fields={[
          { name: "current_loan_balance", label: "Current Loan Balance", min: 1 },
          { name: "current_annual_interest_rate", label: "Current Annual Interest Rate (%)", min: 0, step: 0.01 },
          { name: "current_remaining_term_months", label: "Current Remaining Term (Months)", min: 1, step: 1 },
          { name: "new_annual_interest_rate", label: "New Annual Interest Rate (%)", min: 0, step: 0.01 },
          { name: "new_loan_term_months", label: "New Loan Term (Months)", min: 1, step: 1 },
          { name: "closing_costs", label: "Closing Costs", min: 0, step: 0.01 },
        ]}
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <h1>Mortgage Refinance Calculator: Expert Decision Framework</h1>
        <p>
          Refinancing is not just about getting a lower interest rate. A disciplined refinance review asks a deeper
          question: will the new loan improve long-term cash flow and total borrowing cost after all transaction fees
          are included? A rate reduction can look attractive at first glance, but closing costs, term resets, and time
          horizon can materially change the outcome. This mortgage refinance calculator is designed to replace guesswork
          with a repeatable scenario model so borrowers can assess impact before committing to lender paperwork.
        </p>
        <p>
          FinanceCalc runs refinance math on the backend to keep results consistent across web experiences and AI
          guidance. That means every calculation follows the same validation and computation path, including edge cases
          such as zero-interest assumptions. Instead of relying on rough amortization intuition, you get structured
          outputs for current monthly payment, proposed new monthly payment, remaining interest comparisons, gross
          interest saved, and net savings after closing costs.
        </p>

        <h2>How to Evaluate Refinance Value Beyond Rate Headlines</h2>
        <p>
          Start with your current loan balance, current rate, and remaining term. Then model the new rate, new term,
          and all refinancing costs. The calculator quantifies monthly payment change and total interest trade-off so
          you can separate short-term relief from lifetime cost impact. If your monthly payment drops but total interest
          rises due to a long term reset, that is a strategic warning sign. If both monthly burden and total interest
          improve meaningfully, refinancing may be a high-confidence move.
        </p>
        <p>
          Break-even analysis is essential. Closing costs are paid now, while savings accrue over time. A refinance only
          becomes financially favorable once cumulative savings recover those upfront costs. If break-even occurs after
          your expected move, refinance may destroy value even with a lower nominal rate. By contrast, if break-even is
          reached early and net savings remain positive, refinance can strengthen both liquidity and long-term household
          balance-sheet efficiency.
        </p>

        <h3>Interpreting the Recommendation Band</h3>
        <p>
          The calculator labels outcomes using net savings thresholds to support faster decisions. Large positive net
          savings are flagged as strong candidates, moderate positive savings indicate opportunities requiring closer
          scrutiny, and non-positive net outcomes are treated as likely not beneficial. This does not replace lender
          underwriting review, but it gives a practical first-pass filter for borrowers who want objective prioritization
          before shopping offers.
        </p>

        <h2>Common Mistakes</h2>
        <ul>
          <li>Focusing only on rate reduction and ignoring closing costs.</li>
          <li>Resetting into a longer term without checking total interest impact.</li>
          <li>Skipping break-even timing and expected ownership horizon alignment.</li>
          <li>Using optimistic lender quotes without confirming credit-based final pricing.</li>
          <li>Ignoring prepayment penalties, escrow changes, and fee add-ons.</li>
        </ul>

        <h2>Operational Best Practices for Borrowers</h2>
        <p>
          Run at least three refinance scenarios: conservative, expected, and best-case. Keep the same balance constant
          so only terms change; this isolates refinance effect cleanly. Validate lender fee line items against Loan
          Estimate documents and re-run the calculator when assumptions change. For households balancing debt repayment,
          emergency savings, and investment goals, refinance should be evaluated as part of a broader capital allocation
          plan rather than as a standalone rate decision. With a transparent model and consistent backend logic, you can
          make refinancing choices with higher confidence and lower regret risk.
        </p>
      </article>

      <AffiliateSection
        title="Compare Refinance Offers"
        description="Affiliate placeholder: compare refinance lenders by APR, closing costs, break-even timeline, and term flexibility."
      />
    </div>
  );
}
