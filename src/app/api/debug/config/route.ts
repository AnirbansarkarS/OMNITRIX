import { NextResponse } from "next/server";

/**
 * GET /api/debug/config
 * Check environment configuration (remove in production)
 */
export async function GET() {
  return NextResponse.json(
    {
      hasTripo3dKey: !!process.env.TRIPO3D_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      keyPrefix: process.env.TRIPO3D_API_KEY?.substring(0, 8) + "...",
    },
    { status: 200 }
  );
}
