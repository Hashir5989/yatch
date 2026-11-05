export function generateStaticParams() {
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

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const canonicalSlug = slug === "as-77" || slug === "as77" ? "g77" : slug === "g55" ? "g50" : slug;

  if (slug === "g100") {
    return {
      title: "ASMARATY G100 Super Yacht | 100ft Tri-Deck Flagship | ASMARATY UAE",
      description:
        "Explore the ASMARATY G100 — an iconic 100-foot tri-deck luxury superyacht engineered in the UAE by Al Shaali Marine. Discover authentic specifications, 3D GA deck plans, staterooms, twin MTU engines, and official brochure.",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://asmaraty.com/yachts/g100",
      },
    };
  }

  if (slug === "g77" || slug === "as-77" || slug === "as77") {
    return {
      title: "ASMARATY G77 Luxury Yacht | 78ft Three-Deck Masterpiece | ASMARATY UAE",
      description:
        "Explore the ASMARATY G77 — an elegant 78-foot three-deck luxury yacht engineered in the UAE by ASMARATY. Discover authentic specifications, 3D GA deck plans, 4+2 staterooms, and expansive flybridge terrace.",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://asmaraty.com/yachts/g77",
      },
    };
  }

  return {
    title: "Yacht Specification Dossier | ASMARATY Luxury Yachts",
    description:
      "ASMARATY yacht model specification dossier. Discover our featured luxury yacht models and naval architecture in the UAE.",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `https://asmaraty.com/yachts/${canonicalSlug || "g100"}`,
    },
  };
}

export default function YachtDetailLayout({ children }) {
  return children;
}
