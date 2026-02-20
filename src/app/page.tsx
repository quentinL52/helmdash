'use client';

import { AuthFormsWrapper } from "@/components/auth/auth-forms-wrapper";
import { CheckCircle2, FlaskConical, LineChart, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen relative bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg shadow-sm"></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              FounderOS
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Centralisez la logique de votre <span className="text-primary">Projet</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Un espace unique pour valider vos hypothèses, suivre vos finances, et exécuter vos sprints. Conçu pour les fondateurs qui veulent de la clarté, pas du chaos.
              </p>

              <div className="pt-4 flex items-center gap-6 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Données persistantes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Mode hors-ligne</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#6c5ce7]" />
                  <span>Commencez gratuitement</span>
                </div>
              </div>
            </div>

            {/* Login/Signup Card */}
            <div id="auth-section" className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 transform rotate-2 scale-105"></div>
              <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                <AuthFormsWrapper />
              </div>
            </div>
          </div>
        </section>

        {/* Features / Methodology */}
        <section id="features" className="py-24 bg-muted/30 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Un système d'exploitation pour votre startup</h2>
              <p className="text-muted-foreground">
                Plus besoin de jongler entre Notion, Excel et Todoist. Retrouvez tous les outils essentiels au même endroit.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "1. Hypothèses & Validation",
                  desc: "Formulez vos paris risqués, testez-les, et pivotez rapidement si nécessaire.",
                  icon: <FlaskConical className="w-8 h-8 text-primary" />
                },
                {
                  title: "2. Finances (Runway)",
                  desc: "Suivez votre burn rate et sachez exactement combien de temps vous avez devant vous.",
                  icon: <LineChart className="w-8 h-8 text-primary" />
                },
                {
                  title: "3. Routine & OKR",
                  desc: "Restez concentré sur l'exécution quotidienne alignée avec vos objectifs trimestriels.",
                  icon: <Target className="w-8 h-8 text-primary" />
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors shadow-sm group">
                  <div className="mb-6 bg-muted w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Un prix simple, sans surprise</h2>
              <p className="text-muted-foreground">
                Commencez gratuitement, puis débloquez toute la puissance de FounderOS pour seulement 10€/mois.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-2xl p-8 bg-card border border-border shadow-sm">
                <h3 className="text-xl font-bold text-foreground">Gratuit</h3>
                <p className="mt-2 text-sm text-muted-foreground">Pour découvrir et structurer votre projet.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">0€</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm">
                  {[
                    "Validation d'hypothèses (5 max)",
                    "Suivi de la Runway basique",
                    "Routines quotidiennes",
                    "Lean Canvas",
                    "Journal de bord",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-foreground">
                      <Check className="h-4 w-4 flex-none text-[#6c5ce7]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-8 bg-muted hover:bg-muted/80 text-foreground"
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Commencer gratuitement
                </Button>
              </div>

              {/* Starter Plan - 10€ */}
              <div className="rounded-2xl p-8 bg-card border-2 border-[#6c5ce7] shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6c5ce7] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Recommandé
                </div>
                <h3 className="text-xl font-bold text-foreground">Starter</h3>
                <p className="mt-2 text-sm text-muted-foreground">Tout ce qu'il faut pour accélérer.</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">10€</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </p>
                <ul className="mt-8 space-y-3 text-sm">
                  {[
                    "Hypothèses illimitées",
                    "Suivi de la Runway complet",
                    "Routines quotidiennes",
                    "Score de compétitivité",
                    "Rapport IA hebdomadaire",
                    "Pipeline de contenu",
                    "Support prioritaire",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-foreground">
                      <Check className="h-4 w-4 flex-none text-[#6c5ce7]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-8 bg-[#6c5ce7] hover:bg-[#6c5ce7]/90 text-white"
                  onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Démarrer l'essai
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} FounderOS. Built for builders.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {/* Footer links if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}
