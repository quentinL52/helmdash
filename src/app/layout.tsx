import { Toaster } from "@/components/ui/toaster";
import { StoreSync } from '@/components/store-sync';
import "./globals.css";
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Helmdash — Poste de pilotage du solo founder',
  description: "Dashboard, agent IA, hypothèses, finances, roadmap. Le poste de pilotage qui réunit tes outils et lit dans tes données.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={`${ibmPlexMono.variable} ${ibmPlexSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <StoreSync />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
