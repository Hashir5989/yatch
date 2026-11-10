import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { POST as handleUploadPost } from "./upload/route";
import { DEFAULT_MEDIA } from "@/lib/data/defaultMedia";
import { authenticateAdminRequest } from "@/lib/server/db";

const MEDIA_FILE = path.join(process.cwd(), "data", "media.json");

function readServerMedia() {
  try {
    if (fs.existsSync(MEDIA_FILE)) {
      const raw = fs.readFileSync(MEDIA_FILE, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn("Could not read data/media.json, falling back:", err);
  }
  return DEFAULT_MEDIA;
}

function writeServerMedia(list) {
  try {
    const dir = path.dirname(MEDIA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MEDIA_FILE, JSON.stringify(list, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing data/media.json:", err);
    return false;
  }
}

export async function GET() {
  try {
    const media = readServerMedia();
    return NextResponse.json({
      success: true,
      media,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve media library" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";

  // If multipart form data (file upload), forward to upload route
  if (contentType.includes("multipart/form-data")) {
    return handleUploadPost(request);
  }

  // Otherwise handle JSON item addition
  try {
    const session = await authenticateAdminRequest(request);
    // Allow non-blocking session check or proceed
    const body = await request.json().catch(() => ({}));
    if (!body || !body.url) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    const newItem = {
      id: body.id || `media-${Date.now()}`,
      title: body.title || "ASMARATY Yacht Image",
      url: body.url,
      alt: body.alt || body.title || "ASMARATY luxury yacht",
      category: body.category || "exterior",
      uploadedAt: body.uploadedAt || new Date().toISOString().split("T")[0],
      dimensions: body.dimensions || "2000 x 1200",
    };

    const mediaList = readServerMedia();
    const updated = [newItem, ...mediaList.filter((m) => m && m.id !== newItem.id && m.url !== newItem.url)];
    writeServerMedia(updated);

    return NextResponse.json({
      success: true,
      item: newItem,
      media: updated,
    });
  } catch (err) {
    console.error("Error saving media item:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save media item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await authenticateAdminRequest(request);
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Media ID is required" },
        { status: 400 }
      );
    }

    const mediaList = readServerMedia();
    const filtered = mediaList.filter((m) => m && m.id !== id);
    writeServerMedia(filtered);

    return NextResponse.json({
      success: true,
      media: filtered,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete media item" },
      { status: 500 }
    );
  }
}
