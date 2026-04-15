/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 生产构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
