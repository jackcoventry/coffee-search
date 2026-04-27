import { describe, expect, it } from 'vitest';
import {
  canonicalizeRecommendationResponse,
  createNoCandidateResponse,
} from '@/lib/recommendation';

const candidates = [
  {
    sku: '100001',
    name: 'Golden Lagoon',
    origin: ['Colombia'],
    description: 'A balanced filter coffee.',
  },
  {
    sku: '100002',
    name: 'Mandarin Meadow',
    origin: ['Brazil'],
    description: 'A bright espresso coffee.',
  },
];

describe('recommendation helpers', () => {
  it('canonicalizes model fields from matching candidate products', () => {
    const response = canonicalizeRecommendationResponse(
      {
        query: 'filter coffee',
        introduction: 'Try these.',
        results: [
          {
            sku: '100001',
            name: 'Invented name',
            origin: ['Invented origin'],
            description: 'Invented description',
            reasons: ['Matches filter brewing'],
          },
        ],
      },
      candidates,
      'filter coffee'
    );

    expect(response).toEqual({
      query: 'filter coffee',
      introduction: 'Try these.',
      results: [
        {
          sku: '100001',
          name: 'Golden Lagoon',
          origin: ['Colombia'],
          description: 'A balanced filter coffee.',
          reasons: ['Matches filter brewing'],
        },
      ],
    });
  });

  it('filters out model results that are not candidate SKUs', () => {
    const response = canonicalizeRecommendationResponse(
      {
        query: 'espresso',
        introduction: 'Try these.',
        results: [
          {
            sku: 'NOT-A-CANDIDATE',
            name: 'Nope',
            origin: ['Nope'],
            description: 'Nope',
            reasons: ['Nope'],
          },
          {
            sku: '100002',
            name: 'Wrong',
            origin: ['Wrong'],
            description: 'Wrong',
            reasons: ['Good for espresso'],
          },
        ],
      },
      candidates,
      'espresso'
    );

    expect(response.results).toHaveLength(1);
    expect(response.results[0].sku).toBe('100002');
  });

  it('rejects malformed model responses', () => {
    expect(() =>
      canonicalizeRecommendationResponse(
        {
          query: 'espresso',
          introduction: 'Try these.',
          results: [],
        },
        candidates,
        'espresso'
      )
    ).toThrow();
  });

  it('creates a stable empty-candidate response', () => {
    expect(createNoCandidateResponse('decaf')).toEqual({
      query: 'decaf',
      introduction: 'I could not find any coffees to recommend right now. Please try again later.',
      results: [],
    });
  });
});
