export default function CalculatorsLoading() {
  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-8 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </section>
  );
}
