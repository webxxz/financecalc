"use client";

import { Toaster } from "sonner";

import AppErrorBoundary from "@/components/AppErrorBoundary";
import { CurrencyProvider } from "@/lib/currency-context";
import { UsageProvider } from "@/lib/usage-context";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <UsageProvider>
        <CurrencyProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </CurrencyProvider>
      </UsageProvider>
    </AppErrorBoundary>
  );
}
