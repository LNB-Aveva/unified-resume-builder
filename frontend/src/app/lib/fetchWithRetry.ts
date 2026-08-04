const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;
const REQUEST_TIMEOUT_MS = 65_000;

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message === "Failed to fetch" || err.message === "Load failed";
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const abortFromCaller = () => controller.abort();
    init?.signal?.addEventListener("abort", abortFromCaller, { once: true });

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (err) {
      lastError = err;
      if (err instanceof DOMException && err.name === "AbortError") {
        if (init?.signal?.aborted) throw err;
        throw new Error("Request timed out. Please try again.");
      }
      if (attempt < MAX_RETRIES && isNetworkError(err)) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    } finally {
      window.clearTimeout(timeoutId);
      init?.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
  throw lastError;
}
