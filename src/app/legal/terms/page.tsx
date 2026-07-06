export default function TermsPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: '"IBM Plex Sans", sans-serif', color: "#0E1B2E" }}>
      <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 32, marginBottom: 32 }}>Conditions Générales d'Utilisation (CGU)</h1>
      
      <p style={{ marginBottom: 16 }}>Dernière mise à jour : 15 Septembre 2026</p>
      
      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>1. Objet</h2>
      <p style={{ marginBottom: 16 }}>
        Les présentes CGU encadrent l'accès et l'utilisation du service Helmdash, un poste de pilotage doté d'une intelligence artificielle pour les fondateurs d'entreprises.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>2. Abonnement et Paiement</h2>
      <p style={{ marginBottom: 16 }}>
        L'accès au service est facturé selon les plans en vigueur (Founder Deal, BYOK, Complet). Les paiements sont sécurisés par Stripe. Aucun remboursement n'est effectué pour les mois entamés. L'essai de 14 jours est gratuit et sans engagement.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>3. Clés d'API Tiers (Plan BYOK)</h2>
      <p style={{ marginBottom: 16 }}>
        Les utilisateurs du plan "Bring Your Own Key" sont responsables de l'utilisation, de la facturation et des limites de leurs propres clés API (OpenAI, Anthropic, Mistral). Helmdash décline toute responsabilité en cas de dépassement de quota ou de suspension d'API par le fournisseur.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>4. Limitation de Responsabilité</h2>
      <p style={{ marginBottom: 16 }}>
        Les conseils et l'analyse fournis par l'Agent Helmdash sont générés par intelligence artificielle. Ils ne sauraient remplacer l'avis d'un expert (comptable, avocat, conseiller financier). L'utilisateur est seul décisionnaire.
      </p>
    </div>
  );
}