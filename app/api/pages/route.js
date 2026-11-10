import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPagesServer, savePageServer, authenticateAdminRequest } from "@/lib/server/db";


export async function GET() {
  try {
    const pages = await getPagesServer();
    return NextResponse.json(
      { success: true, pages },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Error in GET /api/pages:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await authenticateAdminRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const pageData = await req.json();
    if (!pageData.title || !pageData.slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }
    const saved = await savePageServer(pageData);

    try {
      if (saved?.slug) revalidatePath(saved.slug);
      revalidatePath("/");
      revalidatePath("/admin");
    } catch (_) {}

    return NextResponse.json(
      { success: true, page: saved },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Error in POST /api/pages:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
