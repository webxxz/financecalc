import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/components/JsonLd";
import { article as howMuchToSaveForRetirement } from "@/content/learn/how-much-to-save-for-retirement";
import { article as howToSaveIncomeTax } from "@/content/learn/how-to-save-income-tax";
import { article as rentVsBuyGuide } from "@/content/learn/rent-vs-buy-guide";
import { article as sipVsLumpSum } from "@/content/learn/sip-vs-lump-sum";
import { article as whatIsEmi } from "@/content/learn/what-is-emi";

type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  content: string;
  relatedCalculators: { href: string; label: string }[];
  faqs: { q: string; a: string }[];
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const ARTICLES: Record<string, LearnArticle> = {
  [whatIsEmi.slug]: whatIsEmi,
  [sipVsLumpSum.slug]: sipVsLumpSum,
  [howToSaveIncomeTax.slug]: howToSaveIncomeTax,
  [rentVsBuyGuide.slug]: rentVsBuyGuide,
  [howMuchToSaveForRetirement.slug]: howMuchToSaveForRetirement,
};

function renderInlineMarkdown(text: string): React.ReactNode {
  return text.split(/(\*\*.*?\*\*)/g).map((part, idx) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${idx}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${part}-${idx}`}>{part}</span>
    ),
  );
}

function renderParagraph(block: string, key: string) {
  const lines = block.split("\n");
  return (
    <p key={key}>
      {lines.map((line, idx) => (
        <span key={`${key}-line-${idx}`}>
          {renderInlineMarkdown(line)}
          {idx < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

function renderContent(content: string) {
  const blocks = content
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const key = `block-${index}`;

    if (block.startsWith("## ")) {
      return <h2 key={key}>{block.slice(3)}</h2>;
    }

    if (block.startsWith("|")) {
      const lines = block.split("\n").filter(Boolean);
      if (lines.length >= 2) {
        const [headerLine, , ...rowLines] = lines;
        const headers = headerLine.split("|").map((cell) => cell.trim()).filter(Boolean);
        const rows = rowLines.map((row) => row.split("|").map((cell) => cell.trim()).filter(Boolean));
        return (
          <div key={key} className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={`${key}-${header}`} className="border border-zinc-300 px-3 py-2 text-left dark:border-zinc-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={`${key}-row-${rowIdx}`}>
                    {row.map((cell, cellIdx) => (
                      <td
                        key={`${key}-row-${rowIdx}-cell-${cellIdx}`}
                        className="border border-zinc-300 px-3 py-2 dark:border-zinc-700"
                      >
                        {renderInlineMarkdown(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    const lines = block.split("\n");
    const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));
    if (isOrderedList) {
      return (
        <ol key={key}>
          {lines.map((line) => (
            <li key={`${key}-${line}`}>{renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    const isUnorderedList = lines.every((line) => /^-\s+/.test(line));
    if (isUnorderedList) {
      return (
        <ul key={key}>
          {lines.map((line) => (
            <li key={`${key}-${line}`}>{renderInlineMarkdown(line.replace(/^-\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return renderParagraph(block, key);
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    return {
      title: "Learn",
      description: "Finance learning articles",
    };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `https://financecalc.app/learn/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://financecalc.app/learn/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export function generateStaticParams() {
  return Object.values(ARTICLES).map((article) => ({ slug: article.slug }));
}

export const revalidate = 3600;

export default async function LearnArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "FinanceCalc",
    },
    publisher: {
      "@type": "Organization",
      name: "FinanceCalc",
    },
    mainEntityOfPage: `https://financecalc.app/learn/${article.slug}`,
  };

  return (
    <div className="space-y-8">
      <JsonLd data={articleSchema} />

      <article className="prose prose-zinc max-w-none dark:prose-invert">
        <header className="not-prose space-y-3">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{article.title}</h1>
          <p className="text-base text-zinc-700 dark:text-zinc-300">{article.description}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Published {article.publishedAt} · {article.readingTime}
          </p>
        </header>

        {renderContent(article.content)}
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Related Calculators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {article.relatedCalculators.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-zinc-200 bg-white p-4 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {article.faqs.map((faq) => (
            <details key={faq.q} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <summary className="cursor-pointer list-none font-medium text-zinc-900 dark:text-zinc-50">{faq.q}</summary>
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
