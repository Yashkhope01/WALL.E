/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  images: {
    // Allow Next.js <Image> to serve images from the Render backend domain.
    // Update the hostname below once your Render service URL is known.
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        // Matches any *.onrender.com subdomain (your Render service)
        hostname: '**.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
