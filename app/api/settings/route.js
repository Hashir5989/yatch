import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettingsServer, saveSettingsServer, authenticateAdminRequest } from "@/lib/server/db";


export async function GET() {
  try {
    const settings = await getSettingsServer();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
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

    try {
      revalidatePath("/", "layout");
    } catch (_) {}

    return NextResponse.json(
      { success: true, settings: updated },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error in PUT /api/settings:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
