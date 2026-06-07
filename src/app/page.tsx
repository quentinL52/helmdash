'use client';

import { AuthFormsWrapper } from "@/components/auth/auth-forms-wrapper";
import { FlaskConical, LineChart, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 shrink-0">
              <Image src="/AIrh_logo.png" alt="AIRH Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
              AIRH Founder Central
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center mb-10 max-w-lg">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4 text-foreground">
            Bienvenue sur le centre de pilotage d'AIRH !
          </h1>
          <p className="text-lg text-muted-foreground">
            Connectez-vous pour accéder à votre espace de travail.
          </p>
        </div>

        {/* Login/Signup Card */}
        <div id="auth-section" className="relative w-full max-w-md flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 transform rotate-2 scale-105 pointer-events-none"></div>
          <div className="relative z-10 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden">
            <AuthFormsWrapper />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AIRH Founder Central. Built for AIRH.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            {/* Footer links if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}
