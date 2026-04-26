import type { Metadata } from "next";

import CurrencyConverterClient from "./CurrencyConverterClient";

export const metadata: Metadata = {
  title: "Currency Converter | Live Exchange Rates",
  description: "Convert between 20+ currencies with live exchange rates. Free currency converter tool.",
};

export default function CurrencyConverterPage() {
  return <CurrencyConverterClient />;
}
