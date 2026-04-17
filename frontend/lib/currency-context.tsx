"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CurrencyCode = "USD" | "INR" | "EUR" | "GBP";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (value: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "USD";
    const savedCurrency = window.localStorage.getItem("fc_currency");
    if (savedCurrency === "USD" || savedCurrency === "INR" || savedCurrency === "EUR" || savedCurrency === "GBP") {
      return savedCurrency;
    }
    const localeCookie = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("fc_locale="))
      ?.split("=")[1];
    const locale = decodeURIComponent(localeCookie || navigator.language || "en-US").toLowerCase();
    if (locale.includes("in")) return "INR";
    if (locale.includes("gb")) return "GBP";
    if (locale.includes("fr") || locale.includes("de") || locale.includes("es") || locale.includes("it") || locale.includes("pt") || locale.includes("eu")) {
      return "EUR";
    }
    return "USD";
  });

  useEffect(() => {
    window.localStorage.setItem("fc_currency", currency);
  }, [currency]);

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
}
