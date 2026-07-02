import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Helmdash',
  description: 'Comment Helmdash traite vos données personnelles.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-sm dark:prose-invert">
      <h1>Politique de Confidentialité</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : juillet 2026</p>

      <h2>1. Données collectées</h2>
      <p>Helmdash collecte uniquement les données nécessaires au fonctionnement du service :</p>
      <ul>
        <li><strong>Compte</strong> : email, nom (via Supabase Auth)</li>
        <li><strong>Données métier</strong> : finances, hypothèses, contacts, contenu — stockées dans Supabase (UE)</li>
        <li><strong>Mémoire vectorielle</strong> : embeddings et notes pour la mémoire de l&apos;agent (pgvector, UE)</li>
        <li><strong>Logs d&apos;audit</strong> : actions clés (hashées, immuables) pour la sécurité</li>
      </ul>

      <h2>2. Absence de cookies</h2>
      <p>Helmdash n&apos;utilise <strong>aucun cookie</strong> publicitaire ou de tracking. Les sessions utilisent les cookies techniques strictement nécessaires à l&apos;authentification (Supabase Auth).</p>

      <h2>3. Sous-traitants</h2>
      <ul>
        <li><strong>Supabase</strong> (UE) — Base de données, Auth, Storage</li>
        <li><strong>Vercel</strong> (UE) — Hébergement</li>
        <li><strong>OpenAI / Anthropic</strong> (US) — Appels IA (anonymisés, sans données identifiantes)</li>
        <li><strong>Stripe</strong> (US) — Paiements (aucune donnée bancaire stockée chez Helmdash)</li>
      </ul>

      <h2>4. Vos droits</h2>
      <p>Conformément au RGPD, vous pouvez à tout moment :</p>
      <ul>
        <li>Accéder à vos données</li>
        <li>Les exporter (JSON)</li>
        <li>Les rectifier</li>
        <li>Les supprimer (suppression complète du compte)</li>
      </ul>
      <p>Contact : <a href="mailto:privacy@helmdash.app">privacy@helmdash.app</a></p>
    </main>
  );
}