"use client";

interface Stats {
    polys: number;
    verts: number;
    materials: number;
}

export default function SceneStats({ stats }: { stats: Stats }) {
    const fmt = (n: number) =>
        n >= 1_000_000
            ? (n / 1_000_000).toFixed(1) + "M"
            : n >= 1_000
                ? (n / 1_000).toFixed(1) + "K"
                : String(n);

    const items = [
        { label: "Polygons", value: fmt(stats.polys) },
        { label: "Vertices", value: fmt(stats.verts) },
        { label: "Materials", value: String(stats.materials) },
    ];

    return (
        <div className="absolute bottom-4 left-4 flex gap-2 animate-fade-in pointer-events-none">
            {items.map(({ label, value }) => (
                <div
                    key={label}
                    className="bg-omni-surface/80 backdrop-blur-md border border-omni-border rounded-lg px-3 py-1.5 text-center"
                >
                    <p className="text-[10px] text-omni-muted">{label}</p>
                    <p className="text-xs font-semibold text-omni-accent font-mono">{value}</p>
                </div>
            ))}
        </div>
    );
}
