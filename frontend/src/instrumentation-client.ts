import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || "";

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV || "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.extra;
      if (event.request) {
        delete event.request.data;
        const headers = event.request.headers;
        if (headers) {
          delete headers["authorization"];
          delete headers["cookie"];
        }
      }
      return event;
    },
  });
}
