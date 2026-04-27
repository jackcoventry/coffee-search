import { getAllProducts } from '@/lib/getProducts';
import { getAbsoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const products = await getAllProducts(100, 0);

  return [
    { url: getAbsoluteUrl(), lastModified: new Date() },
    ...products.map((p) => ({
      url: getAbsoluteUrl(`/product/${p.sku}`),
      lastModified: new Date(),
    })),
  ];
}
