/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '176.123.164.182' },
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
