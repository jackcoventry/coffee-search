import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateMetadata } from './page';

const mocks = vi.hoisted(() => ({
  getProductBySku: vi.fn(),
  getSimilarProductsBySku: vi.fn(),
}));

vi.mock('@/lib/getProducts', () => ({
  getProductBySku: mocks.getProductBySku,
  getSimilarProductsBySku: mocks.getSimilarProductsBySku,
}));

describe('/product/[sku] metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProductBySku.mockResolvedValue({
      category: 'Coffee',
      description: 'A sweet espresso roast.',
      name: 'House Espresso',
      sku: 'SKU1',
    });
  });

  it('builds product metadata from async params', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ sku: 'SKU1' }) });

    expect(mocks.getProductBySku).toHaveBeenCalledWith('SKU1');
    expect(metadata).toEqual(
      expect.objectContaining({
        alternates: { canonical: '/product/SKU1' },
        description: 'A sweet espresso roast.',
        openGraph: expect.objectContaining({
          description: 'A sweet espresso roast.',
          title: 'House Espresso',
          url: '/product/SKU1',
        }),
        title: 'House Espresso',
      })
    );
  });

  it('returns not-found metadata when the SKU is missing', async () => {
    mocks.getProductBySku.mockResolvedValue(null);

    await expect(
      generateMetadata({ params: Promise.resolve({ sku: 'missing' }) })
    ).resolves.toEqual({
      title: 'Product Not Found',
    });
  });
});
