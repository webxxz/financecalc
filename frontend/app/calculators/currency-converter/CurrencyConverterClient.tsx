"use client";

import { useState } from "react";
import { toast } from "sonner";

import { postCalculator } from "@/lib/api";

const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "AUD",
  "CAD",
  "CHF",
  "SGD",
  "AED",
  "SAR",
  "MYR",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "ZAR",
  "CNY",
  "BRL",
] as const;

type ConvertResult = {
  converted_amount: number;
  exchange_rate: number;
  from_currency: string;
  to_currency: string;
  last_updated: string;
};

export default function CurrencyConverterClient() {
  const [amount, setAmount] = useState("1");
  const [fromCurrency, setFromCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>("USD");
  const [toCurrency, setToCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>("INR");
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const onConvert = async () => {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      const message = "Enter a valid amount greater than 0.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await postCalculator("/api/currency-convert", {
        amount: parsedAmount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
      });
      setResult(response.result as ConvertResult);
      toast.success("Conversion complete.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to convert currency";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold tracking-tight">Currency Converter</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Convert between 20 currencies using live exchange rates.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <label className="text-sm">
          <span className="mb-1 block font-medium">From currency</span>
          <select
            value={fromCurrency}
            onChange={(event) => setFromCurrency(event.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end justify-center">
          <button
            type="button"
            onClick={onSwap}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Swap currencies"
          >
            ↔
          </button>
        </div>

        <label className="text-sm">
          <span className="mb-1 block font-medium">To currency</span>
          <select
            value={toCurrency}
            onChange={(event) => setToCurrency(event.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Amount</span>
          <input
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onConvert}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Converting..." : "Convert"}
          </button>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-6 rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-950">
          <p className="text-base font-semibold">
            {Number(amount)} {result.from_currency} = {result.converted_amount} {result.to_currency}
          </p>
          <p className="mt-1">
            Exchange rate: 1 {result.from_currency} = {result.exchange_rate} {result.to_currency}
          </p>
          <p className="mt-1">Last updated: {new Date(result.last_updated).toLocaleString()}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">Rates are indicative. Use for reference only.</p>
    </section>
  );
}
