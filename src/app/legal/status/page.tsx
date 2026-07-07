'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function StatusPage() {
  const tLanding = useTranslations('landing');
  const t = useTranslations('legal_pages.status');
  const accent = "#F0522E";

  return (
    <div style={{ background: "#E9E4D8", color: "#0E1B2E", fontFamily: '"IBM Plex Sans", system-ui, sans-serif', minHeight: '100vh' }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(233,228,216,.82)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(14,27,46,.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/helmdash-mark-navy-512.png" alt="Helmdash Icon" style={{ width: 26, height: 26 }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, fontSize: 18, letterSpacing: "-0.5px" }}>Helmdash</span>
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
            <LanguageSwitcher iconColor="#0E1B2E" />
            <Link href="/" className="hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(14,27,46,0.22)] transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 600, background: "#0E1B2E", color: "#F5F1E8", padding: "9px 16px", borderRadius: 8 }}>{tLanding('nav.join')}</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "80px 32px 120px" }}>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: "1.5px", color: accent, fontWeight: 600 }}>{t('tag')}</span>
        <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "clamp(28px,4vw,40px)", fontWeight: 600, letterSpacing: "-1px", lineHeight: 1.1, margin: "10px 0 20px" }}>
          {t('title')}
        </h1>
        <p style={{ color: "#6e7b90", marginBottom: 48, fontFamily: '"IBM Plex Mono", monospace', fontSize: 14 }}>{t('updated')}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {[0, 1].map((i) => (
            <div key={i}>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: "#0E1B2E" }}>{t(`sections.${i}.title`)}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4a5666", whiteSpace: "pre-wrap" }}>{t(`sections.${i}.body`)}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
