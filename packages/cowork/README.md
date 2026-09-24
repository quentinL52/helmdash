# @helmdash/cowork

<div align="center">

**Le poste de pilotage local-first pour Solopreneurs & Claude Cowork.**  
*Transformez votre binôme IA de code en un associé stratégique et opérationnel.*

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-emerald?logo=anthropic)](https://modelcontextprotocol.io)
[![Zero-Dependency CLI](https://img.shields.io/badge/Zero--Config-Instant_Run-orange)](#démarrage-rapide)

</div>

---

## 🎯 Pourquoi @helmdash/cowork ?

Les solopreneurs et développeurs indépendants n'ont pas besoin d'un énième SaaS lourd ou d'une usine à gaz de dotfiles machine. Ils ont besoin que leur assistant de programmation (**Claude Code**, **Claude Desktop**, **Cursor**) comprenne **en permanence** les enjeux business de leur projet :

- Quel est le problème réel résolu et qui est l'utilisateur cible (ICP) ?
- Quelle est la date butoir du MVP et combien de jours restent au compteur ?
- Quels choix d'architecture ou de produit ont été actés (Decision Log) ?
- Quelles sont les 3 priorités absolues du jour (Top 3 focus) ?

`@helmdash/cowork` s'installe **directement au cœur de votre dépôt de code**. Il s'appuie sur le système de fichiers local (`.cowork/`), des formats ouverts (CSV RFC 4180, Markdown, iCalendar RFC 5545) et le protocole officiel **Model Context Protocol (MCP)** d'Anthropic.

---

## ✨ Fonctionnalités Majeures

```
                    ┌────────────────────────────────────────────────────────┐
                    │                   SOLOPRENEUR / DEV                    │
                    └───────────┬────────────────────────────────┬───────────┘
                                │                                │
                      npx @helmdash/cowork ui             Claude Code / Desktop
                                │                                │
                                ▼                                ▼
                    ┌───────────────────────┐        ┌───────────────────────┐
                    │ Webview Éphémère      │        │ Serveur MCP Stdio     │
                    │  - Kanban drag & drop │        │  - get_project_health │
                    │  - Compte à rebours   │        │  - update_task_status │
                    │  - Auto-stop 15 min   │        │  - add_decision       │
                    └───────────┬───────────┘        └───────────┬───────────┘
                                │                                │
                                └────────────────┬───────────────┘
                                                 │
                                                 ▼
                                ┌─────────────────────────────────┐
                                │ Dossier Projet : .cowork/       │
                                │  ├─ tasks.csv (File Locked)     │
                                │  ├─ decisions.csv               │
                                │  ├─ hypotheses.csv              │
                                │  ├─ context.md (Lean Canvas)    │
                                │  └─ calendar.ics (Flux Agenda)  │
                                └─────────────────────────────────┘
```

### 1. 🧠 Interview de Cadrage Intelligente (`/cowork-onboard`)
Claude explore d'abord votre code source (dépendances, commits, documentation existante), puis mène une interview ciblée en **6 questions fondamentales** inspirées de Helmdash :
1. **Problème** : La douleur précise à éliminer.
2. **Cible (ICP)** : Le persona exact (relance automatique si la réponse est « tout le monde »).
3. **Jalon MVP** : L'échéance cible chiffrée (calcul automatique du compte à rebours 90 jours).
4. **Modèle de revenus** : Comment le projet génère de la valeur (relance si « gratuit » sans plan).
5. **Risque critique** : Le scénario d'échec le plus probable à déjouer.
6. **Dilemme actuel** : L'arbitrage stratégique ou technique ouvert.

### 2. 🔌 Serveur Natif MCP (Model Context Protocol)
Compatible avec **Claude Desktop**, **Claude Code**, **Cursor** et **Windsurf**. Claude dispose d'outils structurés pour interagir avec le projet sans hallucinations :
- `cowork_get_project_health` : Diagnostic complet (MVP countdown, état du backlog, Top 3 focus).
- `cowork_get_project_context` : Récupération du Lean Canvas et de la proposition de valeur.
- `cowork_get_tasks` & `cowork_add_task` : Manipulation typée du Kanban.
- `cowork_update_task_status` : Passage automatique d'une tâche à `done` après génération de code.
- `cowork_add_decision` : Consignation instantanée d'un arbitrage dans le Decision Log.

### 3. 🛡️ Moteur CSV Résistant aux Conflits (Atomic File Locking)
- Système de verrouillage atomique (`.lock`) empêchant toute collision ou corruption si l'utilisateur manipule le Kanban web pendant que Claude écrit dans le terminal.
- Détection et bris automatique des verrous orphelins (> 5 secondes) en cas d'interruption abrupte.
- **Migration de schéma automatique** : Si une nouvelle version ajoute une colonne, vos fichiers existants sont mis à jour dynamiquement sans aucune perte de données.

### 4. 📅 Calendrier & Rappels Universels (`calendar.ics`)
- Génération automatique d'un calendrier standardisé **RFC 5545**.
- Événements dédiés pour chaque tâche dotée d'une date d'échéance ou d'un rappel (`VALARM`).
- Alerte spéciale pour le **Jalon MVP** avec rappels automatiques à J-7 et J-1.
- Importable ou synchronisable dans **Google Calendar**, **Apple Calendar** et **Outlook**.

### 5. ⚡ Webview Locale Éphémère (`localhost:3333`)
- Interface épurée en mode sombre : Kanban interactif drag-and-drop, jauge de compte à rebours MVP, tableau des décisions et hypothèses.
- **Économe en RAM** : Le serveur s'éteint automatiquement après **15 minutes d'inactivité** (aucune requête détectée), libérant instantanément le port et la mémoire de votre machine.

---

## 🚀 Démarrage Rapide

### Étape 1 : Initialiser le projet

Exécutez dans le dossier racine de votre projet :

```bash
npx @helmdash/cowork init
```

Cette commande initialise :
- Le dossier `.cowork/` avec les structures de données de départ.
- Votre fichier `CLAUDE.md` enrichi des protocoles Cowork.
- La commande `/cowork-onboard` dans `.claude/commands/`.
- Le fichier `.mcp.json` pour la détection automatique par Claude et Cursor.
- Le fichier de calendrier `calendar.ics`.

---

### Étape 2 : Cadrer votre projet avec Claude

Dans votre terminal, lancez **Claude Code** :

```bash
claude
```

Puis lancez l'interview initiale :

```text
/cowork-onboard
```

Claude analyse votre dépôt, pose les 6 questions de cadrage, applique les règles de relance et génère automatiquement votre Lean Canvas (`context.md`), vos premières tâches et votre calendrier.

---

### Étape 3 : Ouvrir le Dashboard Kanban

Pour visualiser vos tâches et suivre votre avancement :

```bash
npx @helmdash/cowork ui
```

Ouvrez **[http://localhost:3333](http://localhost:3333)** dans votre navigateur. Déplacez vos cartes au fil de votre avancement.

---

## 🔌 Configuration du Serveur MCP

### Avec Claude Code / Cursor / Windsurf

Le fichier `.mcp.json` généré automatiquement à la racine permet une prise en charge immédiate :

```json
{
  "mcpServers": {
    "helmdash-cowork": {
      "command": "npx",
      "args": ["@helmdash/cowork", "mcp"]
    }
  }
}
```

### Avec Claude Desktop

Ajoutez cette entrée dans votre fichier de configuration `claude_desktop_config.json` :

* **macOS :** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows :** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "helmdash-cowork": {
      "command": "npx",
      "args": ["@helmdash/cowork", "mcp"]
    }
  }
}
```

Claude Desktop aura désormais accès à vos outils de gestion de projet dans son panneau latéral.

---

## 📁 Structure du Dossier `.cowork/`

Tous les artéfacts restent dans votre projet et peuvent être versionnés avec Git :

```text
.cowork/
├── config.json         # Métadonnées du projet, version du schéma, date cible MVP
├── context.md          # Lean Canvas synthétisé, ICP, proposition de valeur
├── tasks.csv           # Backlog Kanban (colonnes, priorités, échéances, agents)
├── decisions.csv       # Journal des décisions (contexte, choix retenu, compromis)
├── hypotheses.csv      # Hypothèses risquées et critères d'invalidation
├── milestones.md       # Roadmap des jalons à 30, 60 et 90 jours
└── calendar.ics        # Flux iCalendar synchronisable avec votre agenda
```

---

## 📋 Spécification des Fichiers CSV

### `tasks.csv`
| Colonne | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant unique (ex: `task-1`) |
| `title` | `string` | Intitulé clair de l'action |
| `category` | `enum` | `Tech` \| `Growth` \| `Product` \| `CFO` \| `Admin` |
| `status` | `enum` | `backlog` \| `todo` \| `in_progress` \| `blocked` \| `done` |
| `priority` | `enum` | `low` \| `medium` \| `high` \| `critical` |
| `dueDate` | `YYYY-MM-DD` | Date d'échéance de la tâche |
| `reminderDate` | `YYYY-MM-DD` | Date de déclenchement du rappel agenda |
| `assignedAgent` | `string` | Agent ou rôle assigné (`founder`, `tech-lead`, `growth`, `cfo`) |
| `notes` | `string` | Contexte ou critères de validation |

### `decisions.csv`
| Colonne | Type | Description |
|---|---|---|
| `id` | `string` | Identifiant de décision (ex: `dec-1`) |
| `date` | `YYYY-MM-DD` | Date de consignation |
| `title` | `string` | Sujet ou arbitrage traité |
| `status` | `enum` | `open` (dilemme) \| `decided` (tranché) \| `superseded` |
| `context` | `string` | Problème ou dilemme rencontré |
| `chosenOption` | `string` | Option retenue |
| `tradeOffs` | `string` | Compromis ou contreparties acceptées |
| `revisitDate` | `YYYY-MM-DD` | Date optionnelle de réévaluation |

---

## 💻 Répertoire des Commandes CLI

Le CLI est rapide, sans dépendance externe superflue et multiplateforme (macOS, Linux, Windows) :

```bash
# Initialisation & Cadrage
npx @helmdash/cowork init               # Initialise .cowork/, .mcp.json et CLAUDE.md
npx @helmdash/cowork init -f            # Force la réinitialisation

# Suivi & Dashboard
npx @helmdash/cowork status             # Affiche le statut rapide, Top 3 et jauge MVP
npx @helmdash/cowork ui                 # Lance l'UI locale (http://localhost:3333)
npx @helmdash/cowork ui --port 4000     # Lance sur un port spécifique
npx @helmdash/cowork calendar           # Régénère manuellement le fichier .ics

# Serveur MCP
npx @helmdash/cowork mcp                # Démarre le serveur MCP Stdio

# Gestion des Tâches
npx @helmdash/cowork tasks list         # Liste toutes les tâches
npx @helmdash/cowork tasks list -s todo # Filtre par statut (backlog, todo, in_progress...)
npx @helmdash/cowork tasks add "Titre"  # Ajoute une tâche (-p critical, -c Tech, -d 2026-10-01)
npx @helmdash/cowork tasks done task-1  # Marque la tâche terminée et met à jour l'agenda

# Gestion des Décisions
npx @helmdash/cowork decisions list     # Affiche l'historique des arbitrages
npx @helmdash/cowork decisions add "..."# Enregistre un choix (-s decided, -o "Option", -t "Compromis")
```

---

## 🛡️ Robustesse & Principes de Conception

1. **Zéro Base de Données Externe** : Pas de conteneur Docker, pas de service Postgres local requis. Tout repose sur des fichiers texte standards manipulables au bloc-notes ou dans un tableur.
2. **Commit Git Naturel** : Tout le dossier `.cowork/` est conçu pour être versionné (`git add .cowork`). L'historique de vos décisions et de vos tâches suit l'historique de votre code.
3. **Respect de la Vie Privée** : Vos données restent à 100% sur votre disque. Aucun appel télémétrique masqué, aucun envoi vers un serveur cloud tiers.
4. **Idempotence & Migrations Silencieuses** : Les scripts et parsers n'écrasent jamais vos données existantes sans confirmation et réconcilient automatiquement les versions de schéma.

---

## ❓ FAQ

**Q : Que faire si le serveur UI s'éteint tout seul ?**  
R : C'est le comportement éphémère normal après 15 minutes d'inactivité pour éviter de saturer la RAM de votre machine. Relancez simplement `npx @helmdash/cowork ui` quand vous en avez besoin.

**Q : Comment m'abonner au calendrier depuis Google Calendar ou Apple Calendar ?**  
R : Vous pouvez soit double-cliquer directement sur `.cowork/calendar.ics` pour l'importer dans Apple Calendar/Outlook, soit faire pointer votre client de calendrier vers `http://localhost:3333/calendar.ics` lorsque l'UI est lancée.

**Q : Est-ce compatible avec d'autres agents que Claude Code ?**  
R : Oui ! Grâce au standard ouvert **Model Context Protocol (MCP)** et aux fichiers ouverts CSV/Markdown, vous pouvez l'utiliser avec Cursor, Windsurf, Claude Desktop, Antigravity ou n'importe quel LLM outillé.

---

## 📄 Licence

Ce projet est distribué sous licence **AGPL-3.0** dans le cadre de l'écosystème [Helmdash](https://helmdash.app).
