const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type CalculatorResponse = {
  result: Record<string, unknown>;
  summary: string;
  insights: string[];
};

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "Request failed";
    try {
      const err = (await response.json()) as { detail?: string };
      detail = err.detail || detail;
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
