import { openai } from '@/lib/openai';

export type ModerationResult = {
  flagged: boolean;
};

export async function moderateUserInput(input: string): Promise<ModerationResult> {
  const res = await openai.moderations.create({
    input,
    model: 'omni-moderation-latest',
  });

  return {
    flagged: res.results.some((result) => result.flagged),
  };
}
