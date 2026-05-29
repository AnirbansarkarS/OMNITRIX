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

    const apiKey = process.env.TRIPO3D_API_KEY;

    // Use Tripo3D API if key is present
    if (apiKey) {
      const tripoRes = await fetch("https://api.tripo3d.ai/v2/openapi/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          type: "text_to_model",
          prompt,
        }),
      });

      if (!tripoRes.ok) {
        const err = await tripoRes.text();
        return NextResponse.json(
          { error: `Tripo3D API error: ${err}` },
          { status: tripoRes.status }
        );
      }

      const tripoData = await tripoRes.json();
      if (tripoData.code !== 0 || !tripoData.data?.task_id) {
        return NextResponse.json(
          { error: "Tripo3D API failed to create task", details: tripoData },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          taskId: tripoData.data.task_id,
          message: "Generation started",
          isDemoMode: false,
        },
        { status: 202 }
      );
    }

    // Fallback: Create demo task
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
