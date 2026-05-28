"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Box,
    Upload,
    Download,
    LayoutDashboard,
    ImagePlay,
    Sparkles,
    ChevronRight,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/viewer", label: "3D Viewer", icon: Box },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/export", label: "Export", icon: Download },
];

const comingSoon = [
    { label: "Text → 3D", icon: Sparkles },
    { label: "Image → 3D", icon: ImagePlay },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex flex-col w-56 min-h-screen bg-omni-surface border-r border-omni-border shrink-0">
            {/* Logo */}
            <div className="px-4 py-5 border-b border-omni-border">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-omni-accent flex items-center justify-center animate-glow">
                        <span className="text-omni-bg font-bold text-xs">OX</span>
                    </div>
                    <span className="font-bold text-omni-text tracking-widest text-sm">OMNITRIX</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="text-[10px] font-semibold text-omni-subtle uppercase tracking-widest px-3 mb-3">
                    Phase 1
                </p>
                {navItems.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                    return (
                        <Link key={href} href={href} className={`nav-item ${active ? "active" : ""}`}>
                            <Icon size={16} />
                            {label}
                            {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
                        </Link>
                    );
                })}

                <div className="pt-4">
                    <p className="text-[10px] font-semibold text-omni-subtle uppercase tracking-widest px-3 mb-3">
                        Coming Soon
                    </p>
                    {comingSoon.map(({ label, icon: Icon }) => (
                        <div
                            key={label}
                            className="nav-item opacity-40 cursor-not-allowed select-none"
                        >
                            <Icon size={16} />
                            {label}
                            <span className="ml-auto text-[9px] badge bg-omni-warning/10 text-omni-warning border border-omni-warning/20 px-1.5 py-0">
                                Soon
                            </span>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Phase badge */}
            <div className="px-4 py-4 border-t border-omni-border">
                <div className="glass-card p-3 text-center">
                    <p className="text-[10px] text-omni-muted mb-1">Current Phase</p>
                    <p className="text-xs font-semibold text-omni-accent">Foundation</p>
                    <div className="mt-2 w-full bg-omni-border rounded-full h-1">
                        <div className="bg-omni-accent h-1 rounded-full w-1/4 transition-all" />
                    </div>
                    <p className="text-[10px] text-omni-subtle mt-1">1 / 4 phases</p>
                </div>
            </div>
        </aside>
    );
}
