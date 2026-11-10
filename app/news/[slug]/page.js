import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalNewsDetailView from "@/components/public/news/UniversalNewsDetailView";
import { getArticleBySlugServer, getArticlesServer } from "@/lib/server/db";

export const instant = false;

export async function generateStaticParams() {
  try {
    const articles = await getArticlesServer(true);
    return articles
      .filter((article) => article.articleType !== "event" && !article.eventDetails?.isUpcoming)
      .map((article) => ({
        slug: article.slug,
      }));
  } catch (err) {
    console.warn("Failed to load static params for news:", err.message);
    return [{ slug: "asmaraty-g77-qatar-international-boat-show-2026" }];
  }
}

export async function generateMetadata({ params }) {
  "use cache";
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return {
      title: "News & Events | ASMARATY Luxury Yachts",
    };
  }

  try {
    const article = await getArticleBySlugServer(slug, false);

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
    const canonicalUrl = article.seo?.canonicalUrl || `https://asmaraty.com/news/${slug}`;

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
  const article = await getArticleBySlugServer(slug, false);

  if (!article) {
    notFound();
  }

  // Upcoming events are featured directly in the events section on /events without standalone detail pages
  if (article.articleType === "event" || article.eventDetails?.isUpcoming) {
    redirect("/events#upcoming-events");
  }

  return <UniversalNewsDetailView initialArticle={article} slug={slug} />;
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

