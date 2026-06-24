import { MetadataRoute } from 'next'
import { STATES } from '@/lib/states'
import { JOB_TYPES } from '@/lib/job-types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  for (const state of STATES) {
    entries.push({
      url: `${siteUrl}/calculator/${state.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
    for (const job of JOB_TYPES) {
      entries.push({
        url: `${siteUrl}/calculator/${state.slug}/${job.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return entries
}

