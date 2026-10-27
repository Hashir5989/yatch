import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveYachtServer, deleteYachtServer, verifySessionToken } from "@/lib/server/db";


export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    const yachtData = await request.json();

    const saved = await saveYachtServer({ ...yachtData, id });
    return NextResponse.json({ success: true, yacht: saved });
  } catch (err) {
    console.error("Yacht PUT API error:", err);
    return NextResponse.json({ success: false, error: "Failed to update yacht" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const { id } = await params;
    await deleteYachtServer(id);

    return NextResponse.json({ success: true, message: "Yacht deleted successfully" });
  } catch (err) {
    console.error("Yacht DELETE API error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete yacht" }, { status: 500 });
  }
}
