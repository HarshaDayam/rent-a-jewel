/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/rent-a-jewel',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'sriyascollection.com' }
    ]
  }
};

export default nextConfig;

