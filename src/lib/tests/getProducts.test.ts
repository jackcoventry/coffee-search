import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();

vi.mock('@/lib/db', () => ({
  pool: { query: (...args: any[]) => queryMock(...args) },
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<any>('react');
  return { ...actual, cache: (fn: any) => fn };
});

const unstableCacheMock = vi.fn((...args: any[]) => args[0]);
vi.mock('next/cache', () => ({
  unstable_cache: (...args: any[]) => unstableCacheMock(...args),
}));

describe('getProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_PRODUCTS: false }));
  });

  it('getAllProducts: wrapped with unstable_cache and returns rows', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ sku: 'A' }, { sku: 'B' }] });

    const mod = await import('@/lib/getProducts');

    expect(unstableCacheMock).toHaveBeenCalledTimes(1);
    const call = unstableCacheMock.mock.calls[0] as any[];
    expect(call[1]).toEqual(['all-products']);
    expect(call[2]).toEqual({ revalidate: 3600 });

    const rows = await mod.getAllProducts(10, 20);

    expect(queryMock).toHaveBeenCalledTimes(1);
    const [sql, params] = queryMock.mock.calls[0];
    expect(String(sql)).toContain('LIMIT $1 OFFSET $2');
    expect(params).toEqual([10, 20]);
    expect(rows).toEqual([{ sku: 'A' }, { sku: 'B' }]);
  });

  it('getProductBySku: returns first row, else null', async () => {
    const mod = await import('@/lib/getProducts');

    queryMock.mockResolvedValueOnce({ rows: [{ sku: 'X', name: 'X' }] });
    await expect(mod.getProductBySku('X')).resolves.toEqual({ sku: 'X', name: 'X' });

    queryMock.mockResolvedValueOnce({ rows: [] });
    await expect(mod.getProductBySku('MISSING')).resolves.toBeNull();
  });

  it('getSimilarProductsBySku: returns similarity rows when present (no fallback)', async () => {
    const mod = await import('@/lib/getProducts');

    queryMock.mockResolvedValueOnce({ rows: [{ sku: 'S1' }] });

    const res = await mod.getSimilarProductsBySku('X', 3);

    expect(res).toEqual([{ sku: 'S1' }]);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('getSimilarProductsBySku: uses fallback when similarity rows empty', async () => {
    const mod = await import('@/lib/getProducts');

    queryMock
      .mockResolvedValueOnce({ rows: [] }) // similarity query
      .mockResolvedValueOnce({ rows: [{ sku: 'F1' }, { sku: 'F2' }] }); // fallback query

    const res = await mod.getSimilarProductsBySku('X', 2);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(res).toEqual([{ sku: 'F1' }, { sku: 'F2' }]);
  });

  it('uses mock products without querying Postgres when enabled', async () => {
    vi.resetModules();
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_PRODUCTS: true }));

    const mod = await import('@/lib/getProducts');

    await expect(mod.getProductBySku('100001')).resolves.toEqual(
      expect.objectContaining({ name: 'Golden Lagoon', sku: '100001' })
    );
    await expect(mod.getAllProducts(2, 0)).resolves.toHaveLength(2);
    await expect(mod.getSimilarProductsBySku('100001', 2)).resolves.toEqual([
      expect.objectContaining({ sku: '100010' }),
      expect.objectContaining({ sku: '100006' }),
    ]);
    expect(queryMock).not.toHaveBeenCalled();
  });
});
