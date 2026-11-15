import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getArticleByIdServer, saveArticleServer, deleteArticleServer, authenticateAdminRequest } from "@/lib/server/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const article = await getArticleByIdServer(id);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    const session = await authenticateAdminRequest(request);
    const isAdmin = Boolean(session);

    // If draft and not admin, reject
    if (article.status !== "published" && !isAdmin) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(
      { success: true, article },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    console.error("News GET by ID error:", err);
    return NextResponse.json({ success: false, error: "Failed to load article" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Article ID is required." }, { status: 400 });
    }

    const articleData = await request.json();

    if (articleData.title !== undefined && (!articleData.title || !articleData.title.trim())) {
      return NextResponse.json({ success: false, error: "News title cannot be empty." }, { status: 400 });
    }

    const saved = await saveArticleServer({ ...articleData, id });
    if (!saved) {
      return NextResponse.json({ success: false, error: `Article with ID '${id}' not found.` }, { status: 404 });
    }

    try {
      revalidatePath("/news");
      if (saved?.slug) revalidatePath(`/news/${saved.slug}`);
      revalidatePath("/events");
      revalidatePath("/");
      revalidatePath("/admin/news");
    } catch (_) {}

    return NextResponse.json(
      { success: true, article: saved },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("News PUT error:", err);
    const isClientError = err.message && (
      err.message.includes("is required") ||
      err.message.includes("cannot be empty") ||
      err.message.includes("already in use") ||
      err.message.includes("must contain only")
    );
    const status = isClientError ? 400 : 500;
    return NextResponse.json({ success: false, error: err.message || "Failed to update article" }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Article ID is required." }, { status: 400 });
    }

    const success = await deleteArticleServer(id);
    if (!success) {
      return NextResponse.json({ success: false, error: `Article with ID '${id}' not found.` }, { status: 404 });
    }

    try {
      revalidatePath("/news");
      revalidatePath("/events");
      revalidatePath("/");
      revalidatePath("/admin/news");
    } catch (_) {}

    return NextResponse.json(
      { success: true, message: "Article deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("News DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete article" }, { status: 500 });
  }
}
