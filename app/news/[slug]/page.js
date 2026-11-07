import { notFound, redirect } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalNewsDetailView from "@/components/public/news/UniversalNewsDetailView";
import { getArticleBySlugServer, getArticlesServer } from "@/lib/server/db";

export async function generateStaticParams() {
  const articles = await getArticlesServer(true);
  return articles
    .filter((article) => article.articleType !== "event" && !article.eventDetails?.isUpcoming)
    .map((article) => ({
      slug: article.slug,
    }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
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
}

export default async function IndividualNewsPage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlugServer(slug, false);

  if (!article) {
    notFound();
  }

  // Upcoming events are featured directly in the events section on /news without standalone detail pages
  if (article.articleType === "event" || article.eventDetails?.isUpcoming) {
    redirect("/news#upcoming-events");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-news" />

      <main className="flex-1">
        <UniversalNewsDetailView initialArticle={article} slug={slug} />
      </main>

      <PublicFooter />
    </div>
  );
}

