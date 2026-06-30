# AirH Founder Dashboard — Proposition d'Amélioration Complète
## Vers un "Founder OS" Hybride : Hermes × Paperclip × AirH + Dashboard Moderne

---

## 1. Vision & Positionnement

### 1.1 Problème Actuel
Le dashboard actuel est un **excellent outil de tracking** (KPIs, hypothèses, finances, canvas, veille) mais **manque d'intelligence active**. C'est un "tableau de bord passif" : le founder doit tout saisir, tout analyser, tout décider. Les agents IA existants (8 agents) sont des **one-shot prompts** sans mémoire persistante, sans délégation de sous-agents, sans boucle d'apprentissage.

### 1.2 Vision Cible : "Founder OS" (MVP → Pre-MVP → Scale)
Un **assistant central conversationnel** (onglet Chat/Agent Central) qui :
- **Comprend** les ambitions, contraintes, contexte complet du founder (mémoire type Obsidian)
- **Pilote** les onglets existants (Finance, Hypothèses, GTM, CRM, etc.) comme des "outils" via function calling
- **Délègue** à des sous-agents spécialisés (PM, CFO, Growth, Legal, Tech Lead, Research) selon le besoin
- **Apprend** en continu (mémoire vectorielle + graphe de connaissances) et propose proactivement
- **Facture** 49€/an (7j essai) avec freemium intelligent

### 1.3 Positionnement Marché Unique
| Outil | Force | Manque |
|-------|-------|--------|
| **Notion/Obsidian** | Mémoire, écriture | Pas d'IA active, pas de data business |
| **Linear/Jira** | Exécution dev | Pas vision/business, pas IA |
| **Baremetrics/ProfitWell** | Finances SaaS | Pas stratégie, pas IA, cher |
| **ChatGPT/Claude** | IA générale | Pas de contexte persistant, pas d'outils métier |
| **Hermes Agent** | Orchestration multi-agents, skills, mémoire | Pas UI founder, pas business data |
| **Paperclip** | Content, distribution | Pas dashboard, pas finances |

**→ AirH Founder OS = Le seul outil qui fusionne : Dashboard Business + Mémoire Obsidian + Orchestration Multi-Agents (Hermes) + Distribution (Paperclip) + Billing SaaS**

---

## 2. Audit des Onglets Actuels & Améliorations Prioritaires

### 2.1 Dashboard (Hub Central) — ⭐⭐⭐⭐☆
**État :** Widgets configurables, DnD, 14 widgets dont 5 gamification.
**Problèmes :** Gamification trop visible (XP, Streak, Quests, Achievements, Founder Score = 5/14 widgets). Pixel art sympa mais bruit signal.
**Actions :**
- **Supprimer** : XPProgress, Streak, Quests, Achievements, FounderScore du dashboard principal
- **Conserver** : PixelMoodDisplay (motivation visuelle), MVPCountdown, Runway, Hypotheses, GTM, AgentsHub, Calendar, WeeklyBrief, QuickActions
- **Ajouter** : Widget "Agent Central Status" (état de l'agent principal, dernier insight, action recommandée)
- **Ajouter** : Widget "Knowledge Graph Preview" (3-5 nœuds récents de la mémoire)

### 2.2 Hypothèses (Lean Startup) — ⭐⭐⭐⭐☆
**État :** Board Kanban Build-Measure-Learn, liste, catégories, risque, pivot tracking. Solide.
**Problèmes :** Pas d'agent de recherche auto, pas de suggestion de test, pas de lien vers data externe.
**Actions :**
- **Agent "Hypothesis Researcher"** : quand hypothèse en `draft` → recherche web (Composio/SerpAPI), propose `testMethod`, `successCriteria`, `cost`, `deadline`
- **Agent "Hypothesis Validator"** : quand `testing` → surveille data (Stripe, GA, Mixpanel via webhook), alerte si `successCriteria` atteint
- **Lier** hypothèses → OKRs → Roadmap → Finance (coût test vs budget)

### 2.3 Finances — ⭐⭐☆☆☆ **CRITIQUE**
**État :** Saisie manuelle, runway chart, KPIs basiques, dépenses récurrentes. Pas de Stripe/Plaid, pas de prévisionnel, pas de scenario planning.
**Problèmes :** "Bancal" — pas de sync temps réel, pas de categorisation auto, pas d'alertes intelligentes, pas de TVA/compta.
**Actions Prioritaires (P0) :**
| Fonctionnalité | Implémentation |
|---|---|
| **Stripe Sync** | Webhook `invoice.payment_succeeded`, `customer.subscription.updated` → auto-revenus MRR/ARR |
| **Plaid/Bank Sync** (EU: GoCardless/Budget Insight) | Dépenses auto-catégorisées (IA) |
| **Prévisionnel IA** | Agent CFO : Monte Carlo sur runway, scénarios best/base/worst |
| **Alertes intelligentes** | "Burn rate ↑ 20% vs mois dernier", "Runway < 3 mois", "MRR churn > 5%" |
| **Export comptable** | CSV Pennylane/QuickBooks/Xero, TVA auto |
| **Budget par projet** | Lier dépenses → Roadmap items → OKRs |

### 2.4 Lean Canvas — ⭐⭐⭐☆☆
**État :** 9 cases, snapshots, export PDF. Basique mais fonctionnel.
**Actions :**
- **Agent "Canvas Optimizer"** : analyse complétude, suggère formulations (via founder profile + benchmarks), détecte contradictions (ex: Problem vs Solution mismatch)
- **Versioning sémantique** : diff visuel entre snapshots, tag "pivot", "refinement"
- **Export Notion/Linear** : crée épics/user stories automatiquement

### 2.5 Roadmap — ⭐⭐⭐☆☆
**État :** Items avec statut, priorité, semaine, dates. Manque : dépendances, estimation, capacity planning.
**Actions :**
- **Agent "PM Agent"** : décompose objectif → épics → tasks, estime (points), propose sprint planning
- **Intégration Linear/GitHub** : sync bi-directionnel (Composio)
- **Dépendances visuelles** : graphe DAG, chemin critique

### 2.6 Go-To-Market — ⭐⭐☆☆☆ **BROUILLON**
**État :** 5 frameworks dans des cartes (StoryBrand, Obviously Awesome, 1-Page, Cold Start, Build in Public). Saisie libre, pas d'exécution, pas de tracking.
**Refonte Complète (P0) :**
```
┌─────────────────────────────────────────────────────────────┐
│  GTM OS — 3 VUES LIÉES                                       │
├──────────────┬──────────────────┬────────────────────────────┤
│  STRATÉGIE   │  EXÉCUTION       │  MESURE                    │
│  (Frameworks)│  (Playbooks)     │  (KPIs & Attribution)      │
├──────────────┼──────────────────┼────────────────────────────┤
│ • Positioning│ • Content Cal.   │ • Funnel: Visiteur→Lead→   │
│ • ICP/Persona│   (agent Content)│   Trial→Paid               │
│ • Pricing    │ • Outbound Seq.  │ • CAC/LTV par canal        │
│ • Channels   │   (agent Growth) │ • Attribution UTM/Ref      │
│ • Messaging  │ • Launch Plan    │ • Cohort Analysis          │
│ • Narrative  │   (agent Launch) │ • Payback Period           │
└──────────────┴──────────────────┴────────────────────────────┘
```
- **Agent "GTM Strategist"** : remplit frameworks via interview conversationnelle
- **Agent "Content Creator"** : génère posts/articles depuis `goToMarket` + `leanCanvas` + `founderProfile.writingStyle`
- **Agent "Growth Operator"** : lance séquences outbound (Composio → Apollo/LinkedIn/Email), track réponses
- **Agent "Launch Coordinator"** : checklist pre-launch, coordonne Product Hunt, newsletters, communities

### 2.7 Veille Stratégique (Competitive Watch) — ⭐⭐⭐⭐☆
**État :** Radar charts, SWOT, Feature Matrix, Market Signals, Scenarios, Intelligence IA. Très complet.
**Actions :**
- **Agent "Competitive Intel"** : monitoring auto (webhooks RSS, Google Alerts API, Twitter API via Composio), enrichit `MarketSignal`, met à jour `Competitor` scores
- **Alertes proactives** : "Competitor X launched feature Y → menace pour ton USP Z"
- **Benchmark pricing auto** : scraping pricing pages (Playwright/Composio)

### 2.8 CRM Lite — ⭐⭐⭐☆☆
**État :** Contacts, statuts, next actions, tags. Basique.
**Actions :**
- **Enrichissement auto** (Composio → Apollo, Clearbit, LinkedIn)
- **Pipeline Kanban** visuel
- **Agent "Relationship Manager"** : suggère relances, détecte signaux d'achat, draft emails

### 2.9 Journal — ⭐⭐⭐☆☆
**État :** Entrées quotidiennes, humeur, tags, blockers. Bien pour la santé mentale.
**Actions :**
- **Agent "Founder Coach"** : analyse patterns humeur/blockers → insights hebdo
- **Lien bidirectionnel** : journal entry ↔ hypothèse ↔ décision ↔ OKR

### 2.10 Whiteboard — ⭐⭐⭐☆☆
**État :** Excalidraw-like, persistence. Utile pour architecture, mindmaps.
**Actions :**
- **Agent "Diagram Generator"** : "dessine mon archi technique" → génère Mermaid → rend dans whiteboard
- **Export vers spécifications** (Linear/GitHub issues)

### 2.11 Content Pipeline — ⭐⭐⭐☆☆
**État :** Idées, statuts, canaux, calendrier. Manque génération IA.
**Actions :** Fusion avec GTM Content Calendar + Agent Content Creator

### 2.12 Routine — ⭐⭐⭐☆☆
**État :** Tâches hebdo par jour, history, completion rate. Bien.
**Actions :** Agent "Routine Optimizer" : analyse completion → suggère ajustements

### 2.13 Settings — ⭐⭐⭐⭐☆
**État :** AI Providers (4), Models, API Keys, Founder Profile, GTM Strategy, Plan Tier, Language. Complet.
**Manque :** Billing portal (Stripe), API Keys rotation, Audit logs, Webhook config, Team invites (future)

---

## 3. Architecture Cible : "Founder OS" — 3 Piliers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FOUNDER OS (AirH Dashboard)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │   PIER 1 : UI    │  │   PIER 2 :       │  │   PIER 3 : INFRA &       │  │
│  │   DASHBOARD      │  │   AGENT OS       │  │   INTEGRATIONS           │  │
│  │   (React/Next)   │  │   (Hermes-based) │  │   (Composio + APIs)      │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────────────┤  │
│  │ • Onglets métier │  │ • Agent Central  │  │ • Composio (100+ tools)  │  │
│  │ • Widgets        │  │   (Chat + Voice) │  │ • Stripe (Billing)       │  │
│  │ • Pixel Art Mood │  │ • Sub-Agents Pool│  │ • Plaid/GoCardless       │  │
│  │ • Responsive     │  │   (PM, CFO,      │  │ • Linear/GitHub/Notion   │  │
│  │ • Dark/Light     │  │    Growth, Legal,│  │ • Supabase (Auth/DB)     │  │
│  │ • i18n FR/EN     │  │    Research)     │  │ • Prisma (ORM)           │  │
│  │ • PWA/Offline    │  │ • Memory: Vector │  │ • Vercel/Edge            │  │
│  │ • Accessibility  │  │   + Graph (Mem0) │  │ • Sentry/Logtail         │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│                                                                             │
│                    ┌────────────────────────────────────┐                   │
│                    │         SECURITY LAYER             │                   │
│                    │  • Chiffrement AES-256 (clés user) │                   │
│                    │  • API Keys: Vault (Supabase Vault)│                   │
│                    │  • Audit Logs immuables            │                   │
│                    │  • Rate limiting / WAF             │                   │
│                    │  • RGPD/Export/Delete              │                   │
│                    └────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Agent Central + Sous-Agents : Spécification Détaillée

### 4.1 Agent Central ("Founder OS Core") — L'Orchestrateur
**Rôle :** Interface conversationnelle unique, mémoire persistante, router vers sous-agents.

```typescript
// src/lib/agents/core-agent.ts
interface FounderOSCoreAgent {
  // Identité & Mémoire
  founderProfile: FounderProfile;           // Depuis store + mémoire vectorielle
  businessContext: BusinessContext;         // Lean Canvas, GTM, Finances, OKRs
  memory: ObsidianMemory;                   // Vector store + Knowledge Graph
  
  // Capacités
  chat(message: ChatMessage): Promise<AgentResponse>;
  executeTool(tool: ToolCall): Promise<ToolResult>;
  delegateToSubAgent(task: SubAgentTask): Promise<SubAgentResult>;
  proactivelyInspect(): Promise<ProactiveInsight[]>;
  
  // Outils natifs (Function Calling)
  tools: [
    'read_dashboard_tab',      // Lit n'importe quel onglet (Finance, Hypotheses, etc.)
    'write_dashboard_tab',     // Écrit/Met à jour (nouvelle hypothèse, entrée finance, etc.)
    'query_memory',            // Recherche sémantique dans mémoire
    'write_memory',            // Ajoute note, lien, entité dans mémoire
    'spawn_sub_agent',         // Délègue à sous-agent spécialisé
    'schedule_recurring',      // Cron job interne (revue hebdo, sync Stripe)
    'trigger_webhook',         // Appel externe (Composio, n8n, Make)
    'generate_report',         // PDF/Notion/Linear export
  ];
}
```

### 4.2 Mémoire Type Obsidian (Vector + Graph)
```typescript
// src/lib/memory/obsidian-memory.ts
interface ObsidianMemory {
  // Vector Store (Mem0 / Pinecone / pgvector)
  vectorStore: VectorStore;           // Embeddings (text-embedding-3-large)
  
  // Knowledge Graph (entities + relations)
  graph: KnowledgeGraph;              // Nœuds: Concept, Personne, Projet, Décision, Insight
                                      // Arêtes: RELATES_TO, CAUSED_BY, PART_OF, CONTRADICTS
  
  // Opérations
  upsertNote(note: MemoryNote): Promise<void>;
  search(query: string, opts?: SearchOpts): Promise<MemoryNote[]>;
  getGraphNeighbors(nodeId: string, depth?: number): Promise<GraphNode[]>;
  extractEntities(text: string): Promise<Entity[]>;
  buildContextWindow(topic: string, maxTokens: number): Promise<string>;
}

interface MemoryNote {
  id: string;
  content: string;           // Markdown
  type: 'journal' | 'decision' | 'insight' | 'meeting' | 'research' | 'template';
  tags: string[];
  links: string[];           // [[wikilinks]] vers autres notes
  entities: Entity[];        // Auto-extrait
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
  source: 'user' | 'agent' | 'import' | 'webhook';
}
```

### 4.3 Pool de Sous-Agents Spécialisés
| Agent | Rôle | Outils Spécifiques | Déclencheur |
|-------|------|-------------------|-------------|
| **PM Agent** | Product Management | `read/write_roadmap`, `create_linear_issues`, `decompose_epic`, `estimate_effort` | "Planifie le dev de X", "Crée les specs pour Y" |
| **CFO Agent** | Finance & Strategy | `read/write_finance`, `stripe_sync`, `forecast_runway`, `scenario_modeling`, `tax_estimate` | "Combien de runway ?", "Simule un hire à 60k" |
| **Growth Agent** | Acquisition & Rétention | `read/write_gtm`, `launch_outbound`, `content_calendar`, `analyze_funnel`, `ab_test_design` | "Lance une campagne LinkedIn", "Optimise mon pricing" |
| **Legal/Compliance Agent** | Juridique & RGPD | `generate_terms`, `privacy_policy`, `dpa`, `contract_review`, `compliance_checklist` | "Rédige mes CGV", "Check RGPD" |
| **Tech Lead Agent** | Architecture & Code | `read/write_whiteboard`, `generate_mermaid`, `create_github_issues`, `code_review`, `arch_decision_record` | "Conçois l'archi pour mon MVP", "Review ce PR" |
| **Research Agent** | Veille & Validation | `web_search`, `deep_research`, `competitor_analysis`, `market_sizing`, `validate_hypothesis` | "Valide mon hypothèse prix", "Analyse le marché X" |
| **Content Agent** | Création Contenu | `generate_post`, `write_article`, `newsletter_draft`, `repurpose_content`, `schedule_social` | "Écrit un post LinkedIn", "Newsletter hebdo" |
| **Recruiting Agent** | RH & Équipe | `write_job_desc`, `screen_cv`, `interview_guide`, `comp_benchmark`, `onboarding_plan` | "J'embauche un dev", "Grille de salaire" |

### 4.4 Mécanisme de Délégation (Hermes-style)
```typescript
// src/lib/agents/delegation.ts
interface SubAgentTask {
  agentId: SubAgentId;
  objective: string;                    // But clair, mesurable
  context: AgentContext;                // Sous-ensemble mémoire pertinent
  constraints: Constraint[];            // Budget, délai, outils autorisés
  successCriteria: string[];            // "Livre un plan de sprint avec 8 tickets estimatés"
  maxIterations: number;                // Default 3
  requireApproval: boolean;             // True si impact financier/juridique
}

interface SubAgentResult {
  status: 'success' | 'partial' | 'failed' | 'needs_approval';
  deliverables: Deliverable[];          // Fichiers, mises à jour dashboard, docs
  insights: string[];                   // Apprentissages pour mémoire centrale
  nextSteps: SubAgentTask[];            // Sous-tâches suggérées
  tokensUsed: number;
  costUsd: number;
}
```

### 4.5 Boucle Proactive (Background)
```typescript
// Cron jobs internes (via Hermes cron ou Vercel Cron)
const proactiveLoops = [
  { id: 'daily_brief', schedule: '0 7 * * *', agent: 'core', task: 'generate_daily_brief' },
  { id: 'weekly_review', schedule: '0 9 * * 1', agent: 'core', task: 'weekly_strategic_review' },
  { id: 'finance_sync', schedule: '0 */6 * * *', agent: 'cfo', task: 'sync_stripe_and_forecast' },
  { id: 'competitive_watch', schedule: '0 */4 * * *', agent: 'research', task: 'scan_competitors' },
  { id: 'hypothesis_check', schedule: '0 10 * * *', agent: 'research', task: 'check_hypothesis_deadlines' },
  { id: 'runway_alert', schedule: '0 9 * * *', agent: 'cfo', task: 'check_runway_thresholds' },
];
```

---

## 5. Intégrations API & Composio — Architecture

### 5.1 Composio comme Couche d'Unification (100+ outils)
```typescript
// src/lib/integrations/composio-client.ts
import { Composio } from '@composio/core';

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });

// Connexions pré-configurées par utilisateur (OAuth via Composio)
const AVAILABLE_TOOLS = {
  // Dev & PM
  'github': ['create_issue', 'create_pr', 'list_repos', 'read_file', 'write_file'],
  'gitlab': ['create_issue', 'create_mr'],
  'linear': ['create_issue', 'update_issue', 'list_issues', 'create_project'],
  'jira': ['create_issue', 'transition_issue'],
  'notion': ['create_page', 'update_page', 'query_database', 'search'],
  
  // Finance & Billing
  'stripe': ['list_customers', 'list_subscriptions', 'create_invoice', 'retrieve_balance'],
  'plaid': ['get_transactions', 'get_accounts'], // US
  'gocardless': ['get_transactions', 'get_accounts'], // EU
  'pennylane': ['create_invoice', 'get_accounts'], // FR Compta
  
  // Sales & Marketing
  'apollo': ['search_contacts', 'enrich_company', 'create_sequence'],
  'linkedin': ['send_message', 'get_profile', 'search_people'],
  'hubspot': ['create_contact', 'create_deal', 'list_deals'],
  'instantly': ['create_campaign', 'add_leads'],
  'mailgun': ['send_email', 'validate_email'],
  
  // Data & Analytics
  'google_analytics': ['run_report', 'get_realtime'],
  'mixpanel': ['query', 'track_event'],
  'posthog': ['query', 'capture'],
  
  // Communication
  'slack': ['send_message', 'create_channel', 'list_channels'],
  'discord': ['send_message'],
  'gmail': ['send_email', 'list_messages', 'create_draft'],
  
  // Research
  'serpapi': ['search', 'search_news'],
  'firecrawl': ['scrape', 'crawl'],
  'exa': ['search', 'deep_research'],
  
  // Design & Docs
  'figma': ['get_file', 'get_components'],
  'excalidraw': ['create_drawing', 'export_image'],
};

// Helper pour l'agent
async function executeComposioTool(toolName: string, params: any, userId: string) {
  const connection = await getUserConnection(userId, toolName.split('_')[0]);
  return composio.tools.execute(toolName, params, { connectionId: connection.id });
}
```

### 5.2 Providers IA — Abstraction Unifiée (Existant + Étendu)
```typescript
// src/lib/ai/provider-registry.ts (Extension)
export const SUPPORTED_PROVIDERS = {
  // Existants
  'openai': { models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'], supports: ['tools', 'vision', 'reasoning'] },
  'anthropic': { models: ['claude-sonnet-4', 'claude-opus-4', 'claude-haiku-3.5'], supports: ['tools', 'vision', 'cache'] },
  'gemini': { models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'], supports: ['tools', 'vision', 'long-context'] },
  'mistral': { models: ['mistral-large', 'mistral-medium', 'codestral'], supports: ['tools', 'vision'] },
  
  // Nouveaux pour spécialisation
  'groq': { models: ['llama-3.3-70b', 'mixtral-8x7b'], supports: ['tools', 'speed'], useCase: 'fast-subagents' },
  'together': { models: ['llama-3.1-405b', 'qwen-2.5-72b'], supports: ['tools', 'cost-efficient'], useCase: 'batch-research' },
  'openrouter': { models: ['*'], supports: ['tools', 'fallback'], useCase: 'model-router' },
  'ollama': { models: ['llama3.2', 'nemotron3-ultra'], supports: ['local', 'privacy'], useCase: 'sensitive-data' },
};

// Router intelligent par tâche
function selectModel(task: AgentTask): { provider: string; model: string } {
  const routing = {
    'reasoning-heavy': { provider: 'openai', model: 'o1-preview' },
    'coding': { provider: 'anthropic', model: 'claude-sonnet-4' },
    'fast-chat': { provider: 'groq', model: 'llama-3.3-70b' },
    'long-context': { provider: 'gemini', model: 'gemini-1.5-pro' },
    'cost-sensitive': { provider: 'together', model: 'llama-3.1-405b' },
    'local-only': { provider: 'ollama', model: 'nemotron3-ultra' },
  };
  return routing[task.complexity] || { provider: 'openai', model: 'gpt-4o' };
}
```

### 5.3 Hermes Agent Integration
```typescript
// src/lib/agents/hermes-bridge.ts
import { HermesAgent } from '@hermes/agent'; // Hypothetical SDK

class HermesBridge {
  private hermes: HermesAgent;
  
  async initialize(userId: string, config: UserConfig) {
    this.hermes = new HermesAgent({
      // Config Hermes
      skills: ['github', 'linear', 'notion', 'web-search', 'code-execution', 'file-ops'],
      mcpServers: config.mcpServers, // User-defined MCP servers
      memory: {
        provider: 'mem0',
        apiKey: config.mem0ApiKey,
        userId,
      },
      tools: {
        // Expose dashboard tools as Hermes skills
        'read_dashboard': this.createDashboardReader(),
        'write_dashboard': this.createDashboardWriter(),
        'spawn_subagent': this.createSubAgentSpawner(),
      },
    });
  }
  
  // Permet à l'agent central d'utiliser l'orchestration Hermes
  async delegateToHermes(task: string, context: any) {
    return this.hermes.run({ task, context, maxSteps: 10 });
  }
}
```

---

## 6. Sécurité — Architecture "Privacy by Design"

### 6.1 Chiffrement & Gestion des Secrets
| Donnée | Stockage | Chiffrement | Rotation |
|--------|----------|-------------|----------|
| **API Keys IA** (OpenAI, Anthropic, etc.) | Supabase Vault | AES-256-GCM (clé dérivée user + pepper serveur) | Rotation manuelle + alerte 90j |
| **Composio OAuth Tokens** | Supabase Vault | AES-256-GCM | Auto-refresh via Composio |
| **Stripe Keys** | Supabase Vault + Stripe Dashboard | Standard Stripe | Via Stripe CLI |
| **Données Business** (Finance, CRM, Journal) | PostgreSQL (Supabase) | **Chiffrement au niveau colonne** (pgcrypto) pour champs sensibles | N/A |
| **Mémoire Vectorielle** | pgvector / Pinecone | Chiffrement au repos (provider) + TLS transit | N/A |
| **Logs d'Audit** | Table `audit_logs` (append-only) | Hash SHA-256 chaîné (immutabilité) | Rétention 7 ans |

### 6.2 Modèle de Sécurité Détaillé
```sql
-- Schéma Supabase sécurisé
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clé de chiffrement par utilisateur (dérivée via PBKDF2)
CREATE TABLE user_encryption_keys (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  key_hash TEXT NOT NULL,           -- Argon2id hash de la master key
  salt BYTEA NOT NULL,
  version INT DEFAULT 1,
  rotated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemple : Table finances avec colonnes chiffrées
CREATE TABLE finance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  month TEXT NOT NULL,
  -- Colonnes sensibles chiffrées côté application
  revenue_encrypted BYTEA,           -- pgp_sym_encrypt(revenue::text, user_key)
  expenses_encrypted BYTEA,          -- JSON chiffré
  notes_encrypted BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche sans déchiffrer (hash deterministe)
CREATE INDEX idx_finance_user_month ON finance_entries(user_id, month);

-- Audit Log immuable
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,              -- 'read_finance', 'write_api_key', 'spawn_agent', etc.
  resource_type TEXT,                -- 'finance', 'api_key', 'agent', 'memory'
  resource_id TEXT,
  ip_hash BYTEA,                     -- hash(ip + salt)
  user_agent_hash BYTEA,
  metadata JSONB,                    -- Non sensible
  prev_hash BYTEA,                   -- Chaînage hash (blockchain-like)
  hash BYTEA NOT NULL,               -- SHA256(action + resource + timestamp + prev_hash)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user_time ON audit_logs(user_id, created_at DESC);
```

### 6.3 Politiques de Sécurité Applicatives
```typescript
// src/lib/security/policies.ts
export const SECURITY_POLICIES = {
  // Rate limiting par utilisateur
  rateLimits: {
    'agent_chat': { requests: 30, window: '1m' },
    'agent_tool_call': { requests: 100, window: '1m' },
    'api_key_rotation': { requests: 5, window: '1h' },
    'data_export': { requests: 3, window: '1h' },
  },
  
  // Permissions par plan
  planLimits: {
    free: { agents: 1, subAgents: 0, memoryMb: 10, apiCalls: 1000/month, integrations: 3 },
    starter: { agents: 3, subAgents: 2, memoryMb: 100, apiCalls: 50000/month, integrations: 10 },
    growth: { agents: 10, subAgents: 5, memoryMb: 1000, apiCalls: 500000/month, integrations: 50 },
    scale: { agents: -1, subAgents: -1, memoryMb: -1, apiCalls: -1, integrations: -1 },
  },
  
  // Actions nécessitant confirmation explicite (MFA/Email)
  requireExplicitConsent: [
    'delete_account',
    'rotate_api_keys',
    'export_all_data',
    'spend_money',           // Stripe charge, API paid calls
    'send_external_communication', // Email, Slack, LinkedIn
    'modify_legal_docs',
    'hire_fire_team_member',
  ],
  
  // Data Retention
  retention: {
    auditLogs: '7 years',
    agentConversations: '2 years', // Configurable par user
    memoryNotes: 'indefinite',     // User-controlled
    webhookPayloads: '30 days',
    stripeEvents: '7 years',       // Comptabilité
  },
};
```

### 6.4 Conformité RGPD / SOC2 Ready
- **DPO** : Désigné (fondateur ou externalisé)
- **DPIA** : Réalisée pour traitement IA (profilage, décisions automatisées)
- **Registre des traitements** : Documenté
- **Droits utilisateur** : Export (JSON/Markdown), Suppression (cascade + vault), Rectification, Portabilité
- **Sous-traitants** : DPA signés avec Supabase, Vercel, Composio, OpenAI, Anthropic, Mem0
- **Hébergement** : EU (Paris/Frankfurt) pour données perso, US optionnel pour IA (consentement explicite)

---

## 7. Modèle Économique & Pricing

### 7.1 Structure Tarifaire (Annuelle - 49€/an = ~4€/mois)

| Plan | Prix | Cible | Inclus | Limites |
|------|------|-------|--------|---------|
| **Free** | 0€ | Découverte | Dashboard de base (5 onglets), 1 agent central, 3 intégrations, 10MB mémoire, 1k appels IA/mois | Pas de sous-agents, pas Stripe sync, pas export, pas webhooks |
| **Starter** | **49€/an** (7j essai) | Solo Founder Pre-MVP | **Tout Free +** Agent Central complet, 3 sous-agents, Stripe sync, 100MB mémoire, 50k appels IA, 10 intégrations, Export PDF/Notion, Email support | 1 user, pas team |
| **Growth** | 199€/an | Startup Seed (2-10) | **Tout Starter +** 10 sous-agents, 1GB mémoire, 500k appels, 50 intégrations, Team seats (3), SSO, Audit logs, Webhooks, Priority support | 3 seats inclus |
| **Scale** | 599€/an | Series A+ | **Tout Growth +** Unlimited, 10 seats, Custom MCP servers, On-prem option, Dedicated success, SLA 99.9%, Custom contracts | Unlimited |

### 7.2 Stratégie "Reverse Trial" (14 jours)
```
Jour 0    : Inscription → Accès complet **Growth** (pas de CB)
Jour 1-10 : Onboarding guidé (email série + in-app) → "Aha moments" ciblés
Jour 11   : Email "Votre essai se termine dans 3 jours — Choisissez votre plan"
Jour 14   : Downgrade auto vers **Starter** (49€/an) si CB enregistrée, sinon **Free**
Jour 15+  : Relance "Revenez sur Growth" si usage élevé détecté
```

### 7.3 Métriques de Santé Business
| KPI | Cible Starter | Cible Growth |
|-----|---------------|--------------|
| **Trial → Paid** | 15% | 25% |
| **Monthly Churn** | < 5% | < 3% |
| **NRR (Net Revenue Retention)** | > 100% | > 120% |
| **CAC** | < 30€ | < 100€ |
| **LTV** | > 150€ | > 800€ |
| **Payback Period** | < 3 mois | < 6 mois |

### 7.4 Stack Billing (Stripe)
```typescript
// src/lib/billing/stripe-config.ts
const STRIPE_PRODUCTS = {
  starter: { priceId: 'price_starter_yearly', amount: 4900, currency: 'eur', interval: 'year' },
  growth: { priceId: 'price_growth_yearly', amount: 19900, currency: 'eur', interval: 'year' },
  scale: { priceId: 'price_scale_yearly', amount: 59900, currency: 'eur', interval: 'year' },
};

// Webhooks critiques
const CRITICAL_WEBHOOKS = [
  'checkout.session.completed',      // Provision access
  'customer.subscription.updated',   // Plan change
  'customer.subscription.deleted',   // Downgrade to Free
  'invoice.payment_failed',          // Dunning (3 tentatives + emails)
  'invoice.payment_succeeded',       // Reactivate
];
```

---

## 8. Feuille de Route d'Implémentation (Phasée)

### Phase 0 : Fondations (Semaines 1-2) — **EN COURS / PRÉREQUIS**
- [x] Dashboard tabs, store Zustand, Supabase Auth/DB, Gamification
- [x] Agent Orchestrator (8 agents), Provider Registry (4 providers)
- [x] Finances basiques, Hypothèses, GTM (frameworks), Veille, CRM, Journal
- [ ] **Critique** : Migrer `localStorage` Zustand → **Supabase (persistance cross-device)**
- [ ] **Critique** : Chiffrement colonnes sensibles (pgcrypto) + Vault pour API Keys
- [ ] **Critique** : Audit Logs immuables + RLS policies strictes

### Phase 1 : Agent Central & Mémoire (Semaines 3-6) — **CORE MVP**
| Semaine | Livrable | Critères de Succès |
|---------|----------|-------------------|
| 3 | **Onglet "Agent Central" (Chat UI)** | Interface type ChatGPT/Claude dans dashboard, streaming, history, markdown, code blocks |
| 3 | **Memory Vector Store (pgvector + Mem0)** | `query_memory` / `write_memory` fonctionnels, recherche sémantique < 500ms |
| 4 | **Knowledge Graph (Entités + Relations)** | Auto-extraction entités depuis journal/notes, graphe visualisable (Cytoscape/React Flow) |
| 4 | **Function Calling → Dashboard Tools** | Agent lit/écrit : Hypothèses, Finances, Canvas, Roadmap, GTM, CRM, Journal |
| 5 | **Sub-Agent Spawning (PM, CFO, Growth)** | `spawn_sub_agent` tool → délégation asynchrone, résultats dans chat + dashboard |
| 5 | **Proactive Loops (Cron)** | Daily brief 7h, Weekly review Lun 9h, Finance sync 6h, Competitive watch 4h |
| 6 | **Founder Profile → Personnalisation** | Writing style, niche, LinkedIn → agents adaptent ton, vocabulaire, exemples |

### Phase 2 : Intégrations & Automatisation (Semaines 7-10)
| Semaine | Livrable | Critères de Succès |
|---------|----------|-------------------|
| 7 | **Composio Integration** | OAuth flow pour GitHub, Linear, Notion, Stripe, Apollo, Gmail, Slack — 10 outils |
| 7 | **Stripe Sync Temps Réel** | Webhook → MRR/ARR auto, Runway recalculé, Alertes email/in-app |
| 8 | **PM Agent + Linear/GitHub** | "Planifie le dev de X" → Crée épics + issues + estimates dans Linear |
| 8 | **CFO Agent + Forecasting** | Monte Carlo runway, scénarios hire/spend, export Pennylane |
| 9 | **Growth Agent + Outbound/Content** | Séquence Apollo + posts LinkedIn + newsletter depuis GTM + Canvas |
| 9 | **Research Agent + Deep Research** | Validation hypothèse → rapport structuré (web + composio SerpAPI/Exa) |
| 10 | **Legal Agent** | Génère CGV, Privacy Policy, DPA, contrat freelance — revue par avocat optionnel |

### Phase 3 : Polish, Billing, Launch (Semaines 11-14)
| Semaine | Livrable | Critères de Succès |
|---------|----------|-------------------|
| 11 | **Stripe Billing Portal** | Self-serve upgrade/downgrade, factures, annulation, méthode paiement |
| 11 | **Reverse Trial Logic** | 14j Growth → auto Starter (49€/an) ou Free, emails automatisés |
| 12 | **Security Hardening** | Pen test (crowdsourced), RLS audit, Chiffrement vérifié, Rate limits, CSP |
| 12 | **Observabilité** | Sentry (erreurs), Logtail (logs), PostHog (analytics), Checkly (uptime) |
| 13 | **Documentation & Onboarding** | Interactive tour, Video demos, Templates (SaaS, Marketplace, Agency, Newsletter) |
| 13 | **Launch Prep** | Product Hunt assets, Press kit, Waitlist > 500, 10 beta testimonials |
| 14 | **LAUNCH 🚀** | Product Hunt + Twitter/LinkedIn + Newsletter + Communities |

### Phase 4 : Post-Launch & Scale (Mois 2-6)
- Team workspaces (invites, roles, shared memory)
- Custom MCP servers (user-deployed)
- Marketplace de skills/agents communautaires
- White-label pour incubateurs/accélérateurs
- API publique pour builders
- Mobile app (React Native / Expo)

---

## 9. Stack Technique Détaillée & Décisions d'Architecture

### 9.1 Choix Techniques Validés
| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript | RSC, Streaming, Server Actions, Performance |
| **Styling** | Tailwind CSS + Radix UI + shadcn/ui | Design system cohérent, accessible, customisable |
| **State Client** | Zustand (persist: Supabase) | Simple, performant, SSR-friendly |
| **State Server** | Supabase (PostgreSQL + Auth + Realtime + Storage + Vault + Edge Functions) | BaaS complet, EU hosting, DX excellente |
| **ORM** | Prisma | Type-safe, migrations, bon DX |
| **Vector DB** | pgvector (Supabase) + Mem0 (cloud) | Hybride : local pour vitesse/privacy, cloud pour scale |
| **Graph DB** | PostgreSQL (recursive CTEs) + Apache AGE (extension) | Pas de DB externe, SQL natif |
| **IA Orchestration** | **Hermes Agent** (skills, memory, delegation) + Custom Orchestrator | Réutilise l'existant, extensible |
| **IA Providers** | OpenAI, Anthropic, Gemini, Mistral, Groq, Together, OpenRouter, Ollama | Multi-provider, fallback, cost optimization |
| **Intégrations** | **Composio** (100+ outils OAuth) + Webhooks directs | Unified API, managed auth, scalable |
| **Billing** | Stripe (Subscriptions + Portal + Webhooks) | Standard marché, gère TVA, dunning, taxes |
| **Email** | Resend (transactionnel) + Loops (marketing/drip) | DX, deliverability, segments |
| **Observabilité** | Sentry + Logtail + PostHog + Checkly | Full stack visibility |
| **Déploiement** | Vercel (Frontend/Edge) + Supabase (DB/Auth) | Zero-ops, scale auto, preview deployments |
| **CI/CD** | GitHub Actions (lint, typecheck, test, build, deploy) | Standard, gratuit pour public |

### 9.2 Structure de Projet Cible
```
airhfounderdashboard/
├── .github/workflows/           # CI/CD
├── prisma/
│   ├── schema.prisma            # Modèles complets (User, Workspace, Agent, Memory, etc.)
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login, Register, Callback, Password Reset
│   │   ├── (app)/               # Dashboard protégé (middleware auth)
│   │   │   ├── agent/           # 🆕 ONGLET AGENT CENTRAL (Chat + Memory + Sub-agents)
│   │   │   ├── dashboard/       # Widgets (refactor: moins gamification)
│   │   │   ├── hypotheses/      # Existant + Agent Research
│   │   │   ├── finances/        # Refactor: Stripe sync, CFO Agent, Forecasting
│   │   │   ├── lean-canvas/     # Existant + Canvas Optimizer
│   │   │   ├── roadmap/         # + PM Agent, Linear sync
│   │   │   ├── routine/         # Existant
│   │   │   ├── competitive-watch/ # + Competitive Intel Agent
│   │   │   ├── whiteboard/      # + Diagram Generator
│   │   │   ├── content/         # Fusion GTM Content + Content Agent
│   │   │   ├── go-to-market/    # 🆕 REFACTOR COMPLET (Stratégie/Exécution/Mesure)
│   │   │   ├── crm/             # + Enrichment, Pipeline, Relationship Agent
│   │   │   ├── journal/         # + Coach Agent insights
│   │   │   ├── settings/        # + Billing Portal, API Keys, Team, Security
│   │   │   └── memory/          # 🆕 Onglet Mémoire (Graph + Vector Search + Notes)
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── agents/      # Agent endpoints (core + sub-agents)
│   │   │   │   ├── chat/        # Streaming chat completion
│   │   │   │   ├── memory/      # Vector search, graph ops
│   │   │   │   └── tools/       # Function calling implementations
│   │   │   ├── integrations/
│   │   │   │   ├── composio/    # OAuth, tool execution
│   │   │   │   ├── stripe/      # Webhooks, portal
│   │   │   │   └── webhooks/    # Generic webhook receiver
│   │   │   ├── cron/            # Vercel Cron jobs (proactive loops)
│   │   │   └── billing/         # Stripe checkout, portal, webhooks
│   │   └── (marketing)/         # Landing, Pricing, Blog, Legal
│   ├── components/
│   │   ├── agent/               # 🆕 ChatUI, AgentCard, SubAgentPanel, ToolCallDisplay
│   │   ├── dashboard/           # Widgets (refactor)
│   │   ├── memory/              # 🆕 GraphView, VectorSearch, NoteEditor
│   │   ├── finance/             # Refactor
│   │   ├── gtm/                 # 🆕 StrategyView, ExecutionView, MeasurementView
│   │   ├── ui/                  # shadcn/ui + custom
│   │   └── ...
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── provider-registry.ts
│   │   │   ├── agent-orchestrator.ts
│   │   │   ├── core-agent.ts           # 🆕 Agent Central
│   │   │   ├── sub-agents/             # 🆕 PM, CFO, Growth, Legal, Tech, Research, Content, Recruiting
│   │   │   ├── delegation.ts           # 🆕 Spawn/manage sub-agents
│   │   │   ├── hermes-bridge.ts        # 🆕 Hermes integration
│   │   │   ├── memory/
│   │   │   │   ├── vector-store.ts     # pgvector + Mem0
│   │   │   │   ├── knowledge-graph.ts  # Entities, relations, Cypher/SQL
│   │   │   │   └── obsidian-memory.ts  # High-level API
│   │   │   └── tools/                  # Function definitions for agents
│   │   ├── integrations/
│   │   │   ├── composio-client.ts
│   │   │   ├── stripe-client.ts
│   │   │   └── webhook-handler.ts
│   │   ├── security/
│   │   │   ├── encryption.ts           # AES-256-GCM, key derivation
│   │   │   ├── vault.ts                # Supabase Vault wrapper
│   │   │   ├── audit.ts                # Immutable audit logs
│   │   │   └── policies.ts             # Rate limits, plan limits, consent
│   │   ├── billing/
│   │   │   ├── stripe-config.ts
│   │   │   ├── subscription-manager.ts
│   │   │   └── trial-manager.ts
│   │   ├── db/
│   │   │   ├── supabase-client.ts
│   │   │   └── prisma-client.ts
│   │   └── utils/
│   ├── store/
│   │   ├── founder-store.ts        # Zustand + Supabase sync
│   │   ├── gamification-store.ts   # Allégé (pixel mood seulement)
│   │   ├── agent-store.ts          # 🆕 Chat history, sub-agent runs
│   │   └── memory-store.ts         # 🆕 Local cache for memory
│   ├── hooks/
│   ├── types/
│   └── middleware.ts               # Auth, Security headers, Rate limit
├── supabase/
│   ├── functions/                  # Edge Functions (heavy IA, webhooks)
│   ├── migrations/
│   └── config.toml
├── docker-compose.yml              # Local dev (Supabase, pgvector, AGE)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

---

## 10. Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Complexité Agent Central** | Haute | Haute | Commencer minimal (chat + 3 tools), itérer. Tests E2E critiques. |
| **Coûts IA (Tokens)** | Moyensible | Moyenne | Haute | Router intelligent (Groq pour rapide, o1 pour reasoning), caching réponses, limites par plan |
| **Latence Multi-Agents** | Moyenne | Moyenne | Streaming progressif, exécution parallèle sub-agents, WebSockets pour temps réel |
| **Adoption Utilisateur (Trop complexe)** | Moyenne | Haute | Onboarding guidé "Premier agent en 5 min", templates par profil, vidéo courtes |
| **Sécurité Données Sensibles** | Faible | Critique | Audit externe pre-launch, Bug bounty, Chiffrement bout-en-bout optionnel |
| **Dépendance Composio/Stripe** | Faible | Moyenne | Abstraction layer, fallback directs API, contracts SLA |
| **Réglementation IA (EU AI Act)** | Faible | Moyenne | Documentation système, transparence, opt-out, human-in-the-loop pour décisions critiques |
| **Performance pgvector à l'échelle** | Moyenne | Moyenne | Partitionnement par user, index HNSW, migration Pinecone/Weaviate si >100k users |

---

## 11. Métriques de Succès (North Star)

### 11.1 Métrique Principale : **"Weekly Active Founders with Agent Interaction" (WAFAI)**
> Nombre de founders uniques par semaine qui ont eu ≥1 interaction significative avec l'Agent Central (chat + tool call + résultat dashboard).

### 11.2 Métriques Secondaires
| Catégorie | KPI | Cible Mois 3 | Cible Mois 6 |
|-----------|-----|--------------|--------------|
| **Activation** | % Users créant 1ère hypothèse via Agent | 40% | 60% |
| **Activation** | % Users connectant Stripe | 30% | 55% |
| **Rétention** | WAU/MAU (Dashboard) | 35% | 45% |
| **Rétention** | WAU/MAU (Agent Chat) | 25% | 40% |
| **Monétisation** | Trial → Paid (Starter) | 15% | 20% |
| **Monétisation** | MRR | 5k€ | 25k€ |
| **Produit** | Avg sub-agents spawns/user/semaine | 2 | 8 |
| **Produit** | Mémoire notes/user | 50 | 200 |
| **Qualité** | NPS | > 30 | > 50 |
| **Qualité** | % Tâches agent complétées sans intervention | 60% | 80% |

---

## 12. Prochaines Actions Immédiates (Cette Semaine)

1. **Sécuriser les fondations** (P0) :
   - [ ] Migrer Zustand `persist: localStorage` → `persist: Supabase` (table `user_settings` + `user_state`)
   - [ ] Implémenter `pgcrypto` pour colonnes sensibles (Finances, CRM, Journal, API Keys)
   - [ ] Configurer Supabase Vault pour API Keys IA + Composio tokens
   - [ ] Activer RLS sur toutes les tables + politiques strictes

2. **Créer l'onglet "Agent Central"** (P0) :
   - [ ] UI Chat (streaming, markdown, code, tool calls visibles)
   - [ ] API `/api/ai/chat/stream` avec `core-agent`
   - [ ] Tools de base : `read_dashboard`, `write_dashboard`, `query_memory`

3. **Mémoire Vectorielle** (P0) :
   - [ ] Activer `pgvector` sur Supabase
   - [ ] Table `memory_notes` + index HNSW
   - [ ] Intégrer Mem0 (cloud) en fallback/augmentation

4. **Stripe Sync** (P1) :
   - [ ] Webhook `invoice.payment_succeeded` → upsert `finance_entries`
   - [ ] Calcul MRR/ARR/Runway temps réel
   - [ ] Alerte "Runway < 3 mois" → notification + Agent CFO suggestion

5. **Composio Setup** (P1) :
   - [ ] Créer app Composio, configurer OAuth GitHub, Linear, Notion, Stripe, Gmail, Slack
   - [ ] Table `user_integrations` (connection_id, tool, status, scopes)
   - [ ] Wrapper `executeComposioTool` côté serveur

---

## 13. Annexe : Comparatif Détaillé Concurrents

| Fonctionnalité | AirH Founder OS | Notion + AI | Linear + AI | Baremetrics | ChatGPT Team | Hermes Agent |
|----------------|-----------------|-------------|-------------|-------------|--------------|--------------|
| **Dashboard Business Unifié** | ✅ Natif | ❌ Manuel | ❌ Dev only | ✅ Finances only | ❌ | ❌ |
| **Mémoire Persistante (Obsidian-like)** | ✅ Vector + Graph | ✅ Pages | ❌ | ❌ | ❌ Context window | ✅ Mem0 |
| **Agent Central Conversationnel** | ✅ Chat + Tools | ⚠️ Q&A seulement | ❌ | ❌ | ✅ Chat | ✅ Chat |
| **Sous-Agents Spécialisés (PM, CFO, Growth...)** | ✅ 8+ natifs | ❌ | ❌ | ❌ | ❌ GPTs | ✅ Skills |
| **Délégation Multi-Agents** | ✅ Orchestré | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Intégrations Métier (Stripe, CRM, Dev, Marketing)** | ✅ 100+ via Composio | ⚠️ API limitée | ✅ Dev tools | ✅ Stripe only | ❌ | ✅ MCP |
| **Exécution Réelle (créer issues, envoyer emails, sync Stripe)** | ✅ Function Calling | ❌ | ⚠️ Linear only | ⚠️ Read only | ❌ | ✅ Skills |
| **Veille Concurrentielle Automatisée** | ✅ Agent Research | ❌ | ❌ | ❌ | ❌ | ⚠️ Skills |
| **Facturation SaaS Intégrée** | ✅ Stripe Billing | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Prix Solo Founder** | **49€/an** | 8€/mo (Plus AI) | Gratuit/12€ | 129$/mo | 25$/mo/user | Self-host / Cloud |
| **Data Privacy (EU, Chiffrement)** | ✅ Native | ⚠️ US | ⚠️ US | ⚠️ US | ⚠️ US | ✅ Self-host |

---

## 14. Conclusion

**AirH Founder Dashboard a tous les atouts pour devenir LE "Founder OS" de référence** : la base technique est solide (Next.js 15, Supabase, Prisma, Zustand, Agent Orchestrator multi-provider), la couverture fonctionnelle est large (13 onglets métier), et la vision est claire.

**Le gap critique** : passer d'un **dashboard passif** à un **système agentique proactif** avec mémoire persistante, délégation de sous-agents, et exécution réelle via intégrations.

**La proposition** : 14 semaines d'exécution focalisée sur 3 piliers (Agent Central + Mémoire, Intégrations/Automatisation, Sécurité/Billing) pour lancer un **MVP payant à 49€/an** qui résout le vrai problème des solo founders : **"Je n'ai pas le temps d'analyser, décider, ET exécuter — j'ai besoin d'un co-pilote qui fait les 3 avec moi."**

Le positionnement hybride **Hermes (orchestration) × Paperclip (distribution) × AirH (business data) × Dashboard Moderne (UX)** crée une barrière à l'entrée unique : aucun concurrent n'a cette combinaison de **données business structurées + mémoire contextuelle + exécution multi-outils + facturation intégrée**.

---

*Document généré le 30 juin 2026 — Version 1.0 — Pour discussion et priorisation avec l'équipe.*