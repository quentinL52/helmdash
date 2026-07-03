'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFounderStore } from "@/store/founder-store";
import { Bot, Save, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import type { ProviderName, AIModel } from "@/lib/ai/provider-interface";

export function AISettingsPanel() {
  const store = useFounderStore();
  const { aiSettings, setAiSettings } = store;
  
  const [provider, setProvider] = useState<ProviderName>(aiSettings.provider || 'openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>(aiSettings.model || '');
  const [modelsConfig, setModelsConfig] = useState<Record<string, string>>(aiSettings.modelsConfig || {});
  const [showKey, setShowKey] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [allProviderModels, setAllProviderModels] = useState<Record<string, AIModel[]>>({});
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const PROVIDERS: { id: ProviderName; name: string }[] = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'mistral', name: 'Mistral AI' },
  ];

  // Fetch configured providers on mount
  useEffect(() => {
    const fetchConfiguredProviders = async () => {
      try {
        const res = await fetch('/api/settings/ai-keys');
        if (res.ok) {
          const data = await res.json();
          setConfiguredProviders(data.configuredProviders || []);
        }
      } catch (err) {
        console.error('Failed to fetch configured providers', err);
      }
    };
    fetchConfiguredProviders();
  }, []);

  // Update local state when provider changes
  useEffect(() => {
    setApiKey(''); // Clear API key input when switching providers
    setModel(aiSettings.provider === provider ? aiSettings.model || '' : '');
    setAvailableModels([]);
    setError('');
    setSuccess('');
  }, [provider, aiSettings]);

  // Fetch all models for all configured providers in background
  useEffect(() => {
    const fetchAll = async () => {
      const newAllModels: Record<string, AIModel[]> = {};
      for (const p of configuredProviders) {
        try {
          const res = await fetch(`/api/ai/models?provider=${p}`);
          const data = await res.json();
          if (res.ok && data.models) {
            const unique = Array.from(new Map(data.models.map((m: any) => [m.id, m])).values());
            newAllModels[p] = unique as AIModel[];
          }
        } catch (e) {}
      }
      setAllProviderModels(newAllModels);
    };
    if (configuredProviders.length > 0) {
      fetchAll();
    }
  }, [configuredProviders]);

  const fetchModels = async (currentKey?: string) => {
    const isConfigured = configuredProviders.includes(provider);
    if (!currentKey && !isConfigured) return;
    
    setIsLoadingModels(true);
    setError('');
    
    try {
      const headers: Record<string, string> = {};
      if (currentKey) {
        headers['x-api-key'] = currentKey;
      }

      const res = await fetch(`/api/ai/models?provider=${provider}`, { headers });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion au provider');
      }
      
      const uniqueModels = Array.from(new Map((data.models || []).map((m: any) => [m.id, m])).values());
      setAvailableModels(uniqueModels as AIModel[]);
      
      // Auto-select first model if none selected
      if (!model && uniqueModels && uniqueModels.length > 0) {
        setModel((uniqueModels[0] as AIModel).id);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les modèles');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = async () => {
    const isConfigured = configuredProviders.includes(provider);
    
    if (!apiKey && !isConfigured) {
      setError('Veuillez entrer une clé API');
      return;
    }

    if (!model && availableModels.length > 0) {
      setError('Veuillez sélectionner un modèle');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Ensure provider is of type ProviderName
      const providerName = provider as ProviderName;

      // If user entered a new key, save it to the server
      if (apiKey) {
        const res = await fetch('/api/settings/ai-keys', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: providerName, apiKey })
        });
        
        if (!res.ok) {
          throw new Error('Erreur lors de la sauvegarde de la clé sur le serveur');
        }
        
        if (!isConfigured) {
          setConfiguredProviders(prev => [...prev, providerName]);
        }
      }

      // Save provider and model settings to store
      setAiSettings({
        provider: providerName,
        model,
        modelsConfig
      });

      setSuccess('Configuration sauvegardée avec succès !');
      setApiKey(''); // Clear key after save for security
      
      // Fetch models to verify if we haven't already
      if (availableModels.length === 0) {
        await fetchModels();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const isCurrentProviderConfigured = configuredProviders.includes(provider);

  return (
    <Card className="bg-card/50 backdrop-blur border-accent/20 relative overflow-hidden group shadow-lg">
      <div className="absolute inset-0 bg-[url('/pixel-overlay.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      
      <CardHeader className="relative z-10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-pixel text-accent-foreground text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              CONFIGURATION IA
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-sm">
              Configurez vos AI Co-founders. Choisissez votre fournisseur de modèle préféré.
            </CardDescription>
          </div>
          {aiSettings.provider && configuredProviders.includes(aiSettings.provider) && (
            <Badge variant="outline" className="border-success text-success bg-success/10 font-pixel text-[10px]">
              <CheckCircle2 className="w-3 h-3 mr-1 inline" />
              CONFIGURÉ ({aiSettings.provider})
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 relative z-10 space-y-6">
        <Tabs value={provider} onValueChange={(v) => setProvider(v as ProviderName)}>
          <TabsList className="grid grid-cols-4 w-full bg-background/50 border border-border/50">
            {PROVIDERS.map(p => (
              <TabsTrigger 
                key={p.id} 
                value={p.id}
                className="font-pixel text-[10px] data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                {p.name.toUpperCase()}
                {configuredProviders.includes(p.id) && <CheckCircle2 className="w-3 h-3 ml-1 text-success inline" />}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="font-pixel text-xs text-muted-foreground">CLÉ API {provider.toUpperCase()}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={isCurrentProviderConfigured ? "(Clé déjà configurée, entrez-en une nouvelle pour la modifier)" : `sk-...`}
                    className="bg-background/50 font-mono text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => fetchModels(apiKey)}
                  disabled={(!apiKey && !isCurrentProviderConfigured) || isLoadingModels}
                  className="font-pixel text-[10px]"
                >
                  {isLoadingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : "VÉRIFIER"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Votre clé est chiffrée et stockée de manière sécurisée en base de données.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-pixel text-xs text-muted-foreground">MODÈLE PRINCIPAL (Agent Core)</Label>
              <Select value={model} onValueChange={setModel} disabled={availableModels.length === 0 && !isCurrentProviderConfigured}>
                <SelectTrigger className="bg-background/50 font-mono text-sm">
                  <SelectValue placeholder={
                    isLoadingModels ? "Chargement des modèles..." : 
                    (availableModels.length === 0 && !isCurrentProviderConfigured) ? "Entrez votre clé pour voir les modèles" : 
                    "Sélectionnez un modèle"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? availableModels.map((m, idx) => (
                    <SelectItem key={`${m.id}-${idx}`} value={m.id} className="font-mono text-sm">
                      {m.name || m.id} <span className="text-muted-foreground text-xs ml-2">({m.id})</span>
                    </SelectItem>
                  )) : (
                    <SelectItem value={model || "default"} className="font-mono text-sm">
                      {model || "Modèle actuel"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label className="font-pixel text-xs text-muted-foreground">MODÈLES PAR SOUS-AGENT</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { role: 'pm', label: 'Product Manager' },
                  { role: 'cfo', label: 'Directeur Financier' },
                  { role: 'growth', label: 'Growth Hacker' },
                  { role: 'research', label: 'Chercheur / Veille' },
                ].map(agent => (
                  <div key={agent.role} className="space-y-1">
                    <Label className="text-xs">{agent.label}</Label>
                    <Select 
                      value={modelsConfig[agent.role] || ''} 
                      onValueChange={(val) => setModelsConfig(prev => ({ ...prev, [agent.role]: val }))} 
                      disabled={Object.keys(allProviderModels).length === 0 && availableModels.length === 0}
                    >
                      <SelectTrigger className="bg-background/50 font-mono text-xs h-8">
                        <SelectValue placeholder="Modèle par défaut" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(allProviderModels).length > 0 ? (
                          Object.entries(allProviderModels).map(([prov, models]) => (
                            <SelectGroup key={prov}>
                              <SelectLabel>{PROVIDERS.find(p => p.id === prov)?.name || prov}</SelectLabel>
                              {models.map((m, idx) => (
                                <SelectItem key={`${prov}-${m.id}-${idx}`} value={`${prov}:${m.id}`} className="font-mono text-xs">
                                  {m.id}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))
                        ) : (
                          <SelectGroup>
                            <SelectLabel>{provider}</SelectLabel>
                            {availableModels.map((m, idx) => (
                              <SelectItem key={`${provider}-${m.id}-${idx}`} value={`${provider}:${m.id}`} className="font-mono text-xs">
                                {m.id}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-md flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleSave} 
                disabled={isSaving || (!apiKey && !isCurrentProviderConfigured)}
                className="font-pixel text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                SAUVEGARDER
              </Button>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
