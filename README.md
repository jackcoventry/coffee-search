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
- `NEXT_PUBLIC_API_KEY` (string) — shared secret required by the client to call the API routes.
- `LLM_MODEL` (string) — the LLM model id to use for natural language queries (e.g. `gpt-4o`, or your chosen model).
- `EMBED_MODEL` (string) — the embedding model id used to create vector embeddings.
- `DATABASE_URL` (string) — Postgres connection string for storing products and vectors.
- `OPENAI_API_KEY` (string) — your OpenAI API key.

## Installation

1. Clone the repository

```
  git clone https://github.com/mmmoustache/coffee-search.git
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
- `csv-parse` — CSV parsing for import scripts
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

## Testing

- Run unit tests: `npm test`
- Run coverage: `npm run test:coverage`

## Development notes

- Use `NEXT_PUBLIC_USE_MOCK_RECOMMEND=true` for fast local development without external API calls.
- The app uses `NEXT_PUBLIC_API_KEY` for a simple client-to-server security header check — keep this secret in production.
- Icon tokens are generated with `npm run icons` and depend on the SVGs in `src/icons/`.

## Contributing

If you'd like to contribute, open an issue or PR. Keep changes focused and add tests for new behaviors.

## License

Licensed under MIT License
Copyright (c) 2026 github.com/mmmoustache
