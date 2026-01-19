/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-recall'],
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig
