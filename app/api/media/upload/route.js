import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { authenticateAdminRequest } from "@/lib/server/db";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported image format (${file.type}). Please upload a JPEG, PNG, WEBP, or AVIF image.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image file exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "images", "news");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalName = file.name || "uploaded-image.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^\w-]/g, "-")
      .slice(0, 50);

    const fileName = `${baseName}-${Date.now()}${ext.toLowerCase()}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/news/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      title: originalName,
    });
  } catch (err) {
    console.error("Image upload API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload image. " + (err.message || "") },
      { status: 500 }
    );
  }
}

