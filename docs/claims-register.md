# Helmdash - Claims Register (V4)

Registre des promesses marketing versus la réalité du code déployé, conformément à la spécification stricte V4. Ce document définit les mots-clés interdits et leurs portées afin d'assurer l'honnêteté stricte de la landing page.

## Mots-clés BANNED_EVERYWHERE
Ces affirmations ne sont ni développées ni prévues dans la roadmap à court terme. Leur présence entraîne un échec immédiat de la CI sur n'importe quel fichier de landing ou de traduction.

| Terme Interdit | Raison |
|---|---|
| `sso` | Pas d'intégration SAML/SSO prévue dans l'immédiat. |
| `sla` | Aucun Service Level Agreement garanti pour le moment. |
| `team seats` | Helmdash est un outil solo-founder pour le moment. |
| `per seat` | Facturation globale, pas par utilisateur. |
| `on-premise` / `on premise` | Solution SaaS cloud uniquement. |
| `audit logs` | L'infrastructure d'audit avancée n'est pas implémentée. |
| `automatic monitoring` / `automated monitoring` | Pas de monitoring automatisé de l'app du client en temps réel. |
| `custom mcp` | Création de MCP personnalisés non supportée. |
| `openrouter` / `local models` | L'intégration de ces LLM n'est pas encore disponible. |
| `unlimited agents` | Le nombre d'agents est limité selon le plan. |
| `guaranteed` | Aucune garantie de résultat (ROI, etc.) n'est juridiquement ou techniquement offerte. |

## Mots-clés BANNED_OUTSIDE_ROADMAP
Ces fonctionnalités sont planifiées mais **pas encore développées**. Leur mention est strictement limitée à la section `<Roadmap>` pour montrer la direction du produit. Toute mention à l'extérieur (dans le hero, le pricing, les avantages, etc.) fera échouer la CI.

| Terme Interdit Hors Roadmap | Raison |
|---|---|
| `notion` | L'import de la base de connaissance Notion est à venir. |
| `csv import` | Le parseur CSV pour la data finance/user est en cours. |
| `gmail` | L'agent de tri d'emails n'est pas encore pluggé à l'API Gmail. |
| `calendar` | L'agent de scheduling n'est pas encore fonctionnel. |
| `social publishing` | La publication LinkedIn/Twitter n'est pas connectée. |
| `conversational onboarding` | Onboarding manuel actuel, version conversationnelle prévue. |
| `command center` | La vue unifiée "Command Center" est en cours de design. |

## Preuve d'Intégrité
Le script `scripts/check-landing-claims.mjs` s'assure que :
1. Aucun terme `BANNED_EVERYWHERE` n'est présent.
2. Aucun terme `BANNED_OUTSIDE_ROADMAP` n'est présent hors des composants `<Roadmap>`.
3. Le compte à rebours de la cohorte est issu de requêtes DB réelles (via `<CohortBadge />` et `api/billing/cohort-status`).
4. Le RGPD est correctement respecté (Soft delete 48h sur `api/account/delete`).
