"use client";

import dynamic from "next/dynamic";
import { useModelStore } from "@/lib/store";

const ModelViewer = dynamic(() => import("@/components/viewer/ModelViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-omni-bg">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-omni-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-omni-muted">Initialising WebGL…</p>
            </div>
        </div>
    ),
});

export default function ViewerPage() {
    const { modelUrl, modelExt } = useModelStore();

    return (
        <div className="flex flex-col h-full -m-6">
            {/* Header bar */}
            <div className="px-6 py-3 border-b border-omni-border flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-sm font-semibold text-omni-text">3D Viewer</h1>
                    <p className="text-xs text-omni-muted">
                        {modelUrl
                            ? `Loaded · ${modelExt?.toUpperCase()}`
                            : "Demo scene — upload a model to view it"}
                    </p>
                </div>
                <div className="flex gap-2 text-xs text-omni-muted">
                    <kbd className="bg-omni-surface border border-omni-border px-2 py-0.5 rounded text-[10px]">
                        Left drag
                    </kbd>
                    <span>Orbit</span>
                    <kbd className="bg-omni-surface border border-omni-border px-2 py-0.5 rounded text-[10px]">
                        Scroll
                    </kbd>
                    <span>Zoom</span>
                    <kbd className="bg-omni-surface border border-omni-border px-2 py-0.5 rounded text-[10px]">
                        Right drag
                    </kbd>
                    <span>Pan</span>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
                <ModelViewer
                    url={modelUrl}
                    ext={modelExt ?? undefined}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
