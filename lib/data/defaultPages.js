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
      /* 1. Full-Bleed Dark Hero Banner */
      getTemplateInstance("hero_banner", {
        id: "home-hero",
        eyebrow: "THE ASMARATY COLLECTION",
        heading: "A Distinctive Perspective on Life at Sea",
        subheading: "Discover the ASMARATY collection, where considered design, refined spaces and the pleasure of being on the water come together.",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
        videoUrl: "/videos/live-yacht-journey.mp4",
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
        heading: "THE SIGNATURE OF THE SEA",
        description: "ASMARATY brings a distinct personality to the water, united by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful onboard comfort. Built on a shared passion for design, craftsmanship, and life at sea, our yachts are created to be as rewarding to spend time aboard as they are to admire from the shore.",
        buttonText: "EXPLORE SIGNATURE MODELS",
        buttonUrl: "#fleet"
      }),

      /* 3. Comprehensive Showcase */
      getTemplateInstance("yacht_collection", {
        id: "home-four-models",
        layoutStyle: "four_models_showcase",
        eyebrow: "VERIFIED SPECIFICATIONS & FLEET DOSSIER",
        heading: "SIGNATURE FLEET MODELS",
        description: "Discover the ASMARATY yacht collection, featuring the G100, G66, G55, and AS 77. Review verified naval dimensions, refined layouts, and bespoke finishes.",
        limit: 12
      }),

      /* 4. Brand Vision: Passion for Design, Craftsmanship & Life at Sea */
      getTemplateInstance("image_text", {
        id: "home-vision",
        layoutStyle: "video",
        backgroundStyle: "white",
        eyebrow: "A PASSION FOR DESIGN & CRAFTSMANSHIP",
        heading: "A SHARED PASSION FOR LIFE AT SEA",
        description: "At ASMARATY, our ambition is to create yachts that deliver spacious luxury boating and stylish, intimate cruising. From our broad proportions and generous accommodations to panoramic flybridge vistas, every vessel is created to be as rewarding to spend time aboard as it is to admire from the shore.",
        imageUrl: "/images/yachts/g100.jpg",
        buttonText: "REQUEST CONSULTATION",
        buttonUrl: "#enquiry-form"
      }),

      /* 5. Full-Bleed Dark Model Slider */
      getTemplateInstance("yacht_collection", {
        id: "home-model-slider",
        layoutStyle: "model_gallery",
        eyebrow: "ASMARATY SERIES",
        heading: "SIGNATURE FLEET AT SEA",
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
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
        buttonText: "VISIT OUR SHIPYARD",
        buttonUrl: "#enquiry-form"
      }),

      /* 7. Direct Shipyard Dialogue & Sea Trial Enquiry Section */
      getTemplateInstance("enquiry_section", {
        id: "home-enquiry",
        eyebrow: "VIP MARITIME CONCIERGE",
        heading: "REQUEST PRIVATE SEA TRIAL OR SHIPYARD CONSULTATION",
        description: "Connect directly with our luxury yacht advisory team. We arrange private sea trials for the ASMARATY fleet, shipyard walkthroughs, and confidential bespoke build consultations.",
        recipientEmail: "info@asmaraty.fake",
        phone: "+971 1234567890",
        address: "ASMARATY Shipyard, Maritime Industrial Zone, UAE",
        yachtOptions: [
          "G100 Superyacht (100ft)",
          "G66 Flybridge (66ft)",
          "G55 Luxury Cruiser (55ft)",
          "AS 77 Flybridge (77ft)",
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
        primaryButtonText: "EXPLORE THE FLEET",
        primaryButtonUrl: "#fleet",
        imageUrl: "/images/live-yacht-journey.jpg"
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
        subheading: "From the flagship G100 superyacht to our dynamic G66, G55, and AS 77 flybridge models, explore custom naval vessels built to transcend expectations.",
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
        eyebrow: "A PASSION FOR DESIGN, CRAFTSMANSHIP & LIFE AT SEA",
        heading: "THE SIGNATURE OF THE SEA",
        subheading: "United by contemporary aesthetics, generous living spaces, and thoughtful onboard comfort, ASMARATY crafts yachts that are as rewarding to spend time aboard as they are to admire from the shore.",
        imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80",
        primaryButtonText: "Our Story",
        primaryButtonUrl: "#about-story",
        secondaryButtonText: "Visit Shipyard",
        secondaryButtonUrl: "/contact"
      }),
      getTemplateInstance("rich_text", {
        id: "about-story",
        eyebrow: "A NEW CHAPTER IN BOATBUILDING",
        heading: "Spacious Luxury Boating & Stylish, Intimate Cruising",
        content: `ASMARATY was founded on a shared passion for design, craftsmanship, and life at sea. Bringing a distinct personality to the water, our boatbuilding journey is united by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful onboard comfort.

With an emphasis on spacious luxury boating and stylish, intimate cruising, our vessels feature broad proportions, expansive main deck saloons, opening sliding panoramic hardtops, and refined Italian fittings. Every model is engineered to be as rewarding to spend time aboard as it is to admire from the shore.

From our flagship G100 superyacht to our G66, G55, and AS 77 models, ASMARATY continues to set new benchmarks for space, luxury, and uncompromised sea-keeping excellence.`
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
