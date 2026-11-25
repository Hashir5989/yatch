import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalNewsDetailView from "@/components/public/news/UniversalNewsDetailView";
import { getArticleBySlugServer, getArticlesServer } from "@/lib/server/db";
import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

export const instant = false;

export async function generateStaticParams() {
  let articles = [];
  try {
    articles = await getArticlesServer(true);
  } catch (err) {
    console.warn("Failed to load static params for news:", err.message);
  }

  const source = articles?.length ? articles : DEFAULT_ARTICLES;
  return source.map((article) => ({
    slug: article.slug,
  }));
}

async function resolveArticle(slug) {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  try {
    const article = await getArticleBySlugServer(decoded, false);
    if (article) return article;
  } catch (err) {
    console.warn("[News] Error loading article from server:", err.message);
  }

  return (
    DEFAULT_ARTICLES.find(
      (a) =>
        (a.slug && a.slug.toLowerCase() === decoded) ||
        (a.id && a.id.toLowerCase() === decoded)
    ) || null
  );
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return {
      title: "News & Events | ASMARATY Luxury Yachts",
    };
  }

  try {
    const article = await resolveArticle(slug);

    if (!article) {
      return {
        title: "Article Not Found | ASMARATY Luxury Yachts",
        robots: { index: false, follow: false },
      };
    }

    const isPublished = article.status === "published";
    const title = article.seo?.metaTitle || `${article.title} | ASMARATY Luxury Yachts`;
    const description = article.seo?.metaDescription || article.excerpt;
    const ogImage = article.seo?.ogImage || article.featuredImage || "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg";
    const canonicalUrl = article.seo?.canonicalUrl || `https://asmaraty.com/news/${article.slug || slug}`;

    return {
      title,
      description,
      robots: {
        index: isPublished,
        follow: isPublished,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "ASMARATY Luxury Yachts",
        images: [
          {
            url: ogImage.startsWith("http") ? ogImage : `https://asmaraty.com${ogImage}`,
            width: 1280,
            height: 854,
            alt: article.featuredImageAlt || article.title,
          },
        ],
        type: "article",
        publishedTime: article.publishedAt,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage.startsWith("http") ? ogImage : `https://asmaraty.com${ogImage}`],
      },
    };
  } catch (err) {
    console.warn("Failed to generate metadata for news:", err.message);
    return {
      title: "News & Events | ASMARATY Luxury Yachts",
    };
  }
}

async function NewsDetailContent({ slug }) {
  const article = await resolveArticle(slug);

  if (!article) {
    notFound();
  }

  return <UniversalNewsDetailView initialArticle={article} slug={article.slug || slug} />;
}

export default async function IndividualNewsPage({ params }) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-news" />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center font-serif text-white/50 text-sm">
              Loading Shipyard Dispatch...
            </div>
          }
        >
          <NewsDetailContent slug={slug} />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  );
}

