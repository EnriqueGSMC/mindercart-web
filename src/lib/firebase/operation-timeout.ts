export class OperationTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "OperationTimeoutError";
  }
}

export function withOperationTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new OperationTimeoutError(label, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timeoutId !== null) clearTimeout(timeoutId);
  });
}
