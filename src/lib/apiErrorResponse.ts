import { NextResponse } from 'next/server';
import { REQUEST_TIMEOUT_MESSAGE, isAbortLikeError } from '@/lib/timeout';

type ApiErrorLike = {
  retryAfterSeconds?: unknown;
  status?: unknown;
};

type ApiErrorContext = {
  durationMs?: number;
  method?: string;
  route?: string;
};

function getStatus(err: unknown, fallbackStatus: number) {
  const status = (err as ApiErrorLike)?.status;
  return typeof status === 'number' && status >= 400 && status < 600 ? status : fallbackStatus;
}

function getRetryAfterSeconds(err: unknown) {
  const retryAfterSeconds = (err as ApiErrorLike)?.retryAfterSeconds;
  return typeof retryAfterSeconds === 'number' ? retryAfterSeconds : null;
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export function apiErrorResponse(
  err: unknown,
  fallbackStatus = 500,
  context: ApiErrorContext = {}
) {
  const isTimeout = isAbortLikeError(err);
  const status = isTimeout ? 504 : getStatus(err, fallbackStatus);

  const logPayload = {
    durationMs: context.durationMs,
    error: getErrorMessage(err),
    method: context.method,
    route: context.route,
    status,
  };

  if (status >= 500) console.error('api_error', logPayload);
  else console.warn('api_error', logPayload);

  const res = NextResponse.json(
    { error: isTimeout ? REQUEST_TIMEOUT_MESSAGE : 'Request could not be processed.' },
    { status }
  );
  const retryAfterSeconds = getRetryAfterSeconds(err);

  if (status === 429 && retryAfterSeconds) {
    res.headers.set('Retry-After', String(retryAfterSeconds));
  }

  return res;
}
