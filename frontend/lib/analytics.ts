type EventName =
  | "calculator_used"
  | "scenario_run"
  | "ai_query"
  | "affiliate_click"
  | "pdf_exported"
  | "goal_created"
  | "pro_page_viewed"
  | "quiz_completed";

type EventParams = {
  calculator_type?: string;
  scenario_type?: string;
  result_value?: number;
  offer_id?: string;
  currency?: string;
};

type GtagFn = (command: "event", eventName: string, params?: Record<string, unknown>) => void;

export function trackEvent(eventName: EventName, params?: EventParams): void {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: GtagFn }).gtag;
  if (!gtag) return;
  try {
    gtag("event", eventName, {
      ...params,
      app_version: "phase5",
    });
  } catch {
    // silent fail — never block user action for analytics
  }
}
