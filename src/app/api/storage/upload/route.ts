import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const buffer = Buffer.from(await req.arrayBuffer());
    const filePath = path.join(process.cwd(), "public", "storage", key);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, key, size: buffer.length });
  } catch (error) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}

