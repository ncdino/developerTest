/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'front-mission.bigs.or.kr',
        port: '',
        pathname: '/media/images/**',
      },
    ],
  },
};

export default nextConfig;