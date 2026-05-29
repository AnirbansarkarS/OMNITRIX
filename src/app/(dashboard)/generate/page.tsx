"use client";

import { TextToModel } from "@/components/generator/TextToModel";
import ModelViewer from "@/components/viewer/ModelViewer";
import { useModelStore } from "@/lib/store";

export default function GeneratePage() {
  const { modelUrl, modelExt } = useModelStore();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Generator Panel */}
      <div className="flex flex-col gap-6">
        <TextToModel />
      </div>

      {/* Viewer Panel */}
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <h3 className="font-semibold mb-4">3D Preview</h3>
          {modelUrl ? (
            <ModelViewer url={modelUrl} ext={modelExt || "glb"} />
          ) : (
            <div className="w-full h-96 rounded-md bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Generate a model to see preview here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
