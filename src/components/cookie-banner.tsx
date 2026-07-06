'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      right: 20,
      maxWidth: 400,
      background: '#0E1B2E',
      color: '#F5F1E8',
      padding: '16px 20px',
      borderRadius: 12,
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 9999,
      fontFamily: '"IBM Plex Sans", sans-serif',
      fontSize: 13,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <p style={{ margin: 0 }}>
        Nous utilisons uniquement les cookies nécessaires au bon fonctionnement de l'application (session, langue). Aucun tracking.
        {' '}
        <Link href="/legal/cookies" style={{ textDecoration: 'underline', color: '#F0522E' }}>
          En savoir plus
        </Link>.
      </p>
      <button 
        onClick={accept}
        style={{
          background: '#F0522E',
          color: '#F5F1E8',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 6,
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          fontFamily: '"IBM Plex Mono", monospace'
        }}
      >
        J'ai compris
      </button>
    </div>
  );
}
