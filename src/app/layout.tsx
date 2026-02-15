import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/toaster";
import { StoreSync } from '@/components/store-sync';
import "./globals.css";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
    <ClerkProvider>
      <html lang="en" className="dark">
        <head />
        <body className={inter.className}>
          <StoreSync />
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
