import { NextResponse } from 'next/server';
import { toSql } from 'pgvector/pg';
import { z } from 'zod';
import { getClientIp } from '@/utils/getClientIp';
import { apiErrorResponse } from '@/lib/apiErrorResponse';
import { assertStrictApi } from '@/lib/apiGuard';
import { getCache, setCache } from '@/lib/cacheResult';
import { pool } from '@/lib/db';
import { embedText } from '@/lib/embeddings';
import { guardUserInput } from '@/lib/guard';
import { openai } from '@/lib/openai';
import { rateLimitOrThrow } from '@/lib/rateLimit';
import {
  canonicalizeRecommendationResponse,
  createNoCandidateResponse,
  RecommendResponseSchema,
  RECOMMENDATION_SYSTEM_PROMPT,
} from '@/lib/recommendation';
import { safeJson } from '@/lib/safeJson';
import { withTimeout } from '@/lib/timeout';

z.config({ jitless: true });

const Body = z.object({
  query: z.string().trim().min(2).max(150),
});

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    assertStrictApi(req);

    const ip = getClientIp(req);
    // Throw error if rate limit exceeds per IP.
    await rateLimitOrThrow(`recommend:${ip}`, 10, 60_000);

    const json = await req.json().catch(() => null);
    const body = Body.safeParse(json);
    if (!body.success) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const { query } = body.data;
    const g = guardUserInput(query); // Security gate for user queries!
    if (!g.ok) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 400 });
    }

    const normalizedQuery = query.trim().toLowerCase();

    const cacheKey = `reco:${normalizedQuery}`;
    const cached = await getCache<z.infer<typeof RecommendResponseSchema>>(cacheKey);

    // If result already exists in cache, return the cache instead
    if (cached) return NextResponse.json({ ...cached, cached: true });

    const embedding = await embedText(query);
    const embeddingSql = toSql(embedding);

    const { rows: results } = await pool.query(
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
    );

    if (results.length === 0) {
      const emptyPayload = createNoCandidateResponse(query);
      await setCache(cacheKey, emptyPayload, 60_000);
      return NextResponse.json({ ...emptyPayload, cached: false });
    }

    const resp = await withTimeout(Number(process.env.OPENAI_TIMEOUT_MS ?? 12_000), (signal) =>
      openai.responses.create(
        {
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
        },
        { signal }
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

    await setCache(cacheKey, validatedPayload, 5 * 60_000);

    return NextResponse.json({ ...validatedPayload, cached: false });
  } catch (err) {
    return apiErrorResponse(err, 500, {
      durationMs: Date.now() - startedAt,
      method: req.method,
      route: '/api/recommend',
    });
  }
}
