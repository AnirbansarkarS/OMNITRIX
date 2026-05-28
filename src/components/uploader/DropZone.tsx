"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { useModelStore } from "@/lib/store";

const ACCEPTED = ["glb", "gltf", "obj", "stl", "fbx"];
const MAX_MB = 100;

function formatBytes(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DropZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ name: string; size: string; ext: string } | null>(null);
    const setFile = useModelStore((s) => s.setFile);
    const router = useRouter();

    const handleFile = useCallback(
        (file: File) => {
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            setError(null);

            if (!ACCEPTED.includes(ext)) {
                setError(`Unsupported format ".${ext}". Use: ${ACCEPTED.join(", ")}`);
                return;
            }
            if (file.size > MAX_MB * 1024 * 1024) {
                setError(`File too large (max ${MAX_MB} MB)`);
                return;
            }

            setPreview({ name: file.name, size: formatBytes(file.size), ext: ext.toUpperCase() });
            setFile(file);
        },
        [setFile]
    );

    const openInViewer = () => router.push("/viewer");

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-4">
            {/* Drop zone */}
            <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
          flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-300
          ${isDragging
                        ? "border-omni-accent bg-omni-accent/5 scale-[1.01]"
                        : "border-omni-border bg-omni-surface/40 hover:border-omni-accent/50 hover:bg-omni-accent/3"
                    }
        `}
            >
                <input
                    type="file"
                    accept={ACCEPTED.map((e) => `.${e}`).join(",")}
                    className="hidden"
                    onChange={onInput}
                />

                <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging ? "bg-omni-accent/20 shadow-omni-accent" : "bg-omni-card border border-omni-border"}`}
                >
                    <Upload size={32} className={isDragging ? "text-omni-accent" : "text-omni-muted"} />
                </div>

                <div className="text-center">
                    <p className="font-semibold text-omni-text mb-1">
                        {isDragging ? "Drop it!" : "Drag & drop your 3D model"}
                    </p>
                    <p className="text-xs text-omni-muted">
                        or <span className="text-omni-accent underline-offset-2 hover:underline">browse file</span>
                    </p>
                </div>

                {/* Format chips */}
                <div className="flex gap-2 flex-wrap justify-center">
                    {ACCEPTED.map((fmt) => (
                        <span key={fmt} className="badge-green font-mono text-[10px] uppercase">
                            .{fmt}
                        </span>
                    ))}
                </div>
                <p className="text-[10px] text-omni-subtle">Max {MAX_MB} MB</p>
            </label>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-omni-danger/10 border border-omni-danger/30 text-omni-danger text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Success preview */}
            {preview && !error && (
                <div className="glass-card p-4 flex items-center gap-4 animate-slide-in">
                    <div className="w-10 h-10 rounded-xl bg-omni-success/10 border border-omni-success/30 flex items-center justify-center">
                        <FileCheck size={20} className="text-omni-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-omni-text text-sm truncate">{preview.name}</p>
                        <p className="text-xs text-omni-muted">
                            {preview.ext} · {preview.size}
                        </p>
                    </div>
                    <button onClick={openInViewer} className="btn-accent text-xs py-2 px-4 shrink-0">
                        Open in Viewer →
                    </button>
                </div>
            )}
        </div>
    );
}
