import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/taskStore";
import fs from "fs/promises";
import path from "path";
import os from "os";

/**
 * GET /api/generate/status/[taskId]
 * Returns the real status of a generation task by checking:
 * 1. The in-memory taskStore
 * 2. The filesystem (tmpdir) as a fallback for cross-module isolation
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // ── 1. Check filesystem first (cross-module reliable) ──
    const glbPath = path.join(os.tmpdir(), "omnitrix-models", `${taskId}.glb`);
    try {
      const stat = await fs.stat(glbPath);
      if (stat.size > 100) {
        // File exists and is non-trivial → completed!
        return NextResponse.json({
          taskId,
          id: taskId,
          status: "completed",
          progress: 100,
          model_url: `/api/generate/models/${taskId}.glb`,
        });
      }
    } catch {
      // File doesn't exist yet — fall through to in-memory check
    }

    // ── 2. Check in-memory taskStore ──
    const task = getTask(taskId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const response: {
      taskId: string;
      id: string;
      status: string;
      progress: number;
      model_url?: string;
      error?: string;
    } = {
      taskId,
      id: taskId,
      status: task.status,
      progress: task.progress,
    };

    if (task.status === "completed") {
      response.model_url = `/api/generate/models/${taskId}.glb`;
    } else if (task.status === "failed") {
      response.error = task.error ?? "Generation failed";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Status route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

