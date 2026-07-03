import { prisma } from '@/lib/prisma';
import { sendTrialEndingEmail } from '@/lib/email/email-service';

export async function expireTrials() {
  const now = new Date();
  const result = await prisma.user.updateMany({
    where: {
      planStatus: 'trialing',
      trialEndsAt: { lt: now },
    },
    data: { planStatus: 'readonly' },
  });

  if (result.count > 0) {
    console.log(`[TrialManager] Expired ${result.count} trials → readonly`);
  }

  return result.count;
}

export async function notifyTrialExpiringSoon() {
  const now = new Date();
  const inFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      planStatus: 'trialing',
      trialEndsAt: { gte: inThreeDays, lt: inFourDays },
    },
    select: { email: true, name: true, locale: true },
  });

  for (const user of users) {
    await sendTrialEndingEmail(
      user.email,
      user.name || 'Founder',
      4,
    );
  }

  return users.length;
}
