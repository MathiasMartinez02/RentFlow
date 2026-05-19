const DEFAULT_DELAY_MS = 600;

export function simulateDelay(ms = DEFAULT_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockFetch<T>(data: T, delayMs?: number): Promise<T> {
  await simulateDelay(delayMs);
  return structuredClone(data) as T;
}

export async function mockFetchWithError<T>(
  data: T,
  errorRate = 0,
  delayMs?: number
): Promise<T> {
  await simulateDelay(delayMs);
  if (Math.random() < errorRate) {
    throw new Error("Simulated network error");
  }
  return structuredClone(data) as T;
}
