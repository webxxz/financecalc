const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type CalculatorResponse = {
  result: Record<string, unknown>;
  summary: string;
  insights: string[];
  warnings?: string[];
  tools_used?: string[];
  tool_arguments_list?: Record<string, unknown>[];
  tool_used?: string;
  tool_arguments?: Record<string, unknown>;
};

export type GoalPayload = {
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  notes?: string | null;
};

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type DecisionResponse = {
  status: "complete" | "needs_more_info";
  verdict: string | null;
  verdict_label: string | null;
  reasoning: string | null;
  comparison: Array<{
    option: string;
    key_metric: string;
    pros: string[];
    cons: string[];
  }>;
  insights: string[];
  recommendation_strength: "strong" | "moderate" | "depends" | null;
  follow_up_question: string | null;
  calculations_run: string[];
};

export type ScenarioResponse = {
  scenario: string;
  verdict: string;
  verdict_label: string;
  insights: string[];
  data: Record<string, unknown>;
};

export type DecisionPayload = {
  message: string;
  conversation_history?: Message[] | null;
  context?: Record<string, unknown> | null;
};

export type ScenarioPayload = {
  scenario: string;
  inputs: Record<string, unknown>;
};

type RequestOptions = RequestInit & {
  cacheMode?: RequestCache;
};

async function request<T>(path: string, init: RequestOptions): Promise<T> {
  const { cacheMode, ...requestInit } = init;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...(requestInit.headers || {}),
    },
    cache: cacheMode ?? (requestInit.method === "GET" ? "default" : "no-store"),
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const err = (await response.json()) as { detail?: string; message?: string; error_code?: string };
      detail = err.message || err.detail || detail;
      if (err.error_code) {
        detail = `${detail} (${err.error_code})`;
      }
    } catch {
      // no-op
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function postCalculator<TPayload>(path: string, payload: TPayload): Promise<CalculatorResponse> {
  return request<CalculatorResponse>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function sendContactMessage(payload: { name: string; email: string; message: string }) {
  return request<CalculatorResponse>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function askAssistant(query: string) {
  return request<CalculatorResponse>("/api/ai/assistant", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function runDecision(payload: DecisionPayload) {
  return request<DecisionResponse>("/api/ai/decision", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runScenario(payload: ScenarioPayload) {
  return request<ScenarioResponse>("/api/ai/scenario", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserDashboard(token: string) {
  return request<CalculatorResponse>("/api/user/dashboard", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cacheMode: "no-store",
  });
}

export async function createGoal(token: string, payload: GoalPayload) {
  return request<CalculatorResponse>("/api/user/goals", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function updateGoal(token: string, goalId: string, payload: Partial<GoalPayload>) {
  return request<CalculatorResponse>(`/api/user/goals/${goalId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function deleteGoal(token: string, goalId: string) {
  return request<CalculatorResponse>(`/api/user/goals/${goalId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function saveCalculation(
  token: string,
  payload: { calculator_type: string; input_data: Record<string, unknown>; output_data: Record<string, unknown> },
) {
  return request<CalculatorResponse>("/api/user/calculations", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
