import { NextResponse } from "next/server";
import { getPageByIdServer, savePageServer, deletePageServer } from "@/lib/server/db";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const page = await getPageByIdServer(id);
    if (!page) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (err) {
    console.error("Error in GET /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await savePageServer({ ...body, id });
    return NextResponse.json({ success: true, page: updated });
  } catch (err) {
    console.error("Error in PUT /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const ok = await deletePageServer(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Cannot delete home page or page not found" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: "Page deleted" });
  } catch (err) {
    console.error("Error in DELETE /api/pages/[id]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
