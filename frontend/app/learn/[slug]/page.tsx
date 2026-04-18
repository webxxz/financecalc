import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FAQSchema from "@/components/FAQSchema";

type KnowledgeArticle = {
  title: string;
  description: string;
  body: string[];
  faqs: { question: string; answer: string }[];
};

const KNOWLEDGE_BASE: Record<string, KnowledgeArticle> = {
  "what-is-emi": {
    title: "What Is EMI? Meaning, Formula, and Planning Tips",
    description:
      "Learn what EMI means, how the installment formula works, and how to use it to choose a safer loan amount and tenure.",
    body: [
      "EMI stands for Equated Monthly Installment. It is the fixed payment you make each month to repay a loan over a defined tenure.",
      "Every EMI includes principal and interest. In early months, interest usually takes a larger share, while principal share grows later.",
      "Use EMI planning to avoid over-borrowing: keep monthly obligations within your budget and compare multiple tenure scenarios before signing.",
    ],
    faqs: [
      {
        question: "What does EMI include?",
        answer: "EMI includes both principal repayment and interest for that month.",
      },
      {
        question: "Does a longer tenure reduce EMI?",
        answer: "Yes, a longer tenure usually lowers monthly EMI but increases total interest paid over time.",
      },
      {
        question: "How can I reduce EMI burden?",
        answer: "Increase down payment, borrow less, negotiate lower rates, or extend tenure after checking total interest impact.",
      },
    ],
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = KNOWLEDGE_BASE[slug];
  if (!article) {
    return {
      title: "Knowledge Base",
      description: "FinanceCalc knowledge base article",
    };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `https://financecalc.app/learn/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://financecalc.app/learn/${slug}`,
      type: "article",
    },
  };
}

export function generateStaticParams() {
  return Object.keys(KNOWLEDGE_BASE).map((slug) => ({ slug }));
}

export const revalidate = 3600;

export default async function KnowledgeBasePage({ params }: PageProps) {
  const { slug } = await params;
  const article = KNOWLEDGE_BASE[slug];
  if (!article) {
    notFound();
  }

  return (
    <article className="prose prose-zinc max-w-none space-y-4 dark:prose-invert">
      <FAQSchema faqs={article.faqs} />
      <h1>{article.title}</h1>
      <p>{article.description}</p>
      {article.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <h2>Frequently Asked Questions</h2>
      {article.faqs.map((faq) => (
        <div key={faq.question}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </article>
  );
}
