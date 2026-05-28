import Link from "next/link";
import { Box, Upload, Download, ArrowRight } from "lucide-react";

const tools = [
    {
        href: "/viewer",
        icon: Box,
        title: "3D Viewer",
        desc: "Load and inspect GLB, OBJ, STL, FBX models with orbit controls, lighting, and scene stats.",
        badge: "Live",
        color: "from-green-500/20 to-emerald-500/10",
        border: "border-omni-accent/20 hover:border-omni-accent/50",
    },
    {
        href: "/upload",
        icon: Upload,
        title: "Upload Model",
        desc: "Drag-and-drop any 3D file. Validates format, shows file info, then opens in viewer.",
        badge: "Live",
        color: "from-purple-500/20 to-pink-500/10",
        border: "border-purple-500/20 hover:border-purple-400/50",
    },
    {
        href: "/export",
        icon: Download,
        title: "Export",
        desc: "Convert and download your model to GLB, OBJ, or STL with poly budget controls.",
        badge: "Live",
        color: "from-green-500/20 to-emerald-500/10",
        border: "border-omni-success/20 hover:border-omni-success/50",
    },
];

export default function DashboardPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold text-omni-text mb-2">
                    Welcome to{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-omni-accent to-green-400">
                        OMNITRIX
                    </span>
                </h1>
                <p className="text-omni-muted text-sm">
                    Phase 1 is live — start by uploading a model or exploring the 3D viewer.
                </p>
            </div>

            {/* Tool cards */}
            <section>
                <h2 className="text-sm font-semibold text-omni-muted uppercase tracking-widest mb-4">
                    Phase 1 — Foundation Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tools.map(({ href, icon: Icon, title, desc, badge, color, border }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`glass-card p-5 flex flex-col gap-3 border transition-all duration-300 group ${border}`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
                            >
                                <Icon size={20} className="text-omni-accent" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-omni-text group-hover:text-omni-accent transition-colors">
                                        {title}
                                    </h3>
                                    <span className="badge-green text-[10px]">{badge}</span>
                                </div>
                                <p className="text-xs text-omni-muted leading-relaxed">{desc}</p>
                            </div>
                            <div className="mt-auto flex items-center gap-1 text-xs text-omni-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                Open <ArrowRight size={12} />
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.map((s) => (
                    <div key={s.label} className="glass-card p-4 text-center">
                        <p className="text-2xl font-bold text-omni-accent mb-1">{s.value}</p>
                        <p className="text-xs text-omni-muted">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* Quick start */}
            <section className="glass-card p-6 border border-omni-accent/10">
                <h2 className="font-semibold text-omni-text mb-4">Quick Start</h2>
                <ol className="space-y-3 text-sm text-omni-muted">
                    {[
                        { step: "1", text: "Go to Upload and drag in a GLB, OBJ, STL, or FBX file.", href: "/upload" },
                        { step: "2", text: "Explore it in the 3D Viewer — orbit, zoom, pan, inspect stats.", href: "/viewer" },
                        { step: "3", text: "Head to Export, pick a format, and download.", href: "/export" },
                    ].map(({ step, text, href }) => (
                        <li key={step} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-omni-accent/10 border border-omni-accent/30 text-omni-accent text-xs flex items-center justify-center shrink-0 font-semibold">
                                {step}
                            </span>
                            <span>
                                {text}{" "}
                                <Link href={href} className="text-omni-accent hover:underline">
                                    {href}
                                </Link>
                            </span>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}

const stats = [
    { value: "4", label: "Formats Supported" },
    { value: "3", label: "Export Formats" },
    { value: "4K", label: "Texture Ready" },
    { value: "60fps", label: "WebGL Viewer" },
];
