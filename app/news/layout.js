export const metadata = {
  title: "Maritime News, Updates & Boat Shows | ASMARATY Luxury Yachts",
  description:
    "Explore the latest news, international boat show debuts, press releases, and shipyard dispatches from ASMARATY Luxury Yachts in the UAE.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://asmaraty.com/news",
  },
  openGraph: {
    title: "Maritime News, Updates & Boat Shows | ASMARATY Luxury Yachts",
    description:
      "Explore the latest announcements, Qatar International Boat Show highlights, and naval innovations from ASMARATY Luxury Yachts.",
    url: "https://asmaraty.com/news",
    siteName: "ASMARATY Luxury Yachts",
    images: [
      {
        url: "https://asmaraty.com/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
        width: 1280,
        height: 854,
        alt: "ASMARATY Flagship Yacht Showcase at Qatar International Boat Show",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function NewsLayout({ children }) {
  return children;
}
