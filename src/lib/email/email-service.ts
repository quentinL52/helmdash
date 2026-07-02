/**
 * Service d'envoi d'email — architecture pluggable.
 * En développement : console.log.
 * En production : Resend (quand RESEND_API_KEY est configurée).
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

type EmailProvider = (payload: EmailPayload) => Promise<void>;

const consoleProvider: EmailProvider = async (payload) => {
  console.log(`[EMAIL] To: ${payload.to} | Subject: ${payload.subject}`);
  console.log(`[EMAIL] Body: ${payload.html.slice(0, 200)}...`);
};

const emailProvider: EmailProvider =
  process.env.RESEND_API_KEY
    ? async (payload) => {
        // Lazy load Resend uniquement si configuré
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Helmdash <noreply@helmdash.app>',
          ...payload,
        });
      }
    : consoleProvider;

export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    await emailProvider(payload);
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    // Ne pas throw — l'email est non-bloquant
  }
}

export async function sendTrialEndingEmail(
  email: string,
  userName: string,
  daysLeft: number,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Votre essai Helmdash se termine dans ${daysLeft} jours`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour ${userName},</h2>
        <p>Votre essai gratuit de 14 jours sur <strong>Helmdash</strong> 
           se termine dans <strong>${daysLeft} jours</strong>.</p>
        <p>Pour continuer à utiliser votre dashboard, vos agents IA et votre mémoire persistante, 
           souscrivez à un abonnement.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/billing"
             style="background: #7B2ED6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Gérer mon abonnement
          </a>
        </p>
        <p style="color: #666; font-size: 0.9em; margin-top: 24px;">
          Helmdash — Votre co-fondateur IA.
        </p>
      </div>
    `,
  });
}
