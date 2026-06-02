import { z } from 'zod';
import type { RecommendResponse } from '@/types/recommend';

export const RECOMMENDATION_SYSTEM_PROMPT = `
You are a coffee catalogue assistant.
You will be given:
- a user query
- a list of candidate coffees with their fields

Task:
1) Extract the user's preferences from the query (flavours, brew method, acidity/body/sweetness, roast).
2) Rank the best 3 coffees from the candidate list, into the property 'results'. Return the name, sku, origin and description fields as part of each result.
3) For each pick, provide 2-3 bullet reasons mapped to specific fields, under the property "reasons" of the result.
4) Use language in your response as if you're talking to the user directly.
5) Return a summary response to the user's query in the 'introduction' property of the data. Introduce the results briefly always with a casual, fun comment on their query.

Rules:
- ONLY choose from candidates (by SKU).
- Do not invent tasting notes, origins, or brew methods not present in the candidate fields.
- Keep each reason short and specific.
- No duplicate properties on the JSON objects.
- Return JSON only with original user query.
`;

export const RecommendationSchema = z.object({
  name: z.string(),
  sku: z.string(),
  origin: z.array(z.string()),
  description: z.string(),
  reasons: z.array(z.string()).min(1).max(3),
});

export const RecommendResponseSchema = z.object({
  query: z.string(),
  introduction: z.string(),
  results: z.array(RecommendationSchema).min(1).max(3),
});

export type CandidateProduct = {
  description: string;
  name: string;
  origin: string[];
  sku: string;
};

export function createNoCandidateResponse(query: string): RecommendResponse {
  return {
    query,
    introduction: 'I could not find any coffees to recommend right now. Please try again later.',
    results: [],
  };
}

export function canonicalizeRecommendationResponse(
  payload: unknown,
  candidates: CandidateProduct[],
  query: string
): RecommendResponse {
  const parsed = RecommendResponseSchema.parse(payload);
  const candidatesBySku = new Map(candidates.map((candidate) => [candidate.sku, candidate]));

  return {
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
}
