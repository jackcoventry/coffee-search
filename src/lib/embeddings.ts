import { getOptionalNumberEnv } from '@/lib/env';
import { openai } from '@/lib/openai';
import { withTimeout } from '@/lib/timeout';

export async function embedText(input: string): Promise<number[]> {
  const res = await withTimeout(getOptionalNumberEnv('OPENAI_TIMEOUT_MS', 12_000), (signal) =>
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
