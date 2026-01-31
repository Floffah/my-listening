import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    typedRoutes: true,
    // cacheComponents: true,
    experimental: {
        viewTransition: true,
    },
};

export default nextConfig;
