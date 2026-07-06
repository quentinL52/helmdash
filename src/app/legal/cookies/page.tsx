export default function CookiesPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: '"IBM Plex Sans", sans-serif', color: "#0E1B2E" }}>
      <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 32, marginBottom: 32 }}>Politique des Cookies</h1>
      
      <p style={{ marginBottom: 16 }}>Dernière mise à jour : 15 Septembre 2026</p>
      
      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>1. Cookies Strictement Nécessaires</h2>
      <p style={{ marginBottom: 16 }}>
        Nous utilisons des cookies indispensables au fonctionnement de la plateforme (Maintien de la session via Supabase, préférences de langue). Ces cookies ne peuvent pas être désactivés.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>2. Cookies Analytiques</h2>
      <p style={{ marginBottom: 16 }}>
        Nous ne collectons aucune donnée analytique tierce (pas de Google Analytics, pas de Meta Pixel). Votre navigation sur le poste de pilotage reste privée. L'observabilité interne se limite aux actions de l'agent.
      </p>
    </div>
  );
}