'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Rocket, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BillingPanel({ currentPlan = 'free' }: { currentPlan?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la redirection');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePortal = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la redirection');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-t-4 border-t-emerald-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-pixel text-emerald-500">
          <CreditCard className="w-5 h-5" />
          Abonnement & Facturation
        </CardTitle>
        <CardDescription>
          Gérez votre forfait et vos informations de paiement.
          {currentPlan !== 'free' && (
            <span className="block mt-2 font-medium text-primary">Forfait actuel : {currentPlan.toUpperCase()}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {currentPlan === 'free' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlanCard 
              title="Starter" 
              price="49€" 
              period="/an"
              features={['Fonctionnalités de base', '1 Agent', 'Support email']}
              icon={<Star className="w-5 h-5 text-blue-500" />}
              onSelect={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER!)}
              isLoading={isLoading}
            />
            <PlanCard 
              title="Growth" 
              price="99€" 
              period="/mois"
              features={['Toutes les fonctionnalités', 'Agents illimités', 'Essai gratuit 14j']}
              icon={<Rocket className="w-5 h-5 text-emerald-500" />}
              onSelect={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH!)}
              isLoading={isLoading}
              highlighted
            />
            <PlanCard 
              title="Scale" 
              price="299€" 
              period="/mois"
              features={['Marque blanche', 'API dédiée', 'Support prioritaire']}
              icon={<Zap className="w-5 h-5 text-purple-500" />}
              onSelect={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE!)}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handlePortal} disabled={isLoading} className="w-full sm:w-auto font-pixel">
              Accéder au Portail Client Stripe
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

function PlanCard({ title, price, period, features, icon, onSelect, isLoading, highlighted = false }: any) {
  return (
    <div className={`p-4 rounded-lg border flex flex-col h-full ${highlighted ? 'border-emerald-500 shadow-sm relative' : 'border-border'}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          Recommandé
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="mb-4">
        <span className="text-2xl font-black">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f: string, i: number) => (
          <li key={i} className="text-sm flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            {f}
          </li>
        ))}
      </ul>
      <Button 
        onClick={onSelect} 
        disabled={isLoading} 
        variant={highlighted ? 'default' : 'outline'}
        className="w-full"
      >
        Choisir ce forfait
      </Button>
    </div>
  );
}
