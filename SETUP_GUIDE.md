# 📋 Guide Complet de Configuration — AirH Founder OS

Ce guide couvre **tout ce que TU dois configurer** (variables d'env, services externes, OAuth, webhooks, DB) pour que l'app soit 100% fonctionnelle en production.

---

## 1️⃣ Variables d'Environnement (`.env.local` → `.env.production`)

Crée un fichier `.env` à la racine avec **toutes** ces variables :

```bash
# ==========================================
# CORE APP
# ==========================================
NEXT_PUBLIC_APP_URL="https://ton-domaine.com"          # URL publique (Vercel prod)
NODE_ENV="production"

# ==========================================
# SUPABASE (Auth + DB + Realtime + Vault)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG...VCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...VCJ9..."  # Server-only !
DATABASE_URL="postgresql://postgres:***@db.xxx.supabase.co:5432/postgres?pgbouncer=true"
# ^ Format Supabase: postgresql://postgres:***@db.[REF].supabase.co:5432/postgres?pgbouncer=true

# ==========================================
# STRIPE (Billing + Webhooks + Portal)
# ==========================================
STRIPE_SECRET_KEY="***"                          # ou sk_test_... pour dev
STRIPE_WEBHOOK_SECRET="***"                        # From Stripe Dashboard > Webhooks
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."         # Client-side
STRIPE_PRICE_STARTER_YEARLY="price_..."                  # Prix ID €49/an (créer dans Stripe)
STRIPE_PRICE_GROWTH_YEARLY="price_..."                   # Prix ID €199/an
STRIPE_PRICE_SCALE_YEARLY="price_..."                    # Prix ID €599/an

# ==========================================
# AI PROVIDERS (au moins 1 requis)
# ==========================================
OPENAI_API_KEY="***"                                  # GPT-4o, embeddings
ANTHROPIC_API_KEY="***"                           # Claude Sonnet 4
GEMINI_API_KEY="***"                                     # Google AI Studio
MISTRAL_API_KEY="***"                                    # Mistral Large
# Optionnel: provider par défaut
AI_DEFAULT_PROVIDER="openai"

# ==========================================
# COMPOSIO (Intégrations 100+ apps)
# ==========================================
COMPOSIO_API_KEY="***"                              # From app.composio.dev

# ==========================================
# UPSTASH REDIS (Rate limiting + BullMQ queues)
# ==========================================
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="***"
UPSTASH_REDIS_URL="rediss://default:xxx@xxx.upstash.io:6379"  # Pour BullMQ (ioredis)

# ==========================================
# CHiffrement (AES-256-GCM) - GARDER SECRET !
# ==========================================
MASTER_ENCRYPTION_KEY="base64-encoded-32-bytes-key"      # Génère: openssl rand -base64 32

# ==========================================
# EMAIL (Resend pour transactionnel)
# ==========================================
RESEND_API_KEY="***"                                  # From resend.com
EMAIL_FROM="AirH Founder OS <noreply@ton-domaine.com>"

# ==========================================
# OPTIONNELS
# ==========================================
# Vercel Analytics / Speed Insights
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."

# Sentry (error tracking)
SENTRY_DSN="https://xxx@sentry.io/xxx"

# PostHog / Mixpanel (analytics)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://eu.i.posthog.com"
```

---

## 2️⃣ Services Externes à Configurer

### **A. Supabase** (Auth + DB + pgvector + Vault + Realtime)
| Action | Où |
|--------|-----|
| Créer projet | https://supabase.com/dashboard |
| Activer `pgvector` | SQL Editor → `CREATE EXTENSION vector;` |
| Activer `pgcrypto` | SQL Editor → `CREATE EXTENSION pgcrypto;` |
| Configurer Auth | Authentication > Providers > Email + OAuth (GitHub, Google) |
| Configurer Vault | Settings > Vault > Activer (pour stocker API keys utilisateurs) |
| RLS Policies | Déjà gérées par Prisma schema, vérifier dans Table Editor |
| Edge Functions | Pour cron jobs si pas Vercel Cron |

### **B. Stripe** (Billing + Webhooks + Customer Portal)
| Action | Où |
|--------|-----|
| Créer 3 prix **annuels** | Products > Add product > Recurring > Yearly: €49, €199, €599 |
| Configurer Webhook | Developers > Webhooks > Add endpoint: `https://ton-domaine.com/api/stripe/webhook` |
| Événements webhook | `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed` |
| Billing Portal | Settings > Billing > Customer portal > Activer + configurer |
| Test mode d'abord | Utiliser `sk_test_` / `pk_test_` + webhook `ngrok` / `stripe listen` |

### **C. Composio** (100+ Intégrations OAuth)
| Action | Où |
|--------|-----|
| Créer compte | https://app.composio.dev |
| Récupérer API Key | Settings > API Keys |
| Configurer Apps cibles | Pour chaque app: GitHub, Linear, Notion, Gmail, Slack, Apollo, SerpAPI, Firecrawl, Exa, LinkedIn, HubSpot, Instantly, Mailgun, Google Analytics, Mixpanel, PostHog, Figma, Excalidraw, Stripe, Plaid, GoCardless, Pennylane, Jira, GitLab, Discord |
| **Important** : Chaque utilisateur devra connecter ses comptes via l'UI (OAuth flow Composio) |

### **D. Upstash Redis** (Rate Limiting + BullMQ)
| Action | Où |
|--------|-----|
| Créer database | https://console.upstash.com/redis > Create Database |
| Région | Europe (Frankfurt/Paris) pour RGPD |
| Récupérer | REST URL + REST Token + Redis URL (rediss://) |
| Free tier | 10k req/jour + 256 MB suffit pour débuter |

### **E. Resend** (Emails transactionnels)
| Action | Où |
|--------|-----|
| Créer compte | https://resend.com |
| Vérifier domaine | Domains > Add > Configurer DKIM/SPF/DMARC |
| Récupérer API Key | API Keys > Create |
| Templates | Créer : `trial-ending-3-days`, `welcome`, `invoice-paid`, `subscription-cancelled` |

---

## 3️⃣ Base de Données — Migrations & Setup

```bash
# 1. Générer Prisma Client
npx prisma generate

# 2. Pousser migrations (créer tables + index HNSW pour pgvector)
npx prisma migrate deploy

# 3. Créer index HNSW manuellement (Prisma ne gère pas vector nativement)
# Exécuter dans Supabase SQL Editor :
```

```sql
-- Index HNSW pour recherche vectorielle performante
CREATE INDEX IF NOT EXISTS memory_notes_embedding_hnsw_idx 
ON memory_notes 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index pour graph nodes/edges
CREATE INDEX IF NOT EXISTS graph_nodes_user_type_name_idx ON graph_nodes (user_id, type, name);
CREATE INDEX IF NOT EXISTS graph_edges_user_source_target_idx ON graph_edges (user_id, source_node_id, target_node_id);

-- Fonction pour cleanup tokens expirés (optionnel)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Logique de nettoyage si tu stockes tokens OAuth en base
  RETURN NEW;
END;
$$;
```

---

## 4️⃣ OAuth Apps à Créer (pour Composio + Auth Supabase)

| Service | Callback URL | Scopes requis |
|---------|--------------|---------------|
| **GitHub** | `https://ton-domaine.com/api/auth/callback/github` | `repo`, `read:user`, `user:email`, `admin:repo_hook` |
| **GitLab** | `https://ton-domaine.com/api/auth/callback/gitlab` | `api`, `read_user`, `read_repository` |
| **Google** | `https://ton-domaine.com/api/auth/callback/google` | `openid`, `email`, `profile` |
| **Linear** | `https://ton-domaine.com/api/auth/callback/linear` | `read`, `write`, `issues:create` |
| **Notion** | `https://ton-domaine.com/api/auth/callback/notion` | `read`, `write`, `databases:read` |
| **Slack** | `https://ton-domaine.com/api/auth/callback/slack` | `channels:read`, `chat:write`, `users:read` |
| **Gmail** | `https://ton-domaine.com/api/auth/callback/gmail` | `https://www.googleapis.com/auth/gmail.send`, `gmail.readonly` |

> **Note** : Composio gère ses propres OAuth flows. Tu configures les apps dans Composio, pas directement dans ton code.

---

## 5️⃣ Webhooks à Configurer

| Service | URL | Événements | Secret |
|---------|-----|------------|--------|
| **Stripe** | `https://ton-domaine.com/api/stripe/webhook` | `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.*`, `checkout.session.completed` | `STRIPE_WEBHOOK_SECRET` |
| **Supabase Realtime** | Auto (via client) | `INSERT/UPDATE/DELETE` sur tables publiques | N/A |
| **Vercel Cron** | `https://ton-domaine.com/api/cron/daily` | `0 9 * * *` (quotidien 9h) | `CRON_SECRET` |
| **Stripe Billing Portal** | `https://ton-domaine.com/api/billing/portal` | Session creation | Auto |

**Cron Jobs Vercel** (ajouter dans `vercel.json` déjà présent) :
```json
{
  "crons": [
    { "path": "/api/cron/daily", "schedule": "0 9 * * *" },
    { "path": "/api/cron/trial-check", "schedule": "0 10 * * *" }
  ]
}
```

---

## 6️⃣ Déploiement Vercel

```bash
# 1. Connecter repo GitHub à Vercel
# 2. Configurer Environment Variables (copier .env.production)
# 3. Build Command: npm run build
# 4. Output Directory: .next
# 5. Install Command: npm ci
# 6. Activer: Vercel Cron, Vercel Analytics, Speed Insights
```

**Variables Vercel obligatoires** (dans Settings > Environment Variables) :
- Toutes les variables du `.env` ci-dessus
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (pour CI/CD deploy)

---

## 7️⃣ Tests & Validation Post-Déploiement

### Checklist "Smoke Test" Production

| Test | Comment valider |
|------|-----------------|
| **Auth** | Login → Dashboard → Onglet Agent visible |
| **Chat Agent** | Envoyer "Quelle est ma runway ?" → Réponse avec données réelles |
| **Read Dashboard** | "Liste mes hypothèses" → Retourne vraies données Prisma |
| **Write Dashboard** | "Crée une hypothèse test" → Apparaît dans onglet Hypotheses |
| **Memory** | "Sauvegarde cette décision" → Recherche sémantique fonctionne |
| **Web Search** | "Cherche actualités IA semaine" → Résultats SerpAPI réels |
| **Spawn Sub-agent** | "Délègue au CFO analyse runway" → TaskId retourné, résultat async |
| **Stripe Sync** | "Sync Stripe" → MRR/ARR mis à jour dans Finances |
| **Rate Limit** | 15 requêtes chat < 1min → 429 Too Many Requests |
| **Billing Portal** | Settings > Billing > "Gérer l'abonnement" → Redirection Stripe Portal |
| **Composio** | Settings > Integrations > Connect GitHub → OAuth flow ok |

---

## 8️⃣ Commandes Utiles (Local / CI)

```bash
# Dev local
npm run dev                    # Port 9002 (config next.config.ts)
npm run genkit:dev             # Si Genkit utilisé

# DB
npx prisma studio              # UI DB locale
npx prisma migrate dev         # Nouvelle migration
npx prisma db push             # Push schema sans migration

# Build & Typecheck
npm run build                  # Build production
npm run typecheck              # tsc --noEmit
npm run lint                   # ESLint

# Stripe CLI (local webhook testing)
stripe login
stripe listen --forward-to localhost:9002/api/stripe/webhook

# Tests (à créer)
npm run test                   # Vitest
npm run test:e2e               # Playwright

# Worker BullMQ (pour sub-agents + memory queue)
# À lancer en process séparé (pm2, systemd, ou Railway/Render)
node -e "require('./dist/lib/queue/sub-agent-queue').startSubAgentWorker()"
node -e "require('./dist/lib/queue/memory-queue').startMemoryWorker()"
```

---

## 9️⃣ Architecture Workers (BullMQ) — Production

Les queues **nécessitent des workers séparés** (ne tournent pas dans Next.js) :

| Option | Comment |
|--------|---------|
| **Railway** | `railway up` + `railway run node worker.js` (simple, $5/mo) |
| **Render** | Background Worker service (free tier dispo) |
| **Fly.io** | `fly deploy` + `fly machine run` |
| **VPS (Hetzner/DigitalOcean)** | systemd service + pm2 |
| **Supabase Edge Functions** | Pour memory queue seulement (Deno) |

**worker.js** minimal :
```javascript
// worker.js - à la racine
require('dotenv').config();
const { startSubAgentWorker } = require('./dist/lib/queue/sub-agent-queue');
const { startMemoryWorker } = require('./dist/lib/queue/memory-queue');

startSubAgentWorker();
startMemoryWorker();
console.log('Workers started...');
```

---

## 🔟 Checklist Finale Avant Launch

```
[ ] .env.production complet sur Vercel
[ ] Supabase: pgvector + pgcrypto activés, migrations passées, RLS ok
[ ] Stripe: 3 prix annuels créés, webhook configuré, portal activé
[ ] Composio: API key + apps cibles configurées
[ ] Upstash: Redis database créée, URLs récupérées
[ ] Resend: Domaine vérifié, API key, templates créés
[ ] OAuth apps: GitHub, Linear, Notion, Gmail, Slack créés + callbacks
[ ] Vercel: Cron jobs déployés, analytics activé
[ ] Workers BullMQ: Déployés + tournent (railway/render/fly)
[ ] Index HNSW: Créé en base (SQL ci-dessus)
[ ] Smoke tests: Tous passés (voir §7)
[ ] Monitoring: Sentry + PostHog configurés
[ ] Backup: Supabase Point-in-Time Recovery activé
[ ] Docs: README + CHANGELOG à jour
```

---

## 💡 Prochaines Étapes (Post-Launch)

1. **Gamification** → Déplacer widgets vers onglet `Progression` (widget-registry.ts)
2. **GTM Refactor** → 3 sous-onglets + Agent GTM dédié
3. **Tests** → Vitest (unit) + Playwright (e2e) + CI déjà prêt
4. **Product Hunt** → Assets + Waitlist + Hunter strategy (doc stratégie)
5. **Observabilité** → Dashboards Grafana/PostHog + Alertes PagerDuty

---

**Tu as tout pour lancer.** Commence par : **Supabase → Stripe → Vercel → Composio → Upstash → Workers**. Le reste suit. 🚀