'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProposalCard } from './ProposalCard';
import { cn } from '@/lib/utils';
import { DefaultChatTransport } from 'ai';

export function ChatUI({ initialConversationId }: { initialConversationId?: string }) {
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  );
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const [localInput, setLocalInput] = useState('');

  const transport = useMemo(() => new DefaultChatTransport({
    api: '/api/ai/chat/stream',
    body: {
      conversationId,
    },
  }), [conversationId]);

  const { messages, status, setMessages, sendMessage } = useChat({
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Fetch history if needed
  useEffect(() => {
    if (initialConversationId) {
      fetch(`/api/ai/chat/history?conversationId=${initialConversationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.conversation?.messages) {
            setMessages(data.conversation.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: 'text', text: m.content }]
            })));
          }
        })
        .catch(console.error);
    }
  }, [initialConversationId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInput.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: localInput }] });
    setLocalInput('');
  };

  const renderMessageContent = (content: string) => {
    const proposalRegex = /\[PROPOSAL:([a-zA-Z0-9-]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = proposalRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={lastIndex}>{content.substring(lastIndex, match.index)}</span>);
      }
      const proposalId = match[1];
      parts.push(
        <ProposalCard 
          key={proposalId}
          proposalId={proposalId}
          onAccept={(id) => {
             sendMessage({ role: 'user', parts: [{ type: 'text', text: `J'accepte la proposition ${id}` }] });
          }}
          onReject={(id) => {
             sendMessage({ role: 'user', parts: [{ type: 'text', text: `Je rejette la proposition ${id}` }] });
          }}
        />
      );
      lastIndex = proposalRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-card/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 pointer-events-none" />
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 transition-colors">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-70">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-inner">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">Bonjour, je suis le Barreur.</p>
            <p className="text-sm">Comment puis-je vous aider aujourd'hui ?</p>
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} className={cn("flex gap-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm", m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-white/5 border border-white/10")}>
              {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={cn("max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed", m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-white/5 border border-white/10 text-foreground")}>
              {renderMessageContent(
                m.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('') || ''
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 flex-row">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[85%] rounded-2xl px-5 py-3.5 bg-white/5 border border-white/10 text-foreground flex items-center gap-3 shadow-sm text-[15px]">
              <Loader2 className="w-4 h-4 animate-spin text-primary" /> Le Barreur réfléchit...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      
      <div className="p-4 bg-background/40 backdrop-blur-md border-t border-white/10 relative z-20">
        <form onSubmit={handleFormSubmit} className="flex gap-3 relative max-w-4xl mx-auto">
          <input
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Posez votre question ou décrivez une tâche..."
            className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-[15px] focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-muted-foreground/70"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-md" 
            disabled={isLoading || !localInput.trim()}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
