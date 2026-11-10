import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { 
  getEventByIdServer, 
  getEventBySlugServer, 
  saveEventServer, 
  deleteEventServer, 
  authenticateAdminRequest 
} from "@/lib/server/db";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    let event = await getEventByIdServer(id);
    if (!event) {
      event = await getEventBySlugServer(id);
    }

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, event },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("Event GET [id] API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load event" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    let existing = await getEventByIdServer(id);
    if (!existing) {
      existing = await getEventBySlugServer(id);
    }

    const updated = {
      ...(existing || {}),
      ...body,
      id: existing?.id || id, // enforce ID continuity
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveEventServer(updated);

    try {
      revalidatePath("/events");
      revalidatePath(`/events/${saved.slug}`);
      if (existing.slug && existing.slug !== saved.slug) {
        revalidatePath(`/events/${existing.slug}`);
      }
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
    console.error("Event PUT [id] API error:", err);
    return NextResponse.json({ success: false, error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const existing = await getEventByIdServer(id);
    const success = await deleteEventServer(id);

    if (!success) {
      return NextResponse.json({ success: false, error: "Event not found or could not be deleted" }, { status: 404 });
    }

    try {
      revalidatePath("/events");
      if (existing?.slug) {
        revalidatePath(`/events/${existing.slug}`);
      }
      revalidatePath("/admin/events");
    } catch (_) {}

    return NextResponse.json(
      { success: true, message: "Event deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Event DELETE [id] API error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
  }
}

