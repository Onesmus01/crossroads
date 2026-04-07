/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    output: "export", // ✅ Enable static export
    images: {
    unoptimized: true,
  },

}

export default nextConfig
