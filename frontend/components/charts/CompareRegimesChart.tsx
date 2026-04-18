"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CompareRegimesChartProps = {
  oldRegimeTax: number;
  newRegimeTax: number;
  currency: string;
};

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
};

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  betterRegimeName: string;
};

function CustomTick({ x = 0, y = 0, payload, betterRegimeName }: TickProps) {
  const isBetter = payload?.value === betterRegimeName;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="#475569" fontSize={12}>
        {payload?.value}
      </text>
      {isBetter ? (
        <text x={0} y={0} dy={32} textAnchor="middle" fill="#16a34a" fontSize={11}>
          ✓ Better
        </text>
      ) : null}
    </g>
  );
}

export default function CompareRegimesChart({ oldRegimeTax, newRegimeTax, currency }: CompareRegimesChartProps) {
  const data = [
    { name: "Old Regime", value: oldRegimeTax, fill: "#f59e0b" },
    { name: "New Regime", value: newRegimeTax, fill: "#6366f1" },
  ];
  const betterRegimeName = oldRegimeTax <= newRegimeTax ? "Old Regime" : "New Regime";
  const moneyFormatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 20, right: 16, left: 8, bottom: 24 }}>
        <XAxis dataKey="name" tick={(props) => <CustomTick {...props} betterRegimeName={betterRegimeName} />} interval={0} />
        <YAxis />
        <Tooltip formatter={(value) => moneyFormatter.format(Number(value))} />
        <Bar dataKey="value" isAnimationActive={false}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList dataKey="value" position="top" formatter={(value: number) => moneyFormatter.format(value)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
