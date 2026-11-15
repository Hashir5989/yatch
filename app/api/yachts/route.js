import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getYachtsServer, saveYachtServer, authenticateAdminRequest } from "@/lib/server/db";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const session = await authenticateAdminRequest(request);
    const isAdmin = Boolean(session);

    // Security: Unauthenticated public requests ALWAYS receive published yachts only.
    // Drafts are accessible only when authenticated as administrator.
    const publishedOnly = !isAdmin || publishedParam === "true";

    const allYachts = await getYachtsServer(publishedOnly);
    const result = publishedOnly
      ? (allYachts || []).filter((y) => y.status === "published" || y.status !== "draft")
      : (allYachts || []);

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

    // 1. Validate required fields
    if (!yachtData.name || !yachtData.name.trim()) {
      return NextResponse.json({ success: false, error: "Yacht model name is required." }, { status: 400 });
    }

    let slug = (yachtData.slug || "").trim().toLowerCase();
    if (!slug) {
      slug = yachtData.name.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ success: false, error: "Yacht slug must contain only lowercase alphanumeric characters and hyphens." }, { status: 400 });
    }

    // 2. Validate status
    if (yachtData.status && !["published", "draft"].includes(yachtData.status)) {
      return NextResponse.json({ success: false, error: "Status must be either 'published' or 'draft'." }, { status: 400 });
    }

    // 3. Validate structured data types
    if (yachtData.specs && (typeof yachtData.specs !== "object" || Array.isArray(yachtData.specs))) {
      return NextResponse.json({ success: false, error: "Specs must be a valid key-value object." }, { status: 400 });
    }
    if (yachtData.gallery && !Array.isArray(yachtData.gallery)) {
      return NextResponse.json({ success: false, error: "Gallery must be an array of image items." }, { status: 400 });
    }
    if (yachtData.heroImages && !Array.isArray(yachtData.heroImages)) {
      return NextResponse.json({ success: false, error: "heroImages must be an array." }, { status: 400 });
    }

    // 4. Validate slug uniqueness across all existing yachts
    const existingYachts = await getYachtsServer(false);
    if (existingYachts.some((y) => y.slug?.toLowerCase() === slug)) {
      return NextResponse.json({ success: false, error: `The URL slug '${slug}' is already in use by another yacht.` }, { status: 400 });
    }

    const preparedYacht = {
      ...yachtData,
      name: yachtData.name.trim(),
      slug,
      category: yachtData.category || "Superyacht",
      status: yachtData.status || "published",
    };

    const saved = await saveYachtServer(preparedYacht);

    try {
      revalidatePath("/yachts");
      if (saved?.slug) revalidatePath(`/yachts/${saved.slug}`);
      revalidatePath("/");
      revalidatePath("/admin/yachts");
    } catch (_) { }

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
