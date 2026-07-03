import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Unauthenticated access' }, { status: 200 });
}
