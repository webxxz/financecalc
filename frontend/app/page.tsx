import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Global Financial Calculators + AI Guidance</h1>
        <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">
          FinanceCalc.app centralizes reliable financial calculations through a backend math engine, with AI-assisted tool calling so users and assistants use the same source of truth.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { href: "/calculators/emi", title: "EMI Calculator", desc: "Loan EMI breakdown with insights." },
          { href: "/calculators/sip", title: "SIP Calculator", desc: "Investment growth projection." },
          { href: "/calculators/mortgage", title: "Mortgage Calculator", desc: "Monthly housing cost estimator." },
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
    </section>
  );
}
