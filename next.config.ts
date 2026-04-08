import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
  },
}

export default nextConfig
