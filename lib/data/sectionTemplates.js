export const SECTION_TEMPLATES = [
  {
    type: "hero_banner",
    name: "Hero Banner",
    category: "Hero & Headers",
    description: "Cinematic full-height hero with elegant headline, subtitle, action buttons, and live stats ticker.",
    icon: "Sparkles",
    thumbnail: "/images/yachts/g100.jpg",
    createDefaultData: (customId) => ({
      id: customId || `sec-hero-${Date.now()}`,
      type: "hero_banner",
      visible: true,
      eyebrow: "ASMARATY • EST. 1979 • ARABIAN GULF",
      heading: "BESPOKE NAVAL MASTERPIECES",
      subheading: "Pioneering luxury composite yacht manufacturing in the United Arab Emirates. Where high-performance design meets unyielding maritime engineering.",
      imageUrl: "/images/yachts/g100.jpg",
      imageAlt: "ASMARATY Flagship G100 cruising in Dubai waters",
      videoUrl: "/videos/gemini_generated_video_4e43e0b5.mp4",
      primaryButtonText: "Explore Fleet",
      primaryButtonUrl: "/yachts",
      secondaryButtonText: "Private Commission",
      secondaryButtonUrl: "/contact",
      layoutStyle: "fullscreen", // fullscreen, contained, split
      backgroundStyle: "dark", // dark, light, navy, glass
      contentAlignment: "center", // left, center
      stats: [
        { value: "100 FT", label: "Flagship AS 100" },
        { value: "45+ YRS", label: "Shipyard Heritage" },
        { value: "35 KTS", label: "Max Speed" },
        { value: "100%", label: "Custom Bespoke" }
      ]
    })
  },
  {
    type: "image_text",
    name: "Image & Text",
    category: "Content & Editorial",
    description: "Editorial two-column narrative layout pairing evocative photography with rich craftsmanship storytelling.",
    icon: "Layout",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-imgtext-${Date.now()}`,
      type: "image_text",
      visible: true,
      eyebrow: "THE ART OF BOATBUILDING",
      heading: "Artisanal Craftsmanship Refined Over Decades",
      description: "Every yacht built at our UAE shipyard is an individualized work of naval art. From vacuum-infused composite hulls engineered for deep offshore stability to hand-stitched Italian leather saloons and bespoke European walnut cabinetry, our master builders marry heritage maritime wisdom with cutting-edge aerospace composites.",
      quote: "“A yacht is not simply an engineering achievement; it is an architectural sanctuary forged between sky and ocean.”",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=80",
      imageAlt: "Master craftsmen laminating high-strength composites at ASMARATY shipyard",
      buttonText: "Discover Our Heritage",
      buttonUrl: "/about",
      layoutStyle: "image-left", // image-left, image-right
      backgroundStyle: "dark", // dark, light, navy, glass
      contentAlignment: "left"
    })
  },
  {
    type: "full_width_image",
    name: "Full-Width Image",
    category: "Showcase & Media",
    description: "Expansive panoramic visual break with dramatic typography, quote overlay, and cinematic scale.",
    icon: "Maximize2",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-fullimg-${Date.now()}`,
      type: "full_width_image",
      visible: true,
      eyebrow: "SEAMLESS HORIZONS",
      heading: "Bespoke Freedom on the Open Water",
      description: "Designed for owners who measure time not by hours, but by the nautical miles charted across azure waters.",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
      imageAlt: "Panoramic sunset view across the Gulf horizon",
      overlayOpacity: 45, // 0 to 90
      buttonText: "Schedule Private Sea Trial",
      buttonUrl: "/contact",
      backgroundStyle: "dark",
      contentAlignment: "center"
    })
  },
  {
    type: "yacht_collection",
    name: "Yacht Collection",
    category: "Showcase & Media",
    description: "Curated grid of luxury yacht models with filterable categories, key technical specs, and detail links.",
    icon: "Grid",
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-collection-${Date.now()}`,
      type: "yacht_collection",
      visible: true,
      eyebrow: "THE FLEET",
      heading: "Masterpieces of Modern Yachting",
      description: "Explore our distinguished series of custom superyachts, ocean explorers, high-performance sports cruisers, and island tenders.",
      filterCategory: "all", // all, Superyacht, Explorer, Flybridge, Sports Cruiser, Island Explorer
      limit: 4,
      layoutStyle: "four_models_showcase", // four_models_showcase, model_gallery, fleet_feature, grid
      backgroundStyle: "dark",
      contentAlignment: "center",
      buttonText: "View Complete Fleet",
      buttonUrl: "#fleet"
    })
  },
  {
    type: "featured_yacht",
    name: "Featured Yacht Spotlight",
    category: "Showcase & Media",
    description: "Comprehensive spotlight on a flagship yacht with interactive feature hotspots, architectural details, and specs.",
    icon: "Award",
    thumbnail: "/images/yachts/g100.jpg",
    createDefaultData: (customId) => ({
      id: customId || `sec-featured-${Date.now()}`,
      type: "featured_yacht",
      visible: true,
      eyebrow: "FLAGSHIP SHOWCASE",
      heading: "The ASMARATY G100 Superyacht",
      yachtSlug: "g100",
      description: "An unmistakable silhouette on the water, the G100 represents four decades of naval evolution. Featuring multi-deck luxury, expansive staterooms, panoramic flybridge, and a hydraulic beach club, she is crafted to exceed the strictest international maritime standards.",
      imageUrl: "/images/yachts/g100.jpg",
      imageAlt: "ASMARATY Flagship G100 at anchor in Dubai",
      keySpecs: [
        { label: "Length Overall", value: "100 ft (30.5m)" },
        { label: "Max Speed", value: "28 Knots" },
        { label: "Staterooms", value: "5 En-suites" },
        { label: "Guests / Crew", value: "10 / 4" }
      ],
      buttonText: "Explore AS 100 Specifications",
      buttonUrl: "/yachts/as-100",
      layoutStyle: "split",
      backgroundStyle: "dark",
      contentAlignment: "left"
    })
  },
  {
    type: "image_gallery",
    name: "Image Gallery",
    category: "Showcase & Media",
    description: "Editorial gallery showcasing exterior lines, interior craftsmanship, and maritime lifestyle with lightbox.",
    icon: "Images",
    thumbnail: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-gallery-${Date.now()}`,
      type: "image_gallery",
      visible: true,
      eyebrow: "VISUAL DIARY",
      heading: "Moments of Maritime Elegance",
      description: "Glimpses into the bespoke world of ASMARATY — from serene coastal anchorages to handcrafted saloon details.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
          caption: "Full-beam master stateroom with panoramic views",
          alt: "Master suite with bespoke furnishings"
        },
        {
          url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
          caption: "Main deck saloon featuring Italian open-grain oak",
          alt: "Contemporary yacht saloon"
        },
        {
          url: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
          caption: "Upper flybridge with glass-edge jacuzzi",
          alt: "Flybridge spa and loungers"
        },
        {
          url: "https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=1200&q=80",
          caption: "Modern glass cockpit navigation helm",
          alt: "Yacht helm controls"
        },
        {
          url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
          caption: "Hydraulic beach club and swim terrace",
          alt: "Aft yacht terrace"
        },
        {
          url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
          caption: "Bow sun lounge for sunset entertaining",
          alt: "Forward yacht deck"
        }
      ],
      layoutStyle: "grid-3", // grid-3, masonry
      backgroundStyle: "dark",
      contentAlignment: "center"
    })
  },
  {
    type: "video_banner",
    name: "Video Banner",
    category: "Showcase & Media",
    description: "Cinematic media presentation simulating high-definition yacht cruise reels with audio and play controls.",
    icon: "PlayCircle",
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-video-${Date.now()}`,
      type: "video_banner",
      visible: true,
      eyebrow: "CINEMATIC EXPERIENCE",
      heading: "Pure Power in Motion",
      subheading: "Witness the hydrodynamic balance and refined posture of our superyachts cutting through the waters of the Arabian Gulf.",
      videoPlaceholderUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
      videoDuration: "02:45",
      videoTitle: "ASMARATY Fleet Sea Trials — Dubai & Arabian Gulf",
      buttonText: "Watch Full Feature",
      buttonUrl: "#play-video",
      backgroundStyle: "dark",
      contentAlignment: "center"
    })
  },
  {
    type: "rich_text",
    name: "Rich Text & Editorial",
    category: "Content & Editorial",
    description: "Editorial essay format ideal for shipyard philosophy, heritage manifesto, and presidential statements.",
    icon: "FileText",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-richtext-${Date.now()}`,
      type: "rich_text",
      visible: true,
      eyebrow: "THE SHIPYARD PHILOSOPHY",
      heading: "An Uncompromising Commitment to Maritime Perfection",
      content: `Founded in 1979, our shipyard in the United Arab Emirates was established with a daring mission: to pioneer the Middle East's very first high-tech composite yacht manufacturing enterprise.

Over the past four and a half decades, ASMARATY has delivered hundreds of luxury yachts, law enforcement patrol vessels, and commercial marine crafts that navigate oceans across five continents. We remain dedicated to a bespoke shipbuilding philosophy where no two hulls are identical.

Each project is guided by an intimate dialogue between naval architect, master artisan, and yacht owner — transforming personal marine dreams into enduring naval heirlooms.`,
      authorName: "Naval Architecture Advisory",
      authorTitle: "Founder & Chairman, ASMARATY",
      backgroundStyle: "dark",
      contentAlignment: "left"
    })
  },
  {
    type: "statistics",
    name: "Statistics & Milestones",
    category: "Content & Editorial",
    description: "4-column luxury statistical counters showcasing shipyard heritage, vessel metrics, and milestones.",
    icon: "TrendingUp",
    thumbnail: "https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-stats-${Date.now()}`,
      type: "statistics",
      visible: true,
      eyebrow: "BY THE NUMBERS",
      heading: "A Legacy of Maritime Leadership",
      description: "Four decades of pioneering engineering excellence recognized across the Arabian Gulf and international waters.",
      items: [
        { number: "1979", label: "Year Established", suffix: "" },
        { number: "500+", label: "Vessels Built & Delivered", suffix: "" },
        { number: "100", label: "Foot Flagship Tri-Deck", suffix: "FT" },
        { number: "100%", label: "In-House UAE Shipyard", suffix: "" }
      ],
      backgroundStyle: "dark",
      contentAlignment: "center"
    })
  },
  {
    type: "call_to_action",
    name: "Call to Action",
    category: "Interactive & Forms",
    description: "High-impact conversion section inviting VIP sea trials or private commission consultations.",
    icon: "Compass",
    thumbnail: "/images/yachts/g100.jpg",
    createDefaultData: (customId) => ({
      id: customId || `sec-cta-${Date.now()}`,
      type: "call_to_action",
      visible: true,
      eyebrow: "PRIVATE COMMISSIONS",
      heading: "Begin Your Bespoke Yacht Journey",
      description: "Our naval architects and interior designers welcome private consultations at our UAE shipyard or via our Dubai VIP lounge. Experience our flagship models firsthand.",
      primaryButtonText: "Book a Private Sea Trial",
      primaryButtonUrl: "/contact",
      secondaryButtonText: "Download Fleet Catalog",
      secondaryButtonUrl: "/yachts",
      guaranteeText: "Direct consultation with Chief Naval Architect • Strict Discretion Assured",
      imageUrl: "/images/live-yacht-journey.jpg",
      videoUrl: "/videos/live-yacht-journey.mp4",
      layoutStyle: "cinematic-full",
      backgroundStyle: "navy",
      contentAlignment: "center"
    })
  },
  {
    type: "enquiry_section",
    name: "Enquiry Section",
    category: "Interactive & Forms",
    description: "Comprehensive luxury concierge booking form for private sea trials, shipyard tours, and custom commissions.",
    icon: "Mail",
    thumbnail: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80",
    createDefaultData: (customId) => ({
      id: customId || `sec-enquiry-${Date.now()}`,
      type: "enquiry_section",
      visible: true,
      eyebrow: "VIP CONCIERGE & COMMISSIONS",
      heading: "Request Private Sea Trial or Shipyard Consultation",
      description: "Connect directly with our luxury yacht advisory team in the UAE. We arrange private sea trials, confidential bespoke build consultations, and VIP shipyard walkthroughs.",
      recipientEmail: "info@asmaraty.fake",
      phone: "+971 56 526 8126",
      address: "AL SHAALI MARINE, OFFICE NO 6, RASHIDIA 1, Al Shaali Group Building, PO BOX NO. 787, AJMAN, United Arab Emirates",
      yachtOptions: ["AS 100 Superyacht", "Magellan 32 Explorer", "AS 88 Flybridge", "AS 68 Sports Cruiser", "AS 45 Island Explorer", "Custom Vessel Build"],
      backgroundStyle: "dark",
      contentAlignment: "left"
    })
  }
];
