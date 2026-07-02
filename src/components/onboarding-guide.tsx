'use client';

import { useState, useEffect } from 'react';
import { useFounderStore } from '@/store/founder-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Bot, BrainCircuit, BookOpen, Target, Zap } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  {
    icon: Bot,
    title: 'Bienvenue sur Helmdash',
    description: 'Votre poste de pilotage de fondateur solo. Posez des questions, déléguer des tâches, et laissez vos agents travailler pour vous.',
    action: { label: 'Parler au Barreur', href: '/agent' },
  },
  {
    icon: BrainCircuit,
    title: 'Configurez votre mémoire',
    description: 'Plus vous utilisez Helmdash, plus il apprend de vous. Ajoutez des notes, des décisions et des insights dans votre mémoire.',
    action: { label: 'Ouvrir la Mémoire', href: '/memory' },
  },
  {
    icon: Target,
    title: 'Définissez vos objectifs',
    description: 'Remplissez votre Lean Canvas, ajoutez des hypothèses, et laissez les agents vous aider à les valider.',
    action: { label: 'Aller au Canvas', href: '/lean-canvas' },
  },
  {
    icon: BookOpen,
    title: 'Configurez votre profil',
    description: 'Ajoutez votre style d\'écriture, votre niche et vos réseaux pour que les agents produisent du contenu à votre image.',
    action: { label: 'Paramètres', href: '/settings' },
  },
  {
    icon: Zap,
    title: 'Connectez vos outils',
    description: 'Lie votre compte Stripe, GitHub, Notion et d\'autres outils pour que les agents puissent agir dans votre écosystème.',
    action: { label: 'Configurer les Intégrations', href: '/settings' },
  },
];

/**
 * Onboarding — guide de démarrage pour les nouveaux utilisateurs.
 * Disparaît après complétion ou fermeture manuelle.
 */
export function OnboardingGuide() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(true); // Start dismissed, only show on explicit trigger
  const onboardingCompleted = useFounderStore((s) => (s as any).onboardingCompleted);
  const setOnboardingCompleted = useFounderStore((s) => (s as any).setOnboardingCompleted);

  // Auto-show if never completed
  useEffect(() => {
    if (!onboardingCompleted) {
      // Delay to let the page render first
      const timer = setTimeout(() => setDismissed(false), 500);
      return () => clearTimeout(timer);
    }
  }, [onboardingCompleted]);

  const handleComplete = () => {
    setDismissed(true);
    if (setOnboardingCompleted) {
      setOnboardingCompleted(true);
    }
  };

  if (dismissed) return null;

  const current = STEPS[step];

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px]">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <current.icon className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm">{current.title}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleComplete}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <CardDescription className="text-xs mt-2">
            Étape {step + 1} sur {STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
            {current.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === step ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setStep(step - 1)}>
                  Retour
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="sm" className="text-xs h-8" onClick={() => setStep(step + 1)}>
                  Suivant
                </Button>
              ) : (
                <Link href={current.action.href}>
                  <Button size="sm" className="text-xs h-8" onClick={handleComplete}>
                    {current.action.label}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}