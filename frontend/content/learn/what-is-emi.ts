export const article = {
  slug: "what-is-emi",
  title: "What is EMI? How is it Calculated?",
  description:
    "Learn how Equated Monthly Instalments work, how banks calculate them, and how to reduce your total interest paid.",
  publishedAt: "2025-04-01",
  readingTime: "5 min",
  content: `
## What is EMI?

An Equated Monthly Instalment (EMI) is a fixed payment made by a borrower to a lender on a specified date every calendar month. EMIs are used to pay off both interest and principal every month, so that over a specified number of years, the loan is fully paid off.

## The EMI Formula

EMI = P × r × (1+r)^n / ((1+r)^n - 1)

Where:
- **P** = Principal loan amount
- **r** = Monthly interest rate (annual rate ÷ 12 ÷ 100)
- **n** = Number of monthly instalments

## Example Calculation

For a ₹10,00,000 home loan at 8.5% annual interest for 20 years:
- r = 8.5 / 12 / 100 = 0.00708
- n = 20 × 12 = 240
- EMI = 10,00,000 × 0.00708 × (1.00708)^240 / ((1.00708)^240 - 1)
- EMI = **₹8,678/month**

## How to Reduce Your EMI

1. **Make a larger down payment** — reduces principal
2. **Negotiate a lower interest rate** — even 0.5% less saves lakhs
3. **Prepay when possible** — reduces outstanding principal faster
4. **Choose a shorter tenure carefully** — higher EMI but less total interest

## EMI vs Flat Rate Interest

Banks advertise flat rates that sound lower. A 7% flat rate is equivalent to ~13% reducing balance rate. Always ask for the reducing balance rate when comparing loans.
  `.trim(),
  relatedCalculators: [
    { href: "/calculators/emi", label: "EMI Calculator" },
    { href: "/calculators/loan-tenure", label: "Loan Tenure Calculator" },
    { href: "/calculators/loan-interest-rate", label: "Interest Rate Finder" },
  ],
  faqs: [
    {
      q: "Can I change my EMI amount mid-loan?",
      a: "Yes, through balance transfer or loan restructuring. Some banks also allow EMI step-up plans where EMI increases annually with your salary.",
    },
    {
      q: "What happens if I miss an EMI?",
      a: "Missing an EMI incurs a penalty (usually 1-2% of EMI) and negatively impacts your CIBIL credit score. After 90 days of non-payment, the account is classified as NPA.",
    },
  ],
};
