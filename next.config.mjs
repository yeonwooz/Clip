/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/schedule',
                destination: 'http://118.67.130.17:8080/schedule',
            },
        ];
    },
};

export default nextConfig;
