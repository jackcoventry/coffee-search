export type Recommendation = {
  name: string;
  sku: string;
  origin: string[];
  description: string;
  reasons: string[];
};

export type RecommendResponse = {
  query: string;
  introduction: string;
  results: Recommendation[];
};

export type RecommendError = {
  message: string;
};
