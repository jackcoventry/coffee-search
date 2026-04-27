import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PromoListing } from '@/components/PromoListing/PromoListing';

vi.mock('@/consts/label', () => ({
  PROMOS_TITLE: 'Promotions',
}));

let mockFromParam: string | null = null;

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'from' ? mockFromParam : null),
  }),
}));

const promoTileSpy = vi.fn();

vi.mock('@/components/PromoListing/PromoTile', () => ({
  PromoTile: (props: any) => {
    promoTileSpy(props);
    return (
      <a
        data-testid="promo-tile"
        href={props.href}
      >
        {props.product?.sku}
      </a>
    );
  },
}));

describe('PromoListing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFromParam = null;
  });

  it('renders the promos title', () => {
    render(<PromoListing products={[]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Promotions' })).toBeInTheDocument();
  });

  it('renders one PromoTile per product with the correct href (empty from)', () => {
    const products = [
      { sku: '100001', name: 'A' },
      { sku: '100002', name: 'B' },
    ] as any;

    render(<PromoListing products={products} />);

    const tiles = screen.getAllByTestId('promo-tile');
    expect(tiles).toHaveLength(2);

    expect(tiles[0]).toHaveAttribute('href', '/product/100001?from=%2F');
    expect(tiles[1]).toHaveAttribute('href', '/product/100002?from=%2F');

    expect(promoTileSpy).toHaveBeenCalledTimes(2);
    expect(promoTileSpy.mock.calls[0][0].product).toMatchObject({ sku: '100001' });
    expect(promoTileSpy.mock.calls[1][0].product).toMatchObject({ sku: '100002' });
  });

  it('uses the "from" query param when building href', () => {
    mockFromParam = '/';

    const products = [{ sku: 'ABC-123' }] as any;

    render(<PromoListing products={products} />);

    const tile = screen.getByTestId('promo-tile');
    expect(tile).toHaveAttribute('href', '/product/ABC-123?from=%2F');
  });

  it('encodes same-origin paths in the "from" param', () => {
    mockFromParam = '/?query=email campaign/Feb?x=1&y=2#results';

    const products = [{ sku: 'SKU1' }] as any;

    render(<PromoListing products={products} />);

    const tile = screen.getByTestId('promo-tile');

    expect(tile).toHaveAttribute(
      'href',
      '/product/SKU1?from=%2F%3Fquery%3Demail%20campaign%2FFeb%3Fx%3D1%26y%3D2%23results'
    );
  });

  it('renders an empty list when products is empty', () => {
    const { container } = render(<PromoListing products={[]} />);
    const lis = container.querySelectorAll('ul li');
    expect(lis).toHaveLength(0);
  });
});
