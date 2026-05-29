import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/generate/status/[taskId]
 * Check the status of a text-to-3D generation task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID required" },
        { status: 400 }
      );
    }

    // Simple demo task status calculation
    if (taskId.startsWith("demo_task_")) {
      // Extract timestamp from taskId
      const parts = taskId.split("_");
      if (parts.length < 3) {
        return NextResponse.json(
          { error: "Invalid task ID format" },
          { status: 400 }
        );
      }

      const createdAt = parseInt(parts[2], 10);
      if (isNaN(createdAt)) {
        return NextResponse.json(
          { error: "Invalid task timestamp" },
          { status: 400 }
        );
      }

      const elapsed = Date.now() - createdAt;
      const totalTime = 10000; // 10 seconds

      let progress = 0;
      let status: "pending" | "processing" | "completed" = "pending";

      if (elapsed < 1000) {
        progress = 0;
        status = "pending";
      } else if (elapsed < 3000) {
        progress = 15 + ((elapsed - 1000) / 2000) * 30;
        status = "processing";
      } else if (elapsed < 6000) {
        progress = 45 + ((elapsed - 3000) / 3000) * 30;
        status = "processing";
      } else if (elapsed < totalTime) {
        progress = 75 + ((elapsed - 6000) / 4000) * 25;
        status = "processing";
      } else {
        progress = 100;
        status = "completed";
      }

      const response: { taskId: string; id: string; status: 'pending' | 'processing' | 'completed'; progress: number; model_url?: string } = {
        taskId,
        id: taskId,
        status,
        progress: Math.round(progress),
      };

      if (status === "completed") {
        response.model_url =
          "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.glb";
      }

      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
