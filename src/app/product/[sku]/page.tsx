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
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'product',
      url: `/product/${product.sku}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ sku: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams: any;
}) {
  const { sku } = await params;
  const from = (await searchParams)?.from ?? '/';
  const product = await getProductBySku(sku);
  const otherProducts = await getSimilarProductsBySku(sku, 3);

  if (!product) notFound();

  return (
    <>
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
