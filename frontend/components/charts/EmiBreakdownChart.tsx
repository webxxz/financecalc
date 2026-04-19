"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type EmiBreakdownChartProps = {
  principal: number;
  totalInterest: number;
  currency: string;
};

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};

export default function EmiBreakdownChart({ principal, totalInterest, currency }: EmiBreakdownChartProps) {
  const data = [
    { name: "Principal", value: principal, color: "#6366f1" },
    { name: "Total Interest", value: totalInterest, color: "#f59e0b" },
  ];

  const moneyFormatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          isAnimationActive={false}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => moneyFormatter.format(Number(value))} />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
      </PieChart>
    </ResponsiveContainer>
  );
}
