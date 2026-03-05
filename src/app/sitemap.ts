import { getAllProducts } from '@/lib/getProducts';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const products = await getAllProducts(100, 0);

  return [
    { url: 'https://coffee-search.vercel.app', lastModified: new Date() },
    ...products.map((p) => ({
      url: `https://coffee-search.vercel.app/product/${p.sku}`,
      lastModified: new Date(),
    })),
  ];
}
