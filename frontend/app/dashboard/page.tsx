import type { Metadata } from "next";

import DashboardClient from "@/components/DashboardClient";
import GoalTracker from "@/components/GoalTracker";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track saved calculations, goals, and history from your FinanceCalc account.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-xl font-semibold">Your Goals</h2>
        <GoalTracker />
      </section>
      <DashboardClient />
    </div>
  );
}
