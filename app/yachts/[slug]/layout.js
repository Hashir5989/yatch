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
  const canonicalSlug =
    slug === "as-77" || slug === "as77"
      ? "g77"
      : slug === "g55" || slug === "g-50" || slug === "as-50" || slug === "as50"
      ? "g50"
      : slug === "g-66" || slug === "as-66" || slug === "as66"
      ? "g66"
      : slug;

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

  if (slug === "g66" || slug === "g-66" || slug === "as-66" || slug === "as66") {
    return {
      title: "ASMARATY G66 Luxury Yacht | 66ft Flybridge Cruiser | ASMARATY UAE",
      description:
        "Explore the ASMARATY G66 — a 66-foot high-performance luxury flybridge yacht engineered in the UAE. Discover authentic specifications, 3D GA deck plans, 4+2 staterooms, twin Volvo inboards, and expansive flybridge terrace.",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://asmaraty.com/yachts/g66",
      },
    };
  }

  if (slug === "g50" || slug === "g-50" || slug === "as-50" || slug === "as50" || slug === "g55") {
    return {
      title: "ASMARATY G50 Luxury Motor Yacht | 50ft Flybridge Cruiser | ASMARATY UAE",
      description:
        "Explore the ASMARATY G50 — an elegant 50-foot luxury flybridge motor yacht engineered in the UAE. Discover authentic specifications, 3D GA deck plans, 3 private staterooms, twin Cummins inboards, and official brochure.",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: "https://asmaraty.com/yachts/g50",
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
