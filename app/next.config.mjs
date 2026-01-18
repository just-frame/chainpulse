/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/coins/images/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.dexscreener.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.helius-rpc.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.alchemyapi.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos.covalenthq.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
