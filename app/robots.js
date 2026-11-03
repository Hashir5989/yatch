export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://asmaraty.com/sitemap.xml",
    host: "https://asmaraty.com",
  };
}

