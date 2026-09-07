import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { PassThrough } from "stream";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ genId: string }> }
) {
  try {
    const { genId } = await params;

    const generation = await prisma.generation.findUnique({
      where: { id: genId },
      include: {
        exports: true,
        brand: true,
      },
    });

    if (!generation || generation.exports.length === 0) {
      return NextResponse.json(
        { error: "Generation or exports not found" },
        { status: 404 }
      );
    }

    const archive = archiver("zip", { zlib: { level: 6 } });
    const stream = new PassThrough();

    archive.pipe(stream);

    const safeTitle = (generation.title || "brandflow-post")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    // Add each exported image to the zip archive
    for (const exp of generation.exports) {
      const filename = `${safeTitle}-${exp.aspectRatio.toLowerCase()}.${exp.format}`;
      const localFilePath = path.join(process.cwd(), "public", "storage", exp.fileKey);

      if (fs.existsSync(localFilePath)) {
        archive.file(localFilePath, { name: filename });
      }
    }

    archive.finalize();

    return new NextResponse(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeTitle}-assets.zip"`,
      },
    });
  } catch (error) {
    console.error("ZIP export error:", error);
    return NextResponse.json({ error: "Failed to create ZIP bundle" }, { status: 500 });
  }
}

