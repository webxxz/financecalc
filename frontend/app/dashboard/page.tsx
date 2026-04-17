import type { Metadata } from "next";

import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track saved calculations, goals, and history from your FinanceCalc account.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
