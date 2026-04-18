"use client";

import { useCallback, useEffect, useState } from "react";
import { type User, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

import { createGoal, deleteGoal, getUserDashboard, updateGoal, type GoalPayload } from "@/lib/api";
import { auth } from "@/lib/firebase-client";

type DashboardGoal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  notes?: string | null;
};

type DashboardCalc = {
  id: string;
  calculator_type: string;
  created_at?: string;
};

type DashboardHistory = {
  id: string;
  type: "goal" | "calculation";
  title: string;
  created_at?: string;
};

const QUICK_PROGRESS_INCREMENT = 0.1;

export default function DashboardClient() {
  const [goals, setGoals] = useState<DashboardGoal[]>([]);
  const [calculations, setCalculations] = useState<DashboardCalc[]>([]);
  const [history, setHistory] = useState<DashboardHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [goalForm, setGoalForm] = useState<GoalPayload>({
    title: "",
    target_amount: 0,
    current_amount: 0,
    target_date: "",
    notes: "",
  });
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsubscribe();
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await getUserDashboard(token);
      const result = data.result as {
        goals?: DashboardGoal[];
        calculations?: DashboardCalc[];
        history?: DashboardHistory[];
      };
      setGoals(result.goals || []);
      setCalculations(result.calculations || []);
      setHistory(result.history || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load dashboard";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onCreateGoal = async () => {
    if (!user) return;
    setError("");
    setMessage("");
    try {
      const token = await user.getIdToken();
      await createGoal(token, goalForm);
      setMessage("Goal saved.");
      toast.success("Goal saved.");
      setGoalForm({ title: "", target_amount: 0, current_amount: 0, target_date: "", notes: "" });
      await loadDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save goal";
      setError(message);
      toast.error(message);
    }
  };

  const onQuickProgress = async (goal: DashboardGoal) => {
    if (!user) return;
    setError("");
    setMessage("");
    try {
      const token = await user.getIdToken();
      await updateGoal(token, goal.id, { current_amount: goal.current_amount + goal.target_amount * QUICK_PROGRESS_INCREMENT });
      setMessage("Goal progress updated.");
      toast.success("Goal progress updated.");
      await loadDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update goal";
      setError(message);
      toast.error(message);
    }
  };

  const onDeleteGoal = async (goalId: string) => {
    if (!user) return;
    setError("");
    setMessage("");
    try {
      const token = await user.getIdToken();
      await deleteGoal(token, goalId);
      setMessage("Goal deleted.");
      toast.success("Goal deleted.");
      await loadDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete goal";
      setError(message);
      toast.error(message);
    }
  };

  if (!user) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-300">Sign in with Firebase to view your dashboard.</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Saved calculations, goals, and financial history in one place.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-5 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">Add Goal</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Goal title"
            value={goalForm.title}
            onChange={(e) => setGoalForm((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="number"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Target amount"
            value={goalForm.target_amount || ""}
            onChange={(e) => setGoalForm((prev) => ({ ...prev, target_amount: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Current amount"
            value={goalForm.current_amount || ""}
            onChange={(e) => setGoalForm((prev) => ({ ...prev, current_amount: Number(e.target.value) }))}
          />
          <input
            type="date"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Target date (optional)"
            value={goalForm.target_date || ""}
            onChange={(e) => setGoalForm((prev) => ({ ...prev, target_date: e.target.value }))}
          />
          <textarea
            className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Notes (optional)"
            value={goalForm.notes || ""}
            onChange={(e) => setGoalForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <button
            type="button"
            className="md:col-span-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={onCreateGoal}
          >
            Save Goal
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Goals</h2>
          <ul className="mt-3 space-y-3">
            {goals.length === 0 ? <li className="text-sm text-zinc-600 dark:text-zinc-300">No goals yet.</li> : null}
            {goals.map((goal) => (
              <li key={goal.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                <p className="font-medium">{goal.title}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Progress: {goal.current_amount} / {goal.target_amount}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onQuickProgress(goal)}
                    className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    +10% Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteGoal(goal.id)}
                    className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold">Saved Calculations</h2>
          <ul className="mt-3 space-y-2">
            {calculations.length === 0 ? <li className="text-sm text-zinc-600 dark:text-zinc-300">No saved calculations yet.</li> : null}
            {calculations.map((item) => (
              <li key={item.id} className="text-sm">
                {item.calculator_type}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">History Timeline</h2>
        <ul className="mt-3 space-y-2">
          {history.length === 0 ? <li className="text-sm text-zinc-600 dark:text-zinc-300">No history yet.</li> : null}
          {history.map((item) => (
            <li key={`${item.type}-${item.id}`} className="text-sm text-zinc-700 dark:text-zinc-300">
              <span className="mr-2 rounded bg-zinc-100 px-2 py-0.5 text-xs uppercase dark:bg-zinc-800">{item.type}</span>
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
