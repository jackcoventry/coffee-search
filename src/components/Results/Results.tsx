import { RECOMMENDATIONS_TITLE, SHOW_QUERY } from '@/consts/label';
import { PropsWithChildren } from 'react';
import { Recommendation } from '@/types/recommend';
import { ResultTile } from '@/components/Results/ResultTile';

type Props = {
  results: Recommendation[];
  introduction: string;
  query: string;
};

export function Results({ results, introduction, query, children }: PropsWithChildren<Props>) {
  return (
    <section
      id="results"
      tabIndex={-1}
      className="results | motion-safe:animate-fade-translate-in motion-safe:opacity-0 py-12 px-6 lg:p-12 mx-3 lg:mx-5 flex flex-col gap-8 bg-surface"
    >
      <article className="mx-auto max-w-4xl flex flex-col gap-5">
        <svg
          className="icon | mx-auto"
          width="4em"
          height="4em"
          fill="currentColor"
          aria-hidden
        >
          <use xlinkHref="/icons/icons.svg#cup-hot" />
        </svg>
        <h1 className="font-heading text-center">{RECOMMENDATIONS_TITLE}</h1>
        <p className="font-body">{introduction}</p>
        {query ? (
          <details>
            <summary className="font-small cursor-pointer focusable">{SHOW_QUERY}</summary>
            <blockquote className="border-s-4 border-line-2 font-small mt-2 py-2 px-4">
              {query}
            </blockquote>
          </details>
        ) : null}
      </article>

      <ul className="grid gap-8 xl:gap-20 mx-auto max-w-5xl w-full">
        {results?.map((result: Recommendation) => (
          <li key={result.sku}>
            <ResultTile result={result} />
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}
