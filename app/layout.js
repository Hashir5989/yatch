import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://asmaraty.com"),
  title: {
    default: "ASMARATY Yachts | Luxury Yacht Collection in UAE",
    template: "%s | ASMARATY Luxury Yachts UAE",
  },
  description:
    "Discover ASMARATY luxury yachts in the UAE. Explore our exclusive yacht collection, including G50, G66, G55 and AS77 models. Precision naval architecture, bespoke craftsmanship, and world-class luxury.",
  keywords: [
    "ASMARATY",
    "ASMARATY yachts",
    "ASMARATY luxury yachts",
    "ASMARATY UAE",
    "ASMARATY G50",
    "ASMARATY G66",
    "ASMARATY G55",
    "ASMARATY AS77",
    "ASMARATY G100",
    "luxury yachts Dubai",
    "superyacht builder UAE",
    "yacht manufacturer UAE",
    "bespoke yachts UAE"
  ],
  alternates: {
    canonical: "https://asmaraty.com/",
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://asmaraty.com/",
    siteName: "ASMARATY Luxury Yachts",
    title: "ASMARATY Yachts | Luxury Yacht Collection in UAE",
    description:
      "Discover ASMARATY luxury yachts in the UAE. Explore our exclusive yacht collection, including G50, G66, G55 and AS77 models.",
    images: [
      {
        url: "/images/yachts/g100.jpg",
        width: 1200,
        height: 630,
        alt: "ASMARATY G100 Superyacht cruising past Burj Al Arab in Dubai UAE",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASMARATY Yachts | Luxury Yacht Collection in UAE",
    description:
      "Discover ASMARATY luxury yachts in the UAE. Explore our exclusive yacht collection, including G50, G66, G55 and AS77 models.",
    images: ["/images/yachts/g100.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png?v=metal", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png?v=metal", sizes: "64x64", type: "image/png" },
      { url: "/favicon.ico?v=metal" }
    ],
    shortcut: "/favicon.ico?v=metal",
    apple: "/apple-touch-icon.png?v=metal",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://asmaraty.com/#organization",
  name: "ASMARATY",
  alternateName: ["ASMARATY Yachts", "ASMARATY Luxury Yachts"],
  url: "https://asmaraty.com",
  logo: "https://asmaraty.com/icon.png",
  description:
    "Pioneering luxury composite yacht manufacturing, naval architecture, and bespoke superyacht building in the United Arab Emirates since 1979.",
  foundingDate: "1979",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rashidia 1",
    addressLocality: "Ajman",
    addressRegion: "Ajman",
    addressCountry: "AE",
  },
  sameAs: ["https://asmaraty.com"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://asmaraty.com/#website",
  name: "ASMARATY Luxury Yachts",
  url: "https://asmaraty.com",
  publisher: {
    "@id": "https://asmaraty.com/#organization",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://asmaraty.com/yachts?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Montserrat:wght@200;300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />
      </head>
      <body className="min-h-full bg-[#080B10] text-[#E8EAEE] font-sans selection:bg-[#C6A155] selection:text-black antialiased">
        {children}
      </body>
    </html>
  );
}
