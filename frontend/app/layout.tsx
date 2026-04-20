import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import AppProviders from "@/components/AppProviders";
import NavUsageIndicator from "@/components/NavUsageIndicator";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://financecalc.app"),
  title: {
    default: "FinanceCalc.app | Global Financial Calculators + AI Assistant",
    template: "%s | FinanceCalc.app",
  },
  description:
    "FinanceCalc.app provides global financial calculators, AI-assisted insights, and currency-aware planning across EMI, SIP, mortgage, and more.",
  openGraph: {
    title: "FinanceCalc.app",
    description: "Global financial calculators with AI-backed guidance and structured math APIs.",
    url: "https://financecalc.app",
    siteName: "FinanceCalc.app",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
        <AppProviders>
          <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-lg font-semibold">
                FinanceCalc.app
              </Link>
              <div className="flex items-center gap-4 text-sm">
                <Link href="/calculators/emi">EMI</Link>
                <Link href="/calculators/sip">SIP</Link>
                <Link href="/calculators/mortgage">Mortgage</Link>
                <Link href="/calculators/credit-card-payoff">Card Payoff</Link>
                <Link href="/calculators/investment-growth">Investment Growth</Link>
                <Link href="/calculators/retirement-withdrawal">Retirement Withdrawal</Link>
                <Link
                  href="/pro"
                  className="font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  ✦ Go Pro
                </Link>
                <NavUsageIndicator />
                <Link href="/decide">Ask AI</Link>
                <Link href="/learn/what-is-emi">Learn</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </nav>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        </AppProviders>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
