'use client';

import { useFounderStore } from '@/store/founder-store';
import { XPProgressWidget } from '@/components/dashboard/widgets/xp-progress-widget';
import { FounderScoreWidget } from '@/components/dashboard/widgets/founder-score-widget';
import { StreakWidget } from '@/components/dashboard/widgets/streak-widget';
import { QuestsWidget } from '@/components/dashboard/widgets/quests-widget';
import { AchievementsWidget } from '@/components/dashboard/widgets/achievements-widget';
import { Trophy } from 'lucide-react';

export default function ProgressionPage() {
  const { founderProfile } = useFounderStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-pixel text-primary flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Progression & Quêtes
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Suivez votre évolution en tant que Founder. Gagnez de l&apos;XP en accomplissant vos routines et débloquez des succès.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Colonne de gauche (Stats & Stats) */}
        <div className="md:col-span-4 space-y-6">
          <FounderScoreWidget />
          <XPProgressWidget />
          <StreakWidget />
          <AchievementsWidget />
        </div>

        {/* Colonne de droite (Quêtes) */}
        <div className="md:col-span-8 space-y-6">
          <QuestsWidget />
        </div>
      </div>
    </div>
  );
}
