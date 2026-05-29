import { NextResponse } from "next/server";

/**
 * GET /api/test/simple
 * Minimal test endpoint
 */
export async function GET() {
  try {
    return NextResponse.json({ test: "ok" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
