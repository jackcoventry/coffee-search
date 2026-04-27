import { PACKSHOT_ALT } from '@/consts/label';
import {
  PRODUCT_ACIDITY,
  PRODUCT_BODY,
  PRODUCT_ORIGIN,
  PRODUCT_RECOMMENDED_FOR,
  PRODUCT_ROAST_LEVEL,
  PRODUCT_SWEETNESS,
  PRODUCT_TASTING_NOTES,
} from '@/consts/productLabel';
import Image from 'next/image';
import { PropsWithChildren } from 'react';
import { getTheme } from '@/utils/getTheme';
import { interpolateText } from '@/utils/interpolate';
import { Product as Props } from '@/types/product';
import { Scale } from '@/components/Scale/Scale';
import { TextMarquee } from '@/components/TextMarquee/TextMarquee';
import './Product.css';

export function Product({
  body,
  sweetness,
  acidity,
  name,
  description,
  category,
  roast_level,
  origin,
  tasting_notes,
  recommended_for,
  sku,
  children,
}: PropsWithChildren<Props>) {
  const descriptors = [
    {
      label: PRODUCT_BODY,
      value: body,
    },
    {
      label: PRODUCT_SWEETNESS,
      value: sweetness,
    },
    {
      label: PRODUCT_ACIDITY,
      value: acidity,
    },
  ];

  const theme = getTheme(sku || '');
  const packShotAlt = interpolateText(PACKSHOT_ALT, {
    name,
  });

  return (
    <section
      className={`product | motion-safe:animate-fade-translate-in motion-safe:opacity-0 ${theme?.backgroundColor} mx-3 lg:mx-5 border-white`}
    >
      <div className="grid p-4 lg:p-12 gap-30 xl:grid-cols-(--product-grid-cols)">
        <div className="contents">
          <Image
            src="/pack.webp"
            alt={packShotAlt}
            className="product__image max-xl:order-2 max-xl:mb-8 max-xl:mx-auto max-xl:max-w-2xs xl:w-155 xl:h-155"
            height={620}
            width={620}
            priority
            sizes="(min-width: 1280px) 620px, 300px"
          />
        </div>
        <div className="flex flex-col gap-6">
          {category && <p className="font-body uppercase text-right">{category}</p>}
          <h1 className="font-heading">{name}</h1>
          {description && <p className="font-body">{description}</p>}

          <ul className="grid grid-flow-col border border-white">
            {descriptors?.map((descriptor) => (
              <li
                className="border border-white p-3"
                key={descriptor.label}
              >
                <h2 className="font-body">{descriptor.label}</h2>
                <p className="font-body font-bold">{descriptor.value}</p>
              </li>
            ))}
          </ul>

          {roast_level || origin ? (
            <div className="flex max-lg:flex-col gap-6">
              {roast_level && (
                <div className="flex flex-col gap-1 w-full">
                  <h2 className="font-title">{PRODUCT_ROAST_LEVEL}</h2>
                  <Scale value={roast_level} />
                </div>
              )}
              {origin && origin.length > 0 ? (
                <div className="flex flex-col gap-1 w-full">
                  <h2 className="font-title">{PRODUCT_ORIGIN}</h2>
                  <p className="font-body">{origin.join(', ')}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {tasting_notes && recommended_for ? (
            <div className="flex max-lg:flex-col gap-6">
              <div className="flex flex-col gap-1 lg:w-1/2">
                <h2 className="font-title">{PRODUCT_TASTING_NOTES}</h2>
                <ul className="list-disc pl-6">
                  {tasting_notes?.map((note: string) => (
                    <li
                      key={note}
                      className="font-body"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1 lg:w-1/2">
                <h2 className="font-title">{PRODUCT_RECOMMENDED_FOR}</h2>
                <ul className="list-disc pl-6">
                  {recommended_for?.map((item: string) => (
                    <li
                      key={item}
                      className="font-body"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
      <div className="my-8">
        <TextMarquee height={180}>{name}</TextMarquee>
      </div>
    </section>
  );
}
