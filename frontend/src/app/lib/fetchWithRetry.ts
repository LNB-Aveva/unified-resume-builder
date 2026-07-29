const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

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
    try {
      return await fetch(input, init);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES && isNetworkError(err)) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
