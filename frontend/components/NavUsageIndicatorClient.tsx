"use client";

import dynamic from "next/dynamic";

const NavUsageIndicator = dynamic(() => import("@/components/NavUsageIndicator"), { ssr: false });

export default function NavUsageIndicatorClient() {
  return <NavUsageIndicator />;
}
