import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getYachtsServer, saveYachtServer, authenticateAdminRequest } from "@/lib/server/db";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const allYachts = await getYachtsServer(publishedOnly);
    const result = publishedOnly
      ? allYachts.filter((y) => y.status !== "draft")
      : allYachts;

    return NextResponse.json(
      { success: true, yachts: result },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Yachts GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load yachts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const yachtData = await request.json();
    if (!yachtData.name || !yachtData.name.trim()) {
      return NextResponse.json({ success: false, error: "Yacht model name is required" }, { status: 400 });
    }

    const saved = await saveYachtServer(yachtData);

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
    console.error("Yachts POST API error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to create yacht" }, { status: 400 });
  }
}
