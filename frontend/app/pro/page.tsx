import type { Metadata } from "next";
import ProPageTracker from "@/components/ProPageTracker";

export const metadata: Metadata = {
  title: "Go Pro",
  description: "Upgrade to FinanceCalc Pro for unlimited AI and advanced exports.",
};

export default function ProPage() {
  return (
    <section className="space-y-6">
      <ProPageTracker />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">FinanceCalc Pro</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Unlock unlimited AI guidance, scenario exploration, and professional PDF reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold">What you get</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Unlimited AI queries</li>
            <li>Unlimited scenario runs</li>
            <li>Calculator PDF exports</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
          <h2 className="text-lg font-semibold">Upgrade</h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Pro checkout integration will be connected in the next phase.
          </p>
          <button
            type="button"
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Coming soon
          </button>
        </article>
      </div>
    </section>
  );
}
