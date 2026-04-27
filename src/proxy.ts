import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function buildCsp(isDev: boolean) {
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'`
    : `script-src 'self' 'unsafe-inline'`;

  return [
    `default-src 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `style-src 'self' 'unsafe-inline'`,
    scriptSrc,
    `connect-src 'self'`,
  ].join('; ');
}

export function proxy(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';

  const csp = buildCsp(isDev);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('Content-Security-Policy', csp);

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  res.headers.set('Content-Security-Policy', csp);

  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
