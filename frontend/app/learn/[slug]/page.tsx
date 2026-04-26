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

function parseBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`bold-${i}`} className="font-semibold text-zinc-900 dark:text-white">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function renderContent(content: string): React.ReactNode[] {
  return content
    .split("\n\n")
    .flatMap((block, i) => {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) return [];
    const blockKey = `${trimmedBlock.slice(0, 40)}-${i}`;

    if (trimmedBlock.startsWith("## ")) {
      return [<h2 key={`h2-${blockKey}`}>{trimmedBlock.replace("## ", "")}</h2>];
    }

    const blockLines = trimmedBlock
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const isBulletList = blockLines.length > 0 && blockLines.every((line) => /^-\s+/.test(line));

    if (isBulletList) {
      const items = blockLines;
      return [
        <ul key={`ul-${blockKey}`}>
          {items.map((item, j) => (
            <li key={`li-${blockKey}-${j}`}>{parseBold(item.replace(/^-\s+/, ""))}</li>
          ))}
        </ul>
      ];
    }

    if (trimmedBlock.startsWith("|")) {
      const rows = trimmedBlock
        .split("\n")
        .filter((row) => row.startsWith("|") && !row.match(/^\|[\-\s|]+\|$/));

      if (rows.length === 0) return [];

      const headers = rows[0].split("|").filter(Boolean).map((header) => header.trim());
      const dataRows = rows.slice(1).map((row) => row.split("|").filter(Boolean).map((cell) => cell.trim()));

      return [
        <div key={`table-${blockKey}`} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((header, headerIndex) => (
                  <th
                    key={`th-${blockKey}-${headerIndex}`}
                    className="border border-zinc-300 px-3 py-2 text-left dark:border-zinc-700"
                  >
                    {parseBold(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr key={`tr-${blockKey}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`td-${blockKey}-${rowIndex}-${cellIndex}`}
                      className="border border-zinc-300 px-3 py-2 dark:border-zinc-700"
                    >
                      {parseBold(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ];
    }

    return [
      <p key={`p-${blockKey}`} className="leading-relaxed text-zinc-700 dark:text-zinc-300">
        {parseBold(trimmedBlock)}
      </p>
    ];
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
