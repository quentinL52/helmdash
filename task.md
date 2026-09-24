# @helmdash/cowork - Local-First Solopreneur & Claude Cowork Module

## Context
Création d'un module de projet installable (`@helmdash/cowork`), inspiré de `TEC0R/worktree-station` mais réinventé pour les solopreneurs avec l'ADN de Helmdash.
Le module s'installe dans n'importe quel projet (`npx @helmdash/cowork init`), configure Claude Code (instructions, cadrage, auto-capture), gère les artéfacts locaux dans `.cowork/` (Kanban CSV, Journal de décisions, Lean Canvas, Hypothèses, Calendrier iCal) et offre une Webview locale (`cowork ui` sur `localhost:3333`).

## The Plan

### Phase 1: Planning & Architecture
- [x] Analyse complète de `TEC0R/worktree-station` (forces, limites, comparaison) `[Skill: senior-architect]`
- [x] Interview de cadrage `/grill-me` et validation des décisions produit `[Skill: senior-architect]`
- [x] Spécification technique et architecture globale (`cowork-module-spec.md`) `[Skill: senior-architect]`

### Phase 2: Core Package & CLI Scaffolding
- [x] Initialiser le package `packages/cowork` (`package.json`, `tsconfig.json`, binaires) `[Skill: nodejs-backend-patterns]`
- [x] Implémenter le moteur CSV typé avec Zod (`tasks.csv`, `decisions.csv`, `hypotheses.csv`) `[Skill: nodejs-best-practices]`
- [x] Implémenter le générateur de calendrier iCal standardisé (`calendar.ics`) `[Skill: nodejs-best-practices]`
- [x] Implémenter le scanner de contexte de dépôt (détection stack, git info, dépendances) `[Skill: nodejs-backend-patterns]`
- [x] Créer les templates de génération (`.cowork/`, `CLAUDE.md`, scripts) `[Skill: nodejs-backend-patterns]`

### Phase 3: AI & Claude Cowork Integration
- [x] Intégrer les prompts de cadrage inspirés de Helmdash (6 questions + `followUpRules`) `[Skill: prompt-engineering-patterns]`
- [x] Configurer les commandes slash pour Claude Code (`/cowork-onboard`, `/task`, `/decide`, `/sweep`) `[Skill: ai-engineer]`
- [x] Implémenter la CLI `cowork` (`init`, `status`, `tasks`, `decisions`, `calendar`, `ui`) `[Skill: nodejs-backend-patterns]`

### Phase 4: Local Dashboard Webview & Verification
- [x] Développer le serveur local léger et l'interface Webview (Kanban drag-and-drop, jauge MVP, décisions) `[Skill: frontend-design]`
- [x] Écrire les tests unitaires (CSV engine, iCal builder, scanner, CLI commands) `[Skill: nodejs-best-practices]`
- [x] Validation complète et section Proof (86/86 tests unitaires au vert, build TS validé) `[Skill: senior-architect]`

### Phase 5: Technical Optimizations & MCP Server (Anthropic Integration)
- [x] Rendre le serveur UI éphémère (auto-shutdown après 15 min d'inactivité) `[Skill: nodejs-backend-patterns]`
- [x] Sécuriser csv-engine avec un système de verrouillage atomique (.lock anti-race condition) `[Skill: nodejs-best-practices]`
- [x] Implémenter le mécanisme de migration de schéma automatique (CSV header reconciliation) `[Skill: nodejs-best-practices]`
- [x] Intégrer le serveur MCP stdio (`src/mcp/`) pour Claude Desktop & Claude Code `[Skill: ai-agents-architect]`
- [x] Écrire les tests unitaires associés et valider la non-régression (95/95 tests au vert) `[Skill: nodejs-best-practices]`
