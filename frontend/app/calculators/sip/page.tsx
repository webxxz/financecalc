import type { Metadata } from "next";
import dynamic from "next/dynamic";

import CalculatorUI from "@/components/CalculatorUI";

const AffiliateSection = dynamic(() => import("@/components/AffiliateSection"));

export const metadata: Metadata = {
  title: "SIP Calculator",
  description: "Estimate future corpus, invested principal, and expected returns using a backend-validated SIP model.",
};

export const revalidate = 3600;

export default function SIPPage() {
  return (
    <div className="space-y-6">
      <CalculatorUI
        title="SIP Calculator"
        description="Project long-term investment growth with monthly contribution, return assumption, and time horizon."
        endpoint="/api/sip"
        fields={[
          { name: "monthly_investment", label: "Monthly Investment", min: 1, max: 500000, showSlider: true },
          { name: "annual_return_rate", label: "Expected Annual Return (%)", min: 0, max: 30, step: 0.01, showSlider: true },
          { name: "tenure_years", label: "Investment Tenure (Years)", min: 1, max: 40, step: 1, showSlider: true },
        ]}
      />
      <AffiliateSection title="Mutual Fund Partners" description="Affiliate placeholder: compare SIP-friendly investment platforms and fees." />
    </div>
  );
}
