type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const REDIS_KEY_PREFIX = 'ratelimit:';

type RedisCommandResponse<T> = {
  error?: string;
  result?: T;
};

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  status = 429;

  constructor(retryAfterSeconds: number) {
    super(`Rate limit exceeded. Retry after ${retryAfterSeconds}s`);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '');
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  return url && token ? { token, url } : null;
}

async function redisCommand<T>(command: Array<string | number>): Promise<T> {
  const config = getRedisConfig();
  if (!config) throw new Error('Redis rate limit is not configured');

  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) {
    throw new Error(`Redis rate limit request failed: ${res.status}`);
  }

  const json = (await res.json()) as RedisCommandResponse<T>;
  if (json.error) throw new Error(json.error);

  return json.result as T;
}

async function persistentRateLimitOrThrow(key: string, limit: number, windowMs: number) {
  const redisKey = `${REDIS_KEY_PREFIX}${key}`;
  const count = await redisCommand<number>(['INCR', redisKey]);

  if (count === 1) {
    await redisCommand<number>(['PEXPIRE', redisKey, windowMs]);
  }

  if (count > limit) {
    const ttlMs = await redisCommand<number>(['PTTL', redisKey]);
    const retryAfterSeconds = Math.max(1, Math.ceil(Math.max(ttlMs, windowMs) / 1000));
    throw new RateLimitError(retryAfterSeconds);
  }
}

function memoryRateLimitOrThrow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    throw new RateLimitError(retryAfterSeconds);
  }

  existing.count += 1;
}

export async function rateLimitOrThrow(
  key: string,
  limit: number,
  windowMs: number
): Promise<void> {
  if (getRedisConfig()) {
    await persistentRateLimitOrThrow(key, limit, windowMs);
    return;
  }

  memoryRateLimitOrThrow(key, limit, windowMs);
}
