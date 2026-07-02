import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/security';

const prisma = new PrismaClient();

/**
 * GET /api/memory/graph
 *
 * Returns the user's knowledge graph (nodes + edges).
 * Used by GraphView component.
 */
async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const nodes = await prisma.graphNode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const edges = await prisma.graphEdge.findMany({
      where: { userId },
      include: {
        sourceNode: true,
        targetNode: true,
      },
    });

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('[Memory Graph API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge graph' },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);