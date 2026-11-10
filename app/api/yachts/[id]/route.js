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
    const yachtData = await request.json();

    const saved = await saveYachtServer({ ...yachtData, id });

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
    return NextResponse.json({ success: false, error: err.message || "Failed to update yacht" }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    await deleteYachtServer(id);

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
