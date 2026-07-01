// @ts-nocheck
'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';

export function ChatUI({ userId }: { userId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/ai/chat/stream',
    body: { userId },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto shadow-xl border-border/50 overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card/50 backdrop-blur-sm">
        <BrainCircuit className="w-6 h-6 mr-3 text-primary" />
        <div>
          <h2 className="text-lg font-semibold tracking-tight font-mono">Barreur</h2>
          <p className="text-xs text-muted-foreground">Orchestrateur & Mémoire Active</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 mt-20">
              <div className="p-4 bg-primary/10 rounded-full">
                <BrainCircuit className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium">Comment puis-je vous aider aujourd'hui ?</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Je suis votre assistant principal. Je peux interagir avec vos données, consulter votre mémoire, ou déléguer des tâches à d'autres agents.
              </p>
            </div>
          )}

          {messages.map((m: any) => (
            <div
              key={m.id}
              className={`flex ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex max-w-[85%] gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="w-8 h-8 border shadow-sm">
                  {m.role === 'user' ? (
                    <>
                      <AvatarImage src="/avatars/founder.png" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/avatars/agent.png" />
                      <AvatarFallback className="bg-blue-500/10 text-blue-500">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>

                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted/50 border border-border/50 text-foreground rounded-tl-sm'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    {/* Gestion des tool calls visuellement */}
                    {m.toolInvocations?.map((toolInvocation: any) => (
                      <div key={toolInvocation.toolCallId} className="my-2 p-3 bg-background/80 rounded-md border text-xs text-muted-foreground font-mono flex flex-col gap-1">
                        <span className="font-semibold text-primary">
                          Tool Call: {toolInvocation.toolName}
                        </span>
                        <span>
                          {JSON.stringify(toolInvocation.args)}
                        </span>
                        {toolInvocation.state === 'result' ? (
                          <div className="mt-2 text-green-500">
                            ✓ Terminé
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center text-blue-400">
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" /> En cours...
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-card/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto"
        >
          <Input
            value={input || ''}
            onChange={handleInputChange}
            placeholder="Demandez un rapport financier, une recherche de marché, ou planifiez une tâche..."
            className="flex-1 bg-background/50 focus-visible:ring-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input?.trim()}
            className="shrink-0 rounded-full w-10 h-10"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
            Propulsé par Founder OS Core Agent
          </span>
        </div>
      </div>
    </Card>
  );
}
