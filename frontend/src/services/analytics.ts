import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  if (!key || initialized) return;

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    autocapture: true,
  });
  initialized = true;
}

export type AnalyticsEvent =
  | "user_registered"
  | "wallet_connected"
  | "project_created"
  | "project_accepted"
  | "milestone_created"
  | "milestone_funded"
  | "work_submitted"
  | "payment_released"
  | "dispute_raised"
  | "feedback_submitted";

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, traits);
}
