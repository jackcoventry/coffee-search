import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ApiError, apiJson } from '@/lib/apiClient';

function makeJsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

describe('apiJson', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    vi.stubGlobal('fetch', vi.fn());
  });

  it('defaults to GET when no body is provided', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      makeJsonResponse({ ok: true })
    );

    await apiJson<{ ok: boolean }>('/test');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [path, init] = (fetch as any).mock.calls[0];

    expect(path).toBe('/test');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
  });

  it('defaults to POST when a body is provided and JSON.stringifys the body', async () => {
    (fetch as any).mockResolvedValueOnce(makeJsonResponse({ id: 123 }));

    const body = { name: 'JC' };
    await apiJson<{ id: number }, typeof body>('/users', { body });

    const [, init] = (fetch as any).mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(body));
  });

  it('sets required headers and merges custom headers', async () => {
    (fetch as any).mockResolvedValueOnce(makeJsonResponse({ ok: true }));

    await apiJson<{ ok: boolean }>('/headers', {
      headers: {
        'x-custom': 'hello',
        // demonstrate override of default header:
        'content-type': 'application/vnd.api+json',
      },
    });

    const [, init] = (fetch as any).mock.calls[0];
    expect(init.headers).toMatchObject({
      'x-custom': 'hello',
      'content-type': 'application/vnd.api+json',
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns parsed JSON for OK responses', async () => {
    (fetch as any).mockResolvedValueOnce(makeJsonResponse({ a: 1, b: 'two' }));

    const result = await apiJson<{ a: number; b: string }>('/ok');
    expect(result).toEqual({ a: 1, b: 'two' });
  });

  it('falls back to "Request failed" when json.error is missing/invalid', async () => {
    (fetch as any).mockResolvedValueOnce(
      makeJsonResponse({ something: 'else' }, { status: 500, statusText: 'Server exploded' })
    );

    await expect(apiJson('/boom')).rejects.toMatchObject({
      status: 500,
      message: 'Request failed',
      details: { something: 'else' },
    } satisfies Partial<ApiError>);
  });

  it('falls back to "Request failed" when json is null and statusText is empty', async () => {
    const res = new Response('not-json', { status: 400, statusText: '' });
    (fetch as any).mockResolvedValueOnce(res);

    await expect(apiJson('/bad-json')).rejects.toMatchObject({
      status: 400,
      message: 'Request failed',
      details: null,
    } satisfies Partial<ApiError>);
  });

  it('turns timeout aborts into ApiError objects', async () => {
    (fetch as any).mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'));

    await expect(apiJson('/slow')).rejects.toMatchObject({
      status: 408,
      message: 'Request timed out. Please try again.',
      details: null,
    } satisfies Partial<ApiError>);
  });

  it('turns plain aborted request errors into ApiError objects', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Request was aborted.'));

    await expect(apiJson('/aborted')).rejects.toMatchObject({
      status: 408,
      message: 'Request timed out. Please try again.',
      details: null,
    } satisfies Partial<ApiError>);
  });
});
