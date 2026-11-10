import { NextResponse } from "next/server";
import { getSettingsServer, saveSettingsServer, authenticateAdminRequest } from "@/lib/server/db";

export async function GET() {
  try {
    const settings = await getSettingsServer();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("Error in GET /api/settings:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const body = await req.json();
    const updated = await saveSettingsServer(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("Error in PUT /api/settings:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
