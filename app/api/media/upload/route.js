import { NextResponse } from "next/server";
import path from "path";
import { authenticateAdminRequest, saveMediaServer } from "@/lib/server/db";
import { saveMediaFile, deleteMediaFileByUrl, detectMagicBytes } from "@/lib/server/storage";
export { detectMagicBytes };

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image file exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Detect actual file signature via magic bytes
    const detectedMime = detectMagicBytes(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file signature. Only authentic JPEG, PNG, WEBP, AVIF, or GIF images are permitted.",
        },
        { status: 400 }
      );
    }

    // 2. Validate file extension matches detected format
    const originalExt = path.extname(file.name || "").toLowerCase();
    const validExtensions = {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/avif": [".avif"],
    };
    const allowedExts = validExtensions[detectedMime] || [];
    if (originalExt && !allowedExts.includes(originalExt)) {
      return NextResponse.json(
        {
          success: false,
          error: `File extension "${originalExt}" does not match detected format (${detectedMime}).`,
        },
        { status: 400 }
      );
    }

    // 3. Extract actual image dimensions safely via Sharp (Reject if corrupt or unparseable)
    let dimensions = null;
    let width = null;
    let height = null;
    try {
      const sharp = (await import("sharp")).default;
      const meta = await sharp(buffer).metadata();
      if (meta && typeof meta.width === "number" && typeof meta.height === "number" && meta.width > 0 && meta.height > 0) {
        width = meta.width;
        height = meta.height;
        dimensions = `${meta.width} x ${meta.height}`;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid or corrupt image: unable to parse valid dimensions from file header.",
          },
          { status: 400 }
        );
      }
    } catch (metaErr) {
      console.warn("[media/upload] Sharp dimension parsing failed:", metaErr.message);
      return NextResponse.json(
        {
          success: false,
          error: `Corrupt or unreadable image file: unable to decode image data (${metaErr.message}).`,
        },
        { status: 400 }
      );
    }

    // Support destination subfolder: uploads (default), news, events, yachts
    const rawFolder = formData.get("folder") || "uploads";

    // 4. Save file to persistent storage (outside Git) with path traversal protection
    savedFileResult = await saveMediaFile({
      buffer,
      originalName: file.name || "uploaded-image.jpg",
      subfolder: rawFolder,
      mimeType: detectedMime,
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
      width,
      height,
      size: buffer.length,
      uploadedAt: new Date().toISOString().split("T")[0],
      dimensions,
      storageKey: savedFileResult.storageKey,
    };

    // 5. Save metadata to PostgreSQL / runtime fallback (NEVER writes to Git-tracked data/media.json)
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
      dimensions,
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
