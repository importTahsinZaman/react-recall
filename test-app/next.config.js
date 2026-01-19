/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  transpilePackages: ['react-recall'],
}

module.exports = nextConfig
