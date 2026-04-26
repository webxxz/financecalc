import Link from "next/link";

export const revalidate = 3600;

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          AI-Powered Financial Decisions
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">What should you do with your money?</h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Don&apos;t just calculate numbers — get a decision. Our AI runs the right calculations, compares your options,
          and tells you exactly what to do and why.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/decide"
            className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Ask AI ✦
          </Link>
          <Link
            href="/decide"
            className="rounded-md border border-zinc-300 px-6 py-3 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Browse Scenarios
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            "Buy or rent a home?",
            "Pay debt or invest?",
            "When can I retire?",
            "Which loan is cheaper?",
          ].map((question) => (
            <Link
              key={question}
              href="/decide"
              className="rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-indigo-300"
            >
              {question} →
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/calculators/emi", title: "EMI Calculator", desc: "Loan EMI breakdown with insights." },
          { href: "/calculators/sip", title: "SIP Calculator", desc: "Investment growth projection." },
          { href: "/calculators/mortgage", title: "Mortgage Calculator", desc: "Monthly housing cost estimator." },
          { href: "/calculators/credit-card-payoff", title: "Credit Card Payoff", desc: "Debt-free timeline and interest cost." },
          { href: "/calculators/investment-growth", title: "Investment Growth", desc: "Compounding and contribution modeling." },
          { href: "/calculators/retirement-withdrawal", title: "Retirement Withdrawal", desc: "4% rule readiness and funding gap." },
          { href: "/calculators/fd", title: "FD Calculator", desc: "Fixed deposit maturity and interest." },
          { href: "/calculators/rd", title: "RD Calculator", desc: "Recurring deposit growth estimator." },
          { href: "/calculators/ppf", title: "PPF Calculator", desc: "15-year PPF corpus with 80C savings." },
          { href: "/calculators/tax", title: "Income Tax Calculator", desc: "FY2025-26 old vs new regime." },
          { href: "/calculators/car-loan", title: "Car Loan EMI Calculator", desc: "Car loan cost breakdown." },
          { href: "/calculators/home-loan-eligibility", title: "Home Loan Eligibility", desc: "Max loan based on income and FOIR." },
          { href: "/calculators/loan-interest-rate", title: "Interest Rate Finder", desc: "Reverse-calculate your loan rate." },
          { href: "/calculators/loan-tenure", title: "Loan Tenure Calculator", desc: "Find repayment period from EMI." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{card.desc}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/40">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          FinanceCalc Pro
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Unlock unlimited AI and premium planning tools</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Get unlimited AI decision queries, advanced scenario workflows, PDF exports, and priority support.
        </p>
        <div className="mt-4">
          <Link
            href="/pro"
            className="inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Explore Pro
          </Link>
        </div>
      </section>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="font-semibold">Learn before you decide</p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-300">
          Explore the knowledge base for practical guidance. Start with{" "}
          <Link href="/learn/what-is-emi" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            What is EMI?
          </Link>
        </p>
      </div>
    </section>
  );
}
