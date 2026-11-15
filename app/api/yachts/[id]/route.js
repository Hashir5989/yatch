import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveYachtServer, deleteYachtServer, authenticateAdminRequest } from "@/lib/server/db";

export async function PUT(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Yacht ID is required." }, { status: 400 });
    }

    const yachtData = await request.json();

    // Field validation if provided
    if (yachtData.status && !["published", "draft"].includes(yachtData.status)) {
      return NextResponse.json({ success: false, error: "Invalid status. Must be 'published' or 'draft'." }, { status: 400 });
    }
    if (yachtData.slug && !/^[a-z0-9-]+$/.test(yachtData.slug.trim().toLowerCase())) {
      return NextResponse.json({ success: false, error: "Slug must contain only lowercase alphanumeric characters and hyphens." }, { status: 400 });
    }
    if (yachtData.specifications && (typeof yachtData.specifications !== "object" || Array.isArray(yachtData.specifications))) {
      return NextResponse.json({ success: false, error: "Specifications must be an object." }, { status: 400 });
    }
    if (yachtData.gallery && !Array.isArray(yachtData.gallery)) {
      return NextResponse.json({ success: false, error: "Gallery must be an array." }, { status: 400 });
    }
    if (yachtData.heroImages && !Array.isArray(yachtData.heroImages)) {
      return NextResponse.json({ success: false, error: "Hero images must be an array." }, { status: 400 });
    }

    const saved = await saveYachtServer({ ...yachtData, id });
    if (!saved) {
      return NextResponse.json({ success: false, error: `Yacht with ID '${id}' not found.` }, { status: 404 });
    }

    try {
      revalidatePath("/yachts");
      if (saved?.slug) revalidatePath(`/yachts/${saved.slug}`);
      revalidatePath("/");
      revalidatePath("/admin/yachts");
    } catch (_) {}

    return NextResponse.json(
      { success: true, yacht: saved },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Yacht PUT API error:", err);
    const isClientError = err.message && (
      err.message.includes("is required") ||
      err.message.includes("already in use") ||
      err.message.includes("must contain only") ||
      err.message.includes("Invalid status")
    );
    const status = isClientError ? 400 : 500;
    return NextResponse.json({ success: false, error: err.message || "Failed to update yacht" }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Yacht ID is required." }, { status: 400 });
    }

    const deleted = await deleteYachtServer(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: `Yacht with ID '${id}' not found.` }, { status: 404 });
    }

    try {
      revalidatePath("/yachts");
      revalidatePath("/");
      revalidatePath("/admin/yachts");
    } catch (_) {}

    return NextResponse.json(
      { success: true, message: "Yacht deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Yacht DELETE API error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete yacht" }, { status: 500 });
  }
}
