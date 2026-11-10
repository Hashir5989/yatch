import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPageByIdServer, savePageServer, deletePageServer, authenticateAdminRequest } from "@/lib/server/db";


export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const page = await getPageByIdServer(id);
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json(
      { success: true, page },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Error in GET /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await savePageServer({ ...body, id });

    // Explicitly revalidate cached Next.js public routes so changes reflect immediately
    try {
      if (updated?.slug) {
        revalidatePath(updated.slug);
      }
      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath(`/admin/editor/${encodeURIComponent(id)}`);
    } catch (_) {}

    return NextResponse.json(
      { success: true, page: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error in PUT /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    const ok = await deletePageServer(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Cannot delete home page or page not found" },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json(
      { success: true, message: "Page deleted" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error in DELETE /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
