import { NextResponse } from "next/server";
import { getArticlesServer, saveArticleServer, authenticateAdminRequest } from "@/lib/server/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const session = await authenticateAdminRequest(request);
    const isAdmin = Boolean(session);

    // Non-admin requests or explicit published=true only receive published articles
    const publishedOnly = !isAdmin || publishedParam === "true";

    const articles = await getArticlesServer(publishedOnly);
    return NextResponse.json({ success: true, articles });
  } catch (err) {
    console.error("News GET API error:", err);
    return NextResponse.json({ success: false, error: "Failed to load news articles" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await authenticateAdminRequest(request);

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin session required." }, { status: 401 });
    }

    const articleData = await request.json();

    if (!articleData.title || !articleData.title.trim()) {
      return NextResponse.json({ success: false, error: "News title is required." }, { status: 400 });
    }

    // Auto-generate clean slug if missing
    let slug = (articleData.slug || "").trim().toLowerCase();
    if (!slug) {
      slug = articleData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Check slug uniqueness across existing articles
    const existing = await getArticlesServer(false);
    if (existing.some((a) => a.slug === slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanedArticle = {
      ...articleData,
      title: articleData.title.trim(),
      slug,
      category: articleData.category || "Boat Shows",
      status: articleData.status === "draft" ? "draft" : "published",
      featuredImage: articleData.featuredImage || "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
      featuredImageAlt: articleData.featuredImageAlt || articleData.title.trim(),
      excerpt: (articleData.excerpt || "").trim(),
      content: (articleData.content || "").trim(),
      publishedAt: articleData.publishedAt || new Date().toISOString().slice(0, 10),
      readingTime: articleData.readingTime || "3 min read",
      eventDetails: articleData.eventDetails || {},
      gallery: Array.isArray(articleData.gallery) ? articleData.gallery : [],
      cta: articleData.cta || {},
      secondaryCta: articleData.secondaryCta || {},
      seo: articleData.seo || {},
      relatedArticleIds: Array.isArray(articleData.relatedArticleIds) ? articleData.relatedArticleIds : [],
    };

    const saved = await saveArticleServer(cleanedArticle);
    return NextResponse.json({ success: true, article: saved });
  } catch (err) {
    console.error("News POST API error:", err);
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 });
  }
}

