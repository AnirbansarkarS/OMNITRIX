import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/taskStore";
import fs from "fs/promises";
import path from "path";
import os from "os";

/**
 * GET /api/generate/models/[taskId]
 * Serves the real generated GLB.
 * Primary source: filesystem (tmpdir) — immune to Next.js module isolation.
 * Fallback: in-memory taskStore.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Strip any extension (e.g. "hf_task_xxx.glb" → "hf_task_xxx")
    const raw = (await params).taskId;
    const taskId = raw.replace(/\.[^.]+$/, "");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // ── 1. Try filesystem first (most reliable across Next.js module contexts) ──
    const glbPath = path.join(os.tmpdir(), "omnitrix-models", `${taskId}.glb`);
    try {
      const fileBuffer = await fs.readFile(glbPath);
      if (fileBuffer.length > 100) {
        console.log(`[models] Serving GLB from disk for ${taskId}: ${fileBuffer.length} bytes`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new Response(fileBuffer as any, {
          status: 200,
          headers: {
            "Content-Type": "model/gltf-binary",
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "no-store",
          },
        });
      }
    } catch {
      // File not written yet — fall through to taskStore check
    }

    // ── 2. Fallback: in-memory taskStore ──
    const task = getTask(taskId);

    if (!task) {
      // Task unknown — could be a very old reload or wrong ID
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status === "failed") {
      return NextResponse.json(
        { error: task.error ?? "Generation failed" },
        { status: 500 }
      );
    }

    if (task.status !== "completed" || !task.glbBuffer) {
      // Still processing
      return NextResponse.json(
        { error: "Model not ready yet", status: task.status, progress: task.progress },
        { status: 202 }
      );
    }

    console.log(`[models] Serving GLB from memory for ${taskId}: ${task.glbBuffer.length} bytes`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Response(task.glbBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": task.glbBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error serving model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to serve model" },
      { status: 500 }
    );
  }
}
