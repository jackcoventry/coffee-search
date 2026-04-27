import { beforeEach, describe, expect, it, vi } from 'vitest';

const OpenAIMock = vi.fn();

vi.mock('openai', () => ({
  default: OpenAIMock,
}));

describe('openai client config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.OPENAI_API_KEY;
  });

  it('creates OpenAI client with apiKey from env', async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    await import('@/lib/openai');

    expect(OpenAIMock).toHaveBeenCalledTimes(1);
    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'test-key',
    });
  });

  it('throws when OPENAI_API_KEY is missing', async () => {
    await expect(import('@/lib/openai')).rejects.toThrow(/OPENAI_API_KEY/);
    expect(OpenAIMock).not.toHaveBeenCalled();
  });
});
