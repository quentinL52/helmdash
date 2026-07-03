'use client';

import { useState } from 'react';

export function NotifyForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simuler l'enregistrement (à connecter à une liste d'attente réelle)
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="inline-flex items-center gap-3 mb-4">
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="text-primary">
            <circle cx="50" cy="50" r="37" fill="none" stroke="currentColor" strokeWidth="9" />
            <g fill="currentColor">
              <rect x="46" y="8" width="8" height="40" rx="4" />
              <rect x="46" y="8" width="8" height="40" rx="4" transform="rotate(60 50 50)" />
              <rect x="46" y="8" width="8" height="40" rx="4" transform="rotate(120 50 50)" />
              <rect x="46" y="8" width="8" height="40" rx="4" transform="rotate(180 50 50)" />
              <rect x="46" y="8" width="8" height="40" rx="4" transform="rotate(240 50 50)" />
              <rect x="46" y="8" width="8" height="40" rx="4" transform="rotate(300 50 50)" />
            </g>
            <circle cx="50" cy="50" r="13" fill="currentColor" />
          </svg>
          <span className="text-2xl font-bold font-mono">Helmdash</span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">
          Take the helm of your startup
        </h1>
        <p className="text-lg text-muted-foreground">
          The AI assistant that orchestrates your data, agents, and memory.
          <br />Get notified when we launch.
        </p>

        {submitted ? (
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-lg font-medium text-green-500">✅ You are on the list!</p>
            <p className="text-sm text-muted-foreground mt-2">
              We will keep you informed about the launch. In the meantime, follow us on <a href="https://twitter.com/helmdash" className="underline">Twitter</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 px-4 py-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Subscribing...' : 'Notify me'}
            </button>
          </form>
        )}

        <p className="text-xs text-muted-foreground">
          No spam. Unsubscribe anytime. Data processed according to our{' '}
          <a href="/legal/privacy" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}
