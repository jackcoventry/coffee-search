import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 10_000,
  max: Number(process.env.DATABASE_POOL_MAX ?? 3),
  ssl: process.env.DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
