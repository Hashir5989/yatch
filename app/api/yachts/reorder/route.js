import { NextResponse } from "next/server";
import { reorderYachtsServer, authenticateAdminRequest } from "@/lib/server/db";

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ success: false, error: "orderedIds must be a non-empty array of IDs" }, { status: 400 });
    }

    if (new Set(orderedIds).size !== orderedIds.length) {
      return NextResponse.json({ success: false, error: "Duplicate IDs detected in reorder list" }, { status: 400 });
    }

    const reordered = await reorderYachtsServer(orderedIds);
    return NextResponse.json({ success: true, yachts: reordered });
  } catch (err) {
    console.error("Yachts reorder API error:", err);
    const message = err.message || "Failed to reorder yachts";
    const status = message.includes("must contain") || message.includes("Duplicate") || message.includes("array") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
