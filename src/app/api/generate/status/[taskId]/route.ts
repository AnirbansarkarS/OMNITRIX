import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/taskStore";

/**
 * GET /api/generate/status/[taskId]
 * Returns the current status of a generation task.
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
      // Return a relative URL — the frontend will prepend window.location.origin
      response.model_url = `/api/generate/models/${taskId}.glb`;
    }

    if (task.status === "failed") {
      response.error = task.error ?? "Generation failed";
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[SF3D status] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
