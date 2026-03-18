/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for the Docker multi-stage build (copies only what's needed)
  output: 'standalone',
}

module.exports = nextConfig
