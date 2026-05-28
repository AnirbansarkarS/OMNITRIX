import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                omni: {
                    bg: "#050A14",
                    surface: "#0D1526",
                    card: "#111D33",
                    border: "#1E2D4A",
                    hover: "#243452",
                    accent: "#00FF66",
                    "accent-dim": "#00CC55",
                    success: "#00FF88",
                    warning: "#FFB800",
                    danger: "#FF4D6D",
                    text: "#E8F4FD",
                    muted: "#7A9BB5",
                    subtle: "#3D5A7A",
                },
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "omni-glow": "radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.15) 0%, transparent 70%)",
            },
            animation: {
                "spin-slow": "spin 8s linear infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
                "float": "float 6s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
                "slide-in": "slideIn 0.3s ease-out",
                "fade-in": "fadeIn 0.4s ease-out",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                glow: {
                    from: { boxShadow: "0 0 10px rgba(0,255,102,0.3)" },
                    to: { boxShadow: "0 0 25px rgba(0,255,102,0.7), 0 0 50px rgba(0,255,102,0.3)" },
                },
                slideIn: {
                    from: { opacity: "0", transform: "translateX(-10px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
            },
            boxShadow: {
                "omni": "0 0 30px rgba(0,255,102,0.1), 0 4px 24px rgba(0,0,0,0.4)",
                "omni-accent": "0 0 20px rgba(0,255,102,0.4)",
                "omni-card": "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            },
        },
    },
    plugins: [],
};

export default config;
