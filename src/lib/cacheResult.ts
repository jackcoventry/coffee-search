type CacheItem<T> = {
  value: T;
  expiresAt: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, CacheItem<any>>();

export async function getCache<T>(key: string): Promise<T | null> {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value as T;
}

export async function setCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
