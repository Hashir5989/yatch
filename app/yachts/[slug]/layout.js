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
