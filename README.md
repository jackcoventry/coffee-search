# Coffee Search

Coffee Search is a sample Next.js + TypeScript application that demonstrates how to fetch product recommendations from a natural language query using embeddings and an LLM.

## Requirements

- Node.js 22+
- npm, pnpm, or yarn
- A PostgreSQL database
- An OpenAI API key

## Environment

Create a `.env` or `.env.local` file in the project root with the variables below. Example values and types are shown:

- `NEXT_PUBLIC_USE_MOCK_RECOMMEND` (boolean) — set to `true` to use built-in mock data instead of calling the API.
- `USE_MOCK_PRODUCTS` (boolean, optional) — set to `true` to use the built-in mock product catalogue for local/e2e runs instead of Postgres.
- `LLM_MODEL` (string) — the LLM model id to use for natural language queries (e.g. `gpt-4o`, or your chosen model).
- `EMBED_MODEL` (string) — the embedding model id used to create vector embeddings.
- `DATABASE_URL` (string) — Postgres connection string for storing products and vectors.
- `DATABASE_POOL_MAX` (number, optional) — maximum Postgres connections per app instance. Defaults to `3`.
- `OPENAI_API_KEY` (string) — your OpenAI API key.
- `OPENAI_TIMEOUT_MS` (number, optional) — fallback timeout for OpenAI calls.
- `MODERATION_TIMEOUT_MS` (number, optional) — timeout for the moderation check. Defaults to `4000`.
- `EMBED_TIMEOUT_MS` (number, optional) — timeout for the query embedding call. Defaults to `8000`.
- `LLM_TIMEOUT_MS` (number, optional) — timeout for the final recommendation response. Defaults to `25000`.
- `SITE_URL` (string, optional) — canonical site origin used for metadata, robots, and sitemap. Defaults to `https://coffee-search.vercel.app`.

## Installation

1. Clone the repository

```
  git clone https://github.com/jackcoventry/coffee-search.git
  cd ai-search
```

2. Install dependencies

```
  npm install
```

3. Create your `.env.local` file (see Environment above).

4. Run the development server

```
  npm run dev
```

The app will be available at http://localhost:3000 by default.

## Scripts

Key npm scripts included in `package.json`:

- `npm run dev` — start Next.js in development mode
- `npm run build` — build the production app
- `npm run start` — start the production server
- `npm run lint` — run ESLint checks
- `npm run products:import` — imports products from CSV (see Data workflow)
- `npm run products:sync` — sync products (scripted sync/maintenance)
- `npm run icons` — generate SVG sprite and icon tokens
- `npm test` / `npm run test:run` — run tests with Vitest

## Dependencies

Important dependencies used in this project (see `package.json` for full list and versions):

- `next`, `react`, `react-dom` — React + Next.js framework
- `openai` — official OpenAI Node client for LLM calls
- `pg` and `pgvector` — Postgres client and vector support
- `tailwindcss` — styling utility
- `zod` — runtime schema validation
- `react-hook-form` and `@hookform/resolvers` — form handling
- `vitest`, `@testing-library/*`, `jsdom` — testing utilities

Dev tooling includes `eslint`, `typescript`, `tsx` for scripts, and SVG tooling for icon generation.

## Folder structure

Top-level layout (important folders and their purpose):

- `src/` — application source code
  - `app/` — Next.js app routes and pages (server/client components)
  - `components/` — React components (Button, Header, Results, etc.)
  - `lib/` — backend helpers and API client code (`openai.ts`, `db.ts`, embeddings helpers)
  - `hooks/` — React hooks (e.g. `useRecommend`)
  - `styles/` — global CSS and fonts
  - `types/` — TypeScript type definitions
  - `utils/` — small utilities used throughout the app
  - `mocks/` — mock responses for local development and tests
  - `scripts/` — helper scripts (import, sync, generate icons)

- `public/` — static assets (icons, fonts)
- `coverage/` — generated test coverage artifacts
- `design-tokens/` — generated icon tokens and design metadata

## Data workflow (importing products)

To import product data from CSV and compute embeddings, run:

```
npm run products:import -- /path/to/products.csv
```

This will:

- Upsert products by SKU into the database
- Compute a searchable `search_text` used for retrieval
- Compute embeddings for the product text and store vector data
- Only update rows that have changed

Note: The import script expects Node to be able to connect to your Postgres instance via `DATABASE_URL`.

## Database setup

The recommendation query uses `pgvector` cosine distance against `products.embedding`. Make sure the extension and vector index exist:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX CONCURRENTLY IF NOT EXISTS products_embedding_active_hnsw_idx
ON products
USING hnsw (embedding vector_cosine_ops)
WHERE embedding IS NOT NULL
  AND (is_active IS NULL OR is_active = true);
```

To inspect existing product indexes:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'products';
```

## Testing

- Run unit tests: `npm test`
- Run coverage: `npm run test:coverage`
- Run browser regression tests: `npm run test:e2e`

## API contract

### `POST /api/recommend`

Request body:

```json
{ "query": "I want a sweet espresso coffee" }
```

- `query` must be a string between 2 and 150 characters.
- Responses are JSON and include `query`, `introduction`, `results`, and `cached`.
- Invalid input returns `400`; rate limits return `429` with `Retry-After`; upstream model validation failures return `502`; server timeouts return `504`.

### `GET /api/products`

Query params:

- `limit` optional number from 1 to 500, default `100`.
- `offset` optional number from 0 upward, default `0`.

### `GET /api/health`

Returns `{ "ok": true, "service": "coffee-search" }` for basic smoke checks.

## Development notes

- Use `NEXT_PUBLIC_USE_MOCK_RECOMMEND=true` for fast local development without external API calls.
- Recommendation caching and rate limiting use in-memory storage. This is enough for a demo, but not a strong abuse-control mechanism across multiple server instances.
- Icon tokens are generated with `npm run icons` and depend on the SVGs in `src/icons/`.

## License

Licensed under MIT License
Copyright (c) 2026 github.com/jackcoventry
