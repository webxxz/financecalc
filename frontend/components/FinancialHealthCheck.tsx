"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Question = {
  id: number;
  prompt: string;
  options: { key: string; label: string; route?: string }[];
};

const FHC_COMPLETED_KEY = "fhc_completed";

const QUESTIONS: Question[] = [
  {
    id: 0,
    prompt: "What brings you here today?",
    options: [
      { key: "loan", label: "I want to take a loan", route: "/calculators/emi" },
      { key: "savings", label: "I want to grow my savings", route: "/calculators/sip" },
      { key: "buy_home", label: "I want to buy a home", route: "/decide?scenario=rent_vs_buy" },
      { key: "retirement", label: "I want to plan for retirement", route: "/decide?scenario=early_retirement" },
      { key: "taxes", label: "I want to save on taxes", route: "/calculators/tax" },
    ],
  },
  {
    id: 1,
    prompt: "What is your monthly income roughly?",
    options: [
      { key: "under_50k", label: "Under ₹50,000" },
      { key: "50k_100k", label: "₹50,000 – ₹1,00,000" },
      { key: "100k_250k", label: "₹1,00,000 – ₹2,50,000" },
      { key: "above_250k", label: "Above ₹2,50,000" },
      { key: "skip", label: "I'd rather not say" },
    ],
  },
  {
    id: 2,
    prompt: "Do you currently have any loans?",
    options: [
      { key: "none", label: "No loans" },
      { key: "home_loan", label: "Home loan" },
      { key: "personal_car", label: "Personal / car loan" },
      { key: "multiple", label: "Multiple loans" },
    ],
  },
  {
    id: 3,
    prompt: "How would you describe your investment experience?",
    options: [
      { key: "starter", label: "I'm just starting out" },
      { key: "fd_ppf", label: "I have FD / PPF" },
      { key: "mutual_funds", label: "I invest in mutual funds" },
      { key: "stocks", label: "I'm experienced with stocks" },
    ],
  },
  {
    id: 4,
    prompt: "What is your primary financial goal?",
    options: [
      { key: "reduce_debt", label: "Reduce debt" },
      { key: "buy_home_3_5", label: "Buy a home in 3-5 years" },
      { key: "build_wealth", label: "Build wealth long term" },
      { key: "retire_early", label: "Retire early" },
      { key: "save_tax", label: "Save on taxes" },
    ],
  },
];

export default function FinancialHealthCheck() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    const completed = window.localStorage.getItem(FHC_COMPLETED_KEY) === "true";
    setIsCompleted(completed);
    setIsReady(true);
  }, []);

  const activeQuestion = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
  const firstAnswerRoute = useMemo(() => {
    const firstAnswer = answers[0];
    if (!firstAnswer) return "/calculators/emi";
    return QUESTIONS[0].options.find((option) => option.key === firstAnswer)?.route ?? "/calculators/emi";
  }, [answers]);

  const onSelect = (optionKey: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionKey }));
  };

  const onBack = () => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  };

  const onGetRecommendation = () => {
    window.localStorage.setItem(FHC_COMPLETED_KEY, "true");
    setIsCompleted(true);
    router.push(firstAnswerRoute);
  };

  if (!isReady || isCompleted) return null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">60-second Financial Health Check</p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Find the right tool for your next step</h2>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{activeQuestion.prompt}</h3>

        <div className="grid gap-3">
          {activeQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion] === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onSelect(option.key)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:border-indigo-400 dark:bg-indigo-950/40 dark:text-indigo-100"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={currentQuestion === 0}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back
        </button>

        {currentQuestion === QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={onGetRecommendation}
            disabled={!answers[currentQuestion]}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            See my recommendation
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentQuestion((prev) => Math.min(QUESTIONS.length - 1, prev + 1))}
            disabled={!answers[currentQuestion]}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
