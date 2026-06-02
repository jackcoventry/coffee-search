export const REQUEST_TIMEOUT_MESSAGE = 'Request timed out. Please try again.';

export function createTimeoutError(message = REQUEST_TIMEOUT_MESSAGE) {
  const err = new Error(message);
  err.name = 'TimeoutError';
  return err;
}

export function isAbortLikeError(err: unknown) {
  return (
    (err instanceof DOMException || err instanceof Error) &&
    (err.name === 'AbortError' || err.name === 'TimeoutError')
  );
}

export function timeoutSignal(timeoutMs: number, signal?: AbortSignal) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(createTimeoutError());
  }, timeoutMs);

  const cleanup = () => {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromInput);
  };

  const abortFromInput = () => {
    timeoutController.abort(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
  };

  if (signal?.aborted) {
    abortFromInput();
    cleanup();
    return { signal: timeoutController.signal, cleanup };
  }

  signal?.addEventListener('abort', abortFromInput, { once: true });

  return { signal: timeoutController.signal, cleanup };
}

export async function withTimeout<T>(
  timeoutMs: number,
  run: (signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  const timeout = timeoutSignal(timeoutMs, signal);

  try {
    return await run(timeout.signal);
  } finally {
    timeout.cleanup();
  }
}
