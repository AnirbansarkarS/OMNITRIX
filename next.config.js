/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
