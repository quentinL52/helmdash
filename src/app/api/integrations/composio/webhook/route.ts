import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received Composio webhook:', body);
    
    // Process webhook logic if required, like storing tokens or logging
    // Composio usually handles oauth tokens on their end, but we can sync state.
    
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Composio webhook handling error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
