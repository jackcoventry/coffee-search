import { beforeEach, describe, expect, it, vi } from 'vitest';
import { moderateUserInput } from '@/lib/moderation';

const mocks = vi.hoisted(() => ({
  moderationCreate: vi.fn(),
}));

vi.mock('@/lib/openai', () => ({
  openai: {
    moderations: {
      create: mocks.moderationCreate,
    },
  },
}));

describe('moderateUserInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when no moderation result is flagged', async () => {
    mocks.moderationCreate.mockResolvedValue({ results: [{ flagged: false }, { flagged: false }] });

    await expect(moderateUserInput('recommend coffee')).resolves.toEqual({ flagged: false });
    expect(mocks.moderationCreate).toHaveBeenCalledWith({
      input: 'recommend coffee',
      model: 'omni-moderation-latest',
    });
  });

  it('returns true when any moderation result is flagged', async () => {
    mocks.moderationCreate.mockResolvedValue({ results: [{ flagged: false }, { flagged: true }] });

    await expect(moderateUserInput('bad prompt')).resolves.toEqual({ flagged: true });
  });
});
