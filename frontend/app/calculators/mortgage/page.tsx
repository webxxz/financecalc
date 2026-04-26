import type { Metadata } from "next";

import CalculatorUI from "@/components/CalculatorUI";

export const metadata: Metadata = {
  title: "Mortgage Calculator",
  description: "Estimate monthly mortgage cost with principal, taxes, and insurance through backend APIs.",
};

export const revalidate = 3600;

export default function MortgagePage() {
  return (
    <div className="space-y-6">
      <CalculatorUI
        title="Mortgage Calculator"
        description="Calculate monthly mortgage payment and all-in housing cost including property tax and insurance."
        endpoint="/api/mortgage"
        fields={[
          { name: "property_price", label: "Property Price", min: 1 },
          { name: "down_payment", label: "Down Payment", min: 0 },
          { name: "annual_interest_rate", label: "Annual Interest Rate (%)", min: 0, step: 0.01 },
          { name: "tenure_years", label: "Tenure (Years)", min: 1, step: 1 },
          { name: "annual_property_tax", label: "Annual Property Tax", min: 0 },
          { name: "annual_home_insurance", label: "Annual Home Insurance", min: 0 },
        ]}
      />
    </div>
  );
}
