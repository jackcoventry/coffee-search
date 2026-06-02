import { NextResponse } from 'next/server';
import { toSql } from 'pgvector/pg';
import { z } from 'zod';
import { getClientIp } from '@/utils/getClientIp';
import { apiErrorResponse } from '@/lib/apiErrorResponse';
import { assertStrictApi } from '@/lib/apiGuard';
import { getCache, setCache } from '@/lib/cacheResult';
import { pool } from '@/lib/db';
import { embedText } from '@/lib/embeddings';
import { getOptionalNumberEnv } from '@/lib/env';
import { guardUserInput } from '@/lib/guard';
import { moderateUserInput } from '@/lib/moderation';
import { openai } from '@/lib/openai';
import { rateLimitOrThrow } from '@/lib/rateLimit';
import {
  RECOMMENDATION_SYSTEM_PROMPT,
  RecommendResponseSchema,
  canonicalizeRecommendationResponse,
  createNoCandidateResponse,
} from '@/lib/recommendation';
import { safeJson } from '@/lib/safeJson';
import { withTimeout } from '@/lib/timeout';

z.config({ jitless: true });

const BLOCKED_PROMPT_LIMIT = 3;
const BLOCKED_PROMPT_WINDOW_MS = 60_000;

const Body = z.object({
  query: z.string().trim().min(2).max(150),
});

export async function POST(req: Request) {
  const startedAt = Date.now();
  const stages: Record<string, number> = {};
  const timed = async <T,>(stage: string, run: () => Promise<T>) => {
    const stageStartedAt = Date.now();
    try {
      return await run();
    } finally {
      stages[stage] = Date.now() - stageStartedAt;
    }
  };

  try {
    assertStrictApi(req);

    const ip = getClientIp(req);
    await timed('rateLimit', () => rateLimitOrThrow(`recommend:${ip}`, 10, 60_000));

    const json = await timed('parseBody', () => req.json().catch(() => null));
    const body = Body.safeParse(json);
    if (!body.success) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const { query } = body.data;
    const g = guardUserInput(query);
    if (!g.ok) {
      await timed('blockedRateLimit', () =>
        rateLimitOrThrow(`recommend-blocked:${ip}`, BLOCKED_PROMPT_LIMIT, BLOCKED_PROMPT_WINDOW_MS)
      );
      console.warn('api_guard_blocked', {
        durationMs: Date.now() - startedAt,
        method: req.method,
        reason: g.reason,
        route: '/api/recommend',
        stages,
        status: 400,
      });
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `reco:${normalizedQuery}`;
    const cached = await timed('cacheRead', () =>
      getCache<z.infer<typeof RecommendResponseSchema>>(cacheKey)
    );

    if (cached) {
      console.info('api_request', {
        cached: true,
        durationMs: Date.now() - startedAt,
        method: req.method,
        route: '/api/recommend',
        stages,
        status: 200,
      });
      return NextResponse.json({ ...cached, cached: true });
    }

    const moderation = await timed('moderation', () => moderateUserInput(query));
    if (moderation.flagged) {
      await timed('blockedRateLimit', () =>
        rateLimitOrThrow(`recommend-blocked:${ip}`, BLOCKED_PROMPT_LIMIT, BLOCKED_PROMPT_WINDOW_MS)
      );
      console.warn('api_guard_blocked', {
        durationMs: Date.now() - startedAt,
        method: req.method,
        reason: 'moderation',
        route: '/api/recommend',
        stages,
        status: 400,
      });
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const embedding = await timed('embedding', () => embedText(query));
    const embeddingSql = toSql(embedding);

    const { rows: results } = await timed('vectorQuery', () =>
      pool.query(
        `
          SELECT
            id, sku, name, category, origin, tasting_notes, recommended_for,
            roast_level, body, sweetness, acidity, description, weight_g,
            (embedding <=> $1::vector) AS distance
          FROM products
          WHERE embedding IS NOT NULL
            AND (is_active IS NULL OR is_active = true)
          ORDER BY distance ASC
          LIMIT 5;
      `,
        [embeddingSql]
      )
    );

    if (results.length === 0) {
      const emptyPayload = createNoCandidateResponse(query);
      await timed('cacheWrite', () => setCache(cacheKey, emptyPayload, 60_000));
      console.info('api_request', {
        cached: false,
        candidateCount: 0,
        durationMs: Date.now() - startedAt,
        method: req.method,
        resultCount: 0,
        route: '/api/recommend',
        stages,
        status: 200,
      });
      return NextResponse.json({ ...emptyPayload, cached: false });
    }

    const llmTimeoutMs = getOptionalNumberEnv(
      'LLM_TIMEOUT_MS',
      getOptionalNumberEnv('OPENAI_TIMEOUT_MS', 25_000)
    );
    const resp = await timed('llm', () =>
      withTimeout(llmTimeoutMs, (signal) =>
        openai.responses.create(
          {
            max_output_tokens: 700,
            model: process.env.LLM_MODEL || 'gpt-4.1-mini',
            text: {
              format: { type: 'json_object' },
            },
            input: [
              {
                role: 'system',
                content: RECOMMENDATION_SYSTEM_PROMPT,
              },
              {
                role: 'user',
                content: JSON.stringify({ query, results }),
              },
            ],
            temperature: 0.3,
          },
          { signal }
        )
      )
    );

    const payload = safeJson(resp.output_text);
    const validatedPayload = (() => {
      try {
        return canonicalizeRecommendationResponse(payload, results, query);
      } catch {
        return null;
      }
    })();

    if (!validatedPayload || validatedPayload.results.length === 0) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 502 });
    }

    await timed('cacheWrite', () => setCache(cacheKey, validatedPayload, 5 * 60_000));

    console.info('api_request', {
      cached: false,
      candidateCount: results.length,
      durationMs: Date.now() - startedAt,
      method: req.method,
      resultCount: validatedPayload.results.length,
      route: '/api/recommend',
      stages,
      status: 200,
    });

    return NextResponse.json({ ...validatedPayload, cached: false });
  } catch (err) {
    return apiErrorResponse(err, 500, {
      durationMs: Date.now() - startedAt,
      method: req.method,
      route: '/api/recommend',
      stages,
    });
  }
}
