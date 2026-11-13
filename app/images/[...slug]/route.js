import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { resolveMediaFile } from "@/lib/server/storage";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slugArray = resolvedParams?.slug || [];

    if (!Array.isArray(slugArray) || slugArray.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Resolves across persistent storage, local .uploads, and legacy public/images
    const foundPath = resolveMediaFile(slugArray);

    if (!foundPath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(foundPath);
    const ext = path.extname(foundPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "image/jpeg";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Runtime dynamic image route error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
