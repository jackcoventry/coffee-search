import { NextResponse } from 'next/server';

type ApiErrorLike = {
  retryAfterSeconds?: unknown;
  status?: unknown;
};

function getStatus(err: unknown, fallbackStatus: number) {
  const status = (err as ApiErrorLike)?.status;
  return typeof status === 'number' && status >= 400 && status < 600 ? status : fallbackStatus;
}

function getRetryAfterSeconds(err: unknown) {
  const retryAfterSeconds = (err as ApiErrorLike)?.retryAfterSeconds;
  return typeof retryAfterSeconds === 'number' ? retryAfterSeconds : null;
}

export function apiErrorResponse(err: unknown, fallbackStatus = 500) {
  const status = getStatus(err, fallbackStatus);

  if (status >= 500) {
    console.error(err);
  }

  const res = NextResponse.json({ error: 'Request could not be processed.' }, { status });
  const retryAfterSeconds = getRetryAfterSeconds(err);

  if (status === 429 && retryAfterSeconds) {
    res.headers.set('Retry-After', String(retryAfterSeconds));
  }

  return res;
}
