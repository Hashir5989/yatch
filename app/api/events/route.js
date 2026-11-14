import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEventsServer, saveEventServer, authenticateAdminRequest } from "@/lib/server/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const session = await authenticateAdminRequest(request);
    const isAdmin = Boolean(session);

    // Non-admin requests or explicit published=true only receive published events
    const publishedOnly = !isAdmin || publishedParam === "true";

    const events = await getEventsServer(publishedOnly);
    return NextResponse.json(
      { success: true, events },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("Events GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const eventData = await request.json();

    if (!eventData.title || !eventData.title.trim()) {
      return NextResponse.json({ success: false, error: "Event title is required." }, { status: 400 });
    }

    // Auto-generate clean slug if missing
    let slug = (eventData.slug || "").trim().toLowerCase();
    if (!slug) {
      slug = eventData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Check slug uniqueness
    const existing = await getEventsServer(false);
    if (existing.some((e) => e.slug === slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const prepared = {
      ...eventData,
      id: eventData.id || `event-${Date.now()}`,
      slug,
      title: eventData.title.trim(),
      category: eventData.category || "Boat Show",
      badge: eventData.badge || "EXHIBITION SHOWCASE",
      status: eventData.status || "published",
      featuredImage: eventData.featuredImage || "/images/events/qibs-2026-fireworks-celebration.jpg",
      featuredImageAlt: eventData.featuredImageAlt || eventData.title,
      photos: Array.isArray(eventData.photos) ? eventData.photos : [],
      highlights: Array.isArray(eventData.highlights) ? eventData.highlights : [],
    };

    const saved = await saveEventServer(prepared);

    try {
      revalidatePath("/events");
      revalidatePath(`/events/${saved.slug}`);
      revalidatePath("/admin/events");
    } catch (_) {}

    return NextResponse.json(
      { success: true, event: saved },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Events POST API error:", err);
    return NextResponse.json({ success: false, error: "Failed to create event showcase" }, { status: 500 });
  }
}

