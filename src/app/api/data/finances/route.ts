import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { GamificationService, XP_RULES } from '@/services/gamification.service';
import { z } from 'zod';

const actionSchema = z.object({
  action: z.enum([
    'updateSettings',
    'addEntry',
    'updateEntry',
    'deleteEntry',
    'addOneTimeEntry',
    'deleteOneTimeEntry',
  ]),
  payload: z.any(),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    if (req.method === 'GET') {
      const [settings, entries, oneTimeEntries] = await Promise.all([
        prisma.financeSettings.findUnique({ where: { userId } }),
        prisma.financeEntry.findMany({ where: { userId } }),
        prisma.financeOneTimeEntry.findMany({ where: { userId } }),
      ]);

      return NextResponse.json({
        settings: settings || { cashAvailable: 0, targetMrr: 0 },
        entries,
        oneTimeEntries,
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action, payload } = actionSchema.parse(body);
      let gamificationResult = null;

      switch (action) {
        case 'updateSettings':
          await prisma.financeSettings.upsert({
            where: { userId },
            update: {
              cashAvailable: payload.cashAvailable,
              targetMrr: payload.targetMrr,
              firstRevenueDate: payload.firstRevenueDate ? new Date(payload.firstRevenueDate) : null,
              firstRevenueAmount: payload.firstRevenueAmount,
            },
            create: {
              userId,
              cashAvailable: payload.cashAvailable ?? 0,
              targetMrr: payload.targetMrr ?? 0,
              firstRevenueDate: payload.firstRevenueDate ? new Date(payload.firstRevenueDate) : null,
              firstRevenueAmount: payload.firstRevenueAmount,
            },
          });
          gamificationResult = await GamificationService.addXp(userId, XP_RULES.FINANCE_SETTINGS_UPDATED);
          break;

        case 'addEntry':
          const date = new Date(payload.date);
          const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          let monthly = await prisma.monthlyFinance.findUnique({
            where: { userId_month: { userId, month: monthStr } }
          });
          
          if (!monthly) {
            monthly = await prisma.monthlyFinance.create({
              data: { userId, month: monthStr, revenue: 0 }
            });
            gamificationResult = await GamificationService.addXp(userId, 25);
          }

          await prisma.financeEntry.create({
            data: {
              id: payload.id,
              userId,
              monthlyFinanceId: monthly.id,
              label: payload.label,
              amount: payload.amount,
              category: payload.category,
              frequency: payload.frequency || 'monthly',
              type: payload.type || 'expense',
              date: new Date(payload.date),
              notes: payload.notes,
            },
          });
          
          if (!gamificationResult) {
             gamificationResult = await GamificationService.addXp(userId, XP_RULES.FINANCE_ENTRY_ADDED);
          }
          break;

        case 'updateEntry':
          await prisma.financeEntry.update({
            where: { id: payload.id, userId },
            data: {
              label: payload.label,
              amount: payload.amount,
              category: payload.category,
              frequency: payload.frequency,
              type: payload.type,
              date: payload.date ? new Date(payload.date) : undefined,
              notes: payload.notes,
            },
          });
          break;

        case 'deleteEntry':
          await prisma.financeEntry.delete({
            where: { id: payload.id, userId },
          });
          break;

        case 'addOneTimeEntry':
          await prisma.financeOneTimeEntry.create({
            data: {
              id: payload.id,
              userId,
              label: payload.label,
              amount: payload.amount,
              category: payload.category,
              date: new Date(payload.date),
              notes: payload.notes,
            },
          });
          gamificationResult = await GamificationService.addXp(userId, XP_RULES.FINANCE_ENTRY_ADDED);
          break;

        case 'deleteOneTimeEntry':
          await prisma.financeOneTimeEntry.delete({
            where: { id: payload.id, userId },
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({ ok: true, gamification: gamificationResult });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    console.error('[API Data Finances] Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
