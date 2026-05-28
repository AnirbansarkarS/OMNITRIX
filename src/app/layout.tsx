import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "OMNITRIX — AI-Powered 3D Asset Platform",
    description:
        "Generate, view, rig, and export 3D models powered by AI. Text-to-3D, image-to-3D, PBR texturing, and community asset gallery.",
    keywords: ["3D", "AI", "model generation", "WebGL", "three.js", "OMNITRIX"],
    openGraph: {
        title: "OMNITRIX",
        description: "AI-Powered 3D Asset Platform",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.variable} font-sans dark bg-omni-bg text-omni-text`}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="omnitrix-theme">
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
