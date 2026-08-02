import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";

export function register() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event) {
      const request = event.request;
      if (request) {
        delete request.data;
        const headers = request.headers;
        if (headers) {
          delete headers["authorization"];
          delete headers["cookie"];
          delete headers["set-cookie"];
        }
      }
      if (event.exception?.values) {
        for (const exc of event.exception.values) {
          if (exc.stacktrace?.frames) {
            for (const frame of exc.stacktrace.frames) {
              delete (frame as Record<string, unknown>).vars;
            }
          }
        }
      }
      delete event.extra;
      return event;
    },
  });
}

export const onRequestError = Sentry.captureRequestError;
