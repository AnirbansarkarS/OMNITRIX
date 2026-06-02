"use client";

import { TextToModel } from "@/components/generator/TextToModel";
import ModelViewer from "@/components/viewer/ModelViewer";
import { useModelStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function GeneratePage() {
  const { modelUrl, modelExt, generationTask } = useModelStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const hasModel = modelUrl && modelExt;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 min-h-0">
      {/* Generator Panel */}
      <div className="flex flex-col gap-4 min-h-0">
        <TextToModel />
        {generationTask && generationTask.status === "completed" && generationTask.modelUrl && (
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 break-all">
            <strong>Model URL:</strong> {generationTask.modelUrl}
          </div>
        )}
      </div>

      {/* Viewer Panel */}
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 flex flex-col overflow-hidden" style={{ height: "560px" }}>
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
            <h3 className="font-semibold text-sm">3D Preview</h3>
            {hasModel && (
              <span className="text-xs text-omni-accent bg-omni-accent/10 px-2 py-0.5 rounded-full">
                Model loaded
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0">
            {hasModel ? (
              <ModelViewer
                key={modelUrl}
                url={modelUrl}
                ext={modelExt}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-600">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6">
                  <svg
                    className="h-10 w-10 opacity-40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p className="text-sm">Upload an image to generate a 3D model</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
