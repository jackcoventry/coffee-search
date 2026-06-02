import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';

describe('next security headers', () => {
  it('sets baseline security headers for all routes', async () => {
    const headers = await nextConfig.headers?.();
    const headerMap = new Map(headers?.[0].headers.map((header) => [header.key, header.value]));

    expect(headers?.[0].source).toBe('/:path*');
    expect(headerMap.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(headerMap.get('Content-Security-Policy')).toContain("object-src 'none'");
    expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
  });
});
