export const article = {
  slug: "how-to-save-income-tax",
  title: "How to Save Income Tax in India: Complete Guide FY 2025-26",
  description:
    "Every legal deduction and exemption available under Indian tax law to reduce your income tax liability in FY 2025-26.",
  publishedAt: "2025-04-10",
  readingTime: "8 min",
  content: `
## New Regime vs Old Regime: Choose First

Before optimising deductions, decide your regime:

**New Regime (default from FY 2023-24):**
- Standard deduction: ₹75,000
- No other deductions allowed
- Lower tax rates across slabs
- Better if total deductions < ₹3.75 lakh

**Old Regime:**
- Standard deduction: ₹50,000
- All deductions below available
- Better if total deductions > ₹3.75 lakh

## Section 80C: ₹1.5 Lakh Deduction

The most popular deduction. Instruments that qualify:
- PPF contribution (safest, 7.1% tax-free)
- ELSS mutual funds (market-linked, 3-year lock-in)
- EPF contribution (from salary)
- Life insurance premium
- NSC, 5-year tax-saving FD
- Children's tuition fees
- Home loan principal repayment

**Strategy:** Max out 80C every year. PPF + ELSS combination gives safety + growth.

## Section 80CCD(1B): Extra ₹50,000 for NPS

Over and above 80C, you can claim an additional ₹50,000 deduction by contributing to NPS Tier 1. This is the most underused deduction in India.

At 30% tax bracket: ₹50,000 NPS contribution saves ₹15,000 in tax immediately.

## HRA Exemption

If you receive HRA from your employer and pay rent, you can claim exemption on the lowest of:
- Actual HRA received
- Rent paid minus 10% of basic salary
- 50% of basic (metro) or 40% (non-metro)

Keep rent receipts. For rent above ₹1 lakh/year, provide landlord's PAN.

## Section 24(b): Home Loan Interest

Deduction up to ₹2 lakh per year on home loan interest for self-occupied property. No limit for let-out property (set off against rental income).

## Section 80D: Health Insurance Premium

- Self + family: ₹25,000 (₹50,000 if any member is 60+)
- Parents: ₹25,000 (₹50,000 if parents are 60+)
- Maximum total: ₹1 lakh

## Section 87A Rebate

If your taxable income (after all deductions) does not exceed:
- ₹7 lakh (new regime): zero tax
- ₹5 lakh (old regime): zero tax

This makes income up to ₹7 lakh completely tax-free under the new regime.
  `.trim(),
  relatedCalculators: [
    { href: "/calculators/tax", label: "Income Tax Calculator" },
    { href: "/calculators/ppf", label: "PPF Calculator" },
    { href: "/calculators/hra", label: "HRA Exemption Calculator" },
  ],
  faqs: [
    {
      q: "Can I switch between old and new tax regime every year?",
      a: "Salaried employees can switch between regimes every year when filing returns. Business owners and professionals can switch only once.",
    },
    {
      q: "Is there a way to have zero tax on ₹10 lakh income?",
      a: "Not without deductions. Under the new regime with ₹75,000 standard deduction, taxable income is ₹9.25 lakh and tax is approximately ₹62,500. Under the old regime, maximising 80C (₹1.5L), 80CCD1B (₹50K), 80D (₹25K), and HRA can bring taxable income below ₹7L for zero tax.",
    },
  ],
};
