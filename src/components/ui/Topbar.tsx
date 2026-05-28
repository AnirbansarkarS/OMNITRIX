"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const breadcrumbs: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/viewer": "3D Viewer",
    "/upload": "Upload Model",
    "/export": "Export",
};

export default function Topbar() {
    const pathname = usePathname();
    const label = breadcrumbs[pathname] ?? "OMNITRIX";

    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    return (
        <header className="flex items-center justify-between px-6 py-3 border-b border-omni-border bg-omni-surface/80 backdrop-blur-md sticky top-0 z-30">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
                <span className="text-omni-subtle text-sm">OMNITRIX</span>
                <span className="text-omni-border">/</span>
                <span className="text-sm font-semibold text-omni-text">{label}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2 rounded-lg text-omni-muted hover:text-omni-accent hover:bg-omni-hover transition-all duration-200"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Clerk user button */}
                <UserButton
                    appearance={{
                        variables: {
                            colorPrimary: "#00FF66",
                            colorBackground: "#0D1526",
                            colorText: "#E8F4FD",
                        },
                    }}
                />
            </div>
        </header>
    );
}
