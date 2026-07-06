"use client";

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, SkipForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function OnboardingChat({ session, onRecap }: { session: any, onRecap: (s: any) => void }) {
  const t = useTranslations('onboarding');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [acks, setAcks] = useState<Record<number, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when step or loading changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.currentStep, loading, acks]);

  const submitAnswer = async (skipped = false) => {
    if (!skipped && !answer.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/onboarding/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: session.currentStep, answer: skipped ? '' : answer })
      });
      const data = await res.json();
      if (data.ack) {
        setAcks(prev => ({ ...prev, [session.currentStep]: data.ack }));
      }
      setAnswer('');
      
      // Delay before showing next question to let the user read the ack
      setTimeout(() => {
        onRecap(data.session);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const skipFlow = async () => {
    setLoading(true);
    await fetch('/api/onboarding/skip', { method: 'POST' });
    window.location.href = '/dashboard';
  };

  const renderMessages = () => {
    const messages = [];
    for (let i = 1; i <= Math.min(session.currentStep, 6); i++) {
      // Question
      messages.push(
        <div key={`q-${i}`} className="flex justify-start mb-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
            {t(`questions.q${i}` as any)}
          </div>
        </div>
      );
      
      // Answer
      const userAns = session.answers?.[`q${i}`];
      if (userAns !== undefined || (i === session.currentStep && loading)) {
        messages.push(
          <div key={`a-${i}`} className="flex justify-end mb-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
              {userAns || answer || "..."}
            </div>
          </div>
        );
      }

      // Ack
      if (acks[i]) {
        messages.push(
          <div key={`ack-${i}`} className="flex justify-start mb-6 animate-in fade-in duration-300">
            <div className="bg-muted/50 text-muted-foreground p-3 rounded-2xl rounded-tl-sm max-w-[85%] italic text-sm">
              {acks[i]}
            </div>
          </div>
        );
      }
    }
    return messages;
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <h1 className="font-bold text-lg">{t('title')}</h1>
        <Button variant="ghost" size="sm" onClick={skipFlow}>Passer</Button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-muted w-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${(Math.min(session.currentStep, 6) / 6) * 100}%` }}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div className="py-4">
          {renderMessages()}
          {loading && !acks[session.currentStep] && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="bg-muted text-foreground p-4 rounded-2xl rounded-tl-sm max-w-[80%] flex items-center shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> ...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 sm:p-6 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex space-x-2">
          <Textarea 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
            disabled={loading || session.currentStep > 6}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitAnswer();
              }
            }}
          />
          <div className="flex flex-col space-y-2">
            <Button 
              size="icon" 
              onClick={() => submitAnswer()} 
              disabled={loading || session.currentStep > 6 || !answer.trim()}
              className="h-10 w-10 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => submitAnswer(true)} 
              disabled={loading || session.currentStep > 6}
              title={t('skip')}
              className="h-10 w-10 shrink-0 text-muted-foreground"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
