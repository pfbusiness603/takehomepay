import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/success'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

