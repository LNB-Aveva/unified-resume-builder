import type { ErrorEvent } from "@sentry/nextjs";

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  const clean = {} as ErrorEvent;
  for (const key of [
    "event_id",
    "timestamp",
    "platform",
    "level",
    "logger",
    "release",
    "environment",
    "server_name",
  ] as const) {
    const value = event[key];
    if (value !== undefined) {
      // The keys above have different value types, but each is copied back to
      // the same Event property.
      Object.assign(clean, { [key]: value });
    }
  }

  const values = event.exception?.values?.map((exception) => ({
    type: /^[A-Za-z0-9_.]+$/.test(exception.type ?? "")
      ? exception.type
      : "Error",
    value: "Application error details redacted",
    stacktrace: exception.stacktrace?.frames
      ? {
          frames: exception.stacktrace.frames.map((frame) => ({
            filename: frame.filename,
            function: frame.function,
            module: frame.module,
            lineno: frame.lineno,
            colno: frame.colno,
            in_app: frame.in_app,
          })),
        }
      : undefined,
  }));

  if (values?.length) {
    clean.exception = { values };
  } else if (event.message || event.logentry) {
    clean.message = "Application error details redacted";
  }

  return clean;
}
