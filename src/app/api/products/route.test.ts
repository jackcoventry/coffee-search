import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAllProducts: vi.fn(),
}));

vi.mock('@/lib/getProducts', () => ({
  getAllProducts: mocks.getAllProducts,
}));

import { GET } from './route';

function request(path = 'http://localhost/api/products') {
  return new Request(path, { method: 'GET' });
}

describe('/api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAllProducts.mockResolvedValue([{ sku: '100001' }]);
  });

  it('uses default pagination when query params are omitted', async () => {
    const res = await GET(request());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mocks.getAllProducts).toHaveBeenCalledWith(100, 0);
    expect(json).toMatchObject({
      count: 1,
      limit: 100,
      offset: 0,
      products: [{ sku: '100001' }],
    });
  });

  it('uses explicit pagination query params', async () => {
    const res = await GET(request('http://localhost/api/products?limit=25&offset=50'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mocks.getAllProducts).toHaveBeenCalledWith(25, 50);
    expect(json).toMatchObject({
      limit: 25,
      offset: 50,
    });
  });

  it('rejects invalid pagination query params', async () => {
    const res = await GET(request('http://localhost/api/products?limit=0'));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Request could not be processed.' });
    expect(mocks.getAllProducts).not.toHaveBeenCalled();
  });
});
