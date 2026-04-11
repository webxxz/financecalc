import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "SIP Calculator",
  description: "Estimate future corpus, invested principal, and expected returns using a backend-validated SIP model.",
};

export default function SIPPage() {
  return (
    <CalculatorUI
      title="SIP Calculator"
      description="Project long-term investment growth with monthly contribution, return assumption, and time horizon."
      endpoint="/api/sip"
      fields={[
        { name: "monthly_investment", label: "Monthly Investment", min: 1 },
        { name: "annual_return_rate", label: "Expected Annual Return (%)", min: 0, step: 0.01 },
        { name: "years", label: "Years", min: 1, step: 1 },
      ]}
    />
  );
}
