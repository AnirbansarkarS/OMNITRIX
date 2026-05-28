"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useModelStore } from "@/lib/store";
import ExportPanel from "@/components/exporter/ExportPanel";
import type { ModelViewerHandle } from "@/components/viewer/ModelViewer";

const ModelViewer = dynamic(() => import("@/components/viewer/ModelViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-omni-bg">
            <div className="w-8 h-8 border-2 border-omni-accent border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

export default function ExportPage() {
    const { modelUrl, modelExt } = useModelStore();
    const viewerRef = useRef<ModelViewerHandle>(null);

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-full -m-6 animate-fade-in">
            {/* 3D Viewer */}
            <div className="flex-1 relative border-r border-omni-border">
                <ModelViewer
                    ref={viewerRef}
                    url={modelUrl}
                    ext={modelExt ?? undefined}
                    className="w-full h-full min-h-[400px]"
                />
            </div>

            {/* Export sidebar */}
            <div className="w-full lg:w-80 p-5 space-y-4 shrink-0 overflow-y-auto">
                <div>
                    <h1 className="text-lg font-bold text-omni-text mb-1">Export</h1>
                    <p className="text-xs text-omni-muted">
                        {modelUrl
                            ? `Model loaded (${modelExt?.toUpperCase()}) — pick a format and export.`
                            : "Upload a model first, then come back here to export."}
                    </p>
                </div>

                <ExportPanel
                    getScene={() => viewerRef.current?.getScene() ?? null}
                />

                {!modelUrl && (
                    <a
                        href="/upload"
                        className="btn-ghost w-full flex items-center justify-center gap-2 text-xs"
                    >
                        Go to Upload →
                    </a>
                )}
            </div>
        </div>
    );
}
