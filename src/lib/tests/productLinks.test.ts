import { describe, expect, it } from 'vitest';
import { getProductHref, getResultsReturnPath, getSafeReturnPath } from '@/lib/productLinks';

describe('product link helpers', () => {
  it('keeps same-origin return paths', () => {
    expect(getSafeReturnPath('/?query=latte#results')).toBe('/?query=latte#results');
  });

  it('falls back to home for unsafe return paths', () => {
    expect(getSafeReturnPath('https://example.com')).toBe('/');
    expect(getSafeReturnPath('//example.com')).toBe('/');
    expect(getSafeReturnPath('homepage')).toBe('/');
    expect(getSafeReturnPath(null)).toBe('/');
  });

  it('builds a results return path from a query', () => {
    expect(getResultsReturnPath('iced coffee & cream')).toBe(
      '/?query=iced%20coffee%20%26%20cream#results'
    );
  });

  it('builds product links with encoded safe return paths', () => {
    expect(getProductHref('SKU1', '/?query=espresso#results')).toBe(
      '/product/SKU1?from=%2F%3Fquery%3Despresso%23results'
    );
  });
});
