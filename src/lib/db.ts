import { Pool } from 'pg';
import { getOptionalNumberEnv, getRequiredEnv } from '@/lib/env';

const databaseUrl = getRequiredEnv('DATABASE_URL');

export const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  max: getOptionalNumberEnv('DATABASE_POOL_MAX', 3),
  ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
