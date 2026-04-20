"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { CalculatorResponse } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { generateCalculatorPDF } from "@/lib/pdf-generator";
import { useUsage } from "@/lib/usage-context";

const UpgradePrompt = dynamic(() => import("@/components/UpgradePrompt"), { ssr: false });

type Props = {
  title: string;
  inputs: Record<string, unknown>;
  result: CalculatorResponse;
  currency: string;
};

export default function ExportPDFButton({ title, inputs, result, currency }: Props) {
  const { isProUser } = useUsage();
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleExport = async () => {
    if (!isProUser) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    try {
      await generateCalculatorPDF(title, inputs, result, currency);
      trackEvent("pdf_exported", {
        calculator_type: title,
        currency,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
      >
        {loading ? "Generating..." : "⬇ Export PDF"}
        {!isProUser ? (
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            Pro
          </span>
        ) : null}
      </button>

      {showUpgrade ? (
        <div className="mt-3">
          <UpgradePrompt reason="pdf_export" compact />
        </div>
      ) : null}
    </div>
  );
}
