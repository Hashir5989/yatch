/**
 * ASMARATY Official Fleet Data
 *
 * Stage 1 Initial Models:
 * 1. G100
 * 2. G66
 * 3. G55
 * 4. AS 77
 *
 * These initial records form the baseline for the client-managed collection.
 * Additional models can be created, edited, reordered, and published via the Admin Panel.
 */

export const DEFAULT_YACHTS = [
  {
    id: "yacht-g100",
    name: "G100",
    slug: "g100",
    category: "Superyacht",
    tagline: "The Flagship of the G-Series",
    series: "G-Series Superyacht",
    description: "The flagship of the ASMARATY G-Series, the G100 represents the pinnacle of contemporary naval architecture. Combining grand proportions with generous social spaces, expansive multi-deck living, and refined maritime luxury, she offers an effortless sanctuary at sea.",
    mainImage: "/images/yachts/g100.jpg",
    gallery: [
      "/images/yachts/g100.jpg",
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80"
    ],
    featured: true,
    status: "published",
    displayOrder: 1,
    specs: {
      lengthOverall: "100 ft",
      hullMaterial: "Vacuum-Infused Composite",
    },
    highlights: [
      "Grand architectural volume with multi-deck living",
      "Floor-to-ceiling panoramic salon glazing",
      "Generous aft beach club and social deck"
    ],
    floorplanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "yacht-g66",
    name: "G66",
    slug: "g66",
    category: "Flybridge",
    tagline: "Dynamic Elegance & Expansive Living",
    series: "G-Series Flybridge",
    description: "Blending dynamic exterior lines with a remarkably spacious interior arrangement, the G66 offers effortless cruising and luxurious open-air entertaining with a wide flybridge retreat.",
    mainImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
    ],
    featured: true,
    status: "published",
    displayOrder: 2,
    specs: {
      lengthOverall: "66 ft",
      hullMaterial: "Reinforced Composite",
    },
    highlights: [
      "Expansive flybridge deck with panoramic views",
      "Seamless indoor-outdoor main deck flow",
      "Generous aft deck for relaxation and dining"
    ],
    floorplanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "yacht-g55",
    name: "G55",
    slug: "g55",
    category: "Cruiser",
    tagline: "Modern Agility Meets Yachting Comfort",
    series: "G-Series Cruiser",
    description: "A sporty, modern cruiser engineered for spirited coastal voyages and weekend escapes, the G55 pairs contemporary aesthetics with intelligent space utilization.",
    mainImage: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=2000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80"
    ],
    featured: true,
    status: "published",
    displayOrder: 3,
    specs: {
      lengthOverall: "55 ft",
      hullMaterial: "Vacuum-Infused Composite",
    },
    highlights: [
      "Streamlined aerodynamic hull profile",
      "Intuitive helm station with smart systems",
      "Integrated swim platform and sun lounge"
    ],
    floorplanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "yacht-as-77",
    name: "AS 77",
    slug: "as-77",
    category: "Flybridge",
    tagline: "Refined Craftsmanship on the Water",
    series: "AS-Series",
    description: "The AS 77 embodies ASMARATY's dedication to contemporary aesthetics, broad proportions, and thoughtful onboard comfort, designed for memorable private family cruising and entertaining guests.",
    mainImage: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=2000&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80"
    ],
    featured: true,
    status: "published",
    displayOrder: 4,
    specs: {
      lengthOverall: "77 ft",
      hullMaterial: "Advanced Composite",
    },
    highlights: [
      "Broad proportions creating expansive living spaces",
      "Spacious flybridge for open-air entertaining",
      "Wide walkaround side decks and comfortable guest quarters"
    ],
    floorplanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  }
];

/**
 * Additional Fleet Models (Preserved for client catalog expansion via Admin Panel)
 */
export const ADDITIONAL_EXPANSION_YACHTS = [
  {
    id: "yacht-as-100",
    name: "AS 100",
    slug: "as-100",
    category: "Superyacht",
    tagline: "The Pinnacle of Naval Architecture",
    series: "Flagship Superyacht",
    description: "Custom tri-deck volume incorporating vacuum-infused composites, expansive panoramic glass, and a private owner's terrace.",
    mainImage: "/images/yachts/g100.jpg",
    gallery: ["/images/yachts/g100.jpg"],
    featured: false,
    status: "draft",
    displayOrder: 5,
    specs: {
      lengthOverall: "100 ft",
      hullMaterial: "Vacuum-Infused Reinforced Composite",
    },
    highlights: [
      "Tri-deck architectural layout with expansive private flybridge",
      "Full-beam master stateroom situated forward on the main deck"
    ]
  }
];
