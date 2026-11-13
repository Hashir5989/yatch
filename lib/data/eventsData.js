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
      },
      {
        id: "photo-1794319670480",
        url: "/images/uploads/6311844283228558314-1794319666560.jpg",
        title: "Waterfront Exhibition Photo",
        alt: "ASMARATY luxury yacht waterfront exhibition view at Old Doha Port",
        tag: "BOAT SHOW",
        caption: "Waterfront exhibition view of the ASMARATY yacht fleet during the Qatar International Boat Show 2026."
      },
      {
        id: "photo-1794327281709",
        url: "/images/uploads/saveclip-app_900433264_18423701230153217_796415544-1794327278833.jpg",
        title: "Fireworks & Waterfront Night Celebration",
        alt: "Monumental fireworks celebration over Old Doha Port and ASMARATY yachts",
        tag: "FIREWORKS",
        caption: "Spectacular fireworks illuminated over ASMARATY fleet at Old Doha Port."
      }
    ],
    seo: {
      metaTitle: "Qatar International Boat Show 2026 Showcase | ASMARATY Luxury Yachts",
      metaDescription: "Explore the official exhibition showcase and complete photo gallery of the ASMARATY G77 debut, fireworks display, and drone show at the Qatar International Boat Show 2026 at Old Doha Port.",
      ogImage: "/images/events/qibs-2026-fireworks-celebration.jpg"
    }
  },
  {
    id: "adibs-2025",
    slug: "abu-dhabi-international-boat-show-2025",
    aliases: ["adibs-2025", "asmaraty-abu-dhabi-international-boat-show-2025"],
    title: "Abu Dhabi International Boat Show 2025",
    subtitle: "ASMARATY G-Series Luxury Fleet & The Charter Show Debut",
    heroHeadline: "ASMARATY COMMANDS THE WATERFRONT AT THE 7TH ABU DHABI INTERNATIONAL BOAT SHOW 2025",
    category: "Boat Show",
    badge: "EXHIBITION SHOWCASE",
    dateBadge: { day: "20 — 23", monthYear: "NOV 2025", locationShort: "ADNEC MARINA" },
    dates: "20th – 23rd November 2025",
    venue: "ADNEC Marina Canal & Marina Hall | Abu Dhabi, UAE",
    vessel: "ASMARATY G-Series Luxury Fleet (G-100, G77, G-66, G-50)",
    presentedBy: "AL SHAALI MARINE – UAE",
    status: "published",
    featuredImage: "/images/events/adibs-2025/adibs-2025-showcase-1.jpg",
    featuredImageAlt: "ASMARATY Luxury Yacht Fleet at the 7th Abu Dhabi International Boat Show 2025 at ADNEC Marina",
    excerpt:
      "Held under the patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan, the record-breaking 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) marked the largest maritime gathering in UAE capital history. ASMARATY Luxury Yachts and Al Shaali Marine commanded prime deep-water berths along the ADNEC Marina canal pontoon, presenting the G-Series fleet, participating in the inaugural Charter Show, and showcasing the landmark 25-Year Shipyard Warranty.",
    description: `ABU DHABI, UAE — Under the esteemed patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan, Ruler's Representative in the Al Dhafra Region, the 7th edition of the Abu Dhabi International Boat Show (ADIBS 2025) concluded at ADNEC Centre Abu Dhabi, marking the grandest maritime exhibition in the history of the UAE capital. Spanning over 85,000 square meters across the purpose-built ADNEC Marina and Marina Hall, the record-breaking gathering hosted 1,068 international and local exhibitors from 56 nations.

For ASMARATY Luxury Yachts, engineered in proud partnership with veteran shipbuilder Al Shaali Marine (established 1979 in the UAE), ADIBS 2025 was a triumphant homecoming on UAE waters. Berthing prominently along the 400-meter ADNEC Marina canal pontoon, the shipyard showcased the depth and technical mastery of its bespoke composite G-Series fleet, led by the flagship G-100 Superyacht, the G77 Two-Deck masterwork, the spirited G-66 Flybridge, and the versatile G-50.

A central milestone of the 2025 showcase was the global debut of The Charter Show, a specialized enclave dedicated to superyachts, luxury charter brokers, and ultra-high-net-worth clients. ASMARATY took center stage within this premier forum, presenting bespoke turnkey charter management solutions and private syndicate allocations to Middle Eastern royal delegations and international family offices.

Throughout the four-day event, ASMARATY conducted daily private sea trials departing directly from the ADNEC Marina basin into Abu Dhabi's protected coastal waterways. Prospective owners evaluated the vessels' effortless hydrodynamic stability, acoustic isolation, and commercial-grade propulsion at full throttle. As twilight descended over the capital, the ASMARATY berths transformed into an atmospheric waterfront majlis, illuminated by warm gold architectural lighting and sapphire-blue underwater LEDs reflecting against the canal.`,
    warrantyCallout: `Drawing upon Al Shaali Marine's 45-year naval heritage since 1979, ASMARATY reinforced its industry-leading 25-Year Shipyard Hull Integrity Warranty. The quarter-century structural guarantee protects vacuum-infused composite hulls, longitudinal stringers, and structural bulkheads against fatigue and osmotic breakdown, providing unprecedented asset security on Arabian Gulf waters.`,
    highlights: [
      "Commanding waterfront berths along the 400-metre ADNEC Marina canal pontoon",
      "Held under the esteemed patronage of H.H. Sheikh Hamdan bin Zayed Al Nahyan",
      "Inaugural presentation at the newly launched Charter Show for superyachts",
      "Comprehensive display of the bespoke G-Series composite fleet (G-100, G77, G-66, G-50)",
      "Daily private sea trial departures navigating Abu Dhabi coastal waters",
      "Reinforcement of the landmark 25-Year Shipyard Hull Integrity Warranty"
    ],
    pressDispatchSlug: "asmaraty-abu-dhabi-international-boat-show-2025",
    photos: [
      {
        id: "adibs-photo-1",
        url: "/images/events/adibs-2025/adibs-2025-showcase-1.jpg",
        alt: "ASMARATY luxury yacht waterfront berth at Abu Dhabi International Boat Show 2025",
        title: "ADNEC Marina Waterfront Showcase",
        tag: "EXHIBITION SHOWCASE",
        caption: "ASMARATY luxury yacht moored along the ADNEC Marina canal pontoon during the 7th Abu Dhabi International Boat Show 2025."
      },
      {
        id: "adibs-photo-2",
        url: "/images/events/adibs-2025/adibs-2025-showcase-2.jpg",
        alt: "ASMARATY fleet dockside presentation at ADNEC Marina",
        title: "Fleet Dockside Presentation",
        tag: "FLEET SHOWCASE",
        caption: "Dockside presentation of the ASMARATY fleet at ADNEC Marina, welcoming dignitaries and maritime collectors."
      },
      {
        id: "adibs-photo-3",
        url: "/images/events/adibs-2025/adibs-2025-showcase-3.jpg",
        alt: "ASMARATY luxury yacht exterior profile at Abu Dhabi Boat Show",
        title: "Exterior Profile & Naval Architecture",
        tag: "NAVAL ARCHITECTURE",
        caption: "Sleek composite profile and handcrafted deck lines engineered by Al Shaali Marine."
      },
      {
        id: "adibs-photo-4",
        url: "/images/events/adibs-2025/adibs-2025-showcase-4.jpg",
        alt: "VIP guests aboard ASMARATY yacht at ADIBS 2025",
        title: "VIP Onboard Reception & Walkthrough",
        tag: "VIP RECEPTION",
        caption: "Distinguished guests and prospective owners experiencing the bespoke interior salon and expansive cockpit."
      },
      {
        id: "adibs-photo-5",
        url: "/images/events/adibs-2025/adibs-2025-showcase-5.jpg",
        alt: "ASMARATY yacht on the ADNEC Marina canal basin",
        title: "ADNEC Marina Basin View",
        tag: "MARINA BASIN",
        caption: "Panoramic view across the ADNEC Marina waterfront pontoon during the 4-day international exhibition."
      },
      {
        id: "adibs-photo-6",
        url: "/images/events/adibs-2025/adibs-2025-showcase-6.jpg",
        alt: "Bespoke composite craftsmanship and deck detailing",
        title: "Master Composite Craftsmanship",
        tag: "CRAFTSMANSHIP",
        caption: "Hand-laid composite finish and precision maritime hardware engineered for the Arabian Gulf."
      },
      {
        id: "adibs-photo-7",
        url: "/images/events/adibs-2025/adibs-2025-showcase-7.jpg",
        alt: "Twilight waterfront view of ASMARATY yachts at ADIBS 2025",
        title: "Twilight Illumination & Evening Showcase",
        tag: "TWILIGHT SHOWCASE",
        caption: "Atmospheric evening illumination over the ASMARATY yacht berths along the ADNEC waterfront."
      },
      {
        id: "adibs-photo-8",
        url: "/images/events/adibs-2025/adibs-2025-showcase-8.jpg",
        alt: "Grand waterfront perspective of the ASMARATY showcase at ADNEC",
        title: "Waterfront Exhibition Perspective",
        tag: "WATERFRONT PANORAMA",
        caption: "Commanding dockside presence of ASMARATY and Al Shaali Marine at the 7th Abu Dhabi International Boat Show 2025."
      }
    ],
    seo: {
      metaTitle: "Abu Dhabi International Boat Show 2025 Showcase | ASMARATY Luxury Yachts",
      metaDescription: "Explore the official exhibition showcase and retrospective of ASMARATY Luxury Yachts at the 7th Abu Dhabi International Boat Show (ADIBS 2025) at ADNEC Marina.",
      ogImage: "/images/events/adibs-2025/adibs-2025-showcase-1.jpg"
    }
  },
  {
    id: "qatar-boat-show-2025",
    slug: "qatar-boat-show-2025",
    aliases: ["qbs-2025", "asmaraty-qatar-boat-show-2025-old-doha-port"],
    title: "Qatar Boat Show 2025",
    subtitle: "Historic Official Qatar Debut of Al Shaali Marine & ASMARATY",
    heroHeadline: "AL SHAALI MARINE AND ASMARATY CAPTIVATE OLD DOHA PORT AT QATAR BOAT SHOW 2025",
    category: "Boat Show",
    badge: "HISTORIC DEBUT",
    dateBadge: { day: "05 — 08", monthYear: "NOV 2025", locationShort: "OLD DOHA PORT" },
    dates: "5th – 8th November 2025",
    venue: "Stand D06 | Old Doha Port, Mina District, Doha, Qatar",
    vessel: "ASMARATY G-Series Luxury Fleet & G77 (77 FT)",
    presentedBy: "AL SHAALI MARINE – UAE",
    status: "published",
    featuredImage: "/images/events/qatar-2025/qatar-2025-showcase-1.jpg",
    featuredImageAlt: "ASMARATY G77 luxury yacht at Qatar Boat Show 2025 at Old Doha Port",
    excerpt:
      "Held under the patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani, the 2nd Qatar Boat Show welcomed over 27,800 visitors to Old Doha Port. Al Shaali Marine and ASMARATY made their historic first-ever official appearance in Qatar at Stand D06, unveiling bespoke G-Series yachts and introducing the 25-Year Warranty.",
    description: `DOHA, QATAR — In an extraordinary milestone for Gulf maritime heritage, the 2nd edition of the Qatar Boat Show 2025 concluded at the iconic Old Doha Port, cementing the event as one of the most dynamic luxury marine exhibitions in the Middle East. Held under the distinguished patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani, Prime Minister and Minister of Foreign Affairs of Qatar, the four-day show welcomed an astounding 27,800 visitors from 105 countries, including more than 4,600 royal dignitaries and VIP collectors.

Spanning the historic waterfront against the picturesque pastel architecture of the Mina District, the 2025 edition brought together 85 premier exhibitors and 505 international brands, with over 65 luxury superyachts valued at approximately QR 880 million illuminating the deep-water marina basin.

For ASMARATY Luxury Yachts and its master manufacturing shipyard Al Shaali Marine (established 1979 in the UAE), Qatar Boat Show 2025 represented a landmark historical chapter: the veteran Emirati shipbuilder’s first-ever official appearance in the State of Qatar. Occupying commanding berths at Stand D06 along the prime Old Doha Port waterfront promenade, the shipyard was welcomed with immense enthusiasm by Qatari yacht owners and maritime families.

The fleet was spearheaded by the magnificent ASMARATY G77 two-deck luxury yacht, alongside scale architectural dossiers of the flagship G-100 Superyacht, the dynamic G-66 Flybridge, and the versatile G-50 cruiser. Each evening, as twilight settled over Doha Bay, Stand D06 transformed into an illuminated waterfront majlis with sapphire-blue underwater LEDs, while monumental fireworks erupted into golden cascades above the skyline.`,
    warrantyCallout: `Drawing upon Al Shaali Marine's 45-year naval heritage since 1979, ASMARATY reinforced its industry-leading 25-Year Shipyard Hull Integrity Warranty. The quarter-century structural guarantee protects vacuum-infused composite hulls, longitudinal stringers, and structural bulkheads against fatigue and osmotic breakdown, providing unprecedented asset security on Arabian Gulf waters.`,
    highlights: [
      "First-ever official appearance of UAE master shipbuilder Al Shaali Marine in Qatar",
      "Held under the esteemed patronage of H.E. Sheikh Mohammed bin Abdulrahman bin Jassim Al Thani",
      "Over 27,800 visitors and 4,600 VVIP delegations attending at Old Doha Port",
      "Commanding waterfront dockside presence at Stand D06 within the Mina District basin",
      "Official presentation of the bespoke G-Series composite fleet led by the ASMARATY G77",
      "Introduction of the landmark 25-Year Shipyard Hull Integrity Warranty to Qatari collectors"
    ],
    pressDispatchSlug: "asmaraty-qatar-boat-show-2025-old-doha-port",
    photos: [
      {
        id: "qatar-2025-photo-1",
        url: "/images/events/qatar-2025/qatar-2025-showcase-1.jpg",
        alt: "ASMARATY yacht berthed at Stand D06, Old Doha Port Mina District",
        title: "Old Doha Port Waterfront Berth",
        tag: "HISTORIC DEBUT",
        caption: "ASMARATY luxury yacht moored at Stand D06 in Old Doha Port during Qatar Boat Show 2025."
      },
      {
        id: "qatar-2025-photo-2",
        url: "/images/events/qatar-2025/qatar-2025-showcase-2.jpg",
        alt: "ASMARATY G77 luxury yacht daylight showcase at Old Doha Port",
        title: "G77 Daylight Showcase",
        tag: "FLEET SHOWCASE",
        caption: "The magnificent ASMARATY G77 two-deck luxury yacht showcased under the daylight sun at Old Doha Port."
      },
      {
        id: "qatar-2025-photo-3",
        url: "/images/events/qatar-2025/qatar-2025-showcase-3.jpg",
        alt: "Al Shaali Marine and ASMARATY dockside exhibition stand",
        title: "Al Shaali Marine Exhibition Presence",
        tag: "EXHIBITION STAND",
        caption: "Al Shaali Marine marking its historic first official appearance in the State of Qatar."
      },
      {
        id: "qatar-2025-photo-4",
        url: "/images/events/qatar-2025/qatar-2025-showcase-4.jpg",
        alt: "VIP dignitaries and guests visiting the ASMARATY yacht",
        title: "VIP Onboard Reception",
        tag: "VIP RECEPTION",
        caption: "Distinguished Qatari guests and maritime collectors touring the ASMARATY fleet."
      },
      {
        id: "qatar-2025-photo-5",
        url: "/images/events/qatar-2025/qatar-2025-showcase-5.jpg",
        alt: "Old Doha Port Mina District pastel architecture and marina basin",
        title: "Mina District Marina Panorama",
        tag: "MARINA BASIN",
        caption: "Waterfront perspective across the vibrant Mina District marina basin at Qatar Boat Show 2025."
      },
      {
        id: "qatar-2025-photo-6",
        url: "/images/events/qatar-2025/qatar-2025-showcase-6.jpg",
        alt: "ASMARATY yacht exterior profile and deck architecture",
        title: "Exterior Profile & Deck Lines",
        tag: "NAVAL ARCHITECTURE",
        caption: "Muscular composite profile and handcrafted deck lines engineered in the UAE."
      },
      {
        id: "qatar-2025-photo-7",
        url: "/images/events/qatar-2025/qatar-2025-showcase-7.jpg",
        alt: "Foredeck and helm walkthrough at Qatar Boat Show",
        title: "Foredeck & Helm Navigation Suite",
        tag: "WALKTHROUGH",
        caption: "State-of-the-art dual-helm electronics and expansive teak foredeck sun lounges."
      },
      {
        id: "qatar-2025-photo-8",
        url: "/images/events/qatar-2025/qatar-2025-showcase-8.jpg",
        alt: "Luxury interior salon craftsmanship and Italian leather details",
        title: "Italian Marble & Leather Interior Salon",
        tag: "INTERIOR OPULENCE",
        caption: "Book-matched Calacatta marble, hand-stitched leather paneling, and acoustic isolation membranes."
      },
      {
        id: "qatar-2025-photo-9",
        url: "/images/events/qatar-2025/qatar-2025-showcase-9.jpg",
        alt: "Guests enjoying hospitality on the flybridge terrace",
        title: "Flybridge Entertaining Terrace",
        tag: "FLYBRIDGE",
        caption: "Expansive upper flybridge terrace featuring wet bar, teppanyaki grill, and panoramic seating."
      },
      {
        id: "qatar-2025-photo-10",
        url: "/images/events/qatar-2025/qatar-2025-showcase-10.jpg",
        alt: "Engine room inspection with twin marine diesels",
        title: "Commercial-Duty Marine Propulsion",
        tag: "ENGINEERING",
        caption: "Heavy-duty commercial marine diesel powerplants engineered for 32-knot sprint performance."
      },
      {
        id: "qatar-2025-photo-11",
        url: "/images/events/qatar-2025/qatar-2025-showcase-11.jpg",
        alt: "Twilight blue LED illumination on the marina basin",
        title: "Twilight Sapphire LED Illumination",
        tag: "TWILIGHT SHOWCASE",
        caption: "Sapphire-blue underwater LEDs casting a luminescent glow across the Old Doha Port basin."
      },
      {
        id: "qatar-2025-photo-12",
        url: "/images/events/qatar-2025/qatar-2025-showcase-12.jpg",
        alt: "Evening waterfront majlis aboard ASMARATY yacht",
        title: "Evening Waterfront Majlis",
        tag: "EVENING SHOWCASE",
        caption: "Atmospheric evening majlis welcoming prospective owners for bespoke commission consultations."
      },
      {
        id: "qatar-2025-photo-13",
        url: "/images/events/qatar-2025/qatar-2025-showcase-13.jpg",
        alt: "Grand fireworks display exploding over Doha skyline and yachts",
        title: "Monumental Skyline Fireworks",
        tag: "FIREWORKS SPECTACULAR",
        caption: "Spectacular fireworks erupting over the Doha skyline and Old Doha Port marina."
      },
      {
        id: "qatar-2025-photo-14",
        url: "/images/events/qatar-2025/qatar-2025-showcase-14.jpg",
        alt: "ASMARATY yacht dockside presentation view",
        title: "Dockside Exhibition View",
        tag: "EXHIBITION",
        caption: "High-profile dockside presentation attracting international visitors and yacht enthusiasts."
      },
      {
        id: "qatar-2025-photo-15",
        url: "/images/events/qatar-2025/qatar-2025-showcase-15.jpg",
        alt: "Bespoke composite hull construction and detailing",
        title: "Precision Composite Construction",
        tag: "CRAFTSMANSHIP",
        caption: "Vacuum-infused resin composite lamination built for Arabian Gulf durability."
      },
      {
        id: "qatar-2025-photo-16",
        url: "/images/events/qatar-2025/qatar-2025-showcase-16.jpg",
        alt: "Aft cockpit seating and hydraulic swim platform",
        title: "Aft Cockpit & Teak Swim Platform",
        tag: "DECK DETAILING",
        caption: "Hydraulic swim platform transitioning seamlessly into the light-drenched main salon."
      },
      {
        id: "qatar-2025-photo-17",
        url: "/images/events/qatar-2025/qatar-2025-showcase-17.jpg",
        alt: "Client consultation with senior naval architects",
        title: "Bespoke Commission Consultations",
        tag: "COMMISSIONING",
        caption: "Confidential consultations covering personalized deck layouts and rare stone selections."
      },
      {
        id: "qatar-2025-photo-18",
        url: "/images/events/qatar-2025/qatar-2025-showcase-18.jpg",
        alt: "Full-beam owner stateroom view",
        title: "Full-Beam Owner's Stateroom",
        tag: "STATEROOMS",
        caption: "Panoramic waterline windows and private en-suite dressing boudoir in the master stateroom."
      },
      {
        id: "qatar-2025-photo-19",
        url: "/images/events/qatar-2025/qatar-2025-showcase-19.jpg",
        alt: "Night celebration panorama over Old Doha Port and ASMARATY fleet",
        title: "Waterfront Celebration Panorama",
        tag: "NIGHT PANORAMA",
        caption: "Grand celebration marking the conclusion of a triumphant Qatar Boat Show 2025."
      }
    ],
    seo: {
      metaTitle: "Qatar Boat Show 2025 Showcase | ASMARATY Luxury Yachts",
      metaDescription: "Explore the official exhibition showcase and retrospective of ASMARATY and Al Shaali Marine at the 2nd Qatar Boat Show 2025 at Old Doha Port.",
      ogImage: "/images/events/qatar-2025/qatar-2025-showcase-1.jpg"
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
