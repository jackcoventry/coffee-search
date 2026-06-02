import { openai } from '@/lib/openai';
import { getOptionalNumberEnv } from '@/lib/env';
import { withTimeout } from '@/lib/timeout';

export type ModerationResult = {
  flagged: boolean;
};

export async function moderateUserInput(input: string): Promise<ModerationResult> {
  const timeoutMs = getOptionalNumberEnv(
    'MODERATION_TIMEOUT_MS',
    getOptionalNumberEnv('OPENAI_TIMEOUT_MS', 4_000)
  );
  const res = await withTimeout(timeoutMs, (signal) =>
    openai.moderations.create(
      {
        input,
        model: 'omni-moderation-latest',
      },
      { signal }
    )
  );

  return {
    flagged: res.results.some((result) => result.flagged),
  };
}
