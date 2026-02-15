'use client';

import Link from "next/link";
import { AuthFormsWrapper } from "@/components/auth/auth-forms-wrapper";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#e8e9ed] font-sans selection:bg-[#6c5ce7] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#1f212e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-lg"></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              FounderOS
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#6c5ce7] opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Centralisez la logique de votre <span className="text-[#6c5ce7]">Projet</span>.
              </h1>
              <p className="text-lg md:text-xl text-[#8b8fa3] max-w-lg leading-relaxed">
                Un espace unique pour valider vos hypothèses, suivre vos finances, et exécuter vos sprints. Conçu pour les fondateurs qui veulent de la clarté, pas du chaos.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-black hover:bg-gray-200 h-12 px-8 text-base">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="pt-8 flex items-center gap-6 text-[#8b8fa3] text-sm">
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
                  <span>100% Gratuit</span>
                </div>
              </div>
            </div>

            {/* Login/Signup Card */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] rounded-2xl blur opacity-20 transform rotate-2 scale-105"></div>
              <div className="relative z-10 w-full max-w-md">
                <AuthFormsWrapper />
              </div>
            </div>
          </div>
        </section>

        {/* Features / Methodology */}
        <section id="features" className="py-24 bg-[#0b0c10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Un système d'exploitation pour votre startup</h2>
              <p className="text-[#8b8fa3]">
                Plus besoin de jongler entre Notion, Excel et Todoist. Retrouvez tous les outils essentiels au même endroit.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "1. Hypothèses & Validation",
                  desc: "Formulez vos paris risqués, testez-les, et pivotez rapidement si nécessaire.",
                  icon: "🔬"
                },
                {
                  title: "2. Finances (Runway)",
                  desc: "Suivez votre burn rate et sachez exactement combien de temps vous avez devant vous.",
                  icon: "💸"
                },
                {
                  title: "3. Routine & OKR",
                  desc: "Restez concentré sur l'exécution quotidienne alignée avec vos objectifs trimestriels.",
                  icon: "🎯"
                }
              ].map((feature, i) => (
                <div key={i} className="bg-[#13141c] border border-[#1f212e] p-8 rounded-2xl hover:border-[#6c5ce7]/50 transition-colors group">
                  <div className="text-4xl mb-6 bg-[#1f212e] w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-[#8b8fa3] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1f212e] py-8 bg-[#0e0e11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8b8fa3] text-sm">
            © {new Date().getFullYear()} FounderOS. Built for builders.
          </p>
          <div className="flex gap-6 text-sm text-[#8b8fa3]">
            {/* Footer links if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}
