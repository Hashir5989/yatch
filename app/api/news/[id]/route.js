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
    const articleData = await request.json();

    if (!articleData.title || !articleData.title.trim()) {
      return NextResponse.json({ success: false, error: "News title is required." }, { status: 400 });
    }

    const saved = await saveArticleServer({ ...articleData, id });

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
    return NextResponse.json({ success: false, error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await authenticateAdminRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteArticleServer(id);

    try {
      revalidatePath("/news");
      revalidatePath("/events");
      revalidatePath("/");
      revalidatePath("/admin/news");
    } catch (_) {}

    return NextResponse.json(
      { success, message: success ? "Article deleted" : "Article not found" },
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

