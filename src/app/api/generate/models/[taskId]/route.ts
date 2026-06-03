import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/generate/models/[taskId].glb
 * Serves a generated 3D model as a GLB file
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

    console.log("Generating GLB for task:", taskId);

    // Generate a simple GLB file with a procedural mesh
    const glbBuffer = generateSimpleGLB();

    console.log("Generated GLB buffer:", glbBuffer.length, "bytes");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Response(Buffer.from(glbBuffer) as any, {
      status: 200,
      headers: {
        "Content-Type": "model/gltf-binary",
        "Content-Length": glbBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating model:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate model" },
      { status: 500 }
    );
  }
}

function generateSimpleGLB(): Buffer {
  // Create a minimal valid GLB with a single triangle
  // This is a very simple, known-good glTF structure
  
  try {
    // Single triangle with 3 vertices
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const indices = new Uint32Array([0, 1, 2]);

    // Binary data
    const posBuffer = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength);
    const indexBuffer = Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength);
    const binData = Buffer.concat([posBuffer, indexBuffer]);

    // Pad to 4-byte boundary
    const padding = (4 - (binData.length % 4)) % 4;
    const paddedBinData = padding > 0 ? Buffer.concat([binData, Buffer.alloc(padding)]) : binData;

    // Create minimal glTF JSON
    const gltf = {
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [
        {
          primitives: [
            {
              attributes: { POSITION: 0 },
              indices: 1,
              material: 0,
            },
          ],
        },
      ],
      materials: [{ pbrMetallicRoughness: { baseColorFactor: [0, 1, 0.4, 1] } }],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126, // FLOAT
          count: 3,
          type: "VEC3",
          min: [0, 0, 0],
          max: [1, 1, 0],
        },
        {
          bufferView: 1,
          componentType: 5125, // UNSIGNED_INT
          count: 3,
          type: "SCALAR",
        },
      ],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: posBuffer.length, byteStride: 12 },
        { buffer: 0, byteOffset: posBuffer.length, byteLength: indexBuffer.length },
      ],
      buffers: [{ byteLength: paddedBinData.length }],
    };

    const jsonStr = JSON.stringify(gltf);
    const jsonBuf = Buffer.from(jsonStr, "utf-8");

    // Pad JSON to 4-byte boundary
    const jsonPadding = (4 - (jsonBuf.length % 4)) % 4;
    const paddedJson = jsonPadding > 0 ? Buffer.concat([jsonBuf, Buffer.alloc(jsonPadding, 0x20)]) : jsonBuf;

    // Calculate total file size
    const fileSize = 12 + 8 + paddedJson.length + 8 + paddedBinData.length;

    // GLB header
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546c67, 0); // magic "glTF"
    header.writeUInt32LE(2, 4); // version
    header.writeUInt32LE(fileSize, 8); // file length

    // JSON chunk header
    const jsonHeader = Buffer.alloc(8);
    jsonHeader.writeUInt32LE(paddedJson.length, 0);
    jsonHeader.writeUInt32LE(0x4e4f534a, 4); // "JSON"

    // Binary chunk header
    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(paddedBinData.length, 0);
    binHeader.writeUInt32LE(0x004e4942, 4); // "BIN\0"

    return Buffer.concat([header, jsonHeader, paddedJson, binHeader, paddedBinData]);
  } catch (err) {
    console.error("Error generating GLB:", err);
    throw err;
  }
}

function padToMultipleOfFour(buffer: Buffer): Buffer {
  const padding = (4 - (buffer.length % 4)) % 4;
  if (padding === 0) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(padding, 0x20)]);
}
