'use client';

import { useTranslations } from 'next-intl';
import { Mail, Linkedin, Twitter, Rocket } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function ContactPage() {
  const t = useTranslations('landing');
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
            <Link href="/" className="hover:-translate-y-[1px] hover:shadow-[0_6px_16px_rgba(14,27,46,0.22)] transition-all" style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, fontWeight: 600, background: "#0E1B2E", color: "#F5F1E8", padding: "9px 16px", borderRadius: 8 }}>{t('nav.join')}</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: "0 auto", padding: "120px 32px" }}>
        <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, letterSpacing: "1.5px", color: accent, fontWeight: 600 }}>CONTACT</span>
        <h1 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: "clamp(32px,4vw,48px)", fontWeight: 600, letterSpacing: "-1.5px", lineHeight: 1.1, margin: "10px 0 40px" }}>
          Get in touch
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <a href="mailto:hello@helmdash.app" className="hover:-translate-y-[2px] transition-all" style={{ display: "flex", alignItems: "center", gap: 16, background: "#F5F1E8", padding: "24px", borderRadius: 16, border: "1px solid rgba(14,27,46,.1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,27,46,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E1B2E" }}>
              <Mail size={24} />
            </div>
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: "#4a5666", marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0E1B2E" }}>hello@helmdash.app</div>
            </div>
          </a>

          <a href="https://www.indiehackers.com/product/helmdash" target="_blank" rel="noreferrer" className="hover:-translate-y-[2px] transition-all" style={{ display: "flex", alignItems: "center", gap: 16, background: "#F5F1E8", padding: "24px", borderRadius: 16, border: "1px solid rgba(14,27,46,.1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,27,46,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E1B2E" }}>
              <Rocket size={24} />
            </div>
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: "#4a5666", marginBottom: 4 }}>Indie Hackers</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0E1B2E" }}>Helmdash</div>
            </div>
          </a>

          <a href="https://www.producthunt.com/products/helmdash" target="_blank" rel="noreferrer" className="hover:-translate-y-[2px] transition-all" style={{ display: "flex", alignItems: "center", gap: 16, background: "#F5F1E8", padding: "24px", borderRadius: 16, border: "1px solid rgba(14,27,46,.1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,27,46,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F28A2E" }}>
              <span style={{ fontSize: 24, fontWeight: 800 }}>P</span>
            </div>
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: "#4a5666", marginBottom: 4 }}>Product Hunt</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0E1B2E" }}>Helmdash</div>
            </div>
          </a>

          <a href="https://www.linkedin.com/company/helmdashapp" target="_blank" rel="noreferrer" className="hover:-translate-y-[2px] transition-all" style={{ display: "flex", alignItems: "center", gap: 16, background: "#F5F1E8", padding: "24px", borderRadius: 16, border: "1px solid rgba(14,27,46,.1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,27,46,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E1B2E" }}>
              <Linkedin size={24} />
            </div>
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: "#4a5666", marginBottom: 4 }}>LinkedIn</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0E1B2E" }}>Helmdash App</div>
            </div>
          </a>

          <a href="https://twitter.com/helmdashapp" target="_blank" rel="noreferrer" className="hover:-translate-y-[2px] transition-all" style={{ display: "flex", alignItems: "center", gap: 16, background: "#F5F1E8", padding: "24px", borderRadius: 16, border: "1px solid rgba(14,27,46,.1)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,27,46,.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0E1B2E" }}>
              <Twitter size={24} />
            </div>
            <div>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: "#4a5666", marginBottom: 4 }}>Twitter</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#0E1B2E" }}>@helmdashapp</div>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
