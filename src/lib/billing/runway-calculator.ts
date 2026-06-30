import { prisma } from '@/lib/prisma';

export async function recalculateRunway(userId: string) {
  const settings = await prisma.financeSettings.findUnique({ where: { userId } });
  
  // Burn rate = moyenne dépenses 6 derniers mois
  const expenses = await prisma.financeEntry.findMany({
    where: { userId, type: 'expense' },
  });
  
  const monthlyBurn = expenses.length > 0
    ? expenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(1, Math.min(6, new Set(expenses.map(e => e.date.getMonth())).size))
    // A simplified logic for burn: total expenses / 6 months or actual months
    : 0;
    
  const cashAvailable = settings?.cashAvailable || 0;
  
  // Mettre à jour les settings
  await prisma.financeSettings.update({
    where: { userId },
    data: {
      cashAvailable,
      // If we expand schema later we could save runwayMonths here
    }
  });
}
