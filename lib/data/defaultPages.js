import { SECTION_TEMPLATES } from "./sectionTemplates.js";

// Helper to get template instance
const getTemplateInstance = (type, overrides = {}) => {
  const tpl = SECTION_TEMPLATES.find((t) => t.type === type);
  if (!tpl) return null;
  const data = tpl.createDefaultData();
  return { ...data, ...overrides };
};

export const DEFAULT_HOME_PAGE = {
    id: "page-home",
    title: "Home",
    slug: "/",
    template: "editorial_showcase",
    status: "published",
    lastModified: "2026-04-12T10:30:00.000Z",
    sections: [
      /* 1. Full-Bleed Dark Hero Banner */
      getTemplateInstance("hero_banner", {
        id: "home-hero",
        eyebrow: "THE ASMARATY COLLECTION",
        heading: "A Distinctive Perspective on Life at Sea",
        subheading: "Discover the ASMARATY collection, where considered design, refined spaces and the pleasure of being on the water come together.",
        imageUrl: "/images/asmaraty-hero-banner-poster.jpg",
        videoUrl: "/videos/banner-home.mp4",
        primaryButtonText: "EXPLORE THE COLLECTION",
        primaryButtonUrl: "#fleet",
        secondaryButtonText: "BOOK SEA TRIAL",
        secondaryButtonUrl: "#enquiry-form"
      }),

      /* 2. Signature 'The Fleet' Pure White Split Feature */
      getTemplateInstance("yacht_collection", {
        id: "home-fleet-feature",
        layoutStyle: "fleet_feature",
        eyebrow: "ASMARATY FLEET",
        heading: "The Signature\nOf the Sea",
        description: "ASMARATY brings a distinct personality to the water, unified by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful on-board comfort. Built on a shared passion for design, craftsmanship, and life at sea, our yachts are created to be as rewarding to spend time aboard as they are to admire from the shore.",
        buttonText: "DISCOVER OUR STORY",
        buttonUrl: "/about"
      }),

      /* 3. Comprehensive Showcase */
      getTemplateInstance("yacht_collection", {
        id: "home-four-models",
        layoutStyle: "four_models_showcase",
        backgroundStyle: "white",
        eyebrow: "ASMARATY SIGNATURE FLEET",
        heading: "OUR SUPERYACHT COLLECTION",
        description: "Immerse yourself in the distinguished world of ASMARATY. Explore our expanding portfolio of bespoke motor yachts and superyachts, engineered with cutting-edge naval architecture, expansive living spaces, and peerless composite craftsmanship.",
        buttonText: "DISCOVER THE COMPLETE FLEET",
        buttonUrl: "/yachts",
        limit: 4
      }),

      /* 4. Brand Vision: Passion for Design, Craftsmanship & Life at Sea */
      getTemplateInstance("image_text", {
        id: "home-vision",
        layoutStyle: "video",
        backgroundStyle: "white",
        eyebrow: "A PASSION FOR DESIGN & CRAFTSMANSHIP",
        heading: "A SHARED PASSION FOR LIFE AT SEA",
        description: "At ASMARATY, our ambition is to create yachts that deliver spacious luxury boating and stylish, intimate cruising. From our broad proportions and generous accommodations to panoramic flybridge vistas, every vessel is created to be as rewarding to spend time aboard as it is to admire from the shore.",
        imageUrl: "/images/asmaraty-shared-passion.jpg",
        imageAlt: "ASMARATY Luxury Yacht with illuminated emblem at sunset",
        buttonText: "REQUEST CONSULTATION",
        buttonUrl: "#enquiry-form"
      }),

      /* 5. Full-Bleed Dark Model Slider */
      getTemplateInstance("yacht_collection", {
        id: "home-model-slider",
        layoutStyle: "model_gallery",
        eyebrow: "ASMARATY INTERIORS",
        heading: "BESPOKE INTERIOR CRAFTSMANSHIP",
        description: "",
        limit: 6
      }),

      /* 6. Shipyard Heritage: Contemporary Aesthetics & Usable Space */
      getTemplateInstance("image_text", {
        id: "home-company",
        layoutStyle: "image-right",
        backgroundStyle: "white",
        eyebrow: "CONTEMPORARY AESTHETICS • CRAFTSMANSHIP",
        heading: "A NEW CHAPTER IN BOATBUILDING",
        description: "Rooted in maritime heritage and refined modern styling, ASMARATY designs yachts that balance modern exterior lines with broad proportions, usable space, and the comforts that make longer stays at sea truly memorable.",
        imageUrl: "/images/asmaraty-shipyard-facility.jpg",
        imageAlt: "Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE",
        buttonText: "VISIT OUR SHIPYARD",
        buttonUrl: "#enquiry-form"
      }),

      /* 7. Direct Shipyard Dialogue & Sea Trial Enquiry Section */
      getTemplateInstance("enquiry_section", {
        id: "home-enquiry",
        eyebrow: "VIP MARITIME CONCIERGE",
        heading: "REQUEST PRIVATE SEA TRIAL OR SHIPYARD CONSULTATION",
        description: "Connect directly with our luxury yacht advisory team. We arrange private sea trials for the ASMARATY fleet, shipyard walkthroughs, and confidential bespoke build consultations.",
        recipientEmail: "info@asmaraty.com",
        phone: "+971 56 526 8126",
        address: "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates",
        operatingHours: "Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)",
        yachtOptions: [
          "G-100 Super Yacht (100ft)",
          "G-66 Luxury Yacht (66ft)",
          "G-50 Luxury Motor Yacht (50ft)",
          "ASMARATY G77 Luxury Yacht",
          "Custom Bespoke Commission"
        ]
      }),

      /* 8. Full-Bleed Dark Ocean 'Start Your Journey Now' Banner */
      getTemplateInstance("call_to_action", {
        id: "home-journey-cta",
        layoutStyle: "cinematic-full",
        eyebrow: "THE HORIZON AWAITS",
        heading: "START YOUR JOURNEY NOW",
        description: "Step aboard the ASMARATY collection and experience the next generation of spacious luxury yachting.",
        primaryButtonText: "VISIT THE FLEET",
        primaryButtonUrl: "#fleet",
        imageUrl: "/images/asmaraty-racing-yacht-journey.jpg",
        videoUrl: ""
      })
    ]
};

export const DEFAULT_YACHTS_PAGE = {
    id: "page-yachts",
    title: "Yacht Collections",
    slug: "/yachts",
    template: "fleet_catalog",
    status: "published",
    lastModified: "2026-11-07T14:30:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "yachts-hero",
        eyebrow: "The Official ASMARATY Fleet",
        heading: "The Fleet of Distinction",
        subheading: "Handcrafted composite superyachts and luxury motor yachts engineered in the United Arab Emirates since 1979. Each vessel unites naval precision, sunlit panoramic architecture, and bespoke master craftsmanship.",
        imageUrl: "/images/yachts/g100/0.jpg",
        imageAlt: "ASMARATY Luxury Yacht Fleet",
        videoUrl: "",
        primaryButtonText: "Explore Models",
        primaryButtonUrl: "#fleet-catalog",
        primaryButton: {
          label: "Explore Models",
          url: "#fleet-catalog",
          type: "anchor",
          target: "_self",
          visible: true,
          style: "solid-gold"
        },
        showModelPills: false,
        secondaryButtonText: "Compare Specs Matrix",
        secondaryButtonUrl: "#comparison-matrix",
        secondaryButton: {
          label: "Compare Specs Matrix",
          url: "#comparison-matrix",
          type: "anchor",
          target: "_self",
          visible: false,
          style: "outline-white"
        },
        stats: [
          { value: "50–100 FT", label: "Fleet Length Span" },
          { value: "3,200 HP", label: "Peak Propulsion Power" },
          { value: "4 Classes", label: "Distinct Naval Series" },
          { value: "1979", label: "Shipyard Heritage (45+ Yrs)" }
        ]
      }),
      getTemplateInstance("yacht_collection", {
        id: "yachts-grid",
        eyebrow: "CATALOGUE DOSSIER",
        heading: "Explore the Models",
        description: "",
        filterCategory: "all",
        categories: [
          { id: "all", label: "All Fleet (4)" },
          { id: "superyacht", label: "Superyachts" },
          { id: "three-deck", label: "Three-Deck Cruisers" },
          { id: "flybridge", label: "Flybridge Cruisers" },
          { id: "motor-yacht", label: "Motor Yachts" }
        ],
        primaryButtonText: "Explore Dossier",
        brochureButtonText: "Brochure (PDF)",
        consultationButtonText: "Book Private Sea Trial / Consultation",
        consultationButtonUrl: "/contact"
      }),
      getTemplateInstance("comparison_matrix", {
        id: "yachts-matrix",
        eyebrow: "TECHNICAL SPECIFICATIONS",
        heading: "Side-by-Side Fleet Comparison",
        description: "Compare naval dimensions, propulsion packages, accommodations, and engineering across all four ASMARATY yacht models.",
        dimensions: [
          "Length Overall (LOA)",
          "Waterline Length (LWL)",
          "Maximum Beam",
          "Draft at Full Load",
          "Displacement",
          "Propulsion Power",
          "Staterooms & Accommodations",
          "Sleeping Berths / Passenger Capacity",
          "Fuel Tank Capacity",
          "Freshwater Capacity",
          "Hull & Deck Construction"
        ]
      }),
      getTemplateInstance("image_text", {
        id: "yachts-custom",
        layoutStyle: "image-right",
        backgroundStyle: "white",
        eyebrow: "CUSTOM COMMISSIONS • SHIPYARD HERITAGE",
        heading: "Every Vessel Tailored to Your Vision",
        quote: "“A yacht is not simply an engineering achievement; it is an architectural sanctuary forged between sky and ocean.”",
        description: "At ASMARATY, no two yachts leaving our shipyard are identical. Owners participate in every design milestone — selecting rare book-matched marbles, hand-stitched leathers, audio-visual layouts, and custom tender arrangements.",
        imageUrl: "/images/interiors/g100-main-salon.jpg",
        imageAlt: "ASMARATY Custom Craftsmanship",
        badgeText: "Shipyard Facility • Ajman, UAE — Over 45 years of continuous marine craftsmanship by Al Shaali Marine.",
        stats: [
          { value: "100%", label: "Bespoke Interior Options" },
          { value: "UAE", label: "Direct Shipyard Direct Access" }
        ],
        buttonText: "Discuss a Custom Commission",
        buttonUrl: "/contact",
        primaryButton: {
          label: "Discuss a Custom Commission",
          url: "/contact",
          type: "internal",
          target: "_self",
          visible: true,
          style: "solid-gold"
        }
      }),
      getTemplateInstance("call_to_action", {
        id: "yachts-concierge",
        eyebrow: "VIP CONCIERGE & ADVISORY",
        heading: "Begin Your Voyage With ASMARATY",
        description: "Whether you wish to arrange a private sea trial, commission a bespoke naval build, or request confidential fleet pricing, our yacht advisory team in the UAE is at your service.",
        primaryButtonText: "Contact Us",
        primaryButtonUrl: "/contact",
        primaryButton: {
          label: "Contact Us",
          url: "/contact",
          type: "internal",
          target: "_self",
          visible: true,
          style: "solid-gold"
        },
        secondaryButtonText: "WhatsApp VIP Concierge",
        secondaryButtonUrl: "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet.",
        secondaryButton: {
          label: "WhatsApp VIP Concierge",
          url: "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet.",
          type: "external",
          target: "_blank",
          visible: true,
          style: "whatsapp"
        }
      })
    ]
};

export const DEFAULT_ABOUT_PAGE = {
    id: "page-about",
    title: "About Us",
    slug: "/about",
    template: "heritage_craft",
    status: "published",
    lastModified: "2026-11-07T12:00:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "about-hero",
        eyebrow: "ABOUT US",
        heading: "A Legacy of Excellence on the Water",
        subheading: "At ASMARATY, we believe in more than just luxury — we believe in creating unforgettable journeys.",
        imageUrl: "/images/about/asmaraty-about-hero-fireworks.jpg",
        imageAlt: "ASMARATY Fireworks Celebration Experience",
        videoUrl: "",
        primaryButtonText: "Discover Our Journey",
        primaryButtonUrl: "#story",
        primaryButton: {
          label: "Discover Our Journey",
          url: "#story",
          type: "anchor",
          target: "_self",
          visible: true,
          style: "solid-gold"
        },
        secondaryButtonText: "Explore Fleet",
        secondaryButtonUrl: "/yachts",
        secondaryButton: {
          label: "Explore Fleet",
          url: "/yachts",
          type: "internal",
          target: "_self",
          visible: true,
          style: "outline-white"
        },
        stats: [
          { value: "1979", label: "Heritage" },
          { value: "UAE", label: "Home Waters" },
          { value: "Excellence", label: "Our Standard" }
        ]
      }),
      getTemplateInstance("image_text", {
        id: "about-story",
        layoutStyle: "image-right",
        backgroundStyle: "light",
        eyebrow: "OUR STORY",
        heading: "Crafting Exceptional Yachting Experiences",
        description: "Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels that set new standards in luxury and performance.",
        imageUrl: "/images/asmaraty-four-yachts-journey.jpg",
        imageAlt: "ASMARATY Fleet Formation Cruising Arabian Gulf",
        badgeText: "UAE Naval Heritage • Since 1979",
        buttonText: "Discover Our Journey",
        buttonUrl: "/contact",
        primaryButton: {
          label: "Discover Our Journey",
          url: "/contact",
          type: "internal",
          target: "_self",
          visible: true,
          style: "solid-gold"
        }
      }),
      getTemplateInstance("statistics", {
        id: "about-stats",
        eyebrow: "HERITAGE IN NUMBERS",
        heading: "Four Decades of Arabian Heritage",
        description: "Pioneering naval architecture, composite engineering, and bespoke luxury motor yachts.",
        items: [
          { number: "1979", label: "Heritage", suffix: "" },
          { number: "UAE", label: "Home Waters", suffix: "" },
          { number: "Excellence", label: "Our Standard", suffix: "" }
        ]
      }),
      getTemplateInstance("values_pillars", {
        id: "about-values",
        eyebrow: "OUR VALUES",
        heading: "Built on Trust. Driven by Passion.",
        description: "We are committed to delivering unparalleled quality, innovation, and personalized experiences for every client.",
        pillars: [
          {
            id: "val-1",
            title: "Craftsmanship",
            desc: "Meticulously crafted yachts for the ultimate experience.",
            icon: "Gem",
            visible: true
          },
          {
            id: "val-2",
            title: "Trust & Integrity",
            desc: "A relationship built on transparency and reliability.",
            icon: "ShieldCheck",
            visible: true
          },
          {
            id: "val-3",
            title: "Innovation",
            desc: "Constantly evolving for a better tomorrow.",
            icon: "Waves",
            visible: true
          },
          {
            id: "val-4",
            title: "Personalised Experiences",
            desc: "Tailored journeys, designed around you.",
            icon: "Users",
            visible: true
          }
        ]
      }),
      getTemplateInstance("call_to_action", {
        id: "about-cta",
        layoutStyle: "cinematic-full",
        heading: "Your Journey Begins Here",
        description: "Explore our exclusive yacht collection and experience the ASMARATY difference.",
        primaryButtonText: "Explore Our Collection",
        primaryButtonUrl: "/yachts",
        primaryButton: {
          label: "Explore Our Collection",
          url: "/yachts",
          type: "internal",
          target: "_self",
          visible: true,
          style: "solid-gold"
        },
        imageUrl: "/images/a77-journey-bg.jpg",
        imageAlt: "ASMARATY Superyacht Cruising Open Ocean"
      })
    ]
};

export const DEFAULT_NEWS_PAGE = {
    id: "page-news",
    title: "News & Insights",
    slug: "/news",
    template: "editorial_showcase",
    status: "published",
    lastModified: "2026-04-05T12:00:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "news-hero",
        showCategoryFilter: false,
        eyebrow: "ASMARATY CHRONICLES",
        heading: "NEWS, INSIGHTS & EVENTS",
        subheading: "Latest naval architecture advancements, vessel launches, boat show highlights, and shipyard dispatches.",
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
        eyebrow: "OFFICIAL FLEET LAUNCH",
        heading: "ASMARATY Introduces the New Fleet Collection",
        description: "ASMARATY opens an exciting new chapter in its boatbuilding journey with the debut of the G-Series and AS-Series. Combining modern exterior styling with exceptionally spacious layouts, the collection introduces a new perspective on space and luxury—featuring generous staterooms, expansive saloons, wide walkaround decks, and bespoke fittings throughout.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
        buttonText: "Discover the Fleet",
        buttonUrl: "/#fleet"
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
};

export const DEFAULT_CONTACT_PAGE = {
    id: "page-contact",
    title: "Contact & Concierge",
    slug: "/contact",
    template: "vip_concierge",
    status: "published",
    lastModified: "2026-04-11T16:20:00.000Z",
    sections: [
      getTemplateInstance("hero_banner", {
        id: "contact-hero",
        eyebrow: "VIP Maritime Concierge & Shipyard Headquarters",
        heading: "Contact ASMARATY",
        subheading: "Connect directly with our luxury yacht advisory team in the United Arab Emirates. Schedule a private sea trial, discuss bespoke superyacht commissions, or arrange an exclusive walkthrough at our shipyard.",
        imageUrl: "/images/yachts/g100/5.jpg",
        imageAlt: "ASMARATY Yacht Maritime Concierge",
        primaryButtonText: "Submit Enquiry",
        primaryButtonUrl: "#contact-form",
        secondaryButtonText: "WhatsApp VIP Concierge",
        secondaryButtonUrl: "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20connect%20with%20your%20advisory%20team."
      }),
      getTemplateInstance("enquiry_section", {
        id: "enquiry-form",
        eyebrow: "DIRECT SHIPYARD DIALOGUE",
        heading: "Schedule a Private Consultation",
        description: "Our senior naval architects and VIP fleet advisors are at your service for confidential build discussions, sea trials, and private viewings.",
        phone: "+971 56 526 8126",
        recipientEmail: "info@asmaraty.com",
        address: "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates",
        operatingHours: "Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)",
        yachtOptions: [
          "ASMARATY G-100 Super Yacht (100 FT • Flagship)",
          "ASMARATY G77 Luxury Yacht (77 FT • Three-Deck)",
          "ASMARATY G-66 Luxury Yacht (66 FT • Flybridge)",
          "ASMARATY G-50 Luxury Motor Yacht (50 FT • Flybridge)",
          "All Fleet Inquiry & Price List"
        ]
      })
    ]
};

// Authoritative list of customizable general pages shown in Admin Pages & Sections
// Dedicated catalog and concierges (Yachts, News, Enquiries) are managed via their dedicated admin modules
export const DEFAULT_PAGES = [
  DEFAULT_HOME_PAGE,
  DEFAULT_ABOUT_PAGE
];
