export default function sitemap() {
  const baseUrl = "https://asmaraty.com";

  // Only publicly available and indexable pages are included in sitemap.xml.
  // Subpages currently under construction are marked with noindex and excluded.
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
