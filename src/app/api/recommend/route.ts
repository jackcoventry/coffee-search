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
import { safeJson } from '@/lib/safeJson';
import { withTimeout } from '@/lib/timeout';

z.config({ jitless: true });

const Body = z.object({
  query: z.string().trim().min(2).max(150),
});

const RecommendationSchema = z.object({
  name: z.string(),
  sku: z.string(),
  origin: z.array(z.string()),
  description: z.string(),
  reasons: z.array(z.string()).min(1).max(3),
  tradeoff: z.string().optional(),
});

const RecommendResponseSchema = z.object({
  query: z.string(),
  introduction: z.string(),
  results: z.array(RecommendationSchema).min(1).max(3),
});

export async function POST(req: Request) {
  try {
    assertStrictApi(req);

    const ip = getClientIp(req);
    // Throw error if rate limit exceeds per IP.
    await rateLimitOrThrow(`recommend:${ip}`, 10, 60_000);

    const { query } = Body.parse(await req.json());
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
              content: `
              You are a coffee catalogue assistant.
              You will be given:
              - a user query
              - a list of candidate coffees with their fields

              Task:
              1) Extract the user's preferences from the query (flavours, brew method, acidity/body/sweetness, roast).
              2) Rank the best 3 coffees from the candidate list, into the property 'results'. Return the name, sku, origin and description fields as part of each result.
              3) For each pick, provide 2-3 bullet reasons mapped to specific fields, under the property "reasons" of the result.
              4) Provide one short tradeoff note for picks #2 and #3, under the property 'tradeoff' of the result.
              5) use language in your response as if you're talking to the user directly
              6) return a summary response to the user's query in the 'introduction' property of the data. Introduce the results briefly always with a casual, fun comment on their query.

              Rules:
              - ONLY choose from candidates (by SKU).
              - Do not invent tasting notes, origins, or brew methods not present in the candidate fields.
              - Keep each reason short and specific.
              - no duplicate properties on the JSON objects
              Return JSON only with original user query
            `,
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
    const parsed = RecommendResponseSchema.parse(payload);
    const candidatesBySku = new Map(results.map((candidate) => [candidate.sku, candidate]));

    const validatedPayload = {
      query,
      introduction: parsed.introduction,
      results: parsed.results
        .map((result) => {
          const candidate = candidatesBySku.get(result.sku);
          if (!candidate) return null;

          return {
            ...result,
            name: candidate.name,
            origin: candidate.origin,
            description: candidate.description,
          };
        })
        .filter((result): result is NonNullable<typeof result> => result !== null),
    };

    if (validatedPayload.results.length === 0) {
      return NextResponse.json({ error: 'Request could not be processed.' }, { status: 502 });
    }

    await setCache(cacheKey, validatedPayload, 5 * 60_000);

    return NextResponse.json({ ...validatedPayload, cached: false });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
