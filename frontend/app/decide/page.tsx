import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ChatInterface = dynamic(() => import("@/components/ChatInterface"), { ssr: false });
const ScenarioCard = dynamic(() => import("@/components/ScenarioCard"), { ssr: false });

export const metadata: Metadata = {
  title: "Ask AI",
  description: "Run AI decision analysis and financial scenarios.",
};

export default function DecidePage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">AI Decision Lab</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Ask a financial question and run scenario comparisons.
        </p>
      </div>
      <ChatInterface />
      <div className="grid gap-4 md:grid-cols-2">
        <ScenarioCard scenario="rent_vs_buy" />
        <ScenarioCard scenario="debt_vs_invest" />
      </div>
    </section>
  );
}
