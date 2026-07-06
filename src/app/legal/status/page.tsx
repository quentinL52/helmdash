export default function StatusPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: '"IBM Plex Sans", sans-serif', color: "#0E1B2E" }}>
      <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 32, marginBottom: 32 }}>Statut du Service</h1>
      
      <p style={{ marginBottom: 16 }}>Dernière mise à jour : 15 Septembre 2026</p>
      
      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>Tous les systèmes sont opérationnels</h2>
      <p style={{ marginBottom: 16 }}>
        Aucun incident n'est actuellement en cours.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>Historique des incidents</h2>
      <p style={{ marginBottom: 16 }}>
        Aucun incident signalé dans les 90 derniers jours.
      </p>
    </div>
  );
}
