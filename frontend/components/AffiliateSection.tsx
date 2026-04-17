type AffiliateSectionProps = {
  title?: string;
  description?: string;
};

export default function AffiliateSection({
  title = "Compare Home Loans",
  description = "Affiliate placeholder: compare interest rates, fees, and prepayment flexibility from partner lenders.",
}: AffiliateSectionProps) {
  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{description}</p>
      <button
        type="button"
        className="mt-3 rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/40"
      >
        Explore Offers
      </button>
    </aside>
  );
}
