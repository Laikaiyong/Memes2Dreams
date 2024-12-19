/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**', // Allows all hostnames
                port: '', // No specific port
                pathname: '**', // Allows all paths
            },
        ],
    },
};

export default nextConfig;