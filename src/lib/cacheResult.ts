type CacheItem<T> = {
  value: T;
  expiresAt: number;
};

import { getRedisConfig, redisCommand } from '@/lib/redisRest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheItem<any>>();

export async function getCache<T>(key: string): Promise<T | null> {
  const config = getRedisConfig();
  if (config) {
    const value = await redisCommand<string | null>(['GET', key]);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value as T;
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const config = getRedisConfig();
  if (config) {
    await redisCommand(['SET', key, JSON.stringify(value), 'PX', ttlMs]);
    return;
  }

  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
