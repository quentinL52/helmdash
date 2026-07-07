import { Toaster } from "@/components/ui/toaster";
import { StoreSync } from '@/components/store-sync';
import { CookieBanner } from '@/components/cookie-banner';
import "./globals.css";
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

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
import { JsonLd } from '@/components/seo/JsonLd';

import { getTranslations, getLocale } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('seo');
  const locale = await getLocale();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://helmdash.com';
  
  return {
    metadataBase: new URL(appUrl),
    title: {
      template: '%s | Helmdash',
      default: t('title'),
    },
    description: t('description'),
    alternates: {
      canonical: appUrl,
      languages: {
        'en': `${appUrl}/en`,
        'fr': `${appUrl}/fr`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: appUrl,
      siteName: 'Helmdash',
      images: [
        {
          url: '/icon.png',
          width: 800,
          height: 600,
          alt: 'Helmdash logo',
        },
      ],
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      creator: '@helmdashapp',
      images: ['/icon.png'],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://helmdash.com';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Helmdash',
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    sameAs: [
      'https://www.linkedin.com/company/helmdashapp',
      'https://twitter.com/helmdashapp'
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Helmdash',
    url: appUrl,
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body className={`${ibmPlexMono.variable} ${ibmPlexSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <StoreSync />
            {children}
            <CookieBanner />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
