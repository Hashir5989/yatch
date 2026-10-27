import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { reorderYachtsServer, verifySessionToken } from "@/lib/server/db";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ success: false, error: "orderedIds must be an array of IDs" }, { status: 400 });
    }

    const reordered = await reorderYachtsServer(orderedIds);
    return NextResponse.json({ success: true, yachts: reordered });
  } catch (err) {
    console.error("Yachts reorder API error:", err);
    return NextResponse.json({ success: false, error: "Failed to reorder yachts" }, { status: 500 });
  }
}
