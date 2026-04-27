import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('@/lib/openai', () => ({
  openai: {
    embeddings: {
      create: (...args: any[]) => createMock(...args),
    },
  },
}));

describe('embedText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.EMBED_MODEL;
  });

  it('uses default model when EMBED_MODEL is not set and returns embedding', async () => {
    createMock.mockResolvedValueOnce({
      data: [{ embedding: [0.1, 0.2, 0.3] }],
    });

    const { embedText } = await import('@/lib/embeddings');

    const result = await embedText('hello');

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      model: 'text-embedding-3-small',
      input: 'hello',
    }, { signal: expect.any(AbortSignal) });

    expect(result).toEqual([0.1, 0.2, 0.3]);
  });

  it('uses EMBED_MODEL when set', async () => {
    process.env.EMBED_MODEL = 'text-embedding-3-large';

    createMock.mockResolvedValueOnce({
      data: [{ embedding: [9, 8, 7] }],
    });

    const { embedText } = await import('@/lib/embeddings');

    const result = await embedText('world');

    expect(createMock).toHaveBeenCalledWith({
      model: 'text-embedding-3-large',
      input: 'world',
    }, { signal: expect.any(AbortSignal) });

    expect(result).toEqual([9, 8, 7]);
  });

  it('propagates errors from the OpenAI client', async () => {
    createMock.mockRejectedValueOnce(new Error('boom'));

    const { embedText } = await import('@/lib/embeddings');

    await expect(embedText('x')).rejects.toThrow('boom');
  });
});
