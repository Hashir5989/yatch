import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getYachtsServer, saveYachtServer, verifySessionToken } from "@/lib/server/db";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";

    const allYachts = await getYachtsServer(publishedOnly);
    const result = publishedOnly
      ? allYachts.filter((y) => y.status !== "draft")
      : allYachts;

    return NextResponse.json({ success: true, yachts: result });
  } catch (err) {
    console.error("Yachts GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load yachts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("asm_admin_session")?.value;

    if (!token || !verifySessionToken(token)) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin login required." }, { status: 401 });
    }

    const yachtData = await request.json();
    if (!yachtData.name || !yachtData.name.trim()) {
      return NextResponse.json({ success: false, error: "Yacht model name is required" }, { status: 400 });
    }

    const saved = await saveYachtServer(yachtData);
    return NextResponse.json({ success: true, yacht: saved });
  } catch (err) {
    console.error("Yachts POST API error:", err);
    return NextResponse.json({ success: false, error: "Failed to create yacht" }, { status: 500 });
  }
}
