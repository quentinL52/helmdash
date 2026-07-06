import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const AUDIENCE_ID = Deno.env.get('RESEND_AUDIENCE_ID')
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

Deno.serve(async (req) => {
  try {
    // 1. (Optionnel) Vérification du secret si vous le configurez dans le webhook
    const authHeader = req.headers.get('Authorization')
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.error("Unauthorized request")
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // 2. Récupération du payload Supabase (Database Webhook)
    const payload = await req.json()
    console.log("Received Webhook Payload:", JSON.stringify(payload))
    
    // Le payload d'un webhook DB Supabase contient record et old_record
    const record = payload.record
    const oldRecord = payload.old_record
    
    // 3. Logique métier : Uniquement si on passe à 'confirmed'
    const isConfirmedNow = record?.status === 'confirmed'
    const wasConfirmedBefore = oldRecord?.status === 'confirmed'
    
    if (isConfirmedNow && !wasConfirmedBefore && record?.email) {
        if (!RESEND_API_KEY || !AUDIENCE_ID) {
          console.error("Missing RESEND_API_KEY or RESEND_AUDIENCE_ID in Edge Function Secrets")
          return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 })
        }

        console.log(`Adding ${record.email} to Resend Audience ${AUDIENCE_ID}`)
        
        // 4. Appel à l'API Resend
        const resendRes = await fetch(`https://api.resend.com/audiences/${AUDIENCE_ID}/contacts`, {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${RESEND_API_KEY}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             email: record.email,
             unsubscribed: false,
           })
        })
        
        if (!resendRes.ok) {
           const errorText = await resendRes.text()
           console.error("Resend API Error:", errorText)
           throw new Error(`Resend API Error: ${resendRes.status} ${errorText}`)
        }
        
        const data = await resendRes.json()
        console.log("Successfully added to Resend:", data)
        return new Response(JSON.stringify({ success: true, data }), { headers: { "Content-Type": "application/json" } })
    }

    // Pas d'action requise pour cette modification
    return new Response(JSON.stringify({ success: true, message: "No action required (status not changed to confirmed)" }), { headers: { "Content-Type": "application/json" } })
    
  } catch (err) {
    console.error("Function Error:", err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})
