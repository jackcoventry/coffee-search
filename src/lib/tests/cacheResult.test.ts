import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCache, setCache } from '@/lib/cacheResult';

describe('cache utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    vi.stubEnv('REDIS_REST_URL', '');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('returns null when key does not exist', async () => {
    await expect(getCache('missing')).resolves.toBeNull();
  });

  it('returns stored value before ttl expires', async () => {
    await setCache('a', 123, 1000);

    await expect(getCache<number>('a')).resolves.toBe(123);

    vi.advanceTimersByTime(999);
    await expect(getCache<number>('a')).resolves.toBe(123);
  });

  it('returns null after ttl expires', async () => {
    await setCache('b', 'hello', 1000);

    vi.advanceTimersByTime(1001);
    await expect(getCache<string>('b')).resolves.toBeNull();
  });

  it('deletes expired items so they do not persist', async () => {
    await setCache('c', 'gone', 500);

    vi.advanceTimersByTime(600);

    await expect(getCache('c')).resolves.toBeNull();
    await expect(getCache('c')).resolves.toBeNull();
  });

  it('overwrites existing key with new ttl and value', async () => {
    await setCache('x', 1, 1000);

    vi.advanceTimersByTime(500);

    await setCache('x', 2, 1000);

    await expect(getCache<number>('x')).resolves.toBe(2);

    vi.advanceTimersByTime(1001);
    await expect(getCache<number>('x')).resolves.toBeNull();
  });

  it('works with objects as values', async () => {
    const obj = { a: 1 };

    await setCache('obj', obj, 1000);

    await expect(getCache<typeof obj>('obj')).resolves.toEqual({ a: 1 });
  });
});
