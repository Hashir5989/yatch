import { notFound } from "next/navigation";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalEventDetailView from "@/components/public/events/UniversalEventDetailView";
import { getEventBySlug as getEventFallback, getAllEvents } from "@/lib/data/eventsData";
import { getEventBySlugServer, getEventsServer } from "@/lib/server/db";

export async function generateStaticParams() {
  const events = await getEventsServer(true).catch(() => getAllEvents());
  return (events || []).map((e) => ({
    slug: e.slug,
  }));
}

async function resolveEvent(slug) {
  try {
    const serverEv = await getEventBySlugServer(slug, true);
    if (serverEv) return serverEv;
  } catch (_) {}
  return getEventFallback(slug);
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const event = await resolveEvent(slug);

  if (!event) {
    return {
      title: "Event Not Found | ASMARATY Luxury Yachts",
    };
  }

  const title = event.seo?.metaTitle || `${event.title} | ASMARATY Luxury Yachts`;
  const description = event.seo?.metaDescription || event.excerpt;
  const ogImage = event.seo?.ogImage || event.featuredImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "ASMARATY Luxury Yachts",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `https://asmaraty.com${ogImage}`,
          width: 1280,
          height: 854,
          alt: event.featuredImageAlt || event.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `https://asmaraty.com${ogImage}`],
    },
  };
}

export default async function EventDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const event = await resolveEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-events" />

      <main className="flex-1">
        <UniversalEventDetailView event={event} />
      </main>

      <PublicFooter />
    </div>
  );
}

