'use client';

import { BACK_TO_TOP, INTRO_MARQUEE, NEW_SEARCH } from '@/consts/label';
import { useRecommend } from '@/hooks/useRecommend/useRecommend';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/Button/Button';
import { Message } from '@/components/Message/Message';
import { QueryForm } from '@/components/QueryForm/QueryForm';
import { Results } from '@/components/Results/Results';
import { TextMarquee } from '@/components/TextMarquee/TextMarquee';

export function SearchPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { submit, data, error, reset, isLoading } = useRecommend();
  const queryFromUrl = useMemo(() => (searchParams.get('query') ?? '').trim(), [searchParams]);
  const results = data?.results ?? [];
  const showResults = !!data && results.length > 0;

  useEffect(() => {
    if (!queryFromUrl) return;
    if (showResults) return;

    submit({ query: queryFromUrl });
  }, [queryFromUrl, showResults, submit]);

  const handleReset = () => {
    reset();
    router.replace(pathname, { scroll: false });
  };

  const handleSubmit = async (payload: { query: string }) => {
    const q = payload.query.trim();
    router.replace(`${pathname}?query=${encodeURIComponent(q)}`, { scroll: false });

    await submit(payload);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [showResults]);

  return (
    <>
      {showResults ? null : (
        <section className="overflow-hidden flex flex-col justify-center items-center motion-safe:transition-opacity bg-100001 p-3 mx-3 lg:mx-5 border-white min-h-(--shell-height)">
          <div className="flex flex-col gap-2 max-md:w-full">
            <svg
              className={`icon | mx-auto${isLoading ? ' motion-safe:animate-bounce' : ''}`}
              width="4em"
              height="4em"
              fill="currentColor"
              aria-hidden
            >
              <use xlinkHref="/icons/icons.svg#cup-hot" />
            </svg>
            <QueryForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </section>
      )}

      {showResults && (
        <Results
          results={data?.results}
          introduction={data?.introduction}
          query={data?.query}
        >
          <section className="text-center pt-6 flex max-md:flex-col justify-center gap-6">
            <div>
              <Button
                href="#content"
                icon="arrow-up-square"
                variant="secondary"
              >
                {BACK_TO_TOP}
              </Button>
            </div>
            <div>
              <Button
                icon="search"
                variant="primary"
                onClick={handleReset}
              >
                {NEW_SEARCH}
              </Button>
            </div>
          </section>
        </Results>
      )}

      <TextMarquee height={180}>{INTRO_MARQUEE}</TextMarquee>

      {error ? <Message>{error}</Message> : null}
    </>
  );
}
