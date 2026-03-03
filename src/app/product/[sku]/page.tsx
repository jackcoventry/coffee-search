import { BACK_TO_RESULTS, BUY_NOW } from '@/consts/label';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProductBySku, getSimilarProductsBySku } from '@/lib/getProducts';
import { Button } from '@/components/Button/Button';
import { Product } from '@/components/Product/Product';
import { PromoListing } from '@/components/PromoListing/PromoListing';

export async function generateMetadata({ params }: { params: { sku: string } }): Promise<Metadata> {
  const product = await getProductBySku(params.sku);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const description = product.description ?? undefined;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/product/${product.sku}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: `/product/${product.sku}`,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ sku: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;
}>) {
  const { sku } = await params;
  const from = (await searchParams)?.from ?? '/';
  const product = await getProductBySku(sku);
  const otherProducts = await getSimilarProductsBySku(sku, 3);

  if (!product) notFound();

  const url = `https://coffee-search.vercel.app/product/${product.sku}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    sku: product.sku,
    category: product.category ?? undefined,
    weight: product.weight_g
      ? { '@type': 'QuantitativeValue', value: product.weight_g, unitCode: 'GRM' }
      : undefined,
    brand: { '@type': 'Brand', name: 'Coffee Search' },
    url,
  };

  const cleanJsonLd = structuredClone(jsonLd);

  return (
    <>
      <script
        type="application/ld+json"
        // This is safe because we're serializing our own data, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd) }}
      />
      <Product {...product}>
        <div className="text-center pt-6 lg:flex gap-6">
          <div className="max-lg:mb-6">
            <Button
              href="#"
              icon="trolley"
              variant="secondary"
            >
              {BUY_NOW}
            </Button>
          </div>
          <div>
            <Button
              href={from}
              icon="search"
            >
              {BACK_TO_RESULTS}
            </Button>
          </div>
        </div>
      </Product>

      <Suspense>
        <PromoListing products={otherProducts} />
      </Suspense>
    </>
  );
}
