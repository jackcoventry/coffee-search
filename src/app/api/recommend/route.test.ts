import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  embedText: vi.fn(),
  getCache: vi.fn(),
  openaiCreate: vi.fn(),
  poolQuery: vi.fn(),
  rateLimitOrThrow: vi.fn(),
  setCache: vi.fn(),
}));

vi.mock('@/lib/cacheResult', () => ({
  getCache: mocks.getCache,
  setCache: mocks.setCache,
}));

vi.mock('@/lib/db', () => ({
  pool: {
    query: mocks.poolQuery,
  },
}));

vi.mock('@/lib/embeddings', () => ({
  embedText: mocks.embedText,
}));

vi.mock('@/lib/openai', () => ({
  openai: {
    responses: {
      create: mocks.openaiCreate,
    },
  },
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimitOrThrow: mocks.rateLimitOrThrow,
}));

import { POST } from './route';

const candidates = [
  {
    description: 'Chocolate-led espresso roast.',
    id: 1,
    name: 'House Espresso',
    origin: ['Brazil'],
    sku: 'SKU1',
  },
  {
    description: 'Bright filter roast.',
    id: 2,
    name: 'Citrus Filter',
    origin: ['Kenya'],
    sku: 'SKU2',
  },
];

function request(body: unknown) {
  return new Request('http://localhost/api/recommend', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'localhost',
      origin: 'http://localhost',
    },
    body: JSON.stringify(body),
  });
}

describe('/api/recommend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCache.mockResolvedValue(null);
    mocks.setCache.mockResolvedValue(undefined);
    mocks.rateLimitOrThrow.mockResolvedValue(undefined);
    mocks.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mocks.poolQuery.mockResolvedValue({ rows: candidates });
    mocks.openaiCreate.mockResolvedValue({
      output_text: JSON.stringify({
        query: 'espresso',
        introduction: 'Try this.',
        results: [
          {
            description: 'Wrong model description.',
            name: 'Wrong model name',
            origin: ['Wrong origin'],
            reasons: ['Matches espresso.'],
            sku: 'SKU1',
          },
        ],
      }),
    });
  });

  it('returns canonical candidate data for a valid recommendation', async () => {
    const res = await POST(request({ query: 'espresso' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.cached).toBe(false);
    expect(json.results).toEqual([
      expect.objectContaining({
        description: 'Chocolate-led espresso roast.',
        name: 'House Espresso',
        origin: ['Brazil'],
        sku: 'SKU1',
      }),
    ]);
    expect(mocks.setCache).toHaveBeenCalledWith('reco:espresso', expect.any(Object), 300000);
  });

  it('rejects invalid request bodies before hitting expensive dependencies', async () => {
    const res = await POST(request({ query: 'x' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({ error: 'Request could not be processed.' });
    expect(mocks.embedText).not.toHaveBeenCalled();
    expect(mocks.openaiCreate).not.toHaveBeenCalled();
  });

  it('returns cached recommendations without querying downstream services', async () => {
    mocks.getCache.mockResolvedValue({
      query: 'espresso',
      introduction: 'Cached.',
      results: [
        {
          description: 'Cached description.',
          name: 'Cached Coffee',
          origin: ['Peru'],
          reasons: ['Cached reason.'],
          sku: 'SKU3',
        },
      ],
    });

    const res = await POST(request({ query: 'espresso' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.cached).toBe(true);
    expect(mocks.embedText).not.toHaveBeenCalled();
    expect(mocks.poolQuery).not.toHaveBeenCalled();
    expect(mocks.openaiCreate).not.toHaveBeenCalled();
  });

  it('returns 502 when the model response cannot be validated', async () => {
    mocks.openaiCreate.mockResolvedValue({
      output_text: JSON.stringify({ query: 'espresso', introduction: 'Missing results.' }),
    });

    const res = await POST(request({ query: 'espresso' }));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Request could not be processed.' });
    expect(mocks.setCache).not.toHaveBeenCalled();
  });

  it('returns 502 when the model recommends only invented SKUs', async () => {
    mocks.openaiCreate.mockResolvedValue({
      output_text: JSON.stringify({
        query: 'espresso',
        introduction: 'Try this.',
        results: [
          {
            description: 'Invented.',
            name: 'Invented Coffee',
            origin: ['Nowhere'],
            reasons: ['Invented reason.'],
            sku: 'NOPE',
          },
        ],
      }),
    });

    const res = await POST(request({ query: 'espresso' }));

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Request could not be processed.' });
    expect(mocks.setCache).not.toHaveBeenCalled();
  });

  it('propagates rate-limit status and retry headers', async () => {
    const err = Object.assign(new Error('limited'), { retryAfterSeconds: 12, status: 429 });
    mocks.rateLimitOrThrow.mockRejectedValue(err);

    const res = await POST(request({ query: 'espresso' }));

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('12');
    expect(await res.json()).toEqual({ error: 'Request could not be processed.' });
  });
});
