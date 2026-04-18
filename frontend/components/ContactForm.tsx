"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { sendContactMessage } from "@/lib/api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await sendContactMessage({ name, email, message });
      setStatus("Message sent successfully.");
      toast.success("Message sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const failureMessage = err instanceof Error ? err.message : "Unable to send message.";
      setStatus(failureMessage);
      toast.error(failureMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-semibold">Contact FinanceCalc</h1>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <textarea
        required
        minLength={10}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help?"
        className="h-32 w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
      {status ? <p className="text-sm text-zinc-700 dark:text-zinc-300">{status}</p> : null}
    </form>
  );
}
