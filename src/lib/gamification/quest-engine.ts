/**
 * Quest Engine
 * ────────────
 * Manages onboarding, weekly, and epic quests.
 * Weekly quests are dynamically generated based on user activity gaps.
 * All core functions are pure — they transform state without side effects.
 */

import type { XPAction } from './xp-table';

// ── Types ──────────────────────────────────────────────────────────────

export type QuestType = 'onboarding' | 'weekly' | 'epic';
export type QuestStatus = 'locked' | 'active' | 'completed';

export interface QuestStep {
  id: string;
  label: string;
  labelFr: string;
  xpReward: number;
  completed: boolean;
  /** Maps to an XPAction or a custom check key */
  action: XPAction | string;
}

export interface Quest {
  id: string;
  title: string;
  titleFr: string;
  description: string;
  descriptionFr: string;
  type: QuestType;
  status: QuestStatus;
  steps: QuestStep[];
  /** Bonus XP awarded when all steps are completed */
  completionBonus: number;
  emoji: string;
  /** ISO date string — only for weekly quests */
  expiresAt?: string;
}

/**
 * Minimal activity snapshot used by the weekly quest generator.
 * Timestamps are ISO date strings; nulls indicate "never done".
 */
export interface ActivitySnapshot {
  lastFinanceUpdate: string | null;
  lastJournalEntry: string | null;
  lastHypothesisTest: string | null;
  lastContentPublished: string | null;
  lastCompetitorAnalyzed: string | null;
  lastCanvasUpdate: string | null;
  hypothesesCount: number;
  contactsCount: number;
  journalCount: number;
  routineStreak: number;
}

// ── Onboarding Quest ───────────────────────────────────────────────────

/** The fixed onboarding quest — always the same for every new founder. */
export function createOnboardingQuest(): Quest {
  return {
    id: 'onboarding_genesis',
    title: 'The Genesis',
    titleFr: 'La Genèse',
    description: 'Complete your founder setup — lay the foundation for your startup journey.',
    descriptionFr: 'Complète ton setup de fondateur — pose les bases de ton parcours startup.',
    type: 'onboarding',
    status: 'active',
    emoji: '🌱',
    completionBonus: 50,
    steps: [
      {
        id: 'onboarding_profile',
        label: 'Set up your profile',
        labelFr: 'Configure ton profil',
        xpReward: 10,
        completed: false,
        action: 'profile_setup',
      },
      {
        id: 'onboarding_canvas',
        label: 'Fill your Lean Canvas',
        labelFr: 'Remplis ton Lean Canvas',
        xpReward: 20,
        completed: false,
        action: 'lean_canvas_updated',
      },
      {
        id: 'onboarding_hypothesis',
        label: 'Create your first hypothesis',
        labelFr: 'Crée ta première hypothèse',
        xpReward: 15,
        completed: false,
        action: 'hypothesis_created',
      },
      {
        id: 'onboarding_competitor',
        label: 'Analyze a competitor',
        labelFr: 'Analyse un concurrent',
        xpReward: 15,
        completed: false,
        action: 'competitor_analyzed',
      },
      {
        id: 'onboarding_routine',
        label: 'Complete your first routine',
        labelFr: 'Complète ta première routine',
        xpReward: 15,
        completed: false,
        action: 'routine_complete',
      },
      {
        id: 'onboarding_journal',
        label: 'Write your first journal entry',
        labelFr: 'Écris ta première entrée de journal',
        xpReward: 15,
        completed: false,
        action: 'journal_entry',
      },
    ],
  };
}

// ── Epic Quests ────────────────────────────────────────────────────────

/** Three long-arc epic quests. */
export function createEpicQuests(): Quest[] {
  return [
    {
      id: 'epic_idea_to_customer',
      title: 'From Idea to Customer',
      titleFr: "De l'Idée au Client",
      description: 'Navigate the full validation loop — from hypothesis to paying customer.',
      descriptionFr: 'Parcours la boucle de validation complète — de l\'hypothèse au client payant.',
      type: 'epic',
      status: 'active',
      emoji: '🏆',
      completionBonus: 200,
      steps: [
        { id: 'e1_canvas',     label: 'Complete Lean Canvas',        labelFr: 'Compléter le Lean Canvas',       xpReward: 20, completed: false, action: 'lean_canvas_updated' },
        { id: 'e1_hyp_create', label: 'Create 3 hypotheses',        labelFr: 'Créer 3 hypothèses',             xpReward: 15, completed: false, action: 'hypothesis_created' },
        { id: 'e1_hyp_test',   label: 'Test 3 hypotheses',          labelFr: 'Tester 3 hypothèses',            xpReward: 50, completed: false, action: 'hypothesis_tested' },
        { id: 'e1_hyp_valid',  label: 'Validate 1 hypothesis',      labelFr: 'Valider 1 hypothèse',            xpReward: 100, completed: false, action: 'hypothesis_validated' },
        { id: 'e1_contact',    label: 'Add 5 contacts',             labelFr: 'Ajouter 5 contacts',             xpReward: 20, completed: false, action: 'contact_added' },
        { id: 'e1_revenue',    label: 'Record first revenue',       labelFr: 'Enregistrer le premier revenu',  xpReward: 100, completed: false, action: 'first_revenue' },
      ],
    },
    {
      id: 'epic_launch_master',
      title: 'Launch Master',
      titleFr: 'Maître du Lancement',
      description: 'Prepare and execute a successful launch.',
      descriptionFr: 'Prépare et exécute un lancement réussi.',
      type: 'epic',
      status: 'active',
      emoji: '🚀',
      completionBonus: 300,
      steps: [
        { id: 'e2_roadmap',   label: 'Complete 5 roadmap tasks',    labelFr: 'Terminer 5 tâches roadmap',      xpReward: 30, completed: false, action: 'roadmap_task_completed' },
        { id: 'e2_content',   label: 'Publish 3 pieces of content', labelFr: 'Publier 3 contenus',             xpReward: 40, completed: false, action: 'content_published' },
        { id: 'e2_gtm',       label: 'Reach 2 GTM milestones',     labelFr: 'Atteindre 2 jalons GTM',         xpReward: 50, completed: false, action: 'gtm_milestone' },
        { id: 'e2_okr',       label: 'Achieve a Key Result',        labelFr: 'Atteindre un Résultat Clé',      xpReward: 75, completed: false, action: 'okr_key_result_achieved' },
      ],
    },
    {
      id: 'epic_fortress_builder',
      title: 'Fortress Builder',
      titleFr: 'Bâtisseur de Forteresse',
      description: 'Build unshakable founder habits.',
      descriptionFr: 'Construis des habitudes de fondateur inébranlables.',
      type: 'epic',
      status: 'active',
      emoji: '🏰',
      completionBonus: 250,
      steps: [
        { id: 'e3_routine',   label: '7-day routine streak',        labelFr: 'Série de 7 jours de routine',    xpReward: 30, completed: false, action: 'routine_streak_7' },
        { id: 'e3_journal',   label: 'Write 10 journal entries',    labelFr: 'Écrire 10 entrées de journal',   xpReward: 40, completed: false, action: 'journal_entry' },
        { id: 'e3_finance',   label: 'Update finances 4 times',     labelFr: 'Mettre à jour les finances 4x',  xpReward: 30, completed: false, action: 'lean_canvas_updated' },
        { id: 'e3_intel',     label: 'Analyze 3 competitors',       labelFr: 'Analyser 3 concurrents',         xpReward: 35, completed: false, action: 'competitor_analyzed' },
        { id: 'e3_streak30',  label: '30-day activity streak',      labelFr: 'Série de 30 jours',              xpReward: 100, completed: false, action: 'routine_streak_30' },
      ],
    },
  ];
}

// ── Weekly Quest Generator ─────────────────────────────────────────────

/**
 * Compute how many days ago a date was (or Infinity if null).
 */
function daysAgo(isoDate: string | null): number {
  if (!isoDate) return Infinity;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Generate an ISO date string 7 days from now. */
function nextWeekExpiry(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

/**
 * Generate up to 4 weekly quests tailored to the user's activity gaps.
 * Prioritises modules the user hasn't touched recently.
 */
export function generateWeeklyQuests(activity: ActivitySnapshot): Quest[] {
  const quests: Quest[] = [];
  const expiry = nextWeekExpiry();

  // Priority: modules untouched the longest come first
  const candidates: { check: () => boolean; factory: () => Quest }[] = [
    {
      check: () => daysAgo(activity.lastFinanceUpdate) > 14,
      factory: () => ({
        id: `weekly_finance_${Date.now()}`,
        title: 'Financial Check-in',
        titleFr: 'Bilan Financier',
        description: "Your finances haven't been updated in 2+ weeks. Time to check in.",
        descriptionFr: "Tes finances n'ont pas été mises à jour depuis 2+ semaines.",
        type: 'weekly',
        status: 'active',
        emoji: '💸',
        completionBonus: 30,
        expiresAt: expiry,
        steps: [
          { id: 'wf_update', label: 'Update your finances', labelFr: 'Mettre à jour tes finances', xpReward: 20, completed: false, action: 'lean_canvas_updated' },
          { id: 'wf_review', label: 'Review cash runway',   labelFr: 'Revoir le runway cash',      xpReward: 15, completed: false, action: 'lean_canvas_updated' },
        ],
      }),
    },
    {
      check: () => daysAgo(activity.lastJournalEntry) > 7,
      factory: () => ({
        id: `weekly_journal_${Date.now()}`,
        title: 'Reflection Week',
        titleFr: 'Semaine de Réflexion',
        description: 'Write 3 journal entries this week.',
        descriptionFr: 'Écris 3 entrées de journal cette semaine.',
        type: 'weekly',
        status: 'active',
        emoji: '📔',
        completionBonus: 25,
        expiresAt: expiry,
        steps: [
          { id: 'wj_1', label: 'Journal entry 1', labelFr: 'Entrée journal 1', xpReward: 15, completed: false, action: 'journal_entry' },
          { id: 'wj_2', label: 'Journal entry 2', labelFr: 'Entrée journal 2', xpReward: 15, completed: false, action: 'journal_entry' },
          { id: 'wj_3', label: 'Journal entry 3', labelFr: 'Entrée journal 3', xpReward: 15, completed: false, action: 'journal_entry' },
        ],
      }),
    },
    {
      check: () => daysAgo(activity.lastHypothesisTest) > 10,
      factory: () => ({
        id: `weekly_hypothesis_${Date.now()}`,
        title: 'Experiment Sprint',
        titleFr: 'Sprint Expérimental',
        description: 'Test at least one hypothesis this week.',
        descriptionFr: 'Teste au moins une hypothèse cette semaine.',
        type: 'weekly',
        status: 'active',
        emoji: '🧪',
        completionBonus: 40,
        expiresAt: expiry,
        steps: [
          { id: 'wh_create', label: 'Create a hypothesis',  labelFr: 'Créer une hypothèse',   xpReward: 15, completed: false, action: 'hypothesis_created' },
          { id: 'wh_test',   label: 'Test the hypothesis',  labelFr: 'Tester l\'hypothèse',   xpReward: 50, completed: false, action: 'hypothesis_tested' },
        ],
      }),
    },
    {
      check: () => daysAgo(activity.lastContentPublished) > 10,
      factory: () => ({
        id: `weekly_content_${Date.now()}`,
        title: 'Content Creator',
        titleFr: 'Créateur de Contenu',
        description: 'Publish content to grow your audience.',
        descriptionFr: 'Publie du contenu pour développer ton audience.',
        type: 'weekly',
        status: 'active',
        emoji: '✍️',
        completionBonus: 25,
        expiresAt: expiry,
        steps: [
          { id: 'wc_publish', label: 'Publish 1 piece of content', labelFr: 'Publier 1 contenu', xpReward: 40, completed: false, action: 'content_published' },
        ],
      }),
    },
    {
      check: () => daysAgo(activity.lastCompetitorAnalyzed) > 14,
      factory: () => ({
        id: `weekly_intel_${Date.now()}`,
        title: 'Intel Briefing',
        titleFr: 'Briefing Intel',
        description: 'Stay sharp — analyze a competitor.',
        descriptionFr: 'Reste en veille — analyse un concurrent.',
        type: 'weekly',
        status: 'active',
        emoji: '🔍',
        completionBonus: 20,
        expiresAt: expiry,
        steps: [
          { id: 'wi_analyze', label: 'Analyze 1 competitor', labelFr: 'Analyser 1 concurrent', xpReward: 35, completed: false, action: 'competitor_analyzed' },
        ],
      }),
    },
    {
      // Fallback: always available if the user's routine streak is low
      check: () => activity.routineStreak < 3,
      factory: () => ({
        id: `weekly_routine_${Date.now()}`,
        title: 'Habit Builder',
        titleFr: 'Constructeur d\'Habitudes',
        description: 'Build momentum with 3 consecutive routine completions.',
        descriptionFr: 'Prends de l\'élan avec 3 routines consécutives.',
        type: 'weekly',
        status: 'active',
        emoji: '🔥',
        completionBonus: 30,
        expiresAt: expiry,
        steps: [
          { id: 'wr_1', label: 'Routine day 1', labelFr: 'Routine jour 1', xpReward: 15, completed: false, action: 'routine_complete' },
          { id: 'wr_2', label: 'Routine day 2', labelFr: 'Routine jour 2', xpReward: 15, completed: false, action: 'routine_complete' },
          { id: 'wr_3', label: 'Routine day 3', labelFr: 'Routine jour 3', xpReward: 15, completed: false, action: 'routine_complete' },
        ],
      }),
    },
  ];

  // Pick up to 4 matching quests
  for (const candidate of candidates) {
    if (quests.length >= 4) break;
    if (candidate.check()) {
      quests.push(candidate.factory());
    }
  }

  return quests;
}

// ── Quest Mutation Helpers ─────────────────────────────────────────────

/**
 * Mark a specific step as completed within a quest.
 * Returns a new Quest object (immutable update).
 */
export function updateQuestProgress(quest: Quest, stepId: string): Quest {
  const updatedSteps = quest.steps.map(step =>
    step.id === stepId ? { ...step, completed: true } : step,
  );
  const allDone = updatedSteps.every(s => s.completed);

  return {
    ...quest,
    steps: updatedSteps,
    status: allDone ? 'completed' : quest.status,
  };
}

/**
 * Check whether all steps of a quest are completed.
 */
export function checkQuestCompletion(quest: Quest): boolean {
  return quest.steps.every(step => step.completed);
}

/**
 * Filter a quest list to only active (non-completed, non-expired) quests.
 */
export function getActiveQuests(quests: Quest[]): Quest[] {
  const now = new Date().toISOString();
  return quests.filter(q => {
    if (q.status === 'completed') return false;
    if (q.expiresAt && q.expiresAt < now) return false;
    return true;
  });
}
