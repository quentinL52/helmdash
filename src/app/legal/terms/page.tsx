import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'Utilisation — Helmdash",
  description: "Conditions générales d'utilisation de Helmdash.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-sm dark:prose-invert">
      <h1>Conditions d&apos;Utilisation</h1>
      <p className="text-muted-foreground text-sm">Dernière mise à jour : juillet 2026</p>

      <h2>1. Service</h2>
      <p>Helmdash est un assistant IA pour fondateurs solo. L&apos;accès est gratuit (Free) ou payant (Starter, Growth, Scale) selon les limitations de chaque plan.</p>

      <h2>2. Utilisation responsable</h2>
      <p>L&apos;utilisateur s&apos;engage à :</p>
      <ul>
        <li>Ne pas utiliser le service pour des activités illégales</li>
        <li>Ne pas tenter de contourner les limitations de plan</li>
        <li>Ne pas partager ses clés API (OpenAI, Anthropic, etc.)</li>
        <li>Ne pas utiliser le service pour générer du contenu nuisible</li>
      </ul>

      <h2>3. Propriété des données</h2>
      <p>Vous conservez l&apos;intégralité de la propriété de vos données. Helmdash n&apos;utilise jamais vos données pour entraîner des modèles IA.</p>

      <h2>4. Paiement</h2>
      <p>Les abonnements sont annuels. Conformément à la législation française, vous disposez d&apos;un délai de rétractation de 14 jours. Passé ce délai, les paiements sont non remboursables.</p>

      <h2>5. Contact</h2>
      <p><a href="mailto:legal@helmdash.app">legal@helmdash.app</a></p>
    </main>
  );
}