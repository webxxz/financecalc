"use client";

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <div className={`mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}
