"use client";

import { Toaster } from "sonner";

import AppErrorBoundary from "@/components/AppErrorBoundary";
import { CurrencyProvider } from "@/lib/currency-context";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <CurrencyProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </CurrencyProvider>
    </AppErrorBoundary>
  );
}
