'use client';

import { USE_MOCK_RECOMMEND } from '@/consts/flags';
import { useCallback, useState } from 'react';
import type { RecommendResponse } from '@/types/recommend';
import { apiJson } from '@/lib/apiClient';
import mockResponse from '@/mocks/openAiResponse2.json';

type Status = 'idle' | 'loading' | 'success' | 'error';

function recommend(query: string) {
  return apiJson<RecommendResponse, { query: string }>('/api/recommend', {
    method: 'POST',
    body: { query },
  });
}

export function useRecommend() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<RecommendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async ({ query }: { query: string }) => {
    setStatus('loading');
    setError(null);

    try {
      const result = USE_MOCK_RECOMMEND
        ? (mockResponse as unknown as RecommendResponse)
        : await recommend(query);

      if (USE_MOCK_RECOMMEND) {
        setTimeout(() => {
          setData(result);
          setStatus('success');
        }, 2000);
      } else {
        setData(result);
        setStatus('success');
      }

      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
      throw e;
    }
  }, []);

  const reset = () => {
    setData(null);
    setError(null);
    setStatus('idle');
  };

  return {
    submit,
    data,
    reset,
    error,
    status,
    isLoading: status === 'loading',
  };
}
