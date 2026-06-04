import { NextRequest, NextResponse } from "next/server";
import { createTask, updateTask, setTaskGlb, failTask, pruneOldTasks } from "@/lib/taskStore";
import fs from "fs/promises";
import path from "path";
import os from "os";

/**
 * POST /api/generate/text-to-3d
 * Accepts { imageBase64?: string, prompt?: string, style?: string }
 * Fires off an async job to stabilityai/stable-fast-3d on HuggingFace Gradio.
 * Returns { taskId } immediately (202) so the client can poll.
 */
export async function POST(request: NextRequest) {
  try {
    let body: { imageBase64?: string; prompt?: string; style?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { imageBase64, prompt } = body ?? {};

    if (!imageBase64 && !prompt?.trim()) {
      return NextResponse.json(
        { error: "An image or a prompt is required" },
        { status: 400 }
      );
    }

    // Prune old tasks to keep memory lean
    pruneOldTasks();

    const taskId = `hf_task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    createTask(taskId);

    // Fire-and-forget: run the HF job in background
    runStableFast3D(taskId, imageBase64, prompt?.trim()).catch((err) => {
      console.error(`[SF3D] Unhandled error for ${taskId}:`, err);
      failTask(taskId, err instanceof Error ? err.message : String(err));
    });

    return NextResponse.json({ success: true, taskId }, { status: 202 });
  } catch (error) {
    console.error("[SF3D] POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

/**
 * Calls the stabilityai/stable-fast-3d HuggingFace Gradio Space.
 * Uploads the image (or a placeholder) and waits for the GLB binary result.
 */
async function runStableFast3D(
  taskId: string,
  imageBase64?: string,
  prompt?: string
): Promise<void> {
  console.log(`[SF3D] Submitting job for task: ${taskId}`);
  updateTask(taskId, { status: "processing", progress: 5 });

  try {
    const { Client } = await import("@gradio/client");

    const hfToken = process.env.HUGGINGFACE_TOKEN as `hf_${string}` | undefined;

    // Connect to the public Space (anonymous or with token)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = await Client.connect("stabilityai/stable-fast-3d", {
      hf_token: hfToken,
    } as any);

    console.log(`[SF3D] Connected to HuggingFace Space`);
    updateTask(taskId, { progress: 15 });

    // The Space expects a raw image blob for its first parameter.
    // Convert base64 data-URI → Blob, or use a 1×1 white PNG placeholder when only a text prompt is given.
    let imageBlob: Blob;
    if (imageBase64) {
      imageBlob = dataUriToBlob(imageBase64);
    } else {
      // 1×1 white PNG (smallest valid PNG) as a stub when only a text prompt is provided
      imageBlob = await fetchPlaceholderImage(prompt ?? "3D object");
    }

    console.log(`[SF3D] Image blob ready (${imageBlob.size} bytes), calling predict...`);
    updateTask(taskId, { progress: 25 });

    // Call the /run/generate endpoint on the Space
    // Parameters: image, foreground_ratio (0.85), texture_resolution ("1024"), mc_resolution (256), remove_background (true)
    const result = await client.predict("/run/generate", {
      image: imageBlob,
      foreground_ratio: 0.85,
      output_format: "glb",
      texture_resolution: "1024",
      mc_resolution: 256,
      remove_background: true,
    });

    updateTask(taskId, { progress: 90 });
    console.log(`[SF3D] Predict returned, processing result...`);

    // The Space returns an array; first element is the output file URL or object
    const output = (result.data as unknown[])?.[0];
    let glbBuffer: Buffer | null = null;

    if (output && typeof output === "object" && "url" in output) {
      // Gradio returns { url, path, orig_name, ... }
      const fileUrl = (output as { url: string }).url;
      console.log(`[SF3D] Downloading GLB from: ${fileUrl}`);
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`Failed to download GLB: ${res.status}`);
      const arrayBuf = await res.arrayBuffer();
      glbBuffer = Buffer.from(arrayBuf);
    } else if (output instanceof Blob || (output && typeof output === "object" && "arrayBuffer" in output)) {
      const ab = await (output as Blob).arrayBuffer();
      glbBuffer = Buffer.from(ab);
    } else if (typeof output === "string" && output.startsWith("http")) {
      const res = await fetch(output);
      if (!res.ok) throw new Error(`Failed to download GLB from string URL: ${res.status}`);
      const ab = await res.arrayBuffer();
      glbBuffer = Buffer.from(ab);
    }

    if (!glbBuffer || glbBuffer.length < 100) {
      throw new Error("HuggingFace returned an empty or invalid GLB");
    }

    console.log(`[SF3D] GLB ready: ${glbBuffer.length} bytes`);

    // Write to filesystem so the model-serving route can read it
    // even if Next.js loads this module and that route in separate contexts.
    const modelDir = path.join(os.tmpdir(), "omnitrix-models");
    await fs.mkdir(modelDir, { recursive: true });
    const glbPath = path.join(modelDir, `${taskId}.glb`);
    await fs.writeFile(glbPath, glbBuffer);
    console.log(`[SF3D] GLB written to: ${glbPath}`);

    // Also keep in-memory store as a fast path
    setTaskGlb(taskId, glbBuffer);
  } catch (err) {
    console.error(`[SF3D] Job failed for ${taskId}:`, err);
    failTask(taskId, err instanceof Error ? err.message : String(err));
  }
}

/** Convert a data-URI string to a Blob */
function dataUriToBlob(dataUri: string): Blob {
  const [header, base64Data] = dataUri.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = Buffer.from(base64Data, "base64");
  return new Blob([binary], { type: mime });
}

/**
 * Fetch a simple image from a public URL based on the prompt text,
 * used when no image is provided (text-only mode).
 * Falls back to a 1×1 white PNG if the fetch fails.
 */
async function fetchPlaceholderImage(prompt: string): Promise<Blob> {
  try {
    // Use a simple placeholder – Stable Fast 3D works best with real images,
    // but a solid-color stub keeps the API happy for text-only requests.
    const encoded = encodeURIComponent(prompt.slice(0, 50));
    const res = await fetch(
      `https://via.placeholder.com/512/ffffff/000000.png?text=${encoded}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) return await res.blob();
  } catch {
    // ignore – fall through to minimal PNG
  }

  // Minimal 1×1 white PNG
  const minimalPng = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108020000009001" +
    "2e0000000c4944415478016360f8cfc00000000200016b38017d0000000049454e44ae426082",
    "hex"
  );
  return new Blob([minimalPng], { type: "image/png" });
}
