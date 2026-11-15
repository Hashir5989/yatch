import { NextResponse } from "next/server";
import { authenticateAdminRequest, getMediaServer, saveMediaServer, deleteMediaServer } from "@/lib/server/db";
import { deleteMediaFileByUrl } from "@/lib/server/storage";
import { findMediaReferences } from "@/lib/server/mediaReferences";
import { POST as handleUploadPost } from "./upload/route";

export async function GET(request) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required to access media library." },
        { status: 401 }
      );
    }

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

    // Path traversal security guard: block attempts to delete outside uploads directory
    if (id.includes("..") || id.includes("//") || id.startsWith("~")) {
      return NextResponse.json(
        { success: false, error: "Access denied: paths outside uploads directory are blocked" },
        { status: 403 }
      );
    }

    // Safety Step 0: Find existing media record to determine its URL
    const allMedia = await getMediaServer();
    const targetItem = (allMedia || []).find((m) => m && (m.id === id || m.url === id));
    const targetUrl = targetItem?.url || (id.startsWith("/images/") ? id : null);

    // Safety Step 1: Check whether media is referenced by pages, yachts, news, or events (Fail-Closed)
    if (targetUrl) {
      try {
        const refCheck = await findMediaReferences(targetUrl);
        if (refCheck.isReferenced) {
          return NextResponse.json(
            {
              success: false,
              error: `Cannot delete image because it is currently referenced by active CMS content: ${refCheck.references.join("; ")}`,
              references: refCheck.references,
            },
            { status: 409 }
          );
        }
      } catch (scanErr) {
        console.error("[media/DELETE] Media reference verification scan failed:", scanErr.message);
        return NextResponse.json(
          {
            success: false,
            error: `Media reference scan failed: ${scanErr.message}. Deletion blocked to protect content integrity.`,
          },
          { status: 500 }
        );
      }
    }

    // Step 2: Delete metadata from database / local store
    const deletedRecord = await deleteMediaServer(id);
    if (!deletedRecord && !targetItem) {
      return NextResponse.json(
        { success: false, error: "Media item not found" },
        { status: 404 }
      );
    }

    // Step 3: Only after metadata deletion is confirmed, safely attempt physical file deletion
    const urlToDelete = deletedRecord?.url || targetUrl;
    if (urlToDelete) {
      await deleteMediaFileByUrl(urlToDelete);
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
