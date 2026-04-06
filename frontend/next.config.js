/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@rainbow-me/rainbowkit'],
}

module.exports = nextConfig
