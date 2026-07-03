'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { COHORT_CONFIG } from '@/lib/billing/cohort-config';

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

export default function LandingPage() {
  const t = useTranslations('landing');
  const [period, setPeriod] = useState<'yearly' | 'semi_annual' | 'monthly'>('semi_annual');
  const currentCohort = 'early'; // Assume 'early' for the MVP, could be fetched dynamically

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
            <a href="#probleme" className="hover:text-[#0E1B2E] transition-colors">{t('problemSurtitle').split('/')[1].trim()}</a>
            <a href="#solution" className="hover:text-[#0E1B2E] transition-colors">{t('productSurtitle').split('/')[1].trim()}</a>
            <a href="#pricing" className="hover:text-[#0E1B2E] transition-colors">{t('pricingSurtitle').split('/')[1].trim()}</a>
            <a href="#roadmap" className="hover:text-[#0E1B2E] transition-colors">{t('roadmapSurtitle').split('/')[1].trim()}</a>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/auth" className="text-[13px] font-medium text-[#4a5666]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Se connecter</Link>
            <a href="#pricing" className="text-[13px] font-semibold bg-[#0E1B2E] text-[#F5F1E8] px-4 py-2 rounded-lg hover:-translate-y-px hover:shadow-lg transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('pricingCtaPrimary')}</a>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="max-w-6xl mx-auto px-8 pt-20 pb-10">
        <div className="inline-flex items-center gap-2 border border-[#0E1B2E]/20 rounded-full py-1.5 pl-2 pr-3 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F0522E] shadow-[0_0_0_3px_rgba(240,82,46,0.18)]" />
          <span className="text-xs font-medium text-[#3a4656] tracking-wide" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {t('heroBadge', { cohort: '4', seats: '12', date: '15 sept.' })}
          </span>
        </div>

        <h1 className="text-[clamp(38px,6.4vw,82px)] font-semibold tracking-[-2.5px] leading-[1.02] mb-6 max-w-4xl" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {t('heroTitle').split('\\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </h1>

        <p className="text-[clamp(17px,1.7vw,21px)] leading-relaxed text-[#3a4656] max-w-[600px] mb-9">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-wrap gap-3.5 items-center mb-4">
          <a href="#pricing" className="text-[15px] font-semibold bg-[#F0522E] text-[#0E1B2E] px-6 py-4 rounded-lg hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#F0522E]/30 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('ctaPrimary')}</a>
          <a href="#solution" className="text-[15px] font-semibold text-[#0E1B2E] px-5 py-4 rounded-lg border border-[#0E1B2E]/20 hover:bg-[#0E1B2E]/5 transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('ctaSecondary')}</a>
        </div>
        <p className="text-[12.5px] text-[#8a8474]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('noCreditCard')}</p>

        <div className="flex items-center gap-3.5 mt-14 pt-5 border-t border-[#0E1B2E]/12">
          <span className="text-[11px] tracking-[1.5px] text-[#8a8474] uppercase" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('socialProof')}</span>
          <div className="flex-1 h-px bg-[#0E1B2E]/8" />
        </div>
      </section>

      {/* ===== PROBLÈME ===== */}
      <section id="probleme" className="max-w-6xl mx-auto px-8 py-16">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('problemSurtitle')}</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2 mb-3 max-w-[760px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('problemTitle')}</h2>
        <p className="text-[17px] text-[#3a4656] max-w-[620px] mb-10">{t('problemSubtitle')}</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-px bg-[#0E1B2E]/12 border border-[#0E1B2E]/12 rounded-2xl overflow-hidden">
          {t.raw('pains').map((p: any) => (
            <div key={p.tag} className="bg-[#F5F1E8] p-7 min-h-[210px] flex flex-col hover:bg-[#FBF8F1] transition-colors">
              <div className="text-[13px] font-bold text-[#F0522E] mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{p.tag}</div>
              <h3 className="text-[19px] font-semibold tracking-[-0.5px] mb-2.5 leading-tight" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{p.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-[#4a5666]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRODUCT TOUR ===== */}
      <section id="solution" className="bg-[#0E1B2E] text-[#EAE6DC] py-20">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('productSurtitle')}</span>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2.5 mb-3 max-w-[800px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('productTitle')}</h2>
          <p className="text-[17px] text-[#a9b2c0] max-w-[640px] mb-10">{t('productSubtitle')}</p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 mt-10">
            {t.raw('productFeatures').map((f: any, i: number) => (
              <div key={i}>
                <div className="text-xs font-bold text-[#F0522E] mb-2.5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>→</div>
                <h3 className="text-[17px] font-semibold text-[#EAE6DC] mb-1.5 tracking-[-0.4px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#9aa4b3]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRANSPARENCE ===== */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('transparencySurtitle')}</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2 mb-3 max-w-[760px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('transparencyTitle')}</h2>
        <p className="text-[17px] text-[#3a4656] max-w-[620px] mb-10">{t('transparencySubtitle')}</p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
          {t.raw('transparencyItems').map((item: any, i: number) => (
            <div key={i} className="bg-[#E9E4D8] border border-[#0E1B2E]/10 p-6 rounded-xl">
              <h3 className="text-base font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-[#4a5666]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="bg-[#F5F1E8] border-y border-[#0E1B2E]/10 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('pricingSurtitle')}</span>
          <div className="flex flex-wrap items-end justify-between gap-5 mt-2.5 mb-3">
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] max-w-[620px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('pricingTitle')}</h2>
          </div>
          <p className="text-base text-[#4a5666] max-w-[600px] mb-10">{t('pricingSubtitle')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            <div className="bg-[#0E1B2E] text-[#EAE6DC] border-[1.5px] border-[#F0522E] rounded-2xl p-7 relative">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-base font-semibold tracking-[-0.3px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Cohorte {currentCohort.toUpperCase()}</h3>
              </div>
              <div className="flex items-baseline gap-1.5 mt-5 mb-1">
                <span className="text-[40px] font-semibold tracking-[-2px] leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{COHORT_CONFIG[currentCohort].prices.semi_annual?.amount ? (COHORT_CONFIG[currentCohort].prices.semi_annual.amount / 100 / 6).toFixed(0) : 0} €</span>
                <span className="text-sm text-[#8a95a6]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>/ mois</span>
              </div>
              <div className="text-[11.5px] text-[#8a95a6] mb-5" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Facturé {COHORT_CONFIG[currentCohort].prices.semi_annual?.amount ? (COHORT_CONFIG[currentCohort].prices.semi_annual.amount / 100).toFixed(0) : 0} € tous les 6 mois</div>
              <a href="/auth" className="mt-8 block text-center text-sm font-semibold py-3 rounded-lg bg-[#F0522E] text-[#0E1B2E] transition-opacity hover:opacity-90" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('pricingCtaPrimary')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ROADMAP ===== */}
      <section id="roadmap" className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('roadmapSurtitle')}</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2 mb-3 max-w-[760px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('roadmapTitle')}</h2>
        <p className="text-[17px] text-[#3a4656] max-w-[620px] mb-10">{t('roadmapSubtitle')}</p>

        <div className="bg-[#F5F1E8] border border-[#0E1B2E]/10 rounded-xl p-6">
          <ul className="space-y-4 max-w-xl">
            {t.raw('roadmapItems').map((item: any, i: number) => (
              <li key={i} className="flex justify-between items-center py-2 border-b border-[#0E1B2E]/5 last:border-0">
                <span className="font-medium text-[#0E1B2E]">{item.title}</span>
                <span className="text-[11px] font-semibold px-2 py-1 bg-[#0E1B2E]/5 rounded text-[#4a5666] uppercase" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== MAKER NOTE ===== */}
      <section className="bg-[#0E1B2E] text-[#EAE6DC] py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('makerSurtitle')}</span>
          <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-4 mb-6" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('makerTitle')}</h2>
          <p className="text-xl leading-relaxed text-[#a9b2c0] italic">"{t('makerBody')}"</p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <span className="text-xs tracking-[1.5px] text-[#F0522E] font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('faqSurtitle')}</span>
        <h2 className="text-[clamp(28px,3.6vw,44px)] font-semibold tracking-[-1.5px] leading-[1.1] mt-2 mb-10 max-w-[760px]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{t('faqTitle')}</h2>

        <div className="max-w-2xl space-y-6">
          {t.raw('faqItems').map((faq: any, i: number) => (
            <div key={i} className="bg-[#F5F1E8] rounded-xl p-5 border border-[#0E1B2E]/5">
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-[#4a5666] leading-relaxed">{faq.a}</p>
            </div>
          ))}
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
              <p className="text-[13.5px] leading-relaxed text-[#6e7b90]">{t('heroSubtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-between items-center pt-5">
            <div className="text-xs text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>© 2026 Helmdash · Fait par un solo founder.</div>
            <div className="flex gap-5 text-xs text-[#5a6678]" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              <Link href="/legal/privacy" className="hover:text-[#9aa4b3] transition-colors">Confidentialité</Link>
              <Link href="/legal/terms" className="hover:text-[#9aa4b3] transition-colors">CGU</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
