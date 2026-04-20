"use client";

import Link from "next/link";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { createGoal, deleteGoal, getUserDashboard, updateGoal, type GoalPayload } from "@/lib/api";
import { auth } from "@/lib/firebase-client";

type Goal = GoalPayload & { id: string };

const GOAL_TEMPLATES = [
  {
    title: "Buy a home",
    icon: "🏠",
    calculatorHref: "/decide",
    placeholder_amount: 5000000,
  },
  {
    title: "Build retirement corpus",
    icon: "🎯",
    calculatorHref: "/decide",
    placeholder_amount: 10000000,
  },
  {
    title: "Pay off loan",
    icon: "💳",
    calculatorHref: "/calculators/emi",
    placeholder_amount: 500000,
  },
  {
    title: "Children's education",
    icon: "🎓",
    calculatorHref: "/calculators/sip",
    placeholder_amount: 2000000,
  },
  {
    title: "Emergency fund",
    icon: "🛡️",
    calculatorHref: "/calculators/fd",
    placeholder_amount: 300000,
  },
  {
    title: "Buy a car",
    icon: "🚗",
    calculatorHref: "/calculators/car-loan",
    placeholder_amount: 800000,
  },
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function daysUntil(dateString: string): number {
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [newGoal, setNewGoal] = useState<Partial<GoalPayload>>({
    title: "",
    target_amount: undefined,
    current_amount: 0,
    target_date: "",
  });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<number>(0);

  const loadGoals = async (activeUser: User) => {
    setLoading(true);
    try {
      const token = await activeUser.getIdToken();
      const dashboard = await getUserDashboard(token);
      const result = dashboard.result as { goals?: Goal[] };
      setGoals(result.goals ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        loadGoals(nextUser);
      } else {
        setGoals([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateGoal = async () => {
    if (!user) return;
    if (!newGoal.title || !newGoal.target_amount) {
      toast.error("Please enter a title and target amount.");
      return;
    }

    setAdding(true);
    try {
      const token = await user.getIdToken();
      await createGoal(token, {
        title: newGoal.title,
        target_amount: Number(newGoal.target_amount),
        current_amount: Number(newGoal.current_amount ?? 0),
        target_date: newGoal.target_date || null,
      });
      setNewGoal({ title: "", target_amount: undefined, current_amount: 0, target_date: "" });
      await loadGoals(user);
      toast.success("Goal created.");
      trackEvent("goal_created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create goal");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await deleteGoal(token, goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      toast.success("Goal deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete goal");
    }
  };

  const startInlineUpdate = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingAmount(goal.current_amount);
  };

  const handleUpdateProgress = async (goalId: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await updateGoal(token, goalId, { current_amount: editingAmount });
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? { ...goal, current_amount: editingAmount } : goal)));
      setEditingGoalId(null);
      toast.success("Goal updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update goal");
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Sign in to track your financial goals and progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-zinc-500">Loading goals...</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const percentage = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
          const progressColor = percentage >= 100 ? "bg-green-600" : percentage >= 50 ? "bg-indigo-600" : "bg-amber-500";

          if (editingGoalId === goal.id) {
            return (
              <div key={goal.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <p className="font-semibold">Update progress: {goal.title}</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="number"
                    value={editingAmount}
                    onChange={(event) => setEditingAmount(Number(event.target.value))}
                    className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateProgress(goal.id)}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGoalId(null)}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={goal.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{goal.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                  </p>
                  {goal.target_date ? (
                    <p className="mt-0.5 text-xs text-zinc-400">Target: {new Date(goal.target_date).toLocaleDateString("en-IN")}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startInlineUpdate(goal)} className="text-xs text-indigo-600 hover:underline" type="button">
                    Update
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="text-xs text-red-500 hover:underline" type="button">
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div style={{ width: `${percentage}%` }} className={`h-2 rounded-full transition-all ${progressColor}`} />
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                {percentage.toFixed(0)}% complete
                {goal.target_date ? ` · ${daysUntil(goal.target_date)} days left` : ""}
              </p>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !loading ? <p className="text-sm text-zinc-500">No goals yet. Add your first goal below.</p> : null}

      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <p className="text-sm font-semibold">Goal templates</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GOAL_TEMPLATES.map((template) => (
            <button
              key={template.title}
              type="button"
              onClick={() =>
                setNewGoal((prev) => ({
                  ...prev,
                  title: template.title,
                  target_amount: template.placeholder_amount,
                  current_amount: prev.current_amount ?? 0,
                }))
              }
              className="rounded-md border border-zinc-300 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span>{template.icon}</span>
              <span className="ml-2 font-medium">{template.title}</span>
              <Link href={template.calculatorHref} className="mt-1 block text-xs text-indigo-600 hover:underline">
                Suggested: {template.calculatorHref}
              </Link>
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            type="text"
            placeholder="Goal title"
            value={newGoal.title ?? ""}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, title: event.target.value }))}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="number"
            placeholder="Target amount"
            value={newGoal.target_amount ?? ""}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, target_amount: Number(event.target.value) }))}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="number"
            placeholder="Current amount"
            value={newGoal.current_amount ?? ""}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, current_amount: Number(event.target.value) }))}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <input
            type="date"
            value={newGoal.target_date ?? ""}
            onChange={(event) => setNewGoal((prev) => ({ ...prev, target_date: event.target.value }))}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <button
            type="button"
            onClick={handleCreateGoal}
            disabled={adding}
            className="md:col-span-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {adding ? "Saving..." : "Add Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
