"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UsageState = {
  isProUser: boolean;
  aiQueriesRemaining: number;
  scenariosRemaining: number;
};

type UsageContextValue = UsageState & {
  consumeAiQuery: () => boolean;
  consumeScenario: () => boolean;
  setProUser: (isPro: boolean) => void;
};

const FREE_TIER_LIMITS = {
  aiQueriesRemaining: 5,
  scenariosRemaining: 3,
};

const STORAGE_KEY = "fc_usage_v1";

const UsageContext = createContext<UsageContextValue | undefined>(undefined);

function getDefaultUsage(): UsageState {
  return {
    isProUser: false,
    ...FREE_TIER_LIMITS,
  };
}

function readStoredUsage(): UsageState {
  if (typeof window === "undefined") return getDefaultUsage();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUsage();
    const parsed = JSON.parse(raw) as Partial<UsageState>;
    return {
      isProUser: Boolean(parsed.isProUser),
      aiQueriesRemaining:
        typeof parsed.aiQueriesRemaining === "number"
          ? Math.max(0, Math.floor(parsed.aiQueriesRemaining))
          : FREE_TIER_LIMITS.aiQueriesRemaining,
      scenariosRemaining:
        typeof parsed.scenariosRemaining === "number"
          ? Math.max(0, Math.floor(parsed.scenariosRemaining))
          : FREE_TIER_LIMITS.scenariosRemaining,
    };
  } catch {
    return getDefaultUsage();
  }
}

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<UsageState>(() => readStoredUsage());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  const value = useMemo<UsageContextValue>(
    () => ({
      ...usage,
      consumeAiQuery: () => {
        if (usage.isProUser) return true;
        if (usage.aiQueriesRemaining <= 0) return false;
        setUsage((prev) => ({
          ...prev,
          aiQueriesRemaining: Math.max(0, prev.aiQueriesRemaining - 1),
        }));
        return true;
      },
      consumeScenario: () => {
        if (usage.isProUser) return true;
        if (usage.scenariosRemaining <= 0) return false;
        setUsage((prev) => ({
          ...prev,
          scenariosRemaining: Math.max(0, prev.scenariosRemaining - 1),
        }));
        return true;
      },
      setProUser: (isPro: boolean) => {
        setUsage((prev) => ({
          ...prev,
          isProUser: isPro,
        }));
      },
    }),
    [usage],
  );

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
}

export function useUsage(): UsageContextValue {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
}
