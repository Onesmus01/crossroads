/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: 'dist', // Change output folder name
  images: {
    unoptimized: true,
  },
}

export default nextConfig