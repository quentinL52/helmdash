import { NextResponse } from 'next/server';
import { startMemoryWorker } from '@/lib/queue/memory-queue';
import { withAuth } from '@/lib/security/with-auth';

// This is a simple route that can be called to ensure the worker is started.
// In a true serverless environment like Vercel, long-running processes (BullMQ Worker) 
// are killed when the request ends. For production Vercel, it is highly recommended 
// to use QStash (Upstash) instead of BullMQ.
// But for this setup (local / custom server), hitting this endpoint will start the worker.

let workerStarted = false;

async function handler() {
  try {
    if (!workerStarted) {
      startMemoryWorker();
      workerStarted = true;
      return NextResponse.json({ status: 'Worker started' });
    }
    return NextResponse.json({ status: 'Worker already running' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const GET = withAuth(handler);