/**
 * Authoritative Event Showcases & Exhibition Data
 * Used across the Events directory (/events) and Event Detail pages (/events/[slug])
 */

export const EVENT_SHOWCASES = [
  {
    id: "qibs-2026",
    slug: "qatar-international-boat-show-2026",
    aliases: ["asmaraty-g77-qatar-international-boat-show-2026"],
    title: "Qatar International Boat Show 2026",
    subtitle: "Regional Debut of ASMARATY G77 Luxury Yacht",
    heroHeadline: "ASMARATY UNVEILS THE REVOLUTIONARY G77 AT QATAR INTERNATIONAL BOAT SHOW 2026",
    category: "Boat Show",
    badge: "REGIONAL DEBUT",
    dateBadge: { day: "04 — 07", monthYear: "NOV 2026", locationShort: "OLD DOHA PORT" },
    dates: "4th – 7th November 2026",
    venue: "Stand D06 | Old Doha Port, Doha, Qatar",
    vessel: "ASMARATY G77 Luxury Yacht (77 FT)",
    presentedBy: "AL SHAALI MARINE – UAE",
    featuredImage: "/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg",
    featuredImageAlt: "ASMARATY G77 official inauguration on the teak foredeck at Old Doha Port",
    excerpt:
      "Al Shaali Marine and ASMARATY officially unveiled the newly launched G77 luxury yacht at Stand D06 at Old Doha Port, introducing our landmark 25-Year Shipyard Warranty.",
    description: `DOHA, QATAR — In a landmark celebration of Middle Eastern maritime innovation, ASMARATY Luxury Yachts, in strategic collaboration with veteran shipbuilder Al Shaali Marine, marked a commanding high-profile presentation at the Qatar International Boat Show 2026 (QIBS). Berthing proudly at Stand D06 within the historic and picturesque Old Doha Port, the shipyard captivated royal dignitaries, high-net-worth yacht owners, and maritime aficionados with the exclusive regional unveiling of its latest crown jewel: the ASMARATY G77.

Spanning four days from November 4th through November 7th, the Qatar International Boat Show served as the preeminent gathering for the regional and global luxury marine industry. ASMARATY's expansive dockside presence represented an authoritative showcase of Emirati composite craftsmanship, cutting-edge naval architecture, and bespoke superyacht engineering tailored specifically for the waters of the Arabian Gulf and international charter territories.

Measuring 77 feet in length overall with an imposing three-deck architectural profile, the newly launched ASMARATY G77 represents the dawn of a new era in regional yacht design. Engineered and handcrafted entirely at Al Shaali Marine's waterfront shipyard facility in Ajman, UAE, the vessel synthesizes muscular oceanic performance with peerless interior serenity. Stepping aboard via the teak hydraulic swim platform, visitors to Stand D06 were greeted by an expansive aft cockpit that transitions seamlessly into a light-drenched main salon through automated floor-to-ceiling glass sliding doors.

Inside, master joiners curated an ambiance of understated Arabian opulence: book-matched Calacatta marble counter surfaces, hand-stitched Italian leather paneling, marine-grade brushed bronze hardware, and acoustic isolation membranes that reduce underway decibel levels to whisper-quiet perfection. Below deck, four bespoke staterooms accommodate up to eight guests in utmost comfort, anchored by a full-beam owner's suite with panoramic waterline windows and private dressing boudoirs.`,
    warrantyCallout: `Beyond aesthetic refinement, the centerpiece announcement resounding across Stand D06 was ASMARATY's revolutionary 25-Year Shipyard Warranty. Drawing upon Al Shaali Marine's 45-year legacy of naval engineering since 1979, the shipyard is guaranteeing the structural integrity of every newly commissioned ASMARATY composite hull for a quarter of a century. The structural guarantee covers main longitudinal stringers, transverse bulkheads, hull bottom laminations, and deck-to-hull bonded joints.`,
    highlights: [
      "Official regional debut of the newly launched ASMARATY G77 luxury yacht",
      "Commanding dockside presentation at Stand D06 within Old Doha Port marina basin",
      "Announcement of the landmark, industry-leading 25-Year Shipyard Hull Integrity Warranty",
      "Secured priority build allocations and custom interior commissioning slots",
      "Private technical walkthroughs conducted with senior naval architects and composite engineers",
      "Evening fireworks celebration viewed from the G77 teak foredeck"
    ],
    pressDispatchSlug: "asmaraty-g77-qatar-international-boat-show-2026",
    photos: [
      {
        id: "qibs-p1",
        url: "/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg",
        alt: "Official inauguration and ribbon ceremony on the teak foredeck of ASMARATY G77",
        title: "Official Inauguration & Ribbon Ceremony",
        caption: "Hostesses in tailored ASMARATY embroidered abayas on the teak foredeck of the G77 during the official inauguration ceremony at Old Doha Port.",
        tag: "INAUGURATION"
      },
      {
        id: "qibs-p2",
        url: "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
        alt: "ASMARATY G77 waterfront night view with blue underwater LEDs and fireworks at Old Doha Port",
        title: "Evening Waterfront Celebration & Fireworks",
        caption: "The illuminated ASMARATY G77 at Stand D06, with sapphire underwater LEDs casting vibrant reflections as monumental fireworks light up the Doha skyline.",
        tag: "EVENING SHOWCASE"
      },
      {
        id: "qibs-p3",
        url: "/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg",
        alt: "Chrome ASMARATY G77 emblem on flybridge wing with branded attire",
        title: "Emblem Detail & Flybridge Architecture",
        caption: "Precision marine-grade chrome ASMARATY G77 emblem mounted on the aerodynamic flybridge wing, reflecting master composite finish and Emirati shipyard heritage.",
        tag: "CRAFTSMANSHIP"
      }
    ],
    seo: {
      metaTitle: "Qatar International Boat Show 2026 Showcase | ASMARATY Luxury Yachts",
      metaDescription: "Explore the official exhibition showcase and complete photo gallery of the ASMARATY G77 debut at the Qatar International Boat Show 2026 at Old Doha Port.",
      ogImage: "/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg"
    }
  }
];

export function getAllEvents() {
  return EVENT_SHOWCASES;
}

export function getEventBySlug(slug) {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  return (
    EVENT_SHOWCASES.find(
      (e) =>
        e.slug.toLowerCase() === normalized ||
        e.id.toLowerCase() === normalized ||
        (Array.isArray(e.aliases) && e.aliases.some((a) => a.toLowerCase() === normalized))
    ) || null
  );
}

