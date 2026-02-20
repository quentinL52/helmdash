import { Toaster } from "@/components/ui/toaster";
import { StoreSync } from '@/components/store-sync';
import "./globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'FounderOS',
  description: 'Centralize your project logic.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
