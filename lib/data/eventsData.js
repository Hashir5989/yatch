/**
 * Authoritative Event Showcases & Exhibition Data
 * Used across the Events directory (/events), Event Detail pages (/events/[slug]), and Admin (/admin/events)
 *
 * NOTE: Events and News are completely separate sections with distinct media.
 * Events focus on boat show exhibitions, waterfront celebrations, fireworks, and marina berths.
 */

export const EVENT_SHOWCASES = [
  {
    id: "qibs-2026",
    slug: "qatar-international-boat-show-2026",
    aliases: ["asmaraty-g77-qatar-international-boat-show-2026", "qibs-2026"],
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
    status: "published",
    featuredImage: "/images/events/qibs-2026-fireworks-celebration.jpg",
    featuredImageAlt: "Monumental fireworks celebration exploding in golden spirals over Old Doha Port and ASMARATY yachts at Qatar International Boat Show 2026",
    excerpt:
      "Al Shaali Marine and ASMARATY officially unveiled the newly launched G77 luxury yacht at Stand D06 at Old Doha Port, celebrated with monumental waterfront fireworks, synchronized drone choreography, and introducing our landmark 25-Year Shipyard Warranty.",
    description: `DOHA, QATAR — In a landmark celebration of Middle Eastern maritime innovation, ASMARATY Luxury Yachts, in strategic collaboration with veteran shipbuilder Al Shaali Marine, marked a commanding high-profile presentation at the Qatar International Boat Show 2026 (QIBS). Berthing proudly at Stand D06 within the historic and picturesque Old Doha Port, the shipyard captivated royal dignitaries, high-net-worth yacht owners, and maritime aficionados with the exclusive regional unveiling of its latest crown jewel: the ASMARATY G77.

Spanning four days from November 4th through November 7th, the Qatar International Boat Show served as the preeminent gathering for the regional and global luxury marine industry. ASMARATY's expansive dockside presence represented an authoritative showcase of Emirati composite craftsmanship, cutting-edge naval architecture, and bespoke superyacht engineering tailored specifically for the waters of the Arabian Gulf and international charter territories.

Measuring 77 feet in length overall with an imposing two-deck architectural profile, the newly launched ASMARATY G77 represents the dawn of a new era in regional yacht design. Engineered and handcrafted entirely at Al Shaali Marine's waterfront shipyard facility in Ajman, UAE, the vessel synthesizes muscular oceanic performance with peerless interior serenity. Stepping aboard via the teak hydraulic swim platform, visitors to Stand D06 were greeted by an expansive aft cockpit that transitions seamlessly into a light-drenched main salon through automated floor-to-ceiling glass sliding doors.

Inside, master joiners curated an ambiance of understated Arabian opulence: book-matched Calacatta marble counter surfaces, hand-stitched Italian leather paneling, marine-grade brushed bronze hardware, and acoustic isolation membranes that reduce underway decibel levels to whisper-quiet perfection. Below deck, four bespoke staterooms accommodate up to eight guests in utmost comfort, anchored by a full-beam owner's suite with panoramic waterline windows and private dressing boudoirs.`,
    warrantyCallout: `Beyond aesthetic refinement, the centerpiece announcement resounding across Stand D06 was ASMARATY's revolutionary 25-Year Shipyard Warranty. Drawing upon Al Shaali Marine's 45-year legacy of naval engineering since 1979, the shipyard is guaranteeing the structural integrity of every newly commissioned ASMARATY composite hull for a quarter of a century. The structural guarantee covers main longitudinal stringers, transverse bulkheads, hull bottom laminations, and deck-to-hull bonded joints.`,
    highlights: [
      "Official regional debut of the newly launched ASMARATY G77 luxury yacht",
      "Commanding dockside presentation at Stand D06 within Old Doha Port marina basin",
      "Announcement of the landmark, industry-leading 25-Year Shipyard Hull Integrity Warranty",
      "Secured priority build allocations and custom interior commissioning slots",
      "Private technical walkthroughs conducted with senior naval architects and composite engineers",
      "Spectacular evening fireworks and synchronized drone light show viewed from the marina basin"
    ],
    pressDispatchSlug: "asmaraty-g77-qatar-international-boat-show-2026",
    photos: [
      {
        id: "event-photo-qibs-1",
        url: "/images/events/qibs-2026-asmaraty-g77-docked-daylight.jpg",
        alt: "ASMARATY G77 luxury two-deck motor yacht berthed at Stand D06 in Old Doha Port with official ASMARATY flags during daylight",
        title: "ASMARATY G77 Regional Debut at Stand D06",
        tag: "REGIONAL DEBUT",
        caption: "The newly launched ASMARATY G77 berthed along the Old Doha Port waterfront promenade, flying official ASMARATY flags at Stand D06."
      },
      {
        id: "event-photo-qibs-2",
        url: "/images/events/qibs-2026-fireworks-celebration.jpg",
        alt: "Monumental spiral fireworks display in gold and magenta exploding over ASMARATY yachts and Old Doha Port marina basin",
        title: "Grand Waterfront Fireworks Celebration",
        tag: "FIREWORKS SPECTACULAR",
        caption: "Dazzling spiral fireworks exploding into the night sky directly above the ASMARATY fleet as VIP guests and spectators celebrate the regional debut."
      },
      {
        id: "event-photo-qibs-3",
        url: "/images/events/qibs-2026-drone-light-show.jpg",
        alt: "QIBS synchronized drone light show in concentric blue rings spelling 'SEE YOU NEXT YEAR' over illuminated yachts",
        title: "QIBS Synchronized Drone Light Show",
        tag: "DRONE LIGHT SHOW",
        caption: "State-of-the-art drone light formation creating concentric blue celestial rings and the 'SEE YOU NEXT YEAR' salute above the illuminated marina pontoon."
      },
      {
        id: "event-photo-qibs-4",
        url: "/images/events/qibs-2026-pontoon-walkway-presentation.jpg",
        alt: "Dignitaries and attendees on the illuminated pontoon walkway at the Al Shaali Marine and ASMARATY stand at Old Doha Port",
        title: "VIP Waterfront Pontoon Walkway & Reception",
        tag: "VIP RECEPTION",
        caption: "Royal dignitaries and international maritime guests walking the illuminated teak pontoon alongside the ASMARATY yacht showcase and brand monolith."
      }
    ],
    seo: {
      metaTitle: "Qatar International Boat Show 2026 Showcase | ASMARATY Luxury Yachts",
      metaDescription: "Explore the official exhibition showcase and complete photo gallery of the ASMARATY G77 debut, fireworks display, and drone show at the Qatar International Boat Show 2026 at Old Doha Port.",
      ogImage: "/images/events/qibs-2026-fireworks-celebration.jpg"
    }
  },
  {
    id: "adibs-2026",
    slug: "abu-dhabi-international-boat-show-2026-adnec-marina",
    aliases: ["adibs-2026", "abu-dhabi-boat-show-2026"],
    title: "Abu Dhabi International Boat Show 2026",
    subtitle: "ASMARATY Luxury Fleet at ADNEC Marina",
    heroHeadline: "ASMARATY CONFIRMS EXPANSIVE FLEET SHOWCASE AT ABU DHABI INTERNATIONAL BOAT SHOW 2026",
    category: "Boat Show",
    badge: "FEATURED UPCOMING",
    dateBadge: { day: "19 — 22", monthYear: "NOV 2026", locationShort: "ADNEC MARINA" },
    dates: "19th – 22nd November 2026",
    venue: "Stand M-12 & Marina Berths B04–B08 | ADNEC Marina, Abu Dhabi, UAE",
    vessel: "ASMARATY G-Series Fleet (G100 Super Yacht, G77, G66, G50)",
    presentedBy: "AL SHAALI MARINE – UAE",
    status: "published",
    featuredImage: "/images/news/adibs-2026-abu-dhabi-boat-show.jpg",
    featuredImageAlt: "ASMARATY Luxury Fleet at Abu Dhabi International Boat Show 2026, ADNEC Marina",
    excerpt:
      "ASMARATY Luxury Yachts and Al Shaali Marine announce their official participation at the Abu Dhabi International Boat Show 2026, welcoming owners and marine enthusiasts to Marina Hall and dedicated deep-water berths at ADNEC Marina.",
    description: `ABU DHABI, UAE — Following an extraordinary reception at regional waterfront showcases, ASMARATY Luxury Yachts, in partnership with veteran Emirati shipbuilder Al Shaali Marine, has officially announced its participation at the Abu Dhabi International Boat Show 2026 (ADIBS).

Held under the patronage of regional leadership and organized by Capital Events at the prestigious ADNEC Centre Abu Dhabi, ADIBS 2026 will run from 19th through 22nd November 2026, gathering world-renowned shipyards, private collectors, and maritime industry leaders.

ASMARATY's presentation at ADIBS 2026 represents a major strategic milestone on its home waters in the UAE. Occupying prime waterfront berths along the ADNEC Marina pontoon and an executive hospitality suite within Marina Hall (Stand M-12), the shipyard will present models from its acclaimed G-Series fleet, including the flagship G-100 Super Yacht, the G77 Two-Deck Yacht, the dynamic G-66 Flybridge, and the versatile G-50.`,
    warrantyCallout: `A central pillar of the Abu Dhabi presentation will be the ASMARATY 25-Year Shipyard Hull Warranty. Recognized as one of the boldest structural guarantees in modern shipbuilding, the warranty guarantees hull bottom laminations, longitudinal stringers, and structural composite bulkheads against structural fatigue or osmotic breakdown for a quarter of a century.`,
    highlights: [
      "Official presentation at the UAE capital's premier maritime gathering",
      "Dedicated deep-water private berths B04–B08 at the ADNEC Marina basin",
      "VIP sea trials departing daily through Abu Dhabi coastal waters",
      "Private interior customization consultations with factory naval architects"
    ],
    pressDispatchSlug: "abu-dhabi-international-boat-show-2026-adnec-marina",
    photos: [
      {
        id: "adibs-photo-1",
        url: "/images/news/adibs-2026-abu-dhabi-boat-show.jpg",
        alt: "ASMARATY Flagship Yacht cruising at sunset",
        title: "ADNEC Marina Showcase",
        tag: "EXHIBITION"
      },
      {
        id: "adibs-photo-2",
        url: "/images/about/asmaraty-about-hero-fireworks.jpg",
        alt: "Evening gala and fireworks over the capital marina",
        title: "Gala Night & Fireworks",
        tag: "FIREWORKS"
      },
      {
        id: "adibs-photo-3",
        url: "/images/g100-burj-al-arab.jpg",
        alt: "G100 Super Yacht flagship cruising",
        title: "G100 Flagship Display",
        tag: "SUPERYACHT"
      },
      {
        id: "adibs-photo-4",
        url: "/images/asmaraty-shipyard-facility.jpg",
        alt: "Al Shaali Marine Shipyard in Ajman, UAE",
        title: "Emirati Shipyard Pavilion",
        tag: "SHIPYARD"
      }
    ],
    seo: {
      metaTitle: "Abu Dhabi International Boat Show 2026 | ASMARATY Luxury Yachts",
      metaDescription: "Explore ASMARATY Luxury Yachts at ADIBS 2026 at ADNEC Marina from 19-22 November 2026. Book private sea trials and VIP shipyard consultations.",
      ogImage: "/images/news/adibs-2026-abu-dhabi-boat-show.jpg"
    }
  },
  {
    id: "dibs-2026",
    slug: "dubai-international-boat-show-2026-dubai-harbour",
    aliases: ["dibs-2026", "dibs-2027", "dubai-boat-show-2026"],
    title: "Dubai International Boat Show 2026",
    subtitle: "ASMARATY Superyacht Showcase at Dubai Harbour",
    heroHeadline: "ASMARATY CONFIRMS PREMIER SUPERYACHT SHOWCASE AT DUBAI INTERNATIONAL BOAT SHOW 2026",
    category: "Boat Show",
    badge: "UPCOMING EXHIBITION",
    dateBadge: { day: "10 — 14", monthYear: "FEB 2027", locationShort: "DUBAI HARBOUR" },
    dates: "10th – 14th February 2027",
    venue: "Superyacht Avenue | Dubai Harbour Marina, Dubai, UAE",
    vessel: "ASMARATY G100 Super Yacht & G77 Two-Deck",
    presentedBy: "AL SHAALI MARINE – UAE",
    status: "published",
    featuredImage: "/images/news/dibs-2026-dubai-boat-show.jpg",
    featuredImageAlt: "Dubai International Boat Show 2026 at Dubai Harbour Marina",
    excerpt:
      "ASMARATY Luxury Yachts will anchor at Superyacht Avenue within Dubai Harbour for the 32nd Edition of DIBS, presenting our flagship G-100 Super Yacht and bespoke sea-trial experiences.",
    description: `DUBAI, UAE — ASMARATY Luxury Yachts, the distinguished high-performance yachting atelier established in collaboration with Al Shaali Marine, has confirmed its premier showcase at the Dubai International Boat Show (DIBS).

Anchoring at Superyacht Avenue within the world-class Dubai Harbour Marina, ASMARATY will welcome regional royalty, prominent yacht fleet operators, and global nautical collectors to an expansive dockside presence celebrating forty-five years of Emirati shipbuilding excellence.`,
    warrantyCallout: `Every hull presented at Dubai Harbour is supported by ASMARATY's industry-defining 25-Year Shipyard Structural Guarantee, guaranteeing peace of mind across oceanic and Gulf voyages.`,
    highlights: [
      "Commanding display at Superyacht Avenue in Dubai Harbour",
      "Regional exhibition of the flagship ASMARATY G100 Super Yacht",
      "Sunset champagne sea trials across Dubai coastal waters and Palm Jumeirah",
      "Executive meeting lounge for private commission and custom hull specifications"
    ],
    pressDispatchSlug: "dubai-international-boat-show-2026-dubai-harbour",
    photos: [
      {
        id: "dibs-photo-1",
        url: "/images/news/dibs-2026-dubai-boat-show.jpg",
        alt: "Dubai International Boat Show at Dubai Harbour",
        title: "Dubai Harbour Marina Berths",
        tag: "EXHIBITION"
      },
      {
        id: "dibs-photo-2",
        url: "/images/about/asmaraty-about-hero-fireworks.jpg",
        alt: "Dubai Harbour fireworks over superyachts",
        title: "Harbour Fireworks Celebration",
        tag: "FIREWORKS"
      },
      {
        id: "dibs-photo-3",
        url: "/images/g100-burj-al-arab.jpg",
        alt: "ASMARATY G100 Super Yacht off Dubai shoreline",
        title: "G100 Super Yacht",
        tag: "SUPERYACHT"
      },
      {
        id: "dibs-photo-4",
        url: "/images/g77-luxury-yacht.jpg",
        alt: "ASMARATY G77 Luxury Yacht",
        title: "ASMARATY G77 Showcase",
        tag: "VESSEL"
      }
    ],
    seo: {
      metaTitle: "Dubai International Boat Show 2026 | ASMARATY Luxury Yachts",
      metaDescription: "Join ASMARATY Luxury Yachts at Superyacht Avenue, Dubai Harbour Marina for DIBS 2026. Private sea trials and shipyard consultations.",
      ogImage: "/images/news/dibs-2026-dubai-boat-show.jpg"
    }
  }
];

export const DEFAULT_EVENTS = EVENT_SHOWCASES;

export function getAllEvents(publishedOnly = false) {
  if (publishedOnly) {
    return EVENT_SHOWCASES.filter((e) => e.status === "published");
  }
  return EVENT_SHOWCASES;
}

export function getEventBySlug(slug, publishedOnly = false) {
  if (!slug) return null;
  const normalized = slug.toLowerCase().trim();
  const found = EVENT_SHOWCASES.find(
    (e) =>
      e.slug.toLowerCase() === normalized ||
      e.id.toLowerCase() === normalized ||
      (Array.isArray(e.aliases) && e.aliases.some((a) => a.toLowerCase() === normalized))
  );
  if (!found) return null;
  if (publishedOnly && found.status !== "published") return null;
  return found;
}

export function getEventById(id) {
  if (!id) return null;
  return EVENT_SHOWCASES.find((e) => e.id === id) || null;
}
