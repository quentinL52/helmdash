'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFounderStore } from "@/store/founder-store";
import { Bot, Save, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import type { ProviderName, AIModel } from "@/lib/ai/provider-interface";

export function AISettingsPanel() {
  const store = useFounderStore();
  const { aiSettings, setAiSettings } = store;
  
  const [provider, setProvider] = useState<ProviderName>(aiSettings.provider || 'openai');
  const [apiKey, setApiKey] = useState<string>(aiSettings.apiKeys?.[provider] || '');
  const [model, setModel] = useState<string>(aiSettings.model || '');
  const [showKey, setShowKey] = useState(false);
  
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update local state when provider changes
  useEffect(() => {
    setApiKey(aiSettings.apiKeys?.[provider] || '');
    setModel(aiSettings.provider === provider ? aiSettings.model || '' : '');
    setAvailableModels([]);
    setError('');
    setSuccess('');
  }, [provider, aiSettings]);

  const fetchModels = async (currentKey: string) => {
    if (!currentKey) return;
    
    setIsLoadingModels(true);
    setError('');
    
    try {
      const res = await fetch(`/api/ai/models?provider=${provider}`, {
        headers: { 'x-api-key': currentKey }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion au provider');
      }
      
      setAvailableModels(data.models || []);
      
      // Auto-select first model if none selected
      if (!model && data.models && data.models.length > 0) {
        setModel(data.models[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les modèles');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
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
      // Create new apiKeys object
      const newApiKeys = {
        ...aiSettings.apiKeys,
        [provider]: apiKey
      };

      // Ensure provider is of type ProviderName before passing to setAiSettings
      const providerName = provider as ProviderName;

      // Save to store
      setAiSettings({
        provider: providerName,
        model,
        apiKeys: newApiKeys
      });

      setSuccess('Configuration sauvegardée avec succès !');
      
      // Fetch models to verify key works if we haven't already
      if (availableModels.length === 0) {
        await fetchModels(apiKey);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const PROVIDERS: { id: ProviderName; name: string }[] = [
    { id: 'openai', name: 'OpenAI' },
    { id: 'anthropic', name: 'Anthropic' },
    { id: 'gemini', name: 'Google Gemini' },
    { id: 'mistral', name: 'Mistral AI' },
  ];

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
          {aiSettings.provider && aiSettings.apiKeys[aiSettings.provider] && (
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
                    placeholder={`sk-...`}
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
                  disabled={!apiKey || isLoadingModels}
                  className="font-pixel text-[10px]"
                >
                  {isLoadingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : "VÉRIFIER"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Votre clé est stockée localement dans votre navigateur (Zustand persist). Elle n'est envoyée qu'à l'API de {provider}.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-pixel text-xs text-muted-foreground">MODÈLE</Label>
              <Select value={model} onValueChange={setModel} disabled={availableModels.length === 0}>
                <SelectTrigger className="bg-background/50 font-mono text-sm">
                  <SelectValue placeholder={
                    isLoadingModels ? "Chargement des modèles..." : 
                    availableModels.length === 0 ? "Entrez votre clé pour voir les modèles" : 
                    "Sélectionnez un modèle"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(m => (
                    <SelectItem key={m.id} value={m.id} className="font-mono text-sm">
                      {m.name || m.id} <span className="text-muted-foreground text-xs ml-2">({m.id})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={isSaving || !apiKey}
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
