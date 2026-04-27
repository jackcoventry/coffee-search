type RedisConfig = {
  token: string;
  url: string;
};

export function getRedisConfig(): RedisConfig | null {
  const raw = process.env.REDIS_REST_URL;
  if (!raw) return null;

  const parsed = new URL(raw);
  const token = decodeURIComponent(parsed.password || parsed.username);
  if (!token) throw new Error('REDIS_REST_URL must include a token in the URL credentials');

  parsed.username = '';
  parsed.password = '';
  parsed.hash = '';

  return {
    token,
    url: parsed.toString().replace(/\/$/, ''),
  };
}

export async function redisCommand<T>(command: unknown[]): Promise<T> {
  const config = getRedisConfig();
  if (!config) throw new Error('Redis is not configured');

  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${config.token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Redis command failed: ${res.status}`);

  const json = (await res.json()) as { result: T; error?: string };
  if (json.error) throw new Error(json.error);

  return json.result;
}
