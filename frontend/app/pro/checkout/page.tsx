"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { sendContactMessage } from "@/lib/api";

export default function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendContactMessage({
        name: "Pro Waitlist",
        email,
        message: "Pro waitlist signup from checkout page",
      });
    } catch {
      // silent — do not block
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-20 text-center">
      <div className="text-5xl">🚀</div>
      <h1 className="text-2xl font-bold">Pro is launching soon</h1>
      <p className="text-zinc-600 dark:text-zinc-300">
        We are setting up secure payments. Enter your email and we will notify you the moment Pro goes live — with a
        30% launch discount.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "..." : "Notify me"}
          </button>
        </form>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <p className="font-medium text-green-700 dark:text-green-300">
            ✓ You are on the list. We will email you when Pro launches.
          </p>
        </div>
      )}

      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
        ← Back to calculators
      </Link>
    </div>
  );
}
