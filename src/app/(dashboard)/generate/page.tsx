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

  useEffect(() => {
    if (modelUrl && modelExt) {
      console.log("Model store updated:", { modelUrl, modelExt });
    }
  }, [modelUrl, modelExt]);

  if (!mounted) return null;

  const hasModel = modelUrl && modelExt;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Generator Panel */}
      <div className="flex flex-col gap-6">
        <TextToModel />
        {generationTask && (
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Task ID:</strong> {generationTask.id.substring(0, 20)}...</p>
            <p><strong>Status:</strong> {generationTask.status}</p>
            <p><strong>Progress:</strong> {generationTask.progress}%</p>
            {generationTask.modelUrl && (
              <p><strong>Model URL:</strong> {generationTask.modelUrl}</p>
            )}
          </div>
        )}
      </div>

      {/* Viewer Panel */}
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 flex-1 flex flex-col">
          <h3 className="font-semibold mb-4">3D Preview</h3>
          <div className="flex-1 min-h-[400px] relative">
            {hasModel ? (
              <div key={modelUrl} className="w-full h-full absolute inset-0">
                <ModelViewer url={modelUrl} ext={modelExt} className="w-full h-full" />
              </div>
            ) : (
              <div className="w-full h-full absolute inset-0 rounded-md bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Generate a model to see preview here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
