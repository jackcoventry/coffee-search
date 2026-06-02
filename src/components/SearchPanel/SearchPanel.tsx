'use client';

import {
  BACK_TO_TOP,
  INTRO_MARQUEE,
  NEW_SEARCH,
  SEARCH_ERROR_TITLE,
  SEARCH_LOADING_PHRASES,
} from '@/consts/label';
import { useRecommend } from '@/hooks/useRecommend/useRecommend';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const ignoreQuerySubmitRef = useRef(false);
  const submittedQueryRef = useRef<string | null>(null);
  const queryFromUrl = useMemo(() => (searchParams.get('query') ?? '').trim(), [searchParams]);
  const results = data?.results ?? [];
  const showResults = !!data && results.length > 0;

  useEffect(() => {
    if (!queryFromUrl) {
      ignoreQuerySubmitRef.current = false;
      submittedQueryRef.current = null;
      return;
    }
    if (ignoreQuerySubmitRef.current) return;
    if (submittedQueryRef.current === queryFromUrl) return;
    if (isLoading) return;
    if (showResults) return;

    submittedQueryRef.current = queryFromUrl;
    submit({ query: queryFromUrl });
  }, [isLoading, queryFromUrl, showResults, submit]);

  const handleReset = () => {
    ignoreQuerySubmitRef.current = true;
    reset();
    router.replace(pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (payload: { query: string }) => {
    const q = payload.query.trim();
    submittedQueryRef.current = q;
    router.replace(`${pathname}?query=${encodeURIComponent(q)}`, { scroll: false });

    await submit({ query: q });
  };

  useEffect(() => {
    if (!showResults) return;

    document.getElementById('results')?.focus();
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
            {isLoading ? <LoadingMessage /> : null}
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

      {error && !showResults ? <Message title={SEARCH_ERROR_TITLE}>{error}</Message> : null}
    </>
  );
}

function LoadingMessage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrase = SEARCH_LOADING_PHRASES[phraseIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhraseIndex((index) => (index + 1) % SEARCH_LOADING_PHRASES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <p
      className="font-body text-center"
      aria-live="polite"
      aria-atomic="true"
    >
      {phrase}
    </p>
  );
}
