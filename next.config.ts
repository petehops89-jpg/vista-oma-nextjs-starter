import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['@open-multi-agent/core', 'core-engine'],
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
