import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkBudget, SynthesisSchema } from '../../../src/lib/ai/onboarding-agent';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    aiCostLog: {
      findMany: vi.fn().mockResolvedValue([{ tokens: 14000 }])
    }
  }
}));

describe('Onboarding Agent', () => {
  describe('checkBudget', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns true if under 15k tokens', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.aiCostLog.findMany as any).mockResolvedValueOnce([{ tokens: 14000 }]);
      const isOk = await checkBudget('user1');
      expect(isOk).toBe(true);
    });

    it('returns false if over 15k tokens', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.aiCostLog.findMany as any).mockResolvedValueOnce([{ tokens: 16000 }]);
      const isOk = await checkBudget('user2');
      expect(isOk).toBe(false);
    });
  });

  describe('SynthesisSchema', () => {
    it('validates a correct payload', () => {
      const validPayload = {
        canvas: {
          problem: 'P',
          solution: 'S',
          customerSegments: 'C',
          revenueStreams: 'R'
        },
        hypotheses: [
          { title: 'H1', successCriteria: 'C1' },
          { title: 'H2', successCriteria: 'C2' }
        ],
        milestone: { title: 'M1', targetDate: '2024-12-31' },
        founderProfile: 'Founder'
      };
      
      const result = SynthesisSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid payload', () => {
      const invalidPayload = {
        canvas: { problem: 'P' } // missing fields
      };
      const result = SynthesisSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
