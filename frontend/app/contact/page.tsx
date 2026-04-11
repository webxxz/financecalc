import type { Metadata } from "next";

import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send support and partnership requests to FinanceCalc.app.",
};

export default function ContactPage() {
  return <ContactForm />;
}
