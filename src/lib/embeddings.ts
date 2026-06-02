import { getOptionalNumberEnv } from '@/lib/env';
import { openai } from '@/lib/openai';
import { withTimeout } from '@/lib/timeout';

export async function embedText(input: string): Promise<number[]> {
  const timeoutMs = getOptionalNumberEnv(
    'EMBED_TIMEOUT_MS',
    getOptionalNumberEnv('OPENAI_TIMEOUT_MS', 8_000)
  );
  const res = await withTimeout(timeoutMs, (signal) =>
    openai.embeddings.create(
      {
        model: process.env.EMBED_MODEL || 'text-embedding-3-small',
        input,
      },
      { signal }
    )
  );

  return res.data[0].embedding;
}
