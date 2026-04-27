import { describe, expect, it, vi } from 'vitest';
import { getOptionalNumberEnv, getOptionalUrlEnv, getRequiredEnv } from '@/lib/env';

describe('env helpers', () => {
  it('returns required env values', () => {
    vi.stubEnv('TEST_REQUIRED_ENV', 'value');

    expect(getRequiredEnv('TEST_REQUIRED_ENV')).toBe('value');

    vi.unstubAllEnvs();
  });

  it('throws for missing required env values', () => {
    vi.stubEnv('TEST_REQUIRED_ENV', '');

    expect(() => getRequiredEnv('TEST_REQUIRED_ENV')).toThrow(/TEST_REQUIRED_ENV/);

    vi.unstubAllEnvs();
  });

  it('parses optional positive numbers', () => {
    vi.stubEnv('TEST_NUMBER_ENV', '42');

    expect(getOptionalNumberEnv('TEST_NUMBER_ENV', 12)).toBe(42);

    vi.unstubAllEnvs();
  });

  it('rejects invalid optional numbers', () => {
    vi.stubEnv('TEST_NUMBER_ENV', 'nope');

    expect(() => getOptionalNumberEnv('TEST_NUMBER_ENV', 12)).toThrow(/TEST_NUMBER_ENV/);

    vi.unstubAllEnvs();
  });

  it('validates optional URLs', () => {
    vi.stubEnv('TEST_URL_ENV', 'https://example.com/path');

    expect(getOptionalUrlEnv('TEST_URL_ENV', 'https://fallback.test')).toBe(
      'https://example.com/path'
    );

    vi.unstubAllEnvs();
  });
});
