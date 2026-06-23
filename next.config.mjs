/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export optional — remove if you need server-side features like Stripe webhooks
  // output: 'export',

  // Vercel handles image optimization; no domains needed for this project
  images: {
    unoptimized: false,
  },
}

export default nextConfig
