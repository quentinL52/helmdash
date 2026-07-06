import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const XP_RULES = {
  FINANCE_ENTRY_ADDED: 10,
  FINANCE_SETTINGS_UPDATED: 5,
  QUEST_COMPLETED: 10,
  DECISION_DECIDED: 15,
  CONTACT_INTERACTION_ADDED: 5,
  CONTACT_FOLLOWUP_DONE: 10,
  DAILY_PLAN_CREATED: 20,
  SWEEP_COMPLETED: 15,
};

export const QUESTS = {
  ONBOARDING_PROFILE: 'onboarding_profile',
};

export class GamificationService {
  /**
   * Add XP to a user's profile and handle level ups
   */
  static async addXp(userId: string, amount: number) {
    try {
      // Upsert gamification profile
      const profile = await prisma.gamificationProfile.upsert({
        where: { userId },
        update: {
          xp: { increment: amount },
          lastActionAt: new Date(),
        },
        create: {
          userId,
          xp: amount,
          level: 1,
          lastActionAt: new Date(),
        },
      });

      // Check for level up (e.g., every 100 XP)
      const newLevel = Math.floor(profile.xp / 100) + 1;
      
      if (newLevel > profile.level) {
        await prisma.gamificationProfile.update({
          where: { userId },
          data: { level: newLevel },
        });
        return { 
          xpAdded: amount, 
          totalXp: profile.xp,
          leveledUp: true, 
          newLevel 
        };
      }

      return { 
        xpAdded: amount, 
        totalXp: profile.xp,
        leveledUp: false, 
        newLevel: profile.level 
      };
    } catch (error) {
      console.error('GamificationService.addXp error:', error);
      return null;
    }
  }

  /**
   * Get user's current gamification profile
   */
  static async getProfile(userId: string) {
    return prisma.gamificationProfile.findUnique({
      where: { userId },
    });
  }

  /**
   * Complete a quest and award XP if not already completed
   */
  static async completeQuest(userId: string, questId: string, xpReward: number = XP_RULES.QUEST_COMPLETED) {
    try {
      const profile = await prisma.gamificationProfile.findUnique({
        where: { userId },
      });

      if (profile?.completedQuests.includes(questId)) {
        return null; // Already completed
      }

      await prisma.gamificationProfile.upsert({
        where: { userId },
        update: {
          completedQuests: { push: questId },
        },
        create: {
          userId,
          completedQuests: [questId],
        },
      });

      return await this.addXp(userId, xpReward);
    } catch (error) {
      console.error('GamificationService.completeQuest error:', error);
      return null;
    }
  }
}
