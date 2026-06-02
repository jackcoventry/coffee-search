import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultTile } from '@/components/Results/ResultTile';

vi.mock('next/image', () => ({
  default: (props: any) => {
    const { src, alt, width, height, ...rest } = props;
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...rest}
      />
    );
  },
}));

let mockQueryParam: string | null = null;
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === 'query' ? mockQueryParam : null),
  }),
}));

const getThemeMock = vi.fn();
vi.mock('@/utils/getTheme', () => ({
  getTheme: (sku: string) => getThemeMock(sku),
}));

vi.mock('@/components/Button/Button', () => ({
  Button: ({ href, children, ...props }: any) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
}));

describe('ResultTile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryParam = null;
    getThemeMock.mockReturnValue({ backgroundColor: 'bg-100001' });
  });

  it('returns null when result is falsy', () => {
    const { container } = render(<ResultTile result={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders name, origin, and reasons', () => {
    const result = {
      sku: 'ABC-123',
      name: 'Moon Roast',
      origin: ['Colombia', 'Ethiopia'],
      reasons: ['Chocolatey', 'Low acidity'],
    } as any;

    render(<ResultTile result={result} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Moon Roast' })).toBeInTheDocument();
    expect(screen.getByText('Origin: Colombia, Ethiopia')).toBeInTheDocument();

    expect(screen.getByText('Chocolatey')).toBeInTheDocument();
    expect(screen.getByText('Low acidity')).toBeInTheDocument();
  });

  it('renders image with correct alt text and src', () => {
    const result = {
      sku: 'SKU1',
      name: 'Star Blend',
      origin: ['Kenya'],
      reasons: [],
    } as any;

    render(<ResultTile result={result} />);

    const img = screen.getByRole('img', { name: 'Pack shot of the Star Blend product' });
    expect(img).toHaveAttribute('src', '/pack.webp');
    expect(img).toHaveAttribute('width', '300');
    expect(img).toHaveAttribute('height', '300');
  });

  it('calls getTheme with result.sku and applies background class', () => {
    const result = {
      sku: 'SKU-THEME',
      name: 'Theme Test',
      origin: ['Peru'],
      reasons: [],
    } as any;

    const { container } = render(<ResultTile result={result} />);

    expect(getThemeMock).toHaveBeenCalledTimes(1);
    expect(getThemeMock).toHaveBeenCalledWith('SKU-THEME');

    // the image wrapper is the div that includes theme background class
    const wrapper = container.querySelector('.result-tile > div');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain('bg-100001');
  });

  it('shows a compact mobile image panel and equal-height desktop panels', () => {
    const result = {
      sku: 'SKU-LAYOUT',
      name: 'Long Copy',
      origin: ['Peru'],
      reasons: ['A detailed reason', 'Another detailed reason'],
    } as any;

    const { container } = render(<ResultTile result={result} />);

    const tile = container.querySelector('.result-tile') as HTMLElement;
    const imagePanel = tile.querySelector('div') as HTMLElement;
    const copyPanel = tile.querySelectorAll('div')[1] as HTMLElement;
    const image = screen.getByRole('img', { name: 'Pack shot of the Long Copy product' });

    expect(tile.className).toContain('result-tile');
    expect(tile.className).toContain('items-stretch');
    expect(tile.firstElementChild).toBe(imagePanel);
    expect(tile.lastElementChild).toBe(copyPanel);
    expect(imagePanel.className).toContain('flex');
    expect(imagePanel.className).toContain('min-h-50');
    expect(imagePanel.className).toContain('lg:min-h-75');
    expect(imagePanel.className.split(/\s+/)).not.toContain('h-75');
    expect(image.className).toContain('max-h-44');
    expect(image.className).toContain('lg:max-h-full');
    expect(copyPanel.className).toContain('lg:min-h-75');
  });

  it('builds href with from="/" when query param is empty', () => {
    mockQueryParam = '';
    const result = {
      sku: 'SKU2',
      name: 'No Query',
      origin: ['Brazil'],
      reasons: [],
    } as any;

    render(<ResultTile result={result} />);

    const link = screen.getByRole('link', { name: 'View product' });

    expect(link).toHaveAttribute('href', '/product/SKU2?from=%2F');
  });

  it('builds href with from="/?query=...#results" when query param exists (encoded)', () => {
    mockQueryParam = 'iced coffee & cream';
    const result = {
      sku: 'SKU3',
      name: 'With Query',
      origin: ['Guatemala'],
      reasons: [],
    } as any;

    render(<ResultTile result={result} />);

    const link = screen.getByRole('link', { name: 'View product' });

    const from = '/?query=iced%20coffee%20%26%20cream#results';
    const expectedHref = `/product/SKU3?from=${encodeURIComponent(from)}`;

    expect(link).toHaveAttribute('href', expectedHref);
  });

  it('renders reasons list items with stable keys (by content)', () => {
    const result = {
      sku: 'SKU4',
      name: 'Key Test',
      origin: ['India'],
      reasons: ['A', 'B', 'C'],
    } as any;

    render(<ResultTile result={result} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });
});
