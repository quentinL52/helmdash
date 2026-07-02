'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ===== SVG Logo HelmDash ===== */
const HelmIcon = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ color }}>
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
);

const FEATURES = [
  { emoji: '🧠', title: 'Central Agent', desc: 'A conversational AI that knows your business, your memory, and your goals. Ask questions, delegate tasks, get insights.' },
  { emoji: '📊', title: 'Business Dashboard', desc: 'Track finances, hypotheses, roadmap, CRM, content, and competitive watch — all in one place.' },
  { emoji: '🔗', title: 'Tool Integrations', desc: 'Connect Stripe, GitHub, Linear, Notion, Gmail, Slack, and 20+ tools via Composio.' },
  { emoji: '🧩', title: 'Sub-Agents', desc: 'Delegate to specialized agents: PM, CFO, Growth, Legal, Tech Lead, Research, Content, Recruiting.' },
  { emoji: '💾', title: 'Persistent Memory', desc: 'Vector database + knowledge graph. Every decision, every insight is saved and recalled.' },
  { emoji: '🔒', title: 'Privacy First', desc: 'EU hosting, AES-256 encryption, no cookies, no training on your data.' },
];

const PRICING_PLANS = [
  { name: 'Free', price: '$0', per: '/mo', note: 'Forever free', tagline: 'Discover Helmdash', features: ['1 agent', '3 integrations', '1K AI calls/mo', '10MB memory'], cta: 'Get Started', bg: 'bg-[#F5F1E8]', fg: 'text-[#0E1B2E]', border: 'border-[#0E1B2E]/16', sub: 'text-[#6a6656]', featured: false },
  { name: 'Starter', price: '$49', per: '/year', note: '≈ $4/mo · 14-day trial', tagline: 'For solo founders pre-MVP', features: ['Full central agent', '3 sub-agents', '10 integrations', '50K AI calls/mo', 'Stripe sync', '100MB memory'], cta: 'Start Free Trial', bg: 'bg-[#0E1B2E]', fg: 'text-[#EAE6DC]', border: 'border-[#0E1B2E]', sub: 'text-[#a9b2c0]', featured: true },
  { name: 'Growth', price: '$199', per: '/year', note: '≈ $16/mo', tagline: 'For seed startups (2-10)', features: ['10 sub-agents', '50 integrations', '500K AI calls/mo', 'Team (3 seats)', 'SSO + audit logs', 'Webhooks', '1GB memory'], cta: 'Start Free Trial', bg: 'bg-[#F5F1E8]', fg: 'text-[#0E1B2E]', border: 'border-[#0E1B2E]/16', sub: 'text-[#6a6656]', featured: false },
];

export default function LandingEN() {
  const [period, setPeriod] = useState<'month' | 'year'>('year');

  return (
    <div className="min-h-screen bg-[#EAE6DC] text-[#0E1B2E] font-sans">
      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-8 py-5">
        <div className="flex items-center gap-2.5">
          <HelmIcon size={28} color="#F0522E" />
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Helmdash</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-[13px] font-semibold hover:text-[#F0522E] transition-colors">Features</a>
          <a href="#pricing" className="text-[13px] font-semibold hover:text-[#F0522E] transition-colors">Pricing</a>
          <Link href="/auth" className="text-[13px] font-semibold hover:text-[#F0522E] transition-colors">Sign In</Link>
          <Link href="/auth" className="text-[13px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-4 py-2 rounded-lg hover:-translate-y-px hover:shadow-lg transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            Take the helm →
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-8 pt-20 pb-24">
        <div className="max-w-[800px]">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>FOUNDER OS — BETA</span>
          <h1 className="text-[clamp(36px,5vw,64px)] font-semibold tracking-[-2.5px] leading-[1.02] mt-4 mb-6" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            Your business dashboard,<br />
            your AI agents,<br />
            <span className="text-[#F0522E]">your memory.</span>
          </h1>
          <p className="text-lg text-[#4a5666] max-w-[560px] mb-8 leading-relaxed">
            Helmdash is the all-in-one operating system for solo founders. 
            Track your metrics, chat with your central agent, delegate to sub-agents, 
            and build persistent memory — all in one place.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-[15px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-6 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0522E]/30 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Take the helm →
            </Link>
            <a href="#features" className="text-[13px] font-semibold text-[#4a5666] hover:text-[#0E1B2E] transition-colors">
              See features
            </a>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>02 / FEATURES</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] max-w-[620px] mt-2.5 mb-3" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          Everything a solo founder needs.
        </h2>
        <p className="text-base text-[#4a5666] max-w-[500px] mb-12">
          No more juggling between Notion, Linear, Stripe, and ChatGPT. One login, one brain, one bar.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#F5F1E8] border border-[#0E1B2E]/16 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="text-base font-semibold mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{f.title}</h3>
              <p className="text-[13.5px] text-[#4a5666] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>03 / PRICING</span>
        <div className="flex flex-wrap items-end justify-between gap-5 mt-2.5 mb-3">
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] max-w-[620px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>One price. Written in black and white.</h2>
          <div className="flex items-center gap-2.5 bg-[#F5F1E8] border border-[#0E1B2E]/16 rounded-full p-1">
            <button onClick={() => setPeriod('month')} className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${period === 'month' ? 'bg-[#0E1B2E] text-[#F5F1E8]' : 'text-[#6a6656]'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Monthly</button>
            <button onClick={() => setPeriod('year')} className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${period === 'year' ? 'bg-[#0E1B2E] text-[#F5F1E8]' : 'text-[#6a6656]'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Yearly <span className="text-[#F0522E]">−20%</span>
            </button>
          </div>
        </div>
        <p className="text-base text-[#4a5666] max-w-[600px] mb-10">No "contact us", no hidden tiers. Join a cohort and keep your founder pricing forever.</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.name} className={`${plan.bg} ${plan.fg} border-[1.5px] ${plan.border} rounded-2xl p-7 relative flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all`}>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{plan.name}</h3>
                {plan.featured && <span className="text-[10px] font-bold bg-[#F0522E] text-[#0E1B2E] px-2 py-0.5 rounded-md" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>POPULAR</span>}
              </div>
              <p className={`text-[13.5px] ${plan.sub} mb-5 leading-relaxed min-h-[38px]`}>{plan.tagline}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-[40px] font-semibold tracking-[-2px] leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{plan.price}</span>
                <span className={`text-sm ${plan.sub}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{plan.per}</span>
              </div>
              <div className={`text-[11.5px] ${plan.sub} mb-5`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{plan.note}</div>
              <div className="flex flex-col gap-2.5 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex gap-2.5 items-start text-[13.5px] leading-relaxed">
                    <span className="text-[#F0522E] font-bold shrink-0">✓</span>
                    <span className={plan.fg === 'text-[#0E1B2E]' ? 'text-[#2a3646]' : 'text-[#c2c8d2]'}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth" className="mt-auto text-center text-sm font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
                style={{ fontFamily: '"IBM Plex Mono", monospace', background: plan.featured ? '#F0522E' : 'transparent', color: plan.featured ? '#0E1B2E' : plan.fg === 'text-[#0E1B2E]' ? '#0E1B2E' : '#EAE6DC', border: plan.featured ? '1px solid #F0522E' : plan.fg === 'text-[#0E1B2E]' ? '1px solid #0E1B2E' : '1px solid rgba(234,230,220,0.24)' }}
              >{plan.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[#0E1B2E] text-[#EAE6DC] py-20 relative overflow-hidden">
        <div className="absolute right-[-90px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] text-[#F0522E]/10"><HelmIcon size={420} /></div>
        <div className="max-w-6xl mx-auto px-8 relative">
          <div className="max-w-[640px]">
            <HelmIcon size={44} color="#F0522E" />
            <h2 className="text-[clamp(30px,4vw,52px)] font-semibold tracking-[-2px] leading-[1.05] mt-6 mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Stop patching tools together. Take the helm.
            </h2>
            <p className="text-lg text-[#a9b2c0] mb-8">Cohort #4 · 12 spots · starts September 15. Import your tools in 2 minutes, no credit card required.</p>
            <Link href="/auth" className="inline-block text-[15px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-6 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0522E]/30 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Take the helm →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0E1B2E] text-[#8a8474] border-t border-[#2a3646] py-8">
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <HelmIcon size={16} color="#F0522E" />
            <span>Helmdash — Founder OS</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/legal/privacy" className="hover:text-[#EAE6DC] transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-[#EAE6DC] transition-colors">Terms</Link>
            <a href="https://twitter.com/helmdash" className="hover:text-[#EAE6DC] transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}