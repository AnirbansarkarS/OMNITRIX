import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // Allow three.js worker and WASM files
    webpack: (config) => {
        config.module.rules.push({
            test: /\.wasm$/,
            type: "asset/resource",
        });
        return config;
    },
};

export default nextConfig;
