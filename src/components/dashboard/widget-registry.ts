import { ReactNode } from 'react';
import { CalendarWidget } from './calendar-widget';
import { RunwayWidget } from './runway-widget';
import { HypothesesWidget } from './hypotheses-widget';
import { GtmWidget } from './gtm-widget';
import { AgentsWidget } from './agents-widget';
import { PixelMoodDisplay } from './pixel-mood-display';
import { MvpCountdown } from './mvp-countdown';
import { FounderScoreWidget } from './widgets/founder-score-widget';
import { StreakWidget } from './widgets/streak-widget';
import { WeeklyBriefWidget } from './widgets/weekly-brief-widget';
import { QuickActionsWidget } from './widgets/quick-actions-widget';
import { XPProgressWidget } from './widgets/xp-progress-widget';
import { QuestsWidget } from './widgets/quests-widget';
import { AchievementsWidget } from './widgets/achievements-widget';

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  component: React.ComponentType<any>;
  category?: 'business' | 'gamification';
}

/** Widgets réservés à la page Progression (gamification) */
export const GAMIFICATION_WIDGET_IDS = [
  'founder-score',
  'xp-progress',
  'streak',
  'quests',
  'achievements',
] as const;

export const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'mvp-countdown': MvpCountdown,
  'pixel-mood': PixelMoodDisplay,
  'runway': RunwayWidget,
  'hypotheses': HypothesesWidget,
  'gtm': GtmWidget,
  'agents': AgentsWidget,
  'calendar': CalendarWidget,
  'founder-score': FounderScoreWidget,
  'streak': StreakWidget,
  'weekly-brief': WeeklyBriefWidget,
  'quick-actions': QuickActionsWidget,
  'xp-progress': XPProgressWidget,
  'quests': QuestsWidget,
  'achievements': AchievementsWidget,
};

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  'founder-score': {
    id: 'founder-score',
    name: 'Founder Score',
    description: 'Affiche vos points de vie et de validation.',
    defaultSize: 'medium',
    component: FounderScoreWidget,
  },
  'xp-progress': {
    id: 'xp-progress',
    name: 'Progression XP',
    description: 'Affiche votre niveau actuel et XP.',
    defaultSize: 'medium',
    component: XPProgressWidget,
  },
  'streak': {
    id: 'streak',
    name: 'Streak Discipline',
    description: 'Affiche vos jours consécutifs d\'activité.',
    defaultSize: 'medium',
    component: StreakWidget,
  },
  'quick-actions': {
    id: 'quick-actions',
    name: 'Actions Rapides',
    description: 'Raccourcis vers vos actions les plus courantes.',
    defaultSize: 'medium',
    component: QuickActionsWidget,
  },
  'weekly-brief': {
    id: 'weekly-brief',
    name: 'Brief IA',
    description: 'Résumé hebdomadaire de l\'Agent Coach.',
    defaultSize: 'large',
    component: WeeklyBriefWidget,
  },
  'mvp-countdown': {
    id: 'mvp-countdown',
    name: 'Compte à rebours MVP',
    description: 'Affiche le temps restant avant le lancement de votre MVP.',
    defaultSize: 'full',
    component: MvpCountdown,
  },
  'agents-hub': {
    id: 'agents-hub',
    name: 'Agent Hub',
    description: 'Centre de contrôle de vos agents IA.',
    defaultSize: 'full',
    component: AgentsWidget,
  },
  'pixel-mood': {
    id: 'pixel-mood',
    name: 'Humeur du jour',
    description: 'Affiche votre dernière entrée d\'humeur en pixel art.',
    defaultSize: 'medium',
    component: PixelMoodDisplay,
  },
  'calendar': {
    id: 'calendar',
    name: 'Calendrier de la semaine',
    description: 'Vos tâches de routine hebdomadaires.',
    defaultSize: 'large',
    component: CalendarWidget,
  },
  'runway': {
    id: 'runway',
    name: 'Runway Tracker',
    description: 'Aperçu de vos finances et temps restant.',
    defaultSize: 'medium',
    component: RunwayWidget,
  },
  'hypotheses': {
    id: 'hypotheses',
    name: 'Hypothèses Actives',
    description: 'Les hypothèses en cours de validation.',
    defaultSize: 'medium',
    component: HypothesesWidget,
  },
  'gtm': {
    id: 'gtm',
    name: 'Go-To-Market',
    description: 'Progression du lancement marketing.',
    defaultSize: 'full',
    component: GtmWidget,
  },
  'quests': {
    id: 'quests',
    name: 'Quêtes',
    description: 'Affiche vos quêtes actives.',
    defaultSize: 'full',
    component: QuestsWidget,
  },
  'achievements': {
    id: 'achievements',
    name: 'Succès',
    description: 'Vos succès débloqués.',
    defaultSize: 'medium',
    component: AchievementsWidget,
  },
};

export const getDefaultLayout = () => {
  return [
    { id: 'weekly-brief', size: 'full' as WidgetSize },
    { id: 'quick-actions', size: 'medium' as WidgetSize },
    { id: 'pixel-mood', size: 'medium' as WidgetSize },
    { id: 'runway', size: 'medium' as WidgetSize },
    { id: 'hypotheses', size: 'medium' as WidgetSize },
    { id: 'agents-hub', size: 'full' as WidgetSize },
  ];
};

export const getSizeClasses = (size: WidgetSize) => {
  switch (size) {
    case 'small': return 'col-span-1 md:col-span-1 lg:col-span-1';
    case 'medium': return 'col-span-1 md:col-span-2 lg:col-span-1';
    case 'large': return 'col-span-1 md:col-span-2 lg:col-span-2';
    case 'full': return 'col-span-1 md:col-span-2 lg:col-span-3';
    default: return 'col-span-1 md:col-span-2 lg:col-span-3';
  }
};
