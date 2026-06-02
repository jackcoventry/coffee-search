import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('rateLimitOrThrow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('allows the first call and creates a new bucket', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await expect(rateLimitOrThrow('k1', 3, 1000)).resolves.toBeUndefined();
  });

  it('increments count until the limit is reached', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await expect(rateLimitOrThrow('k1', 3, 1000)).resolves.toBeUndefined();
    await expect(rateLimitOrThrow('k1', 3, 1000)).resolves.toBeUndefined();
    await expect(rateLimitOrThrow('k1', 3, 1000)).resolves.toBeUndefined();
  });

  it('throws when the limit would be exceeded', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await rateLimitOrThrow('k1', 2, 1000);
    await rateLimitOrThrow('k1', 2, 1000);

    await expect(rateLimitOrThrow('k1', 2, 1000)).rejects.toThrow(/rate limit exceeded/i);
  });

  it('throws with status 429 and retryAfterSeconds', async () => {
    const { RateLimitError, rateLimitOrThrow } = await import('@/lib/rateLimit');

    await rateLimitOrThrow('k1', 1, 1000);

    try {
      await rateLimitOrThrow('k1', 1, 1000);
      throw new Error('Expected to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(RateLimitError);
      if (!(err instanceof RateLimitError)) throw err;
      expect(err.status).toBe(429);
      expect(err.retryAfterSeconds).toBe(1);
      expect(err.message).toMatch(/retry after 1s/i);
    }
  });

  it('allows requests again after the window resets (now > resetAt)', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await rateLimitOrThrow('k1', 1, 1000);

    vi.advanceTimersByTime(1001);

    await expect(rateLimitOrThrow('k1', 1, 1000)).resolves.toBeUndefined();
  });

  it('does not reset exactly at resetAt (boundary: now === resetAt is still limited)', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await rateLimitOrThrow('k1', 1, 1000);

    vi.advanceTimersByTime(1000);

    await expect(rateLimitOrThrow('k1', 1, 1000)).rejects.toThrow(/rate limit exceeded/i);

    vi.advanceTimersByTime(1);

    await expect(rateLimitOrThrow('k1', 1, 1000)).resolves.toBeUndefined();
  });

  it('tracks separate keys independently', async () => {
    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await rateLimitOrThrow('k1', 1, 1000);

    await expect(rateLimitOrThrow('k2', 1, 1000)).resolves.toBeUndefined();
    await expect(rateLimitOrThrow('k1', 1, 1000)).rejects.toThrow();
  });

  it('uses Upstash Redis REST when configured', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com/';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 1 }),
      })
    );

    const { rateLimitOrThrow } = await import('@/lib/rateLimit');

    await expect(rateLimitOrThrow('ip:1', 10, 60000)).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith('https://redis.example.com', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer redis-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify(['INCR', 'ratelimit:ip:1']),
    });
    expect(fetch).toHaveBeenCalledWith('https://redis.example.com', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer redis-token',
        'content-type': 'application/json',
      },
      body: JSON.stringify(['PEXPIRE', 'ratelimit:ip:1', 60000]),
    });
  });

  it('throws a rate limit error using Redis TTL when persistent count exceeds limit', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.example.com';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token';
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: 3 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: 42000 }),
        })
    );

    const { RateLimitError, rateLimitOrThrow } = await import('@/lib/rateLimit');

    await expect(rateLimitOrThrow('ip:1', 2, 60000)).rejects.toBeInstanceOf(RateLimitError);
  });
});
