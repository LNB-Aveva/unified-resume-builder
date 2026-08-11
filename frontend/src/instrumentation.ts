import * as Sentry from "@sentry/nextjs";
import { scrubSentryEvent } from "./lib/sentryPrivacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";

export function register() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubSentryEvent,
  });
}

export const onRequestError = Sentry.captureRequestError;
