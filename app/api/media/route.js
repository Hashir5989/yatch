import { NextResponse } from "next/server";
import { authenticateAdminRequest, getMediaServer, saveMediaServer, deleteMediaServer } from "@/lib/server/db";
import { deleteMediaFileByUrl } from "@/lib/server/storage";
import { POST as handleUploadPost } from "./upload/route";

export async function GET() {
  try {
    const media = await getMediaServer();
    return NextResponse.json({
      success: true,
      media,
    });
  } catch (err) {
    console.error("GET /api/media error:", err);
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
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

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
      storageKey: body.storageKey || null,
    };

    const saved = await saveMediaServer(newItem);
    const media = await getMediaServer();

    return NextResponse.json({
      success: true,
      item: saved,
      media,
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
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

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

    // Step 1: Delete metadata from database / local store first
    const deletedRecord = await deleteMediaServer(id);

    // Step 2: Only after metadata deletion is confirmed, safely attempt physical file deletion
    if (deletedRecord && deletedRecord.url) {
      await deleteMediaFileByUrl(deletedRecord.url);
    }

    const media = await getMediaServer();

    return NextResponse.json({
      success: true,
      deleted: deletedRecord,
      media,
    });
  } catch (err) {
    console.error("DELETE /api/media error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete media item" },
      { status: 500 }
    );
  }
}
