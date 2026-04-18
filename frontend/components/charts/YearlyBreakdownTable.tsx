"use client";

type YearlyBreakdownTableProps = {
  rows: Array<{ year: number; principal_paid: number; interest_paid: number; balance: number }>;
  currency: string;
};

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};

export default function YearlyBreakdownTable({ rows, currency }: YearlyBreakdownTableProps) {
  const moneyFormatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  return (
    <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              Year
            </th>
            <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              Principal Paid
            </th>
            <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              Interest Paid
            </th>
            <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              Outstanding Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">{row.year}</td>
              <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {moneyFormatter.format(row.principal_paid)}
              </td>
              <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {moneyFormatter.format(row.interest_paid)}
              </td>
              <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                {moneyFormatter.format(row.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
