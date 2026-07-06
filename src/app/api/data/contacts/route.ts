import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { z } from 'zod';
import { ContactStatus, ContactType } from '@prisma/client';

const actionSchema = z.object({
  action: z.enum(['add', 'update', 'delete']),
  payload: z.any(),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    if (req.method === 'GET') {
      const contacts = await prisma.contact.findMany({ 
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ contacts });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action, payload } = actionSchema.parse(body);

      switch (action) {
        case 'add':
          await prisma.contact.create({
            data: {
              id: payload.id,
              userId,
              name: payload.name,
              type: payload.type as ContactType || null,
              role: payload.role,
              company: payload.company,
              email: payload.email,
              linkedin: payload.linkedin,
              status: payload.status as ContactStatus || 'a_contacter',
              pipelineStage: payload.pipelineStage,
              lastContactDate: new Date(payload.lastContactDate || new Date()),
              nextActionDate: payload.nextActionDate ? new Date(payload.nextActionDate) : null,
              nextActionLabel: payload.nextActionLabel,
              nextAction: payload.nextAction,
              lastInteractionAt: payload.lastInteractionAt ? new Date(payload.lastInteractionAt) : null,
              waitingOn: payload.waitingOn,
              dealValue: payload.dealValue,
              dormant: payload.dormant || false,
              notionId: payload.notionId,
              notes: payload.notes,
              tags: payload.tags || [],
            }
          });
          break;

        case 'update':
          await prisma.contact.update({
            where: { id: payload.id, userId },
            data: {
              name: payload.name,
              type: payload.type as ContactType || null,
              role: payload.role,
              company: payload.company,
              email: payload.email,
              linkedin: payload.linkedin,
              status: payload.status as ContactStatus,
              pipelineStage: payload.pipelineStage,
              lastContactDate: payload.lastContactDate ? new Date(payload.lastContactDate) : undefined,
              nextActionDate: payload.nextActionDate ? new Date(payload.nextActionDate) : null,
              nextActionLabel: payload.nextActionLabel,
              nextAction: payload.nextAction,
              lastInteractionAt: payload.lastInteractionAt ? new Date(payload.lastInteractionAt) : undefined,
              waitingOn: payload.waitingOn,
              dealValue: payload.dealValue,
              dormant: payload.dormant,
              notionId: payload.notionId,
              notes: payload.notes,
              tags: payload.tags,
              updatedAt: new Date()
            }
          });
          break;

        case 'delete':
          await prisma.contact.delete({
            where: { id: payload.id, userId }
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    console.error('[API Data Contacts] Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
