const DEFAULT_SITE_URL = 'https://coffee-search.vercel.app';

function normalizeSiteUrl(value: string) {
  const url = new URL(value);
  return url.origin;
}

export const SITE_URL = normalizeSiteUrl(process.env.SITE_URL ?? DEFAULT_SITE_URL);

export function getAbsoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}
