/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd'],
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['tile.openstreetmap.org'],
  },
}

module.exports = nextConfig
