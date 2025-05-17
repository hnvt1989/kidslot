/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js to handle static assets correctly
  reactStrictMode: true,
  swcMinify: true,
  // Configure static asset handling
  images: {
    unoptimized: true,
  },
  // Set public directory for assets
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
}

module.exports = nextConfig