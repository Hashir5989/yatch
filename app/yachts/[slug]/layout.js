import { getYachtsServer } from "@/lib/server/db";
import { getYachtShowcaseData, mergeYachtWithShowcase } from "@/lib/data/yachtShowcaseData";

export async function generateStaticParams() {
  try {
    const allYachts = await getYachtsServer(true); // published yachts only
    const params = [];
    for (const y of allYachts) {
      if (y.slug && y.status !== "draft") {
        params.push({ slug: y.slug });
      }
    }
    // Include aliases for backward compatibility
    const aliases = ["g100", "g77", "as-77", "as77", "g66", "g50", "g55"];
    for (const a of aliases) {
      if (!params.some((p) => p.slug === a)) {
        params.push({ slug: a });
      }
    }
    return params;
  } catch (err) {
    console.error("Error generating static params for yachts:", err);
    return [
      { slug: "g100" },
      { slug: "g77" },
      { slug: "as-77" },
      { slug: "as77" },
      { slug: "g66" },
      { slug: "g50" },
      { slug: "g55" },
    ];
  }
}

export const instant = false;

export async function generateMetadata({ params }) {
  "use cache";
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug) {
    return {
      title: "Yacht Specification Dossier | ASMARATY Luxury Yachts",
      robots: { index: false, follow: true },
    };
  }

  const canonicalSlug =
    slug === "as-77" || slug === "as77"
      ? "g77"
      : slug === "g55" || slug === "g-50" || slug === "as-50" || slug === "as50"
      ? "g50"
      : slug === "g-66" || slug === "as-66" || slug === "as66"
      ? "g66"
      : slug;

  try {
    const allYachts = await getYachtsServer(false);
    const cmsYacht = allYachts.find((y) => y.slug?.toLowerCase() === canonicalSlug.toLowerCase());
    const staticShowcase = getYachtShowcaseData(canonicalSlug);
    const merged = mergeYachtWithShowcase(cmsYacht, staticShowcase);

    // 1. Unpublished / Draft Yacht Protection
    if (!merged || merged.status === "draft") {
      return {
        title: `${merged?.fullName || "Yacht Model"} (Draft) | ASMARATY Luxury Yachts`,
        description: "This yacht model dossier is currently in preparation and has not yet been published.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // 2. Published Yacht Metadata
    // Default fallback titles matching authentic ASMARATY copy
    const fallbackTitles = {
      g100: "ASMARATY G100 Super Yacht | 100ft Tri-Deck Flagship | ASMARATY UAE",
      g77: "ASMARATY G77 Luxury Yacht | 77ft Three-Deck Masterpiece | ASMARATY UAE",
      g66: "ASMARATY G66 Luxury Yacht | 66ft Flybridge Cruiser | ASMARATY UAE",
      g50: "ASMARATY G50 Luxury Motor Yacht | 50ft Flybridge Cruiser | ASMARATY UAE",
    };

    const fallbackDescriptions = {
      g100: "Explore the ASMARATY G100 — an iconic 100-foot tri-deck luxury superyacht engineered in the UAE by Al Shaali Marine. Discover authentic specifications, 3D GA deck plans, staterooms, twin MTU engines, and official brochure.",
      g77: "Explore the ASMARATY G77 — an elegant 77-foot three-deck luxury yacht engineered in the UAE by ASMARATY. Discover authentic specifications, 3D GA deck plans, 4+2 staterooms, and expansive flybridge terrace.",
      g66: "Explore the ASMARATY G66 — a 66-foot high-performance luxury flybridge yacht engineered in the UAE. Discover authentic specifications, 3D GA deck plans, 4+2 staterooms, twin Volvo inboards, and expansive flybridge terrace.",
      g50: "Explore the ASMARATY G50 — an elegant 50-foot luxury flybridge motor yacht engineered in the UAE. Discover authentic specifications, 3D GA deck plans, 3 private staterooms, twin Cummins inboards, and official brochure.",
    };

    const defaultTitle = fallbackTitles[canonicalSlug] || `${merged.fullName || merged.name} | ASMARATY UAE`;
    const defaultDesc = fallbackDescriptions[canonicalSlug] || merged.description || "ASMARATY yacht model specification dossier. Discover our featured luxury yacht models and naval architecture in the UAE.";

    const title = merged.seo?.title || defaultTitle;
    const description = merged.seo?.description || defaultDesc;
    const ogImage = merged.seo?.ogImage || merged.heroImage || merged.mainImage || "/images/yachts/g100/0.jpg";
    const canonicalUrl = `https://asmaraty.com/yachts/${canonicalSlug}`;

    return {
      title,
      description,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
            alt: title,
          },
        ],
        url: canonicalUrl,
        type: "website",
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (err) {
    console.error("Error generating metadata for yacht detail:", err);
    return {
      title: "Yacht Specification Dossier | ASMARATY Luxury Yachts",
      description: "ASMARATY yacht model specification dossier.",
      robots: { index: false, follow: true },
      alternates: { canonical: `https://asmaraty.com/yachts/${canonicalSlug || "g100"}` },
    };
  }
}

export default function YachtDetailLayout({ children }) {
  return children;
}
