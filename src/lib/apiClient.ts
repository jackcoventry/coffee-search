import { isAbortLikeError, withTimeout } from '@/lib/timeout';

export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export class ApiRequestError extends Error implements ApiError {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiJson<TResponse, TBody = unknown>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
  }
): Promise<TResponse> {
  let res: Response;

  try {
    res = await withTimeout(
      options?.timeoutMs ?? 15_000,
      (signal) =>
        fetch(path, {
          method: options?.method ?? (options?.body ? 'POST' : 'GET'),
          headers: {
            'content-type': 'application/json',
            ...options?.headers,
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal,
        }),
      options?.signal
    );
  } catch (err) {
    if (isAbortLikeError(err)) {
      throw new ApiRequestError('Request timed out. Please try again.', 408, null);
    }
    throw err;
  }

  const json = await safeJson(res);

  if (!res.ok) {
    const message =
      (json && typeof json?.error === 'string' && json.error) || 'Request failed';

    throw new ApiRequestError(message, res.status, json);
  }

  return json as TResponse;
}
