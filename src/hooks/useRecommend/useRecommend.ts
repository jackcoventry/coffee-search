'use client';

import { USE_MOCK_RECOMMEND } from '@/consts/flags';
import {
  SEARCH_ERROR_BAD_REQUEST,
  SEARCH_ERROR_DEFAULT,
  SEARCH_ERROR_RATE_LIMIT,
  SEARCH_ERROR_SERVER,
  SEARCH_ERROR_TIMEOUT,
} from '@/consts/label';
import { useCallback, useState } from 'react';
import type { RecommendResponse } from '@/types/recommend';
import { apiJson } from '@/lib/apiClient';
import mockResponse from '@/mocks/openAiResponse2.json';

type Status = 'idle' | 'loading' | 'success' | 'error';

function recommend(query: string) {
  return apiJson<RecommendResponse, { query: string }>('/api/recommend', {
    method: 'POST',
    body: { query },
    timeoutMs: 20_000,
  });
}

function getErrorMessage(error: unknown) {
  const status =
    error && typeof error === 'object' && 'status' in error && typeof error.status === 'number'
      ? error.status
      : null;

  if (status === 408 || status === 504) return SEARCH_ERROR_TIMEOUT;
  if (status === 429) return SEARCH_ERROR_RATE_LIMIT;
  if (status === 400 || status === 422) return SEARCH_ERROR_BAD_REQUEST;
  if (status && status >= 500) return SEARCH_ERROR_SERVER;

  if (error instanceof TypeError) {
    return SEARCH_ERROR_SERVER;
  }

  return SEARCH_ERROR_DEFAULT;
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
      setError(getErrorMessage(e));
      setStatus('error');
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
