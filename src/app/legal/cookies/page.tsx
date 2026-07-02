import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique des Cookies — Helmdash',
  description: 'Gestion des cookies sur Helmdash.',
};

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-sm dark:prose-invert">
      <h1>Politique des Cookies</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : juillet 2026</p>

      <h2>Cookies utilisés</h2>
      <p>Helmdash utilise <strong>uniquement</strong> les cookies techniques suivants :</p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Durée</th><th>Finalité</th></tr>
        </thead>
        <tbody>
          <tr><td><code>sb-*-auth-token</code></td><td>Session</td><td>Authentification Supabase</td></tr>
          <tr><td><code>__session</code></td><td>Session</td><td>Jeton de session</td></tr>
        </tbody>
      </table>
      <p><strong>Aucun cookie publicitaire, analytics ou tracking tiers</strong> n&apos;est utilisé. Les analytics PostHog sont cookieless (session uniquement, en mémoire).</p>

      <h2>Gestion</h2>
      <p>Vous pouvez supprimer ces cookies à tout moment via les paramètres de votre navigateur.</p>
    </main>
  );
}