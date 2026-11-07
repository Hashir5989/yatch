export const metadata = {
  title: "Contact & VIP Concierge | ASMARATY Luxury Yachts UAE",
  description:
    "Contact the ASMARATY luxury yacht advisory team in the United Arab Emirates. Visit our shipyard headquarters in Ajman, call our direct client desk (+971 56 526 8126), connect on WhatsApp, or book a private sea trial and bespoke consultation.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://asmaraty.com/contact",
  },
  openGraph: {
    title: "Contact & VIP Concierge | ASMARATY Luxury Yachts UAE",
    description:
      "Direct maritime advisory, private sea trials, and shipyard walkthroughs in Dubai & Ajman, UAE.",
    url: "https://asmaraty.com/contact",
    siteName: "ASMARATY Luxury Yachts",
    images: [
      {
        url: "https://asmaraty.com/images/yachts/g100/5.jpg",
        width: 1200,
        height: 630,
        alt: "ASMARATY Luxury Yachts Shipyard & VIP Concierge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function ContactLayout({ children }) {
  return children;
}
