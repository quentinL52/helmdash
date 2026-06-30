# Document de Passation Technique : AirH Founder OS

Ce document centralise l'architecture, les décisions techniques, les conventions de code et l'état actuel du projet AirH Founder OS. Il sert de point d'entrée pour tout nouvel agent ou développeur reprenant le projet.

## 1. Vision et Architecture Globale

AirH Founder OS est un "Founder OS" hybride qui fusionne un dashboard de gestion (KPIs, finances, GTM) avec un orchestrateur multi-agents IA et une mémoire persistante (type Obsidian).

### Stack Technique (Le "Quoi")
- **Frontend / Fullstack** : Next.js 15 (App Router)
- **Base de données & Backend as a Service** : Supabase (Auth, RLS, Edge Functions, pgvector)
- **ORM** : Prisma
- **State Management** : Zustand (centralisé via `founder-store.ts`)
- **IA & Agents** : Vercel AI SDK, architecture multi-providers (OpenAI, Anthropic, Gemini, Mistral)
- **UI / Design System** : Pixel-art UI (`font-pixel`, `bg-[url('/pixel-overlay.png')]`), Tailwind CSS

### Décisions Architecturales (Le "Pourquoi")
* **Next.js 15 + Supabase** : Permet une architecture robuste, server-rendered, avec une base de données PostgreSQL puissante gérant l'authentification et les politiques de sécurité (RLS) nativement.
* **Prisma vs Supabase Client** : Prisma est utilisé pour son typage fort et sa facilité de migration, complétant Supabase. Cependant, certaines extensions (`pgvector`) nécessitent des requêtes brutes (`$executeRaw`) ou des migrations SQL manuelles car non supportées nativement par Prisma (`Unsupported("vector(3072)")`).
* **Mémoire Vectorielle (pgvector + Mem0)** : L'objectif est d'offrir une "mémoire infinie" (contexte persistant) à l'agent sans surcharger le prompt. Utilisation d'embeddings 3072d.
* **Monorepo (cible)** : L'IP critique (Core IA, Billing, Security) doit être compilée/obfusquée dans des `packages/` séparés, tandis que l'interface UI reste dans `apps/web/` avec une licence de type Source Available (BSL 1.1) pour l'audit et la confiance sans risquer un fork commercial.

## 2. Conventions et Règles d'Implémentation

### Architecture des Agents IA
Le système repose sur un **Agent Central Conversationnel** (`CoreAgent`) qui comprend l'ambition du Founder et délègue les tâches à des sous-agents spécialisés (PM, CFO, Growth, etc.).
* **Registry Pattern** : Les agents (ex: `cfo-agent.ts`, `growth-agent.ts`, `pm-agent.ts`) et outils héritent de classes de base (`base-agent.ts`) et sont enregistrés dans un `registry.ts`.
* **Function Calling** : Les interactions de l'Agent Central avec le Dashboard se font via des outils (`read_dashboard_tab`, `write_dashboard_tab`).

### Sécurité ("Privacy by Design")
* **Chiffrement** : Utilisation de `pgcrypto` pour les colonnes sensibles, et de Supabase Vault pour les clés API (`UserEncryptionKey`).
* **Rate Limiting** : Utilisation d'Upstash (Redis) pour limiter les appels à `/api/ai/chat/stream` afin de prévenir l'épuisement des quotas OpenAI.
* **Prévention Injection SQL** : Validation stricte des `userId` (Regex UUID) avant injection dans les requêtes de recherche vectorielle.

### Modèle de Paiement & Billing Engine
* **Logique SaaS Hosted only** : Pas de version locale gratuite afin d'éviter la complexité d'infrastructure (pgvector, webhooks Stripe) et les abus.
* **Stripe Sync** : Les webhooks (`invoice.payment_succeeded`) doivent synchroniser automatiquement les finances (`MonthlyFinance`, MRR, ARR, Runway).
* **Billing Annuel** : Facturation annuelle privilégiée pour sécuriser la trésorerie et garantir l'engagement à long terme du Founder.

## 3. État Actuel de l'Implémentation

Le projet est estimé à **60% du MVP**. Les fondations (DB, Auth, UI, Store, IA) sont solides, mais manquent de connexions réelles.

### 🟢 Ce qui est terminé et robuste :
- **Dashboard Métier** : 13 onglets implémentés (Hypotheses, Finances, GTM, CRM, etc.).
- **UI/UX** : Thème Pixel-Art, design system fonctionnel.
- **Fondations AI** : `ProviderRegistry` en place, structure du `CoreAgent`, `base-agent.ts` et `registry.ts` créés (branche `feat/semaine-1-2-3-foundation`).

### 🟡 En cours / À modifier :
- **Extraction d'entités en Mémoire** : Actuellement, `extractEntities` fait un appel LLM asynchrone à *chaque* écriture (lent et coûteux). Doit être migré vers une file d'attente asynchrone (BullMQ ou Supabase Edge Functions).
- **Gamification** : 5 des 14 widgets sont liés à la gamification (XP, Quests, etc.), ce qui pollue le signal business. *Décision* : Déplacer la gamification vers un onglet "Progression" dédié, hors du Dashboard par défaut.
- **Onglet GTM** : Actuellement 5 frameworks statiques. Doit être refactorisé en 3 sous-onglets (Stratégie / Exécution / Mesure) pilotés par un Agent GTM.

### 🔴 Bloquants et Prochaines Étapes Immédiates (La "To-Do" prioritaire) :
1. **Remplacer les Mocks par du Réel** : Tous les outils du `CoreAgent` (`read/write_dashboard_tab`, `query/write_memory`, `spawn_sub_agent`) sont actuellement mockés. Il faut implémenter les requêtes Prisma réelles.
2. **Création des Agents Manquants** : Coder `research-agent.ts`, `web-search.ts`, et `sub-agent-queue.ts`.
3. **Sécuriser la Route Chat** : Implémenter Upstash Ratelimit sur `/api/ai/chat/stream`.
4. **Fix Faille SQL Injection** : Valider le format UUID du `userId` dans `vector-store.ts` avant la requête brute.
5. **Intégration Stripe** : Coder les webhooks `invoice.payment_succeeded` pour automatiser les métriques de la page `FinancesPage`.
6. **Migrations Vector** : Écrire la migration SQL native pour activer l'index HNSW de `pgvector`.
7. **CI/CD** : Créer les workflows GitHub Actions manquants (lint, build, types, prisma generate).
