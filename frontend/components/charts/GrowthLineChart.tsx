"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type GrowthLineChartProps = {
  data: Array<{ year: number; invested: number; value: number }>;
  currency: string;
};

function formatYAxisTick(value: number, currency: string): string {
  if (currency === "INR") {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
    return value.toString();
  }
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function getCurrencyLocale(currency: string): string {
  if (currency === "INR") return "en-IN";
  if (currency === "EUR") return "de-DE";
  if (currency === "GBP") return "en-GB";
  return "en-US";
}

export default function GrowthLineChart({ data, currency }: GrowthLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -2 }} />
        <YAxis tickFormatter={(value: number) => formatYAxisTick(value, currency)} />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat(getCurrencyLocale(currency), {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(value)
          }
        />
        <Legend />
        <Line type="monotone" dataKey="value" name="Total Value" stroke="#6366f1" strokeWidth={2} isAnimationActive={false} />
        <Line
          type="monotone"
          dataKey="invested"
          name="Amount Invested"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
