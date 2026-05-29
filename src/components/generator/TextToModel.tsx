"use client";

import { useState, useRef, useEffect } from "react";
import { useModelStore } from "@/lib/store";
import { Sparkles, Loader2, AlertCircle, Copy, Check } from "lucide-react";

type Style = "realistic" | "cartoon" | "anime" | "creative";

export function TextToModel() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("realistic");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  const {
    generationTask,
    setGenerationTask,
    updateGenerationProgress,
    completeGeneration,
    failGeneration,
  } = useModelStore();

  // Poll for task status
  useEffect(() => {
    if (!generationTask || generationTask.status !== "processing") return;

    const pollStatus = async () => {
      try {
        const response = await fetch(
          `/api/generate/status/${generationTask.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch status");

        const data = await response.json();

        if (data.status === "completed" && data.model_url) {
          completeGeneration(generationTask.id, data.model_url);
          setIsLoading(false);
        } else if (data.status === "failed") {
          failGeneration(generationTask.id, data.error || "Generation failed");
          setError(data.error || "Generation failed");
          setIsLoading(false);
        } else if (data.status === "processing") {
          updateGenerationProgress(generationTask.id, data.progress || 50);
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    };

    pollIntervalRef.current = setInterval(pollStatus, 2000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [generationTask, completeGeneration, failGeneration, updateGenerationProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
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
          prompt: prompt.trim(),
          style,
        }),
      });

      // Try to parse response as JSON
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error(
            `Server error (${response.status}): Invalid response format`
          );
        }
      } else {
        throw new Error(
          `Server error (${response.status}): Expected JSON, got ${contentType || "unknown"}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "Generation request failed");
      }

      setIsDemoMode(data.isDemoMode || false);
      setGenerationTask({
        id: data.taskId,
        prompt: prompt.trim(),
        status: "pending",
        progress: 0,
        createdAt: new Date().toISOString(),
      });

      setPrompt("");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start generation";
      console.error("Generation error:", err);
      setError(errorMsg);
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

  return (
    <div className="w-full space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">Text to 3D Model</h3>
        {isDemoMode && (
          <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
            Demo Mode
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Demo Mode Info */}
        {isDemoMode && (
          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950 flex gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Running in demo mode. Configure{" "}
              <code className="font-mono text-xs">TRIPO3D_API_KEY</code> for production use.
            </p>
          </div>
        )}

        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Describe your 3D model
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A beautiful oak tree in a forest, detailed bark texture, autumn colors..."
            disabled={isLoading}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:placeholder-gray-500 disabled:opacity-50"
            rows={4}
          />
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {prompt.length}/1000 characters
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Style</label>
          <div className="grid grid-cols-4 gap-2">
            {(["realistic", "cartoon", "anime", "creative"] as const).map(
              (s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  disabled={isLoading}
                  className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${
                    style === s
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  } disabled:opacity-50`}
                >
                  {s}
                </button>
              )
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950 flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Generation Progress */}
        {generationTask && (
          <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Generating 3D Model...
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 line-clamp-2">
                  {generationTask.prompt}
                </p>
              </div>
              <button
                type="button"
                onClick={copyPrompt}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 dark:bg-blue-800 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${generationTask.progress}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Progress: {generationTask.progress}%
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full rounded-md px-4 py-2 font-medium text-white transition flex items-center justify-center gap-2 ${
            isLoading || !prompt.trim()
              ? "cursor-not-allowed bg-gray-300 dark:bg-gray-700"
              : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 3D Model
            </>
          )}
        </button>
      </form>

      {/* Generation History */}
      {generationTask?.status === "completed" && (
        <div className="rounded-md bg-green-50 p-3 dark:bg-green-950 text-center">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Model generated successfully! Check the viewer.
          </p>
        </div>
      )}
    </div>
  );
}
