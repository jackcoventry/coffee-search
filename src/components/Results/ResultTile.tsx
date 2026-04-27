import { ORIGIN, VIEW_PRODUCT } from '@/consts/label';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getProductHref, getResultsReturnPath } from '@/lib/productLinks';
import { getTheme } from '@/utils/getTheme';
import { Recommendation } from '@/types/recommend';
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
    <div className="result-tile | lg:grid">
      <div className={`${theme?.backgroundColor} w-75 h-75 hidden lg:block`}>
        <Image
          src="/pack.webp"
          alt={`Pack shot of the ${result.name} product`}
          className="result-tile__image"
          width={300}
          height={300}
        />
      </div>
      <div className="px-8 py-5 flex flex-col gap-2 bg-white">
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
