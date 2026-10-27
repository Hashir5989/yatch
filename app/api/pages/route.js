import { NextResponse } from "next/server";
import { getPagesServer, savePageServer } from "@/lib/server/db";

export async function GET() {
  try {
    const pages = await getPagesServer();
    return NextResponse.json({ success: true, pages });
  } catch (err) {
    console.error("Error in GET /api/pages:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const pageData = await req.json();
    if (!pageData.title || !pageData.slug) {
      return NextResponse.json(
        { success: false, error: "Title and slug are required" },
        { status: 400 }
      );
    }
    const saved = await savePageServer(pageData);
    return NextResponse.json({ success: true, page: saved });
  } catch (err) {
    console.error("Error in POST /api/pages:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
