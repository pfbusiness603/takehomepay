import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import StickyMobileCta from '@/components/StickyMobileCta'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TakeHomePay — Free Paycheck & Pay Stub Calculator (2026)',
    template: '%s | TakeHomePay',
  },
  description:
    'Free paycheck calculator for all 50 states. See your exact take-home pay after federal tax, state tax, Social Security, and Medicare. Generate a professional PDF pay stub for $5.99.',
  keywords: ['paycheck calculator', 'take home pay', 'salary calculator', 'pay stub generator', 'net pay calculator'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takehomepaycalculator.dev'),
  openGraph: {
    type: 'website',
    siteName: 'TakeHomePay',
    title: 'TakeHomePay — Free Paycheck Calculator (2026)',
    description: 'See your exact take-home pay after all taxes and deductions. All 50 states.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google AdSense — replace publisher ID once approved */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? 'ca-pub-XXXXXXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <GoogleAnalytics />
        {children}
        <StickyMobileCta />
      </body>
    </html>
  )
}
