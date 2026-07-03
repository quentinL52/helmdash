# Helmdash - Claims Register

Registre des promesses marketing (landing) versus la réalité du code déployé (origin/main).

| Section / Claim | Promesse Marketing | Réalité Code/Base (Preuve) | Statut |
|---|---|---|---|
| **Account** | "Export & suppression de compte en 1 clic" | Le dossier `src/app/api/account` n'existe pas encore. Issue P0 (RGPD) en cours. | ❌ (À ne pas afficher sur la landing) |
| **Pricing** | "Prix fixe à vie pour la première cohorte" | `COHORT_CONFIG` dans le pricing définit la logique de cohorte (`src/config/pricing.ts`). | ✅ Validé |
| **I18n** | "Disponible en FR et EN" | Fichiers `messages/en.json` et `messages/fr.json` présents et configurés via next-intl. | ✅ Validé |
| **Competitive Watch** | "Surveillez vos concurrents" | Dashboard avec radar, timeline, threat matrix existant. | ✅ Validé |
| **Brief Hebdo** | "Recevez un brief hebdo par email" | Le script de test E2E est en attente de validation manuelle de l'humain. (Cron: `/api/cron/scheduled-tasks`). | ⚠️ En attente de test humain |
| **Data Protection** | "Vos données restent privées" | Pas de traceurs externes intrusifs identifiés pour l'instant, mais la politique de confidentialité doit le stipuler. | ⚠️ À vérifier / Limiter |

*La landing page ne doit afficher que les claims avec le statut "✅ Validé". Les claims en statut "❌" ou "⚠️" ne doivent pas faire l'objet d'une promesse.*
