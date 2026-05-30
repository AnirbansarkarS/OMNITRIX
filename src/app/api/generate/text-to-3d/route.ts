import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate/text-to-3d
 * Submit a text-to-3D generation request
 */
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { prompt, imageBase64 } = body || {};

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { error: "Prompt or image is required" },
        { status: 400 }
      );
    }

    // Creating a mock task ID for HuggingFace Gradio workflow
    // The actual fetching/polling via Gradio Client could be handled here or async
    const taskId = `hf_task_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json(
      {
        success: true,
        taskId,
        message: "Generation started",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
