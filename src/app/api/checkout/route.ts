import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { priceId, planTier } = await req.json();
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            customer_email: user.email,
            client_reference_id: user.id,
            metadata: {
                userId: user.id,
                planTier: planTier
            },
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/dashboard?success=true`,
            cancel_url: `${req.headers.get('origin')}/pricing?canceled=true`,
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error("Checkout Error:", err);
        return new NextResponse(err.message, { status: 500 });
    }
}
