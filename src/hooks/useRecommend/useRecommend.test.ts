import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useRecommend', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle with no data or error', async () => {
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_RECOMMEND: false }));
    vi.doMock('@/lib/apiClient', () => ({ apiJson: vi.fn() }));
    vi.doMock('@/mocks/openAiResponse2.json', () => ({ default: { results: [] } }));

    const { useRecommend } = await import('@/hooks/useRecommend/useRecommend');

    const { result } = renderHook(() => useRecommend());

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('calls apiJson and transitions loading state', async () => {
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_RECOMMEND: false }));

    const apiJson = vi.fn().mockResolvedValue({
      results: [{ sku: '1', name: 'Coffee One' }],
    });

    vi.doMock('@/lib/apiClient', () => ({ apiJson }));
    vi.doMock('@/mocks/openAiResponse2.json', () => ({ default: { results: [] } }));

    const { useRecommend } = await import('@/hooks/useRecommend/useRecommend');

    const { result } = renderHook(() => useRecommend());

    // Trigger submit
    await act(async () => {
      await result.current.submit({ query: 'espresso' });
    });

    expect(apiJson).toHaveBeenCalledWith('/api/recommend', {
      method: 'POST',
      body: { query: 'espresso' },
      timeoutMs: 20000,
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual({
      results: [{ sku: '1', name: 'Coffee One' }],
    });
  });

  it('uses mock response and delays success when USE_MOCK_RECOMMEND is true', async () => {
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_RECOMMEND: true }));
    vi.doMock('@/lib/apiClient', () => ({ apiJson: vi.fn() }));

    const mockResponse = {
      results: [{ sku: 'MOCK', name: 'Mock Coffee' }],
    };

    vi.doMock('@/mocks/openAiResponse2.json', () => ({
      default: mockResponse,
    }));

    const { useRecommend } = await import('@/hooks/useRecommend/useRecommend');

    const { result } = renderHook(() => useRecommend());

    await act(async () => {
      await result.current.submit({ query: 'anything' });
    });

    // Still loading
    expect(result.current.status).toBe('loading');

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toEqual(mockResponse);
  });

  it('sets error state when apiJson rejects', async () => {
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_RECOMMEND: false }));

    const apiJson = vi.fn().mockRejectedValue(new Error('Boom'));

    vi.doMock('@/lib/apiClient', () => ({ apiJson }));
    vi.doMock('@/mocks/openAiResponse2.json', () => ({ default: { results: [] } }));

    const { useRecommend } = await import('@/hooks/useRecommend/useRecommend');

    const { result } = renderHook(() => useRecommend());

    await act(async () => {
      try {
        await result.current.submit({ query: 'latte' });
      } catch {
        // swallow error so React state updates
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Boom');
  });

  it('reset clears data, error and returns to idle', async () => {
    vi.doMock('@/consts/flags', () => ({ USE_MOCK_RECOMMEND: false }));

    const apiJson = vi.fn().mockResolvedValue({
      results: [{ sku: '1', name: 'Coffee One' }],
    });

    vi.doMock('@/lib/apiClient', () => ({ apiJson }));
    vi.doMock('@/mocks/openAiResponse2.json', () => ({ default: { results: [] } }));

    const { useRecommend } = await import('@/hooks/useRecommend/useRecommend');

    const { result } = renderHook(() => useRecommend());

    await act(async () => {
      await result.current.submit({ query: 'filter' });
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
