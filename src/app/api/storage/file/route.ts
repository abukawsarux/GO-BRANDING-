import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    // Protect against directory traversal
    const safeKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(process.cwd(), "public", "storage", safeKey);

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeKey).toLowerCase();

    let contentType = "application/octet-stream";
    if (ext === ".png") contentType = "image/png";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    if (ext === ".webp") contentType = "image/webp";
    if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

