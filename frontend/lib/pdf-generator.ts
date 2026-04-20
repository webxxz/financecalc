import type { CalculatorResponse } from "@/lib/api";

export async function generateCalculatorPDF(
  title: string,
  inputs: Record<string, unknown>,
  result: CalculatorResponse,
  currency: string,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PRIMARY = [79, 70, 229] as [number, number, number];
  const TEXT = [30, 30, 30] as [number, number, number];
  const MUTED = [100, 100, 100] as [number, number, number];
  const LINE = [220, 220, 220] as [number, number, number];
  const PAGE_W = 210;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let y = 0;

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FinanceCalc", MARGIN, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered Financial Decisions", MARGIN, 19);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, PAGE_W - MARGIN, 19, {
    align: "right",
  });

  y = 40;

  doc.setTextColor(...TEXT);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  y += 8;

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  const summaryLines = doc.splitTextToSize(result.summary, CONTENT_W);
  doc.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 6 + 6;

  if (Object.keys(inputs).length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    doc.text("Inputs", MARGIN, y);
    y += 6;

    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setFontSize(10);
    Object.entries(inputs).forEach(([key, value], index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      const bg: [number, number, number] = index % 2 === 0 ? [248, 248, 255] : [255, 255, 255];
      doc.setFillColor(...bg);
      doc.rect(MARGIN, y - 3, CONTENT_W, 8, "F");

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      doc.text(label, MARGIN + 3, y + 2);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT);
      const displayVal = String(value);
      doc.text(displayVal, PAGE_W - MARGIN - 3, y + 2, { align: "right" });
      y += 8;
    });

    y += 6;
  }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT);
  doc.text("Results", MARGIN, y);
  y += 6;

  doc.setDrawColor(...LINE);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  const resultEntries = Object.entries(result.result).filter(
    ([key]) => !["yearly_schedule", "yearly_growth"].includes(key),
  );

  doc.setFontSize(10);
  resultEntries.forEach(([key, value], index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const bg: [number, number, number] = index % 2 === 0 ? [248, 248, 255] : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(MARGIN, y - 3, CONTENT_W, 8, "F");

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    doc.text(label, MARGIN + 3, y + 2);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    const displayVal =
      typeof value === "number"
        ? new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
          }).format(value)
        : String(value);
    doc.text(displayVal, PAGE_W - MARGIN - 3, y + 2, { align: "right" });
    y += 8;
  });

  y += 6;

  if (result.insights.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT);
    doc.text("Key Insights", MARGIN, y);
    y += 6;

    doc.setDrawColor(...LINE);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);

    result.insights.forEach((insight) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(`• ${insight}`, CONTENT_W - 5);
      doc.text(lines, MARGIN + 3, y);
      y += lines.length * 5 + 3;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Page ${i} of ${pageCount} | financecalc.in | This report is for informational purposes only.`,
      PAGE_W / 2,
      290,
      { align: "center" },
    );
  }

  const filename = `${title.toLowerCase().replace(/\s+/g, "-")}-report.pdf`;
  doc.save(filename);
}
