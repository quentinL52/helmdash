import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://helmdash.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/auth/', '/notify/'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
