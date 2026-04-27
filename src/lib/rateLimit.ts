type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function rateLimitError(retryAfterSeconds: number) {
  const err = new Error(`Rate limit exceeded. Retry after ${retryAfterSeconds}s`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err as any).status = 429;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (err as any).retryAfterSeconds = retryAfterSeconds;

  return err;
}

export async function rateLimitOrThrow(key: string, limit: number, windowMs: number): Promise<void> {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    throw rateLimitError(retryAfterSeconds);
  }

  existing.count += 1;
}
