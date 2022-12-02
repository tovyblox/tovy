/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
	domains: ['tr.rbxcdn.com']
  }
}

module.exports = nextConfig
