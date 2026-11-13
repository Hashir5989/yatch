import { NextResponse } from "next/server";
import { authenticateAdminRequest, saveMediaServer } from "@/lib/server/db";
import { saveMediaFile, deleteMediaFileByUrl } from "@/lib/server/storage";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit

export async function POST(request) {
  let savedFileResult = null;

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

    // Support destination subfolder: uploads (default), news, events, yachts
    const rawFolder = formData.get("folder") || "uploads";

    // 1. Save file to persistent storage (outside Git) with path traversal protection
    savedFileResult = await saveMediaFile({
      buffer,
      originalName: file.name || "uploaded-image.jpg",
      subfolder: rawFolder,
      mimeType: file.type,
    });

    const publicUrl = savedFileResult.relativeUrl;
    const title = (formData.get("title") || "").trim() || (file.name || "Uploaded Media").replace(/\.[^/.]+$/, "");
    const alt = (formData.get("alt") || "").trim() || title;
    const category = (formData.get("category") || "exterior").trim();

    const newItem = {
      id: `media-${Date.now()}`,
      url: publicUrl,
      title,
      alt,
      category,
      uploadedAt: new Date().toISOString().split("T")[0],
      dimensions: "2000 x 1200",
      storageKey: savedFileResult.storageKey,
    };

    // 2. Save metadata to PostgreSQL / runtime fallback (NEVER writes to Git-tracked data/media.json)
    try {
      await saveMediaServer(newItem);
    } catch (dbErr) {
      // Cleanup orphaned file if database/metadata save fails
      if (savedFileResult && savedFileResult.relativeUrl) {
        try {
          await deleteMediaFileByUrl(savedFileResult.relativeUrl);
        } catch (_) {}
      }
      throw new Error(`Failed to record media metadata: ${dbErr.message}`);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: savedFileResult.fileName,
      title,
      item: newItem,
    });
  } catch (err) {
    console.error("Image upload API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload image. " + (err.message || "") },
      { status: 500 }
    );
  }
}
