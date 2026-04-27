export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

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
  }
): Promise<TResponse> {
  const res = await fetch(path, {
    method: options?.method ?? (options?.body ? 'POST' : 'GET'),
    headers: {
      'content-type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

  const json = await safeJson(res);

  if (!res.ok) {
    const message =
      (json && typeof json?.error === 'string' && json.error) || res.statusText || 'Request failed';

    const err: ApiError = { message, status: res.status, details: json };
    throw err;
  }

  return json as TResponse;
}
