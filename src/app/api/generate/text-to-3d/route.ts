import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate/text-to-3d
 * Submit a text-to-3D generation request
 */
export async function POST(request: NextRequest) {
  try {
    // Simple validation only
    let body;
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    const { prompt } = body || {};

    // Basic validation
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt required" },
        { status: 400 }
      );
    }

    // Create demo task directly without importing service
    const taskId = `demo_task_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json(
      {
        success: true,
        taskId,
        message: "Generation started",
        isDemoMode: true,
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
