import type { CalculatorResponse } from "@/lib/api";

type RGBColor = [number, number, number];

const PRIMARY: RGBColor = [79, 70, 229];
const TEXT: RGBColor = [30, 30, 30];
const MUTED: RGBColor = [100, 100, 100];
const LINE: RGBColor = [220, 220, 220];
const PAGE_W = 210;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Exclude heavy yearly arrays/tables that are better represented in charts on the web UI.
const EXCLUDED_KEYS = new Set(["yearly_schedule", "yearly_growth", "yearly_comparison"]);

function formatValue(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return String(value);
  }
}

function toLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPlainValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatDisplayValue(value: unknown, currency: string): string {
  return typeof value === "number" ? formatValue(value, currency) : formatPlainValue(value);
}

function ensureSpace(doc: import("jspdf").jsPDF, y: number, needed: number): number {
  if (y + needed <= 280) return y;
  doc.addPage();
  return MARGIN;
}

export async function generateCalculatorPDF(
  title: string,
  inputs: Record<string, unknown>,
  result: CalculatorResponse,
  currency: string,
): Promise<void> {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 40;

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FinanceCalc", MARGIN, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("AI-Powered Financial Decisions", MARGIN, 19);
  doc.text(`Generated: ${new Date().toLocaleDateString(locale)}`, PAGE_W - MARGIN, 19, { align: "right" });

  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, MARGIN, y);
  y += 8;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summary = result.summary?.trim() ? result.summary : "No summary available.";
  const summaryLines = doc.splitTextToSize(summary, CONTENT_W);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 6 + 6;

  if (Object.keys(inputs).length > 0) {
    y = ensureSpace(doc, y, 18);
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Inputs", MARGIN, y);
    y += 6;
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setFontSize(10);
    Object.entries(inputs).forEach(([key, value], index) => {
      y = ensureSpace(doc, y, 10);
      const bg: RGBColor = index % 2 === 0 ? [248, 248, 255] : [255, 255, 255];
      doc.setFillColor(...bg);
      doc.rect(MARGIN, y - 3, CONTENT_W, 8, "F");

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(toLabel(key), MARGIN + 3, y + 2);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT);
      const display = formatDisplayValue(value, currency);
      doc.text(display, PAGE_W - MARGIN - 3, y + 2, { align: "right" });
      y += 8;
    });
    y += 6;
  }

  y = ensureSpace(doc, y, 18);
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Results", MARGIN, y);
  y += 6;
  doc.setDrawColor(...LINE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  doc.setFontSize(10);
  const entries = Object.entries(result.result || {}).filter(([key]) => !EXCLUDED_KEYS.has(key));
  entries.forEach(([key, value], index) => {
    y = ensureSpace(doc, y, 10);
    const bg: RGBColor = index % 2 === 0 ? [248, 248, 255] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(MARGIN, y - 3, CONTENT_W, 8, "F");

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(toLabel(key), MARGIN + 3, y + 2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    const display = formatDisplayValue(value, currency);
    doc.text(display, PAGE_W - MARGIN - 3, y + 2, { align: "right" });
    y += 8;
  });
  y += 6;

  const insights = result.insights || [];
  if (insights.length > 0) {
    y = ensureSpace(doc, y, 18);
    doc.setTextColor(...TEXT);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Key Insights", MARGIN, y);
    y += 6;
    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    insights.forEach((insight) => {
      y = ensureSpace(doc, y, 8);
      const lines = doc.splitTextToSize(`• ${insight}`, CONTENT_W - 5);
      doc.text(lines, MARGIN + 3, y);
      y += lines.length * 5 + 3;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${page} of ${pageCount} | financecalc.in | Informational use only.`, PAGE_W / 2, 290, {
      align: "center",
    });
  }

  const safeBase = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
  doc.save(`${safeBase || "calculator"}-report.pdf`);
}
