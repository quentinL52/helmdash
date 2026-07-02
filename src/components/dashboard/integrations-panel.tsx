'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Integration {
  app: string;
  tools: string[];
  status: 'connected' | 'disconnected';
}

const APP_LABELS: Record<string, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  linear: 'Linear',
  jira: 'Jira',
  notion: 'Notion',
  stripe: 'Stripe',
  plaid: 'Plaid',
  gocardless: 'GoCardless',
  apollo: 'Apollo',
  linkedin: 'LinkedIn',
  hubspot: 'HubSpot',
  gmail: 'Gmail',
  slack: 'Slack',
  discord: 'Discord',
  serpapi: 'SerpAPI',
  firecrawl: 'Firecrawl',
  figma: 'Figma',
};

export function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/integrations/composio/list');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch {
      // Silently fail — integrations are optional
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (appName: string) => {
    setConnecting(appName);
    try {
      const res = await fetch('/api/integrations/composio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName }),
      });

      if (!res.ok) throw new Error('Failed to connect');

      const data = await res.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
        toast({
          title: `Connexion ${appName}`,
          description: 'Redirigé vers Composio pour autoriser la connexion.',
        });
      }
    } catch (err) {
      toast({
        title: 'Erreur',
        description: `Impossible de connecter ${appName}.`,
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };

  // Grouper par catégorie
  const categories = {
    dev: ['github', 'gitlab', 'linear', 'jira', 'notion'],
    finance: ['stripe', 'plaid', 'gocardless'],
    marketing: ['apollo', 'linkedin', 'hubspot'],
    communication: ['gmail', 'slack', 'discord'],
    research: ['serpapi', 'firecrawl'],
    design: ['figma'],
  };

  const categoryLabels: Record<string, string> = {
    dev: 'Développement & Produit',
    finance: 'Finance & Billing',
    marketing: 'Ventes & Marketing',
    communication: 'Communication',
    research: 'Recherche & Données',
    design: 'Design',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intégrations</CardTitle>
          <CardDescription>Connectez vos outils externes</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Intégrations</CardTitle>
          <CardDescription>
            {integrations.filter((i) => i.status === 'connected').length} sur {integrations.length} connectées
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchIntegrations}>
          <RefreshCw className="w-3 h-3 mr-1" />
          Rafraîchir
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(categories).map(([catKey, apps]) => {
          const catIntegrations = integrations.filter((i) => apps.includes(i.app));
          if (catIntegrations.length === 0) return null;

          return (
            <div key={catKey}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                {categoryLabels[catKey]}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catIntegrations.map((integration) => (
                  <div
                    key={integration.app}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0">
                        {integration.status === 'connected' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {APP_LABELS[integration.app] || integration.app}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {integration.tools.length} action(s)
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {integration.status === 'connected' ? (
                        <Badge variant="secondary" className="text-[10px]">Connecté</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleConnect(integration.app)}
                          disabled={connecting === integration.app}
                        >
                          {connecting === integration.app ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <ExternalLink className="w-3 h-3 mr-1" />
                          )}
                          Connecter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}