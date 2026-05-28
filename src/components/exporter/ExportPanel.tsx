"use client";

import { useState, useCallback } from "react";
import { Download, Settings2 } from "lucide-react";
import * as THREE from "three";

const FORMATS = ["GLB", "OBJ", "STL"] as const;
type Format = (typeof FORMATS)[number];

interface ExportPanelProps {
    getScene: () => THREE.Object3D | null;
}

export default function ExportPanel({ getScene }: ExportPanelProps) {
    const [format, setFormat] = useState<Format>("GLB");
    const [polyBudget, setBudget] = useState(500);
    const [exporting, setExporting] = useState(false);
    const [done, setDone] = useState(false);

    const download = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExport = useCallback(async () => {
        const scene = getScene();
        if (!scene) {
            alert("No model loaded — please upload a model first.");
            return;
        }

        setExporting(true);
        setDone(false);

        try {
            if (format === "GLB") {
                const { GLTFExporter } = await import(
                    "three/examples/jsm/exporters/GLTFExporter.js"
                );
                const exporter = new GLTFExporter();
                exporter.parse(
                    scene,
                    (result) => {
                        const blob = new Blob([result as ArrayBuffer], {
                            type: "model/gltf-binary",
                        });
                        download(blob, "model.glb");
                        setExporting(false);
                        setDone(true);
                    },
                    (err) => {
                        console.error(err);
                        setExporting(false);
                    },
                    { binary: true }
                );
            } else if (format === "OBJ") {
                const { OBJExporter } = await import(
                    "three/examples/jsm/exporters/OBJExporter.js"
                );
                const result = new OBJExporter().parse(scene);
                download(new Blob([result], { type: "text/plain" }), "model.obj");
                setExporting(false);
                setDone(true);
            } else if (format === "STL") {
                const { STLExporter } = await import(
                    "three/examples/jsm/exporters/STLExporter.js"
                );
                const result = new STLExporter().parse(scene, { binary: true });
                download(
                    new Blob([result as BlobPart], { type: "application/octet-stream" }),
                    "model.stl"
                );
                setExporting(false);
                setDone(true);
            }
        } catch (err) {
            console.error("Export failed:", err);
            setExporting(false);
        }
    }, [format, getScene]);

    return (
        <div className="glass-card p-5 space-y-5 w-full">
            <div className="flex items-center gap-2 mb-1">
                <Settings2 size={16} className="text-omni-accent" />
                <h2 className="font-semibold text-sm text-omni-text">Export Settings</h2>
            </div>

            {/* Format selector */}
            <div>
                <label className="text-xs text-omni-muted mb-2 block">Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                    {FORMATS.map((f) => (
                        <button
                            key={f}
                            onClick={() => { setFormat(f); setDone(false); }}
                            className={`py-2 rounded-lg text-xs font-semibold border transition-all duration-200
                ${format === f
                                    ? "bg-omni-accent text-omni-bg border-omni-accent shadow-omni-accent"
                                    : "border-omni-border text-omni-muted hover:border-omni-accent/50 hover:text-omni-accent"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-omni-subtle mt-2">
                    {format === "GLB" && "Binary GLTF — preserves textures, materials, and animations."}
                    {format === "OBJ" && "Wavefront OBJ — geometry only, no animations."}
                    {format === "STL" && "STL mesh — for 3D printing, no materials."}
                </p>
            </div>

            {/* Poly budget */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-omni-muted">Poly Budget</label>
                    <span className="text-xs font-mono text-omni-accent">
                        {polyBudget >= 1000 ? `${(polyBudget / 1000).toFixed(0)}K` : polyBudget}
                    </span>
                </div>
                <input
                    type="range"
                    min={100}
                    max={5000}
                    step={100}
                    value={polyBudget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-[#00FF66] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-omni-subtle mt-1">
                    <span>100</span>
                    <span>5000K</span>
                </div>
                <p className="text-[10px] text-omni-subtle mt-1">
                    Target density — applied during mesh simplification (Phase 3).
                </p>
            </div>

            {/* Export button */}
            <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {exporting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-omni-bg border-t-transparent rounded-full animate-spin" />
                        Exporting…
                    </>
                ) : (
                    <>
                        <Download size={15} />
                        Export as {format}
                    </>
                )}
            </button>

            {done && (
                <p className="text-center text-xs text-omni-success animate-fade-in">
                    ✓ Download started!
                </p>
            )}
        </div>
    );
}
