import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          include: {
            tasks: true
          }
        },
        hypotheses: true,
        monthlyFinances: {
          include: {
            entries: true
          }
        },
        financeOneTimeEntries: true,
        financeSettings: true,
        gtmStrategy: true,
        contacts: true,
        roadmapItems: true,
        leanCanvasSections: true,
        moodEntries: true,
        streak: true,
        gamificationProfile: true,
        aiSettings: true,
        memoryNotes: true,
        graphNodes: true,
        graphEdges: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return the JSON as an attachment
    return new NextResponse(JSON.stringify(user, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="helmdash-export.json"'
      }
    });
  } catch (error) {
    console.error('[EXPORT_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
