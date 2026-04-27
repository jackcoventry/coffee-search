import { z } from 'zod';

const OptionalNumberSchema = z.coerce.number().finite().positive();
const UrlSchema = z.string().trim().url();

export class MissingEnvError extends Error {
  status = 500;

  constructor(name: string) {
    super(`Missing required environment variable: ${name}`);
    this.name = 'MissingEnvError';
  }
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new MissingEnvError(name);

  return value;
}

export function getOptionalNumberEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = OptionalNumberSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid number environment variable: ${name}`);
  }

  return parsed.data;
}

export function getOptionalUrlEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  const parsed = UrlSchema.safeParse(value || fallback);
  if (!parsed.success) {
    throw new Error(`Invalid URL environment variable: ${name}`);
  }

  return parsed.data;
}
