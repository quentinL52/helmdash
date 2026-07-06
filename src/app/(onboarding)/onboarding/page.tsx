"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingChat } from './components/OnboardingChat';
import { RecapScreen } from './components/RecapScreen';

export default function OnboardingPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/onboarding')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.session.status === 'completed' || data.session.status === 'skipped') {
          router.push('/dashboard');
        } else {
          setSession(data.session);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Initialisation...</div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center">Erreur lors de la création de la session.</div>;

  if (session.status === 'recap') {
    return <RecapScreen session={session} onComplete={() => router.push('/dashboard?onboarded=true')} />;
  }

  return <OnboardingChat session={session} onRecap={(updatedSession) => setSession(updatedSession)} />;
}
