import { SECTION_TEMPLATES } from "./sectionTemplates";

// Helper to get template instance
const getTemplateInstance = (type, overrides = {}) => {
  const tpl = SECTION_TEMPLATES.find((t) => t.type === type);
  if (!tpl) return null;
  const data = tpl.createDefaultData();
  return { ...data, ...overrides };
};

export const DEFAULT_PAGES = [
  {
    id: "page-home",
    title: "Home",
    slug: "/",
    template: "editorial_showcase",
    status: "published",
    lastModified: "2026-04-12T10:30:00.000Z",
    sections: [
      /* 1. Saxdor Full-Bleed Dark Hero Banner */
      getTemplateInstance("hero_banner", {
        id: "home-hero",
        eyebrow: "THE ALL-NEW AS 100",
        heading: "MORE FREEDOM. MORE LUXURY.",
        subheading: "Discover the thrill of uncompromised freedom. Where high-performance Scandinavian architectural design meets Arabian Gulf offshore endurance.",
        imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "DISCOVER THE AS 100",
        primaryButtonUrl: "/yachts/as-100",
        secondaryButtonText: "BOOK SEA TRIAL",
        secondaryButtonUrl: "/contact"
      }),

      /* 2. Saxdor Signature 'The Fleet' Pure White Split Feature */
      getTemplateInstance("yacht_collection", {
        id: "home-fleet-feature",
        layoutStyle: "fleet_feature",
        eyebrow: "ASMARATY MODELS",
        heading: "THE FLEET",
        description: "ASMARATY offers a versatile range of models based on the same core ideas: lightweight composite construction, sharp hull shapes, and well-utilized deck space. From the AS 38 to the AS 100, each boat is designed to provide a confident, efficient, and enjoyable driving experience.",
        buttonText: "EXPLORE ALL MODELS",
        buttonUrl: "/yachts"
      }),

      /* 3. Saxdor Signature 'Our Vision' White Section with 16:9 Video */
      getTemplateInstance("image_text", {
        id: "home-vision",
        layoutStyle: "video",
        backgroundStyle: "white",
        eyebrow: "OUR VISION",
        heading: "TRANSFORMING THE TOMORROW OF BOATING",
        description: "At ASMARATY, our vision is to set a new standard in yachting, driven by a passion to fulfill boaters' future desires. Our continuing dedication to naval innovation ensures that each vessel is crafted to transform your experience on the water.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
        buttonText: "OUR CONCEPT",
        buttonUrl: "/about"
      }),

      /* 4. Saxdor Full-Bleed Dark Model Slider */
      getTemplateInstance("yacht_collection", {
        id: "home-model-slider",
        layoutStyle: "model_gallery",
        eyebrow: "ASMARATY SERIES",
        heading: "SIGNATURE FLEET",
        limit: 8
      }),

      /* 5. Saxdor 'Our Expanding Model Range' Pure White Split Text Only */
      getTemplateInstance("image_text", {
        id: "home-expanding-range",
        layoutStyle: "split_text_only",
        backgroundStyle: "white",
        eyebrow: "MODELS",
        heading: "OUR EXPANDING MODEL RANGE",
        description: "With our current model range, we cover a wide variety of boating needs from versatile day cruisers to bespoke trans-oceanic yachts. As our line-up continues to evolve, our vision remains uncompromised: to build vessels that thrill, inspire, and endure.",
        buttonText: "VISIT THE FLEET",
        buttonUrl: "/yachts"
      }),

      /* 6. Saxdor 'Dealers / Global Dealer Network' Pure White Split with Image Left */
      getTemplateInstance("image_text", {
        id: "home-dealers",
        layoutStyle: "image-left",
        backgroundStyle: "white",
        eyebrow: "DEALERS",
        heading: "GLOBAL DEALER NETWORK AT YOUR SERVICE",
        description: "ASMARATY's global dealer network spans the premier yachting destinations of the world. Find your nearest certified dealer and discover our fleet in person with private sea trials and bespoke advisory.",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80",
        buttonText: "VISIT YOUR DEALER",
        buttonUrl: "/contact"
      }),

      /* 7. Saxdor 'Company / One Team One Company' Pure White Split with Image Right */
      getTemplateInstance("image_text", {
        id: "home-company",
        layoutStyle: "image-right",
        backgroundStyle: "white",
        eyebrow: "COMPANY",
        heading: "ONE TEAM ONE COMPANY",
        description: "Founded in 1979 in the UAE, ASMARATY unites visionary naval architects, composite engineers, and interior craftsmen under one dedicated shipyard. Together, we challenge conventions and build boats that set international benchmarks.",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
        buttonText: "ABOUT ASMARATY",
        buttonUrl: "/about"
      }),

      /* 8. Saxdor 'Latest News' Pure White Split with Image Left */
      getTemplateInstance("image_text", {
        id: "home-news",
        layoutStyle: "image-left",
        backgroundStyle: "white",
        eyebrow: "LATEST NEWS",
        heading: "ASMARATY AS 100 GTO: THE FLAGSHIP MAKES GLOBAL WAVES",
        description: "Unveiled at the international boat show, the new flagship AS 100 combines extraordinary cruising range with expansive alfresco living and award-winning naval architecture.",
        imageUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80",
        buttonText: "READ FULL STORY",
        buttonUrl: "/news"
      }),

      /* 9. Saxdor Signature Full-Bleed Dark Ocean 'Start Your Journey Now' Banner */
      getTemplateInstance("call_to_action", {
        id: "home-journey-cta",
        layoutStyle: "cinematic-full",
        eyebrow: "THE HORIZON AWAITS",
        heading: "START YOUR JOURNEY NOW",
        description: "Step aboard and experience the next generation of luxury yachting.",
        primaryButtonText: "VISIT THE FLEET",
        primaryButtonUrl: "/yachts",
        imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80"
      })
    ]
  },
  {
    id: "page-yachts",
    title: "Yacht Collections",
    slug: "/yachts",
    template: "fleet_catalog",
    status: "published",
    lastModified: "2026-04-10T14:15:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "yachts-hero",
        eyebrow: "THE ASMARATY COLLECTION",
        heading: "THE FLEET OF DISTINCTION",
        subheading: "From the majestic 100ft tri-deck flagship to high-speed offshore island cruisers, explore custom naval vessels built to transcend expectations.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "Filter Models",
        primaryButtonUrl: "#fleet-grid",
        secondaryButtonText: "Request Price List",
        secondaryButtonUrl: "/contact"
      }),
      getTemplateInstance("yacht_collection", {
        id: "yachts-grid",
        layoutStyle: "grid",
        eyebrow: "CATALOGUE",
        heading: "Explore All Yacht Series",
        description: "Click any model to view comprehensive technical specifications, engine options, interior layouts, and bespoke customization packages.",
        filterCategory: "all",
        limit: 12
      }),
      getTemplateInstance("image_text", {
        id: "yachts-custom",
        layoutStyle: "image-right",
        backgroundStyle: "white",
        eyebrow: "CUSTOM BESPOKE COMMISSIONS",
        heading: "Every Vessel Tailored to Your Vision",
        description: "At ASMARATY, no two yachts leaving our shipyard are identical. Owners participate in every design milestone — selecting rare book-matched marbles, hand-stitched leathers, audio-visual layouts, and custom tender arrangements.",
        imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
        buttonText: "Discuss a Custom Build",
        buttonUrl: "/contact"
      }),
      getTemplateInstance("enquiry_section", {
        id: "yachts-enquiry",
        eyebrow: "VIP ENQUIRIES",
        heading: "Request Private Fleet Consultation & Pricing"
      })
    ]
  },
  {
    id: "page-about",
    title: "About Us",
    slug: "/about",
    template: "heritage_craft",
    status: "published",
    lastModified: "2026-04-08T09:45:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "about-hero",
        eyebrow: "SHIPYARD HERITAGE • SINCE 1979",
        heading: "THE PIONEER OF GULF BOATBUILDING",
        subheading: "More than four decades of continuous naval innovation, Arabian maritime passion, and bespoke craftsmanship in the United Arab Emirates.",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "Our Story",
        primaryButtonUrl: "#about-story",
        secondaryButtonText: "Visit Shipyard",
        secondaryButtonUrl: "/contact"
      }),
      getTemplateInstance("rich_text", {
        id: "about-story",
        eyebrow: "OUR ORIGIN STORY",
        heading: "From Visionary Dreams to World-Class Shipyard",
        content: `In 1979, when the modern United Arab Emirates was still in its formative years, our founders recognized an extraordinary opportunity: to revive the region's ancient maritime seafaring soul through modern composite naval engineering.

Starting with high-integrity coastal fishing craft and patrol vessels, the shipyard rapidly established a reputation for producing boats that could withstand the demanding thermal and saline environment of the Arabian Gulf.

As our engineering mastery expanded, ASMARATY transitioned into luxury motor yachts, collaborating with distinguished Italian naval architects to produce vessels that combine Mediterranean aerodynamic grace with exceptional Gulf seaworthiness. Today, our 100-foot tri-deck superyachts represent the pinnacle of regional luxury yacht building.`
      }),
      getTemplateInstance("image_text", {
        id: "about-tech",
        layoutStyle: "image-left",
        backgroundStyle: "white",
        eyebrow: "ENGINEERING EXCELLENCE",
        heading: "Advanced Vacuum-Infused Composites",
        description: "We utilize multi-axial glass fiber, carbon fiber reinforcements, and high-performance vinylester resins processed via vacuum resin infusion. This achieves optimal strength-to-weight ratios, increased fuel efficiency, higher cruising speeds, and exceptional acoustic insulation.",
        imageUrl: "https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=2000&q=80",
        buttonText: "Explore Technical Standards",
        buttonUrl: "/yachts"
      }),
      getTemplateInstance("call_to_action", {
        id: "about-cta",
        layoutStyle: "cinematic-full",
        heading: "Experience ASMARATY in Person",
        description: "We invite prospective owners to tour our UAE shipyard facility and witness the artisan craftsmanship firsthand.",
        primaryButtonText: "VISIT THE SHIPYARD",
        primaryButtonUrl: "/contact"
      })
    ]
  },
  {
    id: "page-news",
    title: "News & Insights",
    slug: "/news",
    template: "editorial_showcase",
    status: "published",
    lastModified: "2026-04-05T12:00:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "news-hero",
        eyebrow: "ASMARATY CHRONICLES",
        heading: "NEWS, INSIGHTS & EVENTS",
        subheading: "Latest international boat show highlights, naval architecture advancements, vessel launches, and shipyard dispatches.",
        imageUrl: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "Read Latest Dispatch",
        primaryButtonUrl: "#latest-news",
        secondaryButtonText: "Press Inquiries",
        secondaryButtonUrl: "/contact"
      }),
      getTemplateInstance("image_text", {
        id: "news-article-1",
        layoutStyle: "image-left",
        backgroundStyle: "white",
        eyebrow: "DUBAI INTERNATIONAL BOAT SHOW 2026",
        heading: "ASMARATY Debuts the New AS 100 Tri-Deck Edition",
        description: "At the prestigious Dubai International Boat Show, ASMARATY unveiled the newest iteration of its flagship AS 100 superyacht. Featuring an expanded upper deck infinity jacuzzi, enlarged floor-to-ceiling salon windows, and an automated zero-emission battery hybrid anchoring system, the vessel captivated global collectors and maritime journalists alike.",
        imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80",
        buttonText: "Read Press Release",
        buttonUrl: "/yachts/as-100"
      }),
      getTemplateInstance("call_to_action", {
        id: "news-cta",
        layoutStyle: "cinematic-full",
        heading: "Subscribe to Exclusive Marine Dispatches",
        description: "Receive private invitations to confidential sea trials, new model launches, and VIP shipyard events.",
        primaryButtonText: "JOIN VIP REGISTRY",
        primaryButtonUrl: "/contact"
      })
    ]
  },
  {
    id: "page-contact",
    title: "Contact & Concierge",
    slug: "/contact",
    template: "vip_concierge",
    status: "published",
    lastModified: "2026-04-11T16:20:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "contact-hero",
        eyebrow: "VIP MARITIME CONCIERGE",
        heading: "CONNECT WITH THE SHIPYARD",
        subheading: "Arrange a confidential consultation, schedule a private sea trial, or request exclusive build specifications from our UAE headquarters.",
        imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "Send Enquiry",
        primaryButtonUrl: "#enquiry-form",
        secondaryButtonText: "Call Concierge",
        secondaryButtonUrl: "tel:1234567890"
      }),
      getTemplateInstance("enquiry_section", {
        id: "enquiry-form",
        eyebrow: "DIRECT SHIPYARD DIALOGUE",
        heading: "Request Private Sea Trial or Commission Walkthrough"
      })
    ]
  }
];
