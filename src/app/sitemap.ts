import { getAllProducts } from '@/lib/getProducts';

export default async function sitemap() {
  const products = await getAllProducts(100, 0);

  return [
    {
      url: 'https://coffee-search.vercel.app',
      lastModified: new Date(),
    },
    ...products.map((product) => ({
      url: `https://coffee-search.vercel.app/product/${product.sku}`,
      lastModified: new Date(),
    })),
  ];
}
