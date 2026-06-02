import { ORIGIN, VIEW_PRODUCT } from '@/consts/label';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getTheme } from '@/utils/getTheme';
import { Recommendation } from '@/types/recommend';
import { getProductHref, getResultsReturnPath } from '@/lib/productLinks';
import { Button } from '@/components/Button/Button';
import './ResultTile.css';

type Props = {
  result: Recommendation;
};

export function ResultTile({ result }: Readonly<Props>) {
  const params = useSearchParams();

  if (!result) return null;

  const query = params.get('query') ?? '';
  const from = getResultsReturnPath(query);
  const theme = getTheme(result?.sku || '');
  const href = getProductHref(result.sku, from);

  return (
    <div className="result-tile | grid items-stretch">
      <div
        className={`${theme?.backgroundColor} flex min-h-50 lg:w-75 lg:min-h-75 items-center justify-center p-5 lg:p-6`}
      >
        <Image
          src="/pack.webp"
          alt={`Pack shot of the ${result.name} product`}
          className="result-tile__image max-h-44 lg:max-h-full object-contain"
          width={300}
          height={300}
        />
      </div>
      <div className="px-8 py-5 lg:min-h-75 flex flex-col justify-center gap-2 bg-white">
        <h2 className="font-title">{result.name}</h2>
        <p className="font-body">
          {ORIGIN}: {result.origin.join(', ')}
        </p>
        <ul className="list-disc pl-5 font-small">
          {result?.reasons?.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <Button
          href={href}
          className="mt-3 self-start"
          icon="arrow-right"
        >
          {VIEW_PRODUCT}
        </Button>
      </div>
    </div>
  );
}
