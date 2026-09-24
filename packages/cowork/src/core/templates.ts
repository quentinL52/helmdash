import { ScannedContext } from './context-scanner';
import { TASK_HEADERS, DECISION_HEADERS, HYPOTHESIS_HEADERS, formatCsv } from './csv-engine';

export function getInitialConfig(context: ScannedContext): string {
  const config = {
    projectName: context.projectName,
    mvpTargetDate: null,
    port: 3333,
    founderName: 'Solopreneur',
    syncEnabled: false,
    stack: context.stack,
  };
  return JSON.stringify(config, null, 2) + '\n';
}

export function getInitialTasksCsv(): string {
  return formatCsv(TASK_HEADERS, [
    {
      id: 'task-1',
      title: 'Lancer l interview de cadrage Claude Cowork (/cowork-onboard)',
      category: 'Product',
      status: 'todo',
      priority: 'critical',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      reminderDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      assignedAgent: 'barreur',
      notes: 'Définir la cible, le problème, et la date cible du MVP.',
    },
    {
      id: 'task-2',
      title: 'Vérifier la stack technique et les dépendances du projet',
      category: 'Tech',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
      reminderDate: '',
      assignedAgent: 'tech-lead',
      notes: 'Initialisation automatique par @helmdash/cowork.',
    },
  ]);
}

export function getInitialDecisionsCsv(): string {
  return formatCsv(DECISION_HEADERS, [
    {
      id: 'dec-1',
      date: new Date().toISOString().slice(0, 10),
      title: 'Adoption de Helmdash Cowork en mode local-first',
      status: 'decided',
      context: 'Gestion de projet allégée et pilotée par IA pour solopreneur.',
      chosenOption: 'Fichiers CSV locaux (.cowork/) + webview locale sur :3333',
      tradeOffs: 'Pas de base de données lourde requise, entièrement versionné sous Git.',
      revisitDate: '',
    },
  ]);
}

export function getInitialHypothesesCsv(): string {
  return formatCsv(HYPOTHESIS_HEADERS, [
    {
      id: 'hyp-1',
      hypothesis: 'Les utilisateurs cibles sont prêts à utiliser cette solution pour résoudre leur douleur principale.',
      validationMethod: 'Entretiens qualitatifs avec 5 utilisateurs cibles.',
      successCriteria: 'Au moins 3 utilisateurs demandent un accès immédiat.',
      status: 'untested',
      validatedAt: '',
    },
  ]);
}

export function getInitialContextMd(context: ScannedContext): string {
  return `# Contexte Projet : ${context.projectName}
> Généré par @helmdash/cowork pour Claude Cowork & Solopreneur.

## 1. Vue d'Ensemble
- **Nom du projet :** ${context.projectName}
- **Description :** ${context.description || 'À compléter lors du cadrage initial.'}
- **Stack détectée :** ${context.stack.length > 0 ? context.stack.join(', ') : 'Non détectée'}
- **Gestionnaire de paquets :** ${context.packageManager}
- **Branche Git active :** ${context.branch || 'main'}

---

## 2. Lean Canvas (Éléments Clés)
- **Problème :** À formuler avec précision (la douleur #1 ressentie par les clients).
- **Segment de clientèle (ICP) :** Qui souffre le plus de ce problème ?
- **Proposition de valeur unique :** Pourquoi ce projet plutôt qu'un tableur ou une alternative ?
- **Solution principale :** Les 2-3 fonctionnalités indispensables pour le MVP.
- **Modèle de revenus :** Comment ce projet devient financièrement viable ?
- **Risque majeur :** Le piège principal à déjouer dans les 90 prochains jours.

---

## 3. Profil du Fondateur
- **Rôle :** Solopreneur & Chef de bord
- **Approche :** Pragmatisme, livraison rapide (MVP), réduction de la dette technique.
`;
}

export function getInitialMilestonesMd(context: ScannedContext): string {
  return `# Jalons & Roadmap MVP : ${context.projectName}

## Jalon 1 : Cadrage & Fondations (J+15)
- [ ] Cadrage de l'offre et des personas validé
- [ ] Architecture technique et schéma de données arrêtés
- [ ] Première version navigable du core loop

## Jalon 2 : MVP Utilisable (J+45)
- [ ] Parcours complet de bout en bout testé en conditions réelles
- [ ] Retours de 3 testeurs alphas recueillis et arbitrés
- [ ] Première décision technique ou pivot consigné

## Jalon 3 : Lancement Public (J+90)
- [ ] Landing page ou accès ouvert
- [ ] Tracking des métriques clés activé
- [ ] Premiers paiements ou engagement confirmé
`;
}

export function getClaudeMdInstructions(context: ScannedContext): string {
  return `<!-- HELMDASH COWORK START -->
# Protocoles @helmdash/cowork pour Claude Code

Ce projet est piloté avec **@helmdash/cowork**, le module compagnon pour solopreneurs inspiré de Helmdash.
En tant qu'assistant de programmation en binôme ("Claude Cowork"), tu dois impérativement respecter les règles suivantes :

## 1. Contexte du Projet & Fichiers de Référence
Tous les artéfacts de gestion de projet sont stockés dans le dossier local \`.cowork/\` :
- \`.cowork/context.md\` : Le Lean Canvas et le profil du projet.
- \`.cowork/tasks.csv\` : Le backlog et Kanban des tâches.
- \`.cowork/decisions.csv\` : Le Decision Log consignant les arbitrages et dilemmes.
- \`.cowork/hypotheses.csv\` : Les hypothèses de validation du MVP.
- \`.cowork/calendar.ics\` : Le flux d'agenda iCal avec deadlines et rappels.

## 2. Commandes Disponibles
- \`/cowork-onboard\` : Lancer ou reprendre l'interview de cadrage initiale du projet (6 questions structurées).
- \`/task [action]\` : Proposer l'ajout, la modification ou la complétion d'une tâche dans \`.cowork/tasks.csv\`.
- \`/decide [sujet]\` : Consigner un arbitrage ou un dilemme tranché dans \`.cowork/decisions.csv\`.
- \`/status\` : Résumer l'état d'avancement du Kanban, du compte à rebours MVP et des priorités du jour (Top 3).

## 3. Règles d'Auto-Capture Proactive
- **Fin de tâche :** Dès que tu termines une implémentation demandée par l'utilisateur, propose-lui de passer la tâche correspondante à \`done\` dans \`.cowork/tasks.csv\` et de mettre à jour le calendrier avec \`npx @helmdash/cowork calendar\`.
- **Dilemme ou arbitrage :** Dès qu'un choix d'architecture ou de produit non trivial est fait, propose d'ajouter une entrée dans \`.cowork/decisions.csv\` (contexte, option choisie, trade-offs).
- **Échéance / Deadline :** Si une tâche a une date d'échéance critique, rappelle à l'utilisateur qu'elle est répercutée dans \`.cowork/calendar.ics\`.
<!-- HELMDASH COWORK END -->
`;
}

export function getOnboardingPromptMarkdown(): string {
  return `# Guide de Cadrage Claude Cowork (/cowork-onboard)

Tu es le **Barreur Cowork**, l'associé IA pragmatique du solopreneur.
Ton but est de cadrer le projet en posant 6 questions fondamentales, une par une, de manière concise et directe.

## Instructions :
1. Examine d'abord le code source et les fichiers existants pour ne pas poser de questions dont la réponse est déjà évidente.
2. Pose les questions **une par une**.
3. **Règles de relance immédiate (Anti-vague) :**
   - Si la réponse à la question Cible est "tout le monde" ou trop générique -> Relance : *"Tout le monde, c'est souvent personne au début. Si tu devais choisir une niche ultra-spécifique de 10 personnes pour commencer, qui seraient-elles ?"*
   - Si la réponse au Risque est "aucun" ou "je ne sais pas" -> Relance : *"Il y a toujours un risque (concurrence, technique, distribution). Quel est le scénario le plus probable qui ferait que ce projet échoue dans 6 mois ?"*
   - Si la réponse au Modèle de revenu est "gratuit" ou "pub" -> Relance : *"La gratuité est difficile à rentabiliser pour un solopreneur. As-tu envisagé de faire payer directement le service ? À quel prix ?"*
4. Dès que les 6 questions sont répondues :
   - Mets à jour \`.cowork/context.md\` avec le Lean Canvas synthétisé.
   - Remplis \`.cowork/tasks.csv\` avec les 5 premières tâches critiques du MVP.
   - Enregistre le premier dilemme identifié dans \`.cowork/decisions.csv\`.
   - Mets à jour la date cible MVP dans \`.cowork/config.json\`.
   - Régénère \`.cowork/calendar.ics\` en exécutant \`npx @helmdash/cowork calendar\`.
`;
}
