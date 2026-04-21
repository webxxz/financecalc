import Link from "next/link";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ProPageTracker = dynamic(() => import("@/components/ProPageTracker"), { ssr: false });

export const metadata: Metadata = {
  title: "FinanceCalc Pro — Unlimited AI Financial Advice",
  description:
    "Upgrade to FinanceCalc Pro for unlimited AI queries, saved goals, PDF reports, and priority support.",
};

export default function ProPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      <ProPageTracker />

      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">FinanceCalc Pro</p>
        <h1 className="text-4xl font-bold tracking-tight">Unlimited financial intelligence</h1>
        <p className="mx-auto max-w-xl text-zinc-600 dark:text-zinc-300">
          Free plan gives you the tools. Pro gives you everything you need to actually make better financial
          decisions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-700">
          <p className="text-lg font-semibold">Free</p>
          <p className="mt-2 text-3xl font-bold">₹0</p>
          <p className="mt-1 text-sm text-zinc-500">forever</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "All 14+ calculators — unlimited",
              "5 AI decision queries per day",
              "10 scenario analyses per day",
              "Basic charts and results",
              "WhatsApp sharing",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
            {["Saved goals and history", "PDF report export", "Priority AI responses"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-zinc-400">
                <span>✗</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-2xl border-2 border-indigo-500 bg-indigo-50 p-6 dark:border-indigo-600 dark:bg-indigo-950/30">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">MOST POPULAR</span>
          </div>
          <p className="text-lg font-semibold">Pro</p>
          <p className="mt-2 text-3xl font-bold">
            ₹299
            <span className="text-base font-normal text-zinc-500">/month</span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">or ₹2,499/year (save 30%)</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Everything in Free",
              "Unlimited AI decision queries",
              "Unlimited scenario analyses",
              "Save and track financial goals",
              "Export any result as PDF",
              "Decision history",
              "Priority AI with deeper analysis",
              "Early access to new features",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-indigo-600">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pro/checkout"
            className="mt-6 block w-full rounded-md bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Start Pro — ₹299/month →
          </Link>
          <p className="mt-2 text-center text-xs text-zinc-400">Cancel anytime. No questions asked.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800">
              <th className="px-4 py-3 text-left font-medium">Feature</th>
              <th className="px-4 py-3 text-center font-medium">Free</th>
              <th className="px-4 py-3 text-center font-medium text-indigo-600">Pro</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["All calculators", "✓", "✓"],
              ["AI queries per day", "5", "Unlimited"],
              ["Scenario analyses/day", "10", "Unlimited"],
              ["Save calculations", "✗", "✓"],
              ["Goal tracker", "✗", "✓"],
              ["PDF export", "✗", "✓"],
              ["Decision history", "✗", "✓"],
              ["Priority AI", "✗", "✓"],
            ].map(([feature, free, pro]) => (
              <tr key={feature} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{feature}</td>
                <td className="px-4 py-3 text-center text-zinc-500">{free}</td>
                <td className="px-4 py-3 text-center font-medium text-indigo-600">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Common questions</h2>
        {[
          {
            q: "Can I cancel anytime?",
            a: "Yes. Cancel from your account settings anytime. You keep Pro access until the end of your billing period.",
          },
          {
            q: "What payment methods are accepted?",
            a: "UPI, debit card, credit card, and net banking via Razorpay. All payments are secure and encrypted.",
          },
          {
            q: "Is my financial data stored securely?",
            a: "Yes. All data is encrypted at rest and in transit. We never sell or share your financial information.",
          },
          {
            q: "Do you offer a free trial?",
            a: "The free tier is permanently free with generous limits. Pro is for users who use the platform regularly.",
          },
        ].map((faq) => (
          <details key={faq.q} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <summary className="list-none cursor-pointer font-medium">{faq.q}</summary>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
