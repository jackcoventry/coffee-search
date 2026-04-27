export function getSafeReturnPath(from?: string | string[] | null) {
  const path = Array.isArray(from) ? from[0] : from;

  return path?.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export function getResultsReturnPath(query?: string | null) {
  return `/${query ? `?query=${encodeURIComponent(query)}#results` : ''}`;
}

export function getProductHref(sku: string | number, from?: string | string[] | null) {
  return `/product/${sku}?from=${encodeURIComponent(getSafeReturnPath(from))}`;
}
