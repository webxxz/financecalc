export const article = {
  slug: "how-much-to-save-for-retirement",
  title: "How Much Do You Need to Retire? The Complete Guide",
  description:
    "Calculate your retirement corpus using the 4% rule, understand how inflation affects your retirement, and build a savings plan to retire on time.",
  publishedAt: "2025-04-20",
  readingTime: "7 min",
  content: `
## The Retirement Number Question

"How much do I need to retire?" is the most important financial question most people never answer concretely.

## The 4% Rule (and Why It Needs Adjusting for India)

The 4% rule says: your retirement corpus should be 25× your annual expenses. At 4% annual withdrawal, the corpus lasts 30 years.

Example: If you need ₹60,000/month in retirement:
- Annual expenses: ₹7.2 lakh
- Required corpus: ₹7.2L × 25 = **₹1.8 crore**

**The India adjustment:** India's inflation has averaged 6% vs the US's 2-3%. Use a 3% withdrawal rate instead (33× annual expenses) for safety.

Adjusted corpus: ₹7.2L × 33 = **₹2.4 crore**

## Inflation: The Silent Retirement Killer

₹60,000/month today will have the purchasing power of just ₹19,000 in 20 years at 6% inflation.

This means your retirement expenses are not ₹60,000/month — they are ₹60,000 × (1.06)^20 = **₹1,92,428/month** if you retire 20 years from now.

Required corpus at retirement: ₹1,92,428 × 12 × 33 = **₹7.6 crore**

Most retirement planning fails because people use today's expenses, not inflation-adjusted future expenses.

## The Three Stages of Retirement Savings

**Stage 1 — Accumulation (age 25-50):**
Maximise equity allocation (70-80%). Time is your biggest asset.
Target: invest 20-30% of income.

**Stage 2 — Consolidation (age 50-60):**
Reduce equity to 50-60%, increase debt/fixed income.
Target: reach 80-90% of required corpus.

**Stage 3 — Distribution (age 60+):**
30-40% equity for growth, 60-70% in stable instruments.
Target: 3-4% annual withdrawal rate.

## Monthly Savings Required by Age

To retire at 60 with ₹3 crore corpus (10% annual return):

| Current Age | Monthly SIP Required |
|-------------|---------------------|
| 25          | ₹4,350             |
| 30          | ₹7,250             |
| 35          | ₹12,400            |
| 40          | ₹22,800            |
| 45          | ₹48,300            |

Starting 10 years earlier cuts your required monthly savings by nearly half.

## The Instruments

- **EPF + VPF:** Guaranteed 8.15%, tax-free. Maximise this first.
- **PPF:** 7.1% tax-free, ₹1.5L/year limit. Excellent for debt portion.
- **NPS:** Market-linked, tax benefit up to ₹2L/year. Good for equity exposure.
- **ELSS / Equity mutual funds:** 12-15% long-term returns. Best for growth.
  `.trim(),
  relatedCalculators: [
    { href: "/calculators/retirement-withdrawal", label: "Retirement Calculator" },
    { href: "/decide", label: "Retirement Readiness Check" },
    { href: "/calculators/sip", label: "SIP Calculator" },
    { href: "/calculators/ppf", label: "PPF Calculator" },
  ],
  faqs: [
    {
      q: "What if I start saving for retirement late?",
      a: "Starting late requires saving more aggressively (30-40% of income) and potentially working a few years longer. The key is to start immediately — every month of delay increases the required savings significantly.",
    },
    {
      q: "Should I pay off my home loan before retiring?",
      a: "Yes, ideally. Carrying a home loan into retirement reduces your monthly cash flow flexibility. Target to be debt-free at least 3-5 years before your target retirement age.",
    },
  ],
};
