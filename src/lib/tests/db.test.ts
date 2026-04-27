import { beforeEach, describe, expect, it, vi } from 'vitest';

const PoolMock = vi.fn();

vi.mock('pg', () => ({
  Pool: PoolMock,
}));

describe('database pool config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_POOL_MAX;
  });

  it('creates Pool with connectionString only when not supabase', async () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';

    await import('@/lib/db');

    expect(PoolMock).toHaveBeenCalledTimes(1);
    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: 'postgres://localhost:5432/db',
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 3,
      ssl: undefined,
    });
  });

  it('enables ssl when DATABASE_URL contains supabase', async () => {
    process.env.DATABASE_URL = 'postgres://abc.supabase.co:5432/db';

    await import('@/lib/db');

    expect(PoolMock).toHaveBeenCalledTimes(1);
    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: 'postgres://abc.supabase.co:5432/db',
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 3,
      ssl: { rejectUnauthorized: false },
    });
  });

  it('passes undefined connectionString if env var is missing', async () => {
    await import('@/lib/db');

    expect(PoolMock).toHaveBeenCalledTimes(1);
    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: undefined,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 3,
      ssl: undefined,
    });
  });

  it('allows the pool max to be configured', async () => {
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';
    process.env.DATABASE_POOL_MAX = '5';

    await import('@/lib/db');

    expect(PoolMock).toHaveBeenCalledTimes(1);
    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: 'postgres://localhost:5432/db',
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 5,
      ssl: undefined,
    });
  });
});
