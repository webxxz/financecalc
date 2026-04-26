import type { Metadata } from "next";

import NetWorthClient from "./NetWorthClient";

export const metadata: Metadata = {
  title: "Net Worth Calculator | FinanceCalc",
  description: "Calculate your total net worth, debt-to-asset ratio and financial health score.",
};

export default function NetWorthPage() {
  return <NetWorthClient />;
}
