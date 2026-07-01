import { Toaster } from "@/components/ui/toaster";
import { StoreSync } from '@/components/store-sync';
import "./globals.css";
import type { Metadata } from 'next';
import { Inter, VT323 } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const vt323 = VT323({ weight: "400", subsets: ['latin'], variable: '--font-pixel' });

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
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${vt323.variable} font-sans antialiased`}>
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
