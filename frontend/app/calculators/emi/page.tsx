import type { Metadata } from "next";
import dynamic from "next/dynamic";

import CalculatorUI from "@/components/CalculatorUI";

const AffiliateSection = dynamic(() => import("@/components/AffiliateSection"));

export const metadata: Metadata = {
  title: "EMI Calculator",
  description:
    "Use the FinanceCalc EMI calculator to estimate monthly loan installments, total payment, and total interest with transparent assumptions.",
};

export const revalidate = 3600;

const seoContent = `An EMI calculator helps borrowers make better credit decisions before committing to a loan. Instead of relying on rough estimates, it computes your monthly installment from three direct variables: principal, annual interest rate, and tenure in months. This matters because small interest changes can significantly alter total outflow over the life of a loan. By evaluating scenarios early, users can compare affordability, avoid repayment stress, and reduce long-term interest burden.

At FinanceCalc, the EMI engine runs on the backend so every output stays consistent whether the request comes from a user interface or an AI assistant. This approach improves trust, because the same validated formula powers all channels. When users experiment with a shorter tenure, they can quickly see the monthly obligation rise while total interest declines. In contrast, extending tenure usually lowers the monthly burden but increases lifetime cost.

A practical EMI workflow starts with your realistic budget. Set a target installment that leaves room for savings, emergency expenses, and inflation. Then tune principal and tenure to stay inside that boundary. If your planned EMI exceeds a safe threshold, you can increase down payment, reduce loan amount, or delay purchase. The calculator also helps with refinancing decisions by comparing old and new rates under the same principal assumptions.

The insights section is important, because raw numbers alone rarely communicate trade-offs. FinanceCalc highlights actionable takeaways such as interest impact and tenure sensitivity so users can make clear decisions quickly. For global users, this planning layer can be paired with exchange-rate conversion when borrowing or earning in different currencies.

For best outcomes, revisit EMI projections before final loan signing, especially if rates or fees change. A transparent, repeatable EMI model is one of the simplest ways to avoid hidden borrowing costs and maintain financial flexibility over time.`;

export default function EMIPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FinanceCalc EMI Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: "https://financecalc.app/calculators/emi",
    description:
      "EMI calculator for monthly installment, total payment, and interest analysis with structured insights.",
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CalculatorUI
        title="EMI Calculator"
        description="Calculate monthly EMI, total payment, and total interest with validated backend formulas."
        endpoint="/api/emi"
        fields={[
          { name: "principal", label: "Principal", min: 1, max: 10000000, showSlider: true },
          { name: "annual_interest_rate", label: "Annual Interest Rate (%)", min: 0, max: 24, step: 0.01, showSlider: true },
          { name: "tenure_months", label: "Tenure (Months)", min: 1, max: 360, step: 1, showSlider: true },
        ]}
      />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        {seoContent.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      <AffiliateSection />
    </div>
  );
}
