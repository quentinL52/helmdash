# Helmdash — Runbook Pré-Launch

## 1. Variables d'Environnement Requises

```bash
# === Auth ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === Base de données ===
DATABASE_URL=

# === IA Providers ===
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# === Stripe ===
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_STARTER=
NEXT_PUBLIC_STRIPE_PRICE_GROWTH=
NEXT_PUBLIC_STRIPE_PRICE_SCALE=

# === Intégrations ===
COMPOSIO_API_KEY=

# === Monitoring ===
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.postghog.com

# === URLs ===
NEXT_PUBLIC_APP_URL=https://helmdash.app
CRON_SECRET=
```

## 2. Déploiement Vercel

### Production
- **Domaine principal** : `helmdash.app` → marketing (landing page)
- **Sous-domaine app** : `app.helmdash.app` → dashboard

### Commandes
```bash
# Déploiement production
vercel --prod

# Variables d'environnement
vercel env add

# Protection de domaine
vercel domains add helmdash.app
vercel domains add app.helmdash.app
```

## 3. Base de données (Supabase)

### Migrations
```bash
npx prisma migrate deploy
```

### Backup quotidien
- Activé par défaut sur Supabase Pro (point-in-time recovery)
- Backup manuel : Supabase Dashboard → Database → Backups → Trigger backup

### Monitoring DB
- Connection pooling : activé sur Supabase (pgbouncer)
- Alertes CPU > 80% : configurées dans Supabase Dashboard

## 4. Stripe

### Webhook configuration
1. Stripe Dashboard → Webhooks → Add endpoint
2. URL : `https://helmdash.app/api/billing/webhook`
3. Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. Signing secret → `STRIPE_WEBHOOK_SECRET`

### Produits (à créer dans Stripe)
| Plan | Price ID | Montant |
|------|----------|---------|
| Starter | `price_starter_yearly` | 49€/an |
| Growth | `price_growth_yearly` | 199€/an |
| Scale | `price_scale_yearly` | 599€/an |

## 5. Composio

1. Créer un compte sur [app.composio.dev](https://app.composio.dev)
2. Générer une API key → `COMPOSIO_API_KEY`
3. Configurer les OAuth apps dans Composio Dashboard :
   - GitHub, Linear, Notion, Gmail, Slack, Stripe

## 6. Monitoring (Sentry + PostHog)

### Sentry
1. Créer projet Next.js sur [sentry.io](https://sentry.io)
2. Copier le DSN → `SENTRY_DSN`
3. Logger configuré : `src/lib/logging/logger.ts`

### PostHog
1. Créer projet sur [eu.posthog.com](https://eu.posthog.com)
2. API key → `NEXT_PUBLIC_POSTHOG_KEY`
3. Analytics configuré : `src/lib/analytics/posthog.ts`
4. Cookieless, mémoire seule, sans capture auto

## 7. Quotas & Rate Limiting

| Route | Limite | Implémentation |
|-------|--------|----------------|
| `/api/ai/chat/stream` | 30 req/min/user | `withRateLimit` |
| `/api/ai/*` | 100 req/min/user | `withRateLimit` |
| API IA calls | Selon plan (1K-500K/mois) | `plan-limits.ts` |

## 8. Sécurité

- ✅ CSP headers (HD-015)
- ✅ RLS sur toutes les tables (HD-016)
- ✅ API routes protégées par `withAuth`
- ✅ Chiffrement AES-256 pour API keys (BYOK)
- ✅ Audit logs immuables
- ✅ Rate limiting

## 9. Checklist Pré-Lancement

- [ ] Variables d'env configurées sur Vercel
- [ ] Migrations Prisma exécutées
- [ ] Stripe webhook actif
- [ ] Domaines pointés (helmdash.app + app.helmdash.app)
- [ ] Sentry DSN valide
- [ ] PostHog actif
- [ ] Backup Supabase configuré
- [ ] SSL/TLS actif (automatique avec Vercel)
- [ ] Tests CI verts
- [ ] Compte de test Stripe fonctionnel