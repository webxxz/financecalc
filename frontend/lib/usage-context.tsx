"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type UsageData = {
  aiQueries: number;
  scenarioRuns: number;
  date: string;
};

type UsageContextType = {
  aiQueriesRemaining: number;
  scenarioRunsRemaining: number;
  isProUser: boolean;
  consumeAIQuery: () => boolean;
  consumeScenarioRun: () => boolean;
  setProUser: (value: boolean) => void;
};

const AI_LIMIT = 5;
const SCENARIO_LIMIT = 10;
const STORAGE_KEY = "fc_usage";
const PRO_KEY = "fc_pro";
const TODAY = () => new Date().toISOString().split("T")[0];

function readUsage(): UsageData {
  if (typeof window === "undefined") {
    return { aiQueries: 0, scenarioRuns: 0, date: TODAY() };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { aiQueries: 0, scenarioRuns: 0, date: TODAY() };

    const parsed = JSON.parse(raw) as UsageData;
    if (parsed.date !== TODAY()) {
      return { aiQueries: 0, scenarioRuns: 0, date: TODAY() };
    }

    return {
      aiQueries: Number.isFinite(parsed.aiQueries) ? Math.max(0, parsed.aiQueries) : 0,
      scenarioRuns: Number.isFinite(parsed.scenarioRuns) ? Math.max(0, parsed.scenarioRuns) : 0,
      date: typeof parsed.date === "string" ? parsed.date : TODAY(),
    };
  } catch {
    return { aiQueries: 0, scenarioRuns: 0, date: TODAY() };
  }
}

function writeUsage(data: UsageData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silent
  }
}

function readProStatus(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(PRO_KEY) === "true";
  } catch {
    return false;
  }
}

const UsageContext = createContext<UsageContextType>({
  aiQueriesRemaining: AI_LIMIT,
  scenarioRunsRemaining: SCENARIO_LIMIT,
  isProUser: false,
  consumeAIQuery: () => true,
  consumeScenarioRun: () => true,
  setProUser: () => {},
});

export function UsageProvider({ children }: { children: ReactNode }) {
  const [usage, setUsage] = useState<UsageData>(() => readUsage());
  const [isProUser, setIsProUserState] = useState<boolean>(() => readProStatus());

  const aiQueriesRemaining = isProUser ? Infinity : Math.max(0, AI_LIMIT - usage.aiQueries);
  const scenarioRunsRemaining = isProUser ? Infinity : Math.max(0, SCENARIO_LIMIT - usage.scenarioRuns);

  const consumeAIQuery = useCallback((): boolean => {
    if (isProUser) return true;

    const current = readUsage();
    if (current.aiQueries >= AI_LIMIT) return false;

    const updated: UsageData = {
      ...current,
      aiQueries: current.aiQueries + 1,
    };

    writeUsage(updated);
    setUsage(updated);
    return true;
  }, [isProUser]);

  const consumeScenarioRun = useCallback((): boolean => {
    if (isProUser) return true;

    const current = readUsage();
    if (current.scenarioRuns >= SCENARIO_LIMIT) return false;

    const updated: UsageData = {
      ...current,
      scenarioRuns: current.scenarioRuns + 1,
    };

    writeUsage(updated);
    setUsage(updated);
    return true;
  }, [isProUser]);

  const setProUser = useCallback((value: boolean) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PRO_KEY, value ? "true" : "false");
      } catch {
        // silent
      }
    }

    setIsProUserState(value);
  }, []);

  return (
    <UsageContext.Provider
      value={{
        aiQueriesRemaining,
        scenarioRunsRemaining,
        isProUser,
        consumeAIQuery,
        consumeScenarioRun,
        setProUser,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export const useUsage = () => useContext(UsageContext);
