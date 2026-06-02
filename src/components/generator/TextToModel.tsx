"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useModelStore } from "@/lib/store";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

type Style = "realistic" | "cartoon" | "anime" | "creative";
type Mode = "image" | "text";

export function TextToModel() {
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>("realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    generationTask,
    setGenerationTask,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
  } = useModelStore();

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreview(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Poll for task status
  useEffect(() => {
    if (!generationTask || generationTask.status !== "processing") return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/generate/status/${generationTask.id}`);
        if (!response.ok) throw new Error("Failed to fetch status");

        const data = await response.json();

        if (data.status === "completed" && data.model_url) {
          // Build absolute URL so Three.js GLTFLoader.loadAsync can fetch it
          const absoluteUrl = `${window.location.origin}${data.model_url}`;
          console.log("[SF3D] Generation completed! Model URL:", absoluteUrl);
          completeGeneration(generationTask.id, absoluteUrl);
          setIsLoading(false);
        } else if (data.status === "failed") {
          failGeneration(generationTask.id, data.error || "Generation failed");
          setError(data.error || "Generation failed");
          setIsLoading(false);
        } else if (data.status === "processing" || data.status === "pending") {
          updateGenerationProgress(generationTask.id, data.progress ?? 10);
        }
      } catch (err) {
        console.warn("[SF3D] Poll error:", err);
      }
    };

    pollIntervalRef.current = setInterval(pollStatus, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [generationTask, completeGeneration, failGeneration, updateGenerationProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "image" && !imageBase64) {
      setError("Please upload an image to generate a 3D model from");
      return;
    }
    if (mode === "text" && !prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    if (prompt.length > 1000) {
      setError("Prompt must be less than 1000 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate/text-to-3d", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim() || (imageBase64 ? "Image to 3D" : ""),
          imageBase64,
          style,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error(`Unexpected response type: ${contentType}`);
      }
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation request failed");
      }

      setGenerationTask({
        id: data.taskId,
        prompt: prompt.trim() || (imageBase64 ? "Image → 3D" : ""),
        status: "processing",
        progress: 5,
        createdAt: new Date().toISOString(),
      });

      setPrompt("");
      // keep the image preview so user can see what was submitted
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start generation";
      console.error("[SF3D] Submit error:", err);
      setError(msg);
      setIsLoading(false);
    }
  };

  const copyPrompt = () => {
    if (generationTask?.prompt) {
      navigator.clipboard.writeText(generationTask.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isGenerating =
    isLoading ||
    (generationTask?.status === "processing" || generationTask?.status === "pending");

  const canSubmit =
    !isGenerating &&
    (mode === "image" ? !!imageBase64 : !!prompt.trim());

  return (
    <div className="w-full space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-omni-accent" />
          <h3 className="font-semibold">Image → 3D Generator</h3>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "image"
                ? "bg-omni-accent text-white"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "text"
                ? "bg-omni-accent text-white"
                : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
          >
            Text
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload (Image mode) */}
        {mode === "image" && (
          <div>
            {imagePreview ? (
              <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full max-h-56 object-contain bg-gray-50 dark:bg-gray-900"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" /> Image ready for 3D generation
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 w-full rounded-lg border-2 border-dashed cursor-pointer py-10 px-4 transition-colors ${isDragging
                    ? "border-omni-accent bg-omni-accent/5"
                    : "border-gray-300 dark:border-gray-700 hover:border-omni-accent/60 hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
              >
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 10 MB</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isGenerating}
              className="hidden"
            />
          </div>
        )}

        {/* Text prompt (Text mode) */}
        {mode === "text" && (
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Describe your 3D model
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A ceramic vase with blue glaze, studio lighting…"
              disabled={isGenerating}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:placeholder-gray-500 disabled:opacity-50 resize-none"
              rows={4}
            />
            <div className="mt-1 text-xs text-gray-400 text-right">
              {prompt.length}/1000
            </div>
          </div>
        )}

        {/* Style selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Texture style
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(["realistic", "cartoon", "anime", "creative"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                disabled={isGenerating}
                className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${style === s
                    ? "bg-omni-accent text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  } disabled:opacity-50`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Progress */}
        {generationTask && (generationTask.status === "processing" || generationTask.status === "pending") && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Generating 3D model via Stable Fast 3D…
                </p>
              </div>
              <button type="button" onClick={copyPrompt} className="text-blue-400 hover:text-blue-300">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="relative h-2 w-full bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${generationTask.progress}%` }}
              />
              {/* Shimmer animation while processing */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {generationTask.progress}% — This may take 30–120 s while the Space warms up
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full rounded-md px-4 py-2.5 font-medium text-white transition flex items-center justify-center gap-2 ${!canSubmit
              ? "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
              : "bg-omni-accent hover:bg-omni-accent/90"
            }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <ImageIcon className="h-4 w-4" />
              Generate 3D Model
            </>
          )}
        </button>
      </form>

      {/* Success notice */}
      {generationTask?.status === "completed" && (
        <div className="rounded-md bg-green-50 dark:bg-green-950/40 p-3 text-center">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            ✅ 3D model generated! Check the viewer on the right.
          </p>
        </div>
      )}
    </div>
  );
}
