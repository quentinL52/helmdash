'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/* ===== SVG Logo HelmDash (piste 1b — gouvernail plein) ===== */
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
    <g fill="currentColor">
      <circle cx="50" cy="7" r="5.5" />
      <circle cx="50" cy="7" r="5.5" transform="rotate(60 50 50)" />
      <circle cx="50" cy="7" r="5.5" transform="rotate(120 50 50)" />
      <circle cx="50" cy="7" r="5.5" transform="rotate(180 50 50)" />
      <circle cx="50" cy="7" r="5.5" transform="rotate(240 50 50)" />
      <circle cx="50" cy="7" r="5.5" transform="rotate(300 50 50)" />
    </g>
    <circle cx="50" cy="50" r="13" fill="currentColor" />
  </svg>
);

/* ===== Pricing ===== */
const PRICING_PLANS = [
  {
    name: 'Starter',
    featured: false,
    tagline: 'Le poste de pilotage essentiel : dashboard + agent central.',
    price: '4 €', per: '/ mois',
    note: 'soit 49 € / an',
    features: [
      'Dashboard finances, hypothèses, roadmap',
      'Agent central (50k tokens/mois)',
      '3 sous-agents (Finance, Growth, PM)',
      'Import Notion, CSV, Stripe',
      '1 espace de travail',
    ],
    cta: 'Commencer', ctaVariant: 'outline' as const,
    bg: 'bg-[#F5F1E8]', fg: 'text-[#0E1B2E]', sub: 'text-[#7a7666]',
    border: 'border-[rgba(14,27,46,0.16)]',
  },
  {
    name: 'Growth',
    featured: true,
    tagline: 'Le poste complet : 10 sous-agents + veille automatique.',
    price: '16,50 €', per: '/ mois',
    note: 'soit 199 € / an · −20%',
    features: [
      'Tout Starter, sans limite de requêtes',
      '10 sous-agents spécialisés',
      'Veille concurrentielle automatique',
      'CRM + Hypothèses Lean illimités',
      'Team 3 seats · SSO · Audit logs',
      'Simulations de runway illimitées',
    ],
    cta: 'Rejoindre la cohorte →', ctaVariant: 'default' as const,
    bg: 'bg-[#0E1B2E]', fg: 'text-[#EAE6DC]', sub: 'text-[#8a95a6]',
    border: 'border-[#F0522E]',
  },
  {
    name: 'Scale',
    featured: false,
    tagline: 'Pour les startups en croissance et les agences.',
    price: '50 €', per: '/ mois',
    note: 'soit 599 € / an',
    features: [
      'Tout Growth, en illimité',
      'Sous-agents illimités',
      'Custom MCP servers',
      'On-premise possible',
      '10 seats · SLA 99.9%',
      'Dedicated success manager',
    ],
    cta: 'Nous contacter', ctaVariant: 'outline' as const,
    bg: 'bg-[#F5F1E8]', fg: 'text-[#0E1B2E]', sub: 'text-[#7a7666]',
    border: 'border-[rgba(14,27,46,0.16)]',
  },
];

const PAINS = [
  { tag: '01', title: "Le contexte s'évapore", body: "Ta décision d'hier est dans un doc Notion, le chiffre qui la justifie dans un tableur, le raisonnement dans un vieux thread ChatGPT. Reconstituer prend 20 min à chaque fois." },
  { tag: '02', title: "Tu décides à l'aveugle", body: "« Est-ce qu'on peut se le permettre ? » demande d'ouvrir trois fichiers et de faire le calcul à la main. Alors souvent, tu tranches au feeling." },
  { tag: '03', title: 'Personne ne suit à ta place', body: "La veille concurrente, le suivi des hypothèses, le pipe CRM : tout ça n'avance que quand tu t'en occupes. C'est-à-dire jamais assez." },
  { tag: '04', title: "L'IA ne connaît pas ton business", body: "ChatGPT te répond bien — mais à froid. Il n'a ni tes chiffres, ni ton historique, ni le droit d'écrire quoi que ce soit dans tes outils." },
];

const COMPARISON_ROWS = [
  { label: "Vue d'ensemble du business", notion: 'à monter soi-même', gpt: '—', linear: 'produit only', helm: 'native' },
  { label: 'Suivi financier / runway', notion: 'tableur bricolé', gpt: 'calcul manuel', linear: '—', helm: 'temps réel' },
  { label: 'Agit dans tes données', notion: 'manuel', gpt: 'lecture seule', linear: 'manuel', helm: "l'agent écrit" },
  { label: 'Mémoire du contexte', notion: 'si tu ranges', gpt: 'oublie', linear: 'tickets', helm: 'permanente' },
  { label: 'Sous-agents spécialisés', notion: '—', gpt: 'générique', linear: '—', helm: '10 métiers' },
  { label: 'Veille concurrentielle', notion: 'à la main', gpt: 'sur demande', linear: '—', helm: 'automatique' },
];

export default function LandingPage() {
  const [period, setPeriod] = useState<'year' | 'month'>('year');

  return (
    <div className="min-h-screen bg-[#E9E4D8] text-[#0E1B2E] font-sans selection:bg-[#F0522E] selection:text-[#F5F1E8]" style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-[#E9E4D8]/80 backdrop-blur-md border-b border-[#0E1B2E]/10">
        <div className="max-w-6xl mx-auto px-8 py-3.5 flex items-center gap-5">
          <a href="#top" className="flex items-center gap-2.5">
            <HelmIcon size={26} color="#0E1B2E" />
            <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Helmdash</span>
          </a>
          <nav className="flex gap-6 ml-6 text-[13px] font-medium text-[#4a5666]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            <a href="#probleme" className="hover:text-[#0E1B2E] transition-colors">Le problème</a>
            <a href="#solution" className="hover:text-[#0E1B2E] transition-colors">La solution</a>
            <a href="#comparatif" className="hover:text-[#0E1B2E] transition-colors">Comparatif</a>
            <a href="#pricing" className="hover:text-[#0E1B2E] transition-colors">Pricing</a>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/auth" className="text-[13px] font-medium text-[#4a5666]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Se connecter</Link>
            <a href="#pricing" className="text-[13px] font-semibold bg-[#0E1B2E] text-[#F5F1E8] px-4 py-2 rounded-lg hover:-translate-y-px hover:shadow-lg transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Rejoindre la cohorte</a>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="max-w-6xl mx-auto px-8 pt-20 pb-10">
        <div className="inline-flex items-center gap-2 border border-[#0E1B2E]/20 rounded-full py-1.5 pl-2 pr-3 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0522E] shadow-[0_0_0_3px_rgba(240,82,46,0.18)]" />
          <span className="text-xs font-medium text-[#3a4656] tracking-wide" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Cohorte #4 · 12 places restantes · démarrage 15 sept.</span>
        </div>

        <h1 className="text-[clamp(38px,6.4vw,82px)] font-semibold tracking-[-2.5px] leading-[1.02] mb-6 max-w-4xl" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          Six outils ouverts.<br />Zéro vue d'ensemble.<br /><span className="text-[#8a8474]">Une seule barre à tenir.</span>
        </h1>

        <p className="text-[clamp(17px,1.7vw,21px)] leading-relaxed text-[#3a4656] max-w-[600px] mb-9">
          Helmdash réunit tes finances, tes hypothèses, ta roadmap et ta veille dans un seul poste de pilotage — piloté par un agent qui lit et écrit directement dans <em className="not-italic text-[#0E1B2E] font-semibold">tes</em> données. Fini le copier-coller entre Notion, tableurs et ChatGPT.
        </p>

        <div className="flex flex-wrap gap-3.5 items-center mb-4">
          <a href="#pricing" className="text-[15px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-6 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0522E]/30 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Prendre la barre →</a>
          <a href="#solution" className="text-[15px] font-semibold text-[#0E1B2E] px-5 py-4 rounded-lg border border-[#0E1B2E]/20 hover:bg-[#0E1B2E]/5 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Voir le produit</a>
        </div>
        <p className="text-[12.5px] text-[#8a8474]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Pas de carte bancaire · Import Notion & CSV en 2 min · Résiliable à tout moment</p>

        <div className="flex items-center gap-3.5 mt-14 pt-5 border-t border-[#0E1B2E]/12">
          <span className="text-[11px] tracking-[1.5px] text-[#8a8474] uppercase" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Ils ont arrêté de jongler</span>
          <div className="flex-1 h-px bg-[#0E1B2E]/8" />
          <div className="flex gap-5 text-[13px] font-semibold text-[#3a4656] flex-wrap" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            <span>indie hackers</span><span className="text-[#8a8474]">·</span>
            <span>micro-SaaS</span><span className="text-[#8a8474]">·</span>
            <span>bootstrappers</span><span className="text-[#8a8474]">·</span>
            <span>solopreneurs</span>
          </div>
        </div>
      </section>

      {/* ===== PROBLÈME ===== */}
      <section id="probleme" className="max-w-6xl mx-auto px-8 py-16">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>01 / LE PROBLÈME</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2 mb-3 max-w-[760px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Tu ne diriges pas ton business. Tu cours après lui.</h2>
        <p className="text-[17px] text-[#3a4656] max-w-[620px] mb-10">Coder seul à minuit, c'est déjà assez dur. Le vrai coût, c'est le temps perdu à recoller les morceaux éparpillés dans quinze onglets.</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-px bg-[#0E1B2E]/12 border border-[#0E1B2E]/12 rounded-2xl overflow-hidden">
          {PAINS.map((p) => (
            <div key={p.tag} className="bg-[#F5F1E8] p-7 min-h-[210px] flex flex-col hover:bg-[#FBF8F1] transition-colors">
              <div className="text-[13px] font-bold text-[#F0522E] mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{p.tag}</div>
              <h3 className="text-[19px] font-semibold tracking-[-0.5px] mb-2.5 leading-tight" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{p.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-[#4a5666]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SOLUTION ===== */}
      <section id="solution" className="bg-[#0E1B2E] text-[#EAE6DC] py-20">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>02 / LA SOLUTION</span>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2.5 mb-3 max-w-[800px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Un poste de pilotage. Un agent qui a les mains dans le cambouis.</h2>
          <p className="text-[17px] text-[#a9b2c0] max-w-[640px] mb-10">L'agent central lit tes chiffres, met à jour tes hypothèses, délègue à des sous-agents spécialisés — et te rend une décision, pas un pavé de texte.</p>

          {/* Product mockup window */}
          <div className="border border-[#EAE6DC]/15 rounded-2xl overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] bg-[#0B1524]">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#111F33] border-b border-[#EAE6DC]/10">
              <div className="flex gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#33415A]" /><span className="w-2.5 h-2.5 rounded-full bg-[#33415A]" /><span className="w-2.5 h-2.5 rounded-full bg-[#33415A]" /></div>
              <div className="ml-2 text-xs text-[#6e7b90] flex items-center gap-1.5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                <HelmIcon size={13} color="#F0522E" />helmdash.app / poste-de-pilotage
              </div>
              <div className="ml-auto text-[11px] text-[#4a5666]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>⌘K</div>
            </div>
            <div className="grid grid-cols-[186px_1fr_316px] min-h-[520px]">
              {/* Sidebar mock */}
              <aside className="bg-[#0C1728] border-r border-[#EAE6DC]/8 p-4 flex flex-col gap-1">
                <div className="text-[10px] tracking-[1.2px] text-[#4a5666] px-2 pb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>PILOTAGE</div>
                {[
                  { label: "Vue d'ensemble", active: true },
                  { label: 'Finances' }, { label: 'Hypothèses', badge: '2' },
                  { label: 'Roadmap' }, { label: 'CRM', badge: '8' },
                  { label: 'Veille', badge: '3' },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-2.5 text-[13px] px-2 py-2 rounded-md transition-colors ${item.active ? 'text-[#EAE6DC] bg-[#F0522E]/15 font-semibold' : 'text-[#a9b2c0] font-medium'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    <span className={`w-1.5 h-1.5 rounded-sm ${item.active ? 'bg-[#F0522E]' : 'bg-[#33415A]'}`} />
                    {item.label}
                    {item.badge && <span className="ml-auto text-[10px] text-[#4a5666]">{item.badge}</span>}
                  </div>
                ))}
                <div className="mt-auto border-t border-[#EAE6DC]/8 pt-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-gradient-to-br from-[#233247] to-[#14263D]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>JM</div>
                  <div>
                    <div className="text-xs text-[#c9cfd9] font-medium" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Jonas M.</div>
                    <div className="text-[10px] text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>solo · pré-seed</div>
                  </div>
                </div>
              </aside>

              {/* Main content mock */}
              <main className="p-5 overflow-hidden">
                <div className="flex items-baseline gap-2.5 mb-4">
                  <h3 className="text-base font-semibold text-[#EAE6DC]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Vue d'ensemble</h3>
                  <span className="text-[11px] text-[#6e7b90]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>mise à jour il y a 2 min par l'agent</span>
                </div>
                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'MRR', value: '4 280 €', trend: '▲ 38% / 6 mois', tc: '#3FB27F' },
                    { label: 'Runway', value: '8,2 mois', trend: '▼ 0,4 vs. avril', tc: '#E0A54A' },
                    { label: 'Burn / mois', value: '3 100 €', trend: 'stable', tc: '#8a95a6' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-[#111F33] border border-[#EAE6DC]/10 rounded-xl p-3.5">
                      <div className="text-[10.5px] tracking-[.5px] text-[#6e7b90] mb-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{kpi.label}</div>
                      <div className="text-2xl font-semibold text-[#EAE6DC] tracking-[-1px] leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{kpi.value}</div>
                      <div className="text-[11px] font-semibold mt-1.5" style={{ color: kpi.tc, fontFamily: '"IBM Plex Mono", monospace' }}>{kpi.trend}</div>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div className="bg-[#111F33] border border-[#EAE6DC]/10 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3.5">
                    <div className="text-xs text-[#c9cfd9] font-medium" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>MRR · 6 derniers mois</div>
                    <div className="text-[11px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>+38%</div>
                  </div>
                  <div className="flex items-end gap-2.5 h-24">
                    {['38%', '46%', '52%', '68%', '82%', '100%'].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full rounded-[4px_4px_2px_2px] hover:opacity-80 transition-opacity" style={{ height: h, background: i === 5 ? '#F0522E' : i >= 3 ? '#2B4A6E' : '#25405F' }} />
                        <span className="text-[9.5px] text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{['avr','mai','juin','juil','août','sept'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hypotheses */}
                <div className="bg-[#111F33] border border-[#EAE6DC]/10 rounded-xl p-3.5">
                  <div className="text-xs text-[#c9cfd9] font-medium mb-3 flex items-center gap-2" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Hypothèses Lean <span className="text-[10px] text-[#6e7b90] font-normal">· 2 à tester cette semaine</span>
                  </div>
                  {[
                    { s: 'VALIDÉE', c: '#3FB27F', t: "L'onboarding guidé réduit le churn J7", conf: 'conf. 82%' },
                    { s: 'À TESTER', c: '#E0A54A', t: 'Les devs paient pour la veille auto', conf: 'conf. 41%' },
                    { s: 'À TESTER', c: '#7A3A2A', t: 'Le tarif annuel augmente la rétention', conf: 'conf. 33%', light: true },
                  ].map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-t border-[#EAE6DC]/5 first:border-0">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap" style={{ color: h.light ? '#F5F1E8' : '#0E1B2E', background: h.c, fontFamily: '"IBM Plex Mono", monospace' }}>{h.s}</span>
                      <span className="text-[13px] text-[#c2c8d2] flex-1">{h.t}</span>
                      <span className="text-[11px] text-[#6e7b90] whitespace-nowrap" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{h.conf}</span>
                    </div>
                  ))}
                </div>
              </main>

              {/* Agent panel mock */}
              <aside className="bg-[#0C1728] border-l border-[#EAE6DC]/8 flex flex-col">
                <div className="px-4 py-3.5 border-b border-[#EAE6DC]/8 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#F0522E] flex items-center justify-center"><HelmIcon size={16} color="#0E1B2E" /></div>
                  <div>
                    <div className="text-[13px] text-[#EAE6DC] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Barreur</div>
                    <div className="text-[10px] text-[#6e7b90]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>agent · connecté à tes données</div>
                  </div>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3FB27F] shadow-[0_0_0_3px_rgba(63,178,127,0.2)]" />
                </div>
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
                  <div className="self-end max-w-[88%] bg-[#1B2A40] border border-[#EAE6DC]/8 rounded-xl rounded-br-sm px-3 py-2.5 text-[12.5px] text-[#d5dae2]">On peut se payer un freelance design 2 mois ?</div>
                  <div className="max-w-[94%] bg-[#101E31] border border-[#EAE6DC]/10 rounded-xl rounded-bl-sm px-3 py-3">
                    <div className="text-[10px] text-[#6e7b90] mb-2 tracking-[.3px] uppercase" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Délégué à 2 sous-agents</div>
                    <div className="flex flex-col gap-1.5 mb-2.5">
                      {[{ name: 'Finance', icon: '€', bg: '#2B4A6E', note: 'burn + runway' }, { name: 'Growth', icon: '↗', bg: '#7A3A2A', note: 'impact churn' }].map(s => (
                        <div key={s.name} className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold" style={{ background: s.bg, fontFamily: '"IBM Plex Mono", monospace' }}>{s.icon}</span>
                          <span className="text-[11px] text-[#b3bac6] font-medium" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{s.name}</span>
                          <span className="ml-auto text-[10px] text-[#6e7b90]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{s.note}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-[#d5dae2] mb-2">Oui, mais serré. À <strong className="text-[#EAE6DC]">3 100 €</strong> de burn, un freelance à 1 400 €/mois ramène ton runway de <strong className="text-[#EAE6DC]">8,2</strong> à <strong className="text-[#EAE6DC]">5,4 mois</strong>.</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10.5px] text-[#0E1B2E] bg-[#F0522E] px-2 py-1 rounded-md font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Simuler dans Finances</span>
                      <span className="text-[10.5px] text-[#b3bac6] border border-[#EAE6DC]/15 px-2 py-1 rounded-md" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Voir le détail</span>
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-3 border-t border-[#EAE6DC]/8">
                  <div className="flex items-center gap-2 bg-[#111F33] border border-[#EAE6DC]/12 rounded-lg px-3 py-2">
                    <span className="text-[12.5px] text-[#6e7b90] flex-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Demande à ton poste de pilotage…</span>
                    <span className="w-0.5 h-4 bg-[#F0522E] animate-pulse" />
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mt-10">
            {[
              { no: '→', title: "Il écrit, pas seulement lit", body: "L'agent met à jour une hypothèse, crée une tâche roadmap ou logue un prospect — directement dans tes données, avec ton accord." },
              { no: '→', title: 'Des sous-agents, pas un chatbot', body: "Recherche, finance, growth, produit : chacun a son domaine et ses outils. L'agent central orchestre et te rend une synthèse." },
              { no: '→', title: 'La mémoire de ton bateau', body: "Chaque décision garde son contexte : le chiffre, le raisonnement, la date. Tu ne repars jamais de zéro." },
            ].map((f, i) => (
              <div key={i}>
                <div className="text-xs font-bold text-[#F0522E] mb-2.5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{f.no}</div>
                <h3 className="text-[17px] font-semibold text-[#EAE6DC] mb-1.5 tracking-[-0.4px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#9aa4b3]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMMENT ÇA MARCHE ===== */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>03 / COMMENT ÇA MARCHE</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2.5 mb-10 max-w-[680px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Opérationnel avant ton prochain café.</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {[
            { n: '1', title: 'Branche tes outils', body: 'Connecte Stripe, importe ton Notion et tes tableurs. Helmdash range tout dans un modèle unique — finances, roadmap, hypothèses, CRM.', meta: '≈ 2 min · rien à reconstruire' },
            { n: '2', title: "L'agent prend ses marques", body: "Il lit ton historique, calcule tes métriques, repère les hypothèses en attente et te fait un premier point de situation.", meta: 'premier brief en < 5 min' },
            { n: '3', title: 'Tu pilotes, il exécute', body: 'Tu poses tes questions en langage naturel. Il analyse, délègue, et agit dans tes données — tu valides d\'un clic.', meta: 'en continu · 7j/7' },
          ].map((s) => (
            <div key={s.n} className="pr-7">
              <div className="flex items-center gap-3.5 mb-4">
                <span className="text-[15px] font-bold text-[#0E1B2E] w-10 h-10 border-[1.5px] border-[#0E1B2E] rounded-full flex items-center justify-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{s.n}</span>
                <div className="flex-1 h-px bg-[repeating-linear-gradient(90deg,rgba(14,27,46,0.3)_0_5px,transparent_5px_10px)]" />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.5px] mb-2.5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#4a5666] mb-3.5">{s.body}</p>
              <div className="text-xs text-[#8a8474] bg-[#0E1B2E]/5 rounded-md px-2.5 py-2 inline-block" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{s.meta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMPARATIF ===== */}
      <section id="comparatif" className="bg-[#F5F1E8] border-y border-[#0E1B2E]/10 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>04 / POSITIONNEMENT</span>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2.5 mb-3 max-w-[720px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Chaque outil fait bien une chose. Aucun ne les relie.</h2>
          <p className="text-base text-[#4a5666] max-w-[600px] mb-10">On ne remplace pas ton éditeur ni ton LLM. On tient la vue d'ensemble qu'aucun d'eux ne tient.</p>

          <div className="overflow-x-auto border border-[#0E1B2E]/14 rounded-2xl bg-[#EFEADD]">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.1fr] bg-[#E4DECF] border-b border-[#0E1B2E]/14">
                <div className="px-4 py-4 text-xs tracking-[.5px] text-[#6a6656] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>CE QUE TU FAIS</div>
                {['Notion', 'ChatGPT', 'Linear', 'Helmdash'].map(h => (
                  <div key={h} className={`px-3 py-4 text-[13px] font-semibold text-center ${h === 'Helmdash' ? 'bg-[#0E1B2E] text-[#F5F1E8] flex items-center justify-center gap-1.5' : 'text-[#3a4656]'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {h === 'Helmdash' && <HelmIcon size={14} color="#F0522E" />}{h}
                  </div>
                ))}
              </div>
              {COMPARISON_ROWS.map((r) => (
                <div key={r.label} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1.1fr] border-b border-[#0E1B2E]/8">
                  <div className="px-4 py-3.5 text-sm text-[#2a3646] font-medium flex items-center">{r.label}</div>
                  <div className="px-3 py-3.5 text-xs text-center text-[#7a7666] flex items-center justify-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{r.notion}</div>
                  <div className="px-3 py-3.5 text-xs text-center text-[#7a7666] flex items-center justify-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{r.gpt}</div>
                  <div className="px-3 py-3.5 text-xs text-center text-[#7a7666] flex items-center justify-center" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{r.linear}</div>
                  <div className="px-3 py-3.5 text-[12.5px] font-semibold text-center text-[#0E1B2E] bg-[#F0522E]/7 flex items-center justify-center gap-1" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    <span className="text-[#F0522E] font-bold">✓</span>{r.helm}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#8a8474] mt-4" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Garde-les tous si tu veux. Helmdash importe leurs données et redonne le fil.</p>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>05 / PRICING</span>
        <div className="flex flex-wrap items-end justify-between gap-5 mt-2.5 mb-3">
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] max-w-[620px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Un prix. Écrit noir sur blanc.</h2>
          <div className="flex items-center gap-2.5 bg-[#F5F1E8] border border-[#0E1B2E]/16 rounded-full p-1">
            <button onClick={() => setPeriod('month')} className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${period === 'month' ? 'bg-[#0E1B2E] text-[#F5F1E8]' : 'text-[#6a6656]'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Mensuel</button>
            <button onClick={() => setPeriod('year')} className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-all ${period === 'year' ? 'bg-[#0E1B2E] text-[#F5F1E8]' : 'text-[#6a6656]'}`} style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Annuel <span className="text-[#F0522E]">−20%</span>
            </button>
          </div>
        </div>
        <p className="text-base text-[#4a5666] max-w-[600px] mb-10">Pas de « contactez-nous », pas de palier caché. Tu entres avec une cohorte, tu gardes ton tarif fondateur tant que tu restes.</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
          {PRICING_PLANS.map((plan) => (
            <div key={plan.name} className={`${plan.bg} ${plan.fg} border-[1.5px] ${plan.border} rounded-2xl p-7 relative flex flex-col hover:-translate-y-1 hover:shadow-2xl transition-all`}>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-semibold tracking-[-0.3px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{plan.name}</h3>
                {plan.featured && <span className="text-[10px] font-bold bg-[#F0522E] text-[#0E1B2E] px-2 py-0.5 rounded-md" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>POPULAIRE</span>}
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
              <a href="#" className="mt-auto text-center text-sm font-semibold py-3 rounded-lg transition-opacity hover:opacity-90"
                style={{ fontFamily: '"IBM Plex Mono", monospace', background: plan.featured ? '#F0522E' : 'transparent', color: plan.featured ? '#0E1B2E' : plan.fg === 'text-[#0E1B2E]' ? '#0E1B2E' : '#EAE6DC', border: plan.featured ? '1px solid #F0522E' : plan.fg === 'text-[#0E1B2E]' ? '1px solid #0E1B2E' : '1px solid rgba(234,230,220,0.24)' }}
              >{plan.cta}</a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="bg-[#0E1B2E] text-[#EAE6DC] py-20 relative overflow-hidden">
        <div className="absolute right-[-90px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] text-[#F0522E]/10"><HelmIcon size={420} /></div>
        <div className="max-w-6xl mx-auto px-8 relative">
          <div className="max-w-[640px]">
            <HelmIcon size={44} color="#F0522E" />
            <h2 className="text-[clamp(30px,4vw,52px)] font-semibold tracking-[-2px] leading-[1.05] mt-6 mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Arrête de recoller les morceaux. Prends la barre.</h2>
            <p className="text-lg text-[#a9b2c0] mb-8">Cohorte #4 · 12 places · démarrage le 15 septembre. Import de tes outils en 2 minutes, aucune carte requise.</p>
            <div className="flex flex-wrap gap-3.5">
              <a href="#" className="text-[15px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-7 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0522E]/35 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Réserver ma place →</a>
              <a href="#solution" className="text-[15px] font-semibold text-[#EAE6DC] px-6 py-4 rounded-lg border border-[#EAE6DC]/24 hover:bg-[#EAE6DC]/5 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Revoir le produit</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0B1524] text-[#8a95a6] py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-wrap gap-10 justify-between items-start pb-9 border-b border-[#EAE6DC]/8">
            <div className="max-w-[300px]">
              <div className="flex items-center gap-2.5 mb-3.5">
                <HelmIcon size={24} color="#EAE6DC" />
                <span className="font-semibold text-[17px] text-[#EAE6DC] tracking-[-0.5px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Helmdash</span>
              </div>
              <p className="text-[13.5px] leading-relaxed text-[#6e7b90]">Le poste de pilotage du solo founder. Un dashboard, un agent, zéro onglet en trop.</p>
            </div>
            <div className="flex gap-14 flex-wrap">
              {[
                { head: 'PRODUIT', links: ['Le poste de pilotage', "L'agent Barreur", 'Sous-agents', 'Intégrations', 'Changelog'] },
                { head: 'RESSOURCES', links: ['Guide du solo founder', 'Modèles Lean', 'Documentation', 'Feuille de route'] },
                { head: 'COHORTE', links: ['Prochaine cohorte', 'Discord', 'Parrainage', 'Contact'] },
              ].map(col => (
                <div key={col.head}>
                  <div className="text-[11px] tracking-[1px] text-[#4a5666] mb-3.5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{col.head}</div>
                  <div className="flex flex-col gap-2">
                    {col.links.map(l => (
                      <a key={l} href="#" className="text-[13.5px] text-[#9aa4b3] hover:text-[#EAE6DC] transition-colors">{l}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-between items-center pt-5">
            <div className="text-xs text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>© 2026 Helmdash · Fait à Lyon par un solo founder, pour les solo founders.</div>
            <div className="flex gap-5 text-xs text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              <a href="#" className="hover:text-[#9aa4b3] transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-[#9aa4b3] transition-colors">CGU</a>
              <a href="#" className="hover:text-[#9aa4b3] transition-colors">Statut</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
