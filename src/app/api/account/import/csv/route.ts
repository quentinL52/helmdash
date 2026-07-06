import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { parse } from 'csv-parse/sync';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 });
    }

    const text = await file.text();
    
    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'Fichier CSV vide ou mal formaté' }, { status: 400 });
    }

    let importedCount = 0;

    switch (type) {
      case 'finances':
        // Expected columns: date, type (income/expense), amount, description, category
        for (const record of records) {
          if (!record.amount || !record.type) continue;
          await prisma.financialEntry.create({
            data: {
              userId,
              type: record.type.toLowerCase() === 'income' ? 'income' : 'expense',
              amount: parseFloat(record.amount) || 0,
              description: record.description || 'Import CSV',
              category: record.category || 'Import',
              date: record.date ? new Date(record.date) : new Date()
            }
          });
          importedCount++;
        }
        break;

      case 'contacts':
        // Expected columns: name, email, company, role, status
        for (const record of records) {
          if (!record.name) continue;
          await prisma.contact.create({
            data: {
              userId,
              name: record.name,
              email: record.email || null,
              company: record.company || null,
              role: record.role || null,
              status: record.status || 'lead'
            }
          });
          importedCount++;
        }
        break;

      case 'decisions':
        // Expected columns: title, context, status
        for (const record of records) {
          if (!record.title) continue;
          await prisma.decision.create({
            data: {
              userId,
              title: record.title,
              context: record.context || null,
              status: ['pending', 'approved', 'challenged', 'rejected'].includes(record.status) ? record.status : 'pending'
            }
          });
          importedCount++;
        }
        break;

      default:
        return NextResponse.json({ error: 'Type d\'import non supporté' }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: importedCount });
  } catch (e: any) {
    console.error('[CSV Import Error]', e);
    return NextResponse.json({ error: e.message || 'Erreur lors de l\'importation' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
