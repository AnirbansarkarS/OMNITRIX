import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-omni-bg flex flex-col">
            {/* Gradient orbs */}
            <div className="gradient-orb w-[600px] h-[600px] bg-omni-accent/10 top-[-200px] left-[-100px]" />
            <div
                className="gradient-orb w-[400px] h-[400px] bg-purple-500/10 bottom-[100px] right-[-100px]"
                style={{ animationDelay: "3s" }}
            />
            <div
                className="gradient-orb w-[300px] h-[300px] bg-omni-accent/5 top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2"
                style={{ animationDelay: "1.5s" }}
            />

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-omni-border/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-omni-accent flex items-center justify-center">
                        <span className="text-omni-bg font-bold text-xs">OX</span>
                    </div>
                    <span className="text-omni-text font-bold text-lg tracking-wide">OMNITRIX</span>
                </div>
                <div className="flex items-center gap-3">
                    <SignedIn>
                        <Link href="/dashboard" className="btn-accent text-sm py-2 px-4">
                            Go to Dashboard →
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <Link href="/sign-in" className="btn-ghost text-sm py-2 px-4">
                            Sign In
                        </Link>
                        <Link href="/sign-up" className="btn-accent text-sm py-2 px-4">
                            Get Started Free
                        </Link>
                    </SignedOut>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
                <div className="badge-green mb-6 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-omni-accent animate-pulse" />
                    Phase 1 — Now Live
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
                    The Future of{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-omni-accent to-green-400">
                        3D Creation
                    </span>
                    <br />is Here
                </h1>

                <p className="text-omni-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    Generate studio-quality 3D models from text or images, view in real-time
                    WebGL, rig with AI, and export to any format — all in one platform.
                </p>

                <div className="flex gap-4 flex-wrap justify-center">
                    <Link href="/sign-up" className="btn-accent text-base px-8 py-3">
                        Start for Free →
                    </Link>
                    <Link href="/viewer" className="btn-ghost text-base px-8 py-3">
                        Try the Viewer
                    </Link>
                </div>

                {/* Phase cards */}
                <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full text-left">
                    {phases.map((p) => (
                        <div key={p.name} className="glass-card p-5 glow-ring group">
                            <div className="text-2xl mb-3">{p.icon}</div>
                            <div className="text-xs text-omni-muted mb-1 font-mono">{p.phase}</div>
                            <h3 className="font-semibold text-omni-text mb-2 group-hover:text-omni-accent transition-colors">
                                {p.name}
                            </h3>
                            <p className="text-xs text-omni-muted leading-relaxed">{p.desc}</p>
                            {p.active && (
                                <span className="mt-3 inline-block badge-green text-[10px]">Active</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 text-center py-6 text-omni-subtle text-xs border-t border-omni-border/30">
                © {new Date().getFullYear()} OMNITRIX · Built with Next.js 14 · Three.js · Clerk
            </footer>
        </main>
    );
}

const phases = [
    {
        phase: "Phase 1",
        name: "Foundation",
        icon: "🏗️",
        desc: "Next.js shell, Clerk auth, 3D WebGL viewer, model uploader, universal exporter.",
        active: true,
    },
    {
        phase: "Phase 2",
        name: "AI Core",
        icon: "🤖",
        desc: "Text→3D, Image→3D, PBR texturing, job queue with Redis + BullMQ.",
        active: false,
    },
    {
        phase: "Phase 3",
        name: "Post-Processing",
        icon: "⚙️",
        desc: "Auto-rigging, part segmentation, style filters, multi-view reconstruction.",
        active: false,
    },
    {
        phase: "Phase 4",
        name: "Ecosystem",
        icon: "🌐",
        desc: "Asset gallery, Blender plugin, Unity package, Stripe credits + billing.",
        active: false,
    },
];
