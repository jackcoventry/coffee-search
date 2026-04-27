'use client';

import { PROMOS_TITLE } from '@/consts/label';
import { useSearchParams } from 'next/navigation';
import { getProductHref } from '@/lib/productLinks';
import { Product } from '@/types/product';
import { PromoTile } from '@/components/PromoListing/PromoTile';

type Props = {
  products: Product[];
};

export function PromoListing({ products = [] }: Readonly<Props>) {
  const params = useSearchParams();
  const from = params.get('from') ?? '';

  return (
    <section className="py-20 px-6 flex flex-col gap-6">
      <h2 className="font-heading text-center">{PROMOS_TITLE}</h2>
      <ul className="flex max-xl:gap-10 max-xl:flex-col xl:justify-evenly xl:w-6xl mx-auto">
        {products?.map((product: Product) => {
          const href = getProductHref(product.sku, from);

          return (
            <li key={product.sku}>
              <PromoTile
                product={product}
                href={href}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
