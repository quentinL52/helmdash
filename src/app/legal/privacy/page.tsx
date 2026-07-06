export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", fontFamily: '"IBM Plex Sans", sans-serif', color: "#0E1B2E" }}>
      <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 32, marginBottom: 32 }}>Politique de Confidentialité</h1>
      
      <p style={{ marginBottom: 16 }}>Dernière mise à jour : 15 Septembre 2026</p>
      
      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>1. Éditeur du Service</h2>
      <p style={{ marginBottom: 16 }}>
        Le service Helmdash est édité par un Solo Founder basé à Lyon, France.
        <br />Contact : [EMAIL_CONTACT]
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>2. Hébergement et Données</h2>
      <p style={{ marginBottom: 16 }}>
        Les données sont hébergées par Supabase (AWS) sur des serveurs situés en Union Européenne (Irlande/Francfort).
        Vos clés d'API (OpenAI, Anthropic, Mistral) sont chiffrées en base de données et ne sont jamais partagées à des tiers.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>3. Utilisation de l'Intelligence Artificielle</h2>
      <p style={{ marginBottom: 16 }}>
        Helmdash utilise des modèles d'IA tiers. Aucune de vos données privées n'est utilisée pour entraîner ces modèles. L'utilisation de modèles par l'API garantit la confidentialité selon les conditions d'utilisation strictes (Zéro rétention d'entraînement) de nos fournisseurs.
      </p>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>4. Droits des utilisateurs (RGPD)</h2>
      <p style={{ marginBottom: 16 }}>
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement (droit à l'oubli), et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant directement ou via l'interface de l'application (suppression du compte en 1 clic).
      </p>
    </div>
  );
}