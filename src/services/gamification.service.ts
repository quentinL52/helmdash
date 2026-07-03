import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const XP_RULES = {
  FINANCE_ENTRY_ADDED: 10,
  FINANCE_SETTINGS_UPDATED: 5,
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
}
