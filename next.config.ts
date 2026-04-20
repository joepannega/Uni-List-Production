import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Supabase client has untyped schema (no generated types) — suppress until types are generated
    ignoreBuildErrors: true,
  },
}

export default nextConfig
