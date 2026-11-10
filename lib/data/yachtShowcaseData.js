/**
 * Official ASMARATY Fleet Showcase Data
 * Unified data model powering all yacht detail pages with an identical luxury template.
 */

export const YACHT_SHOWCASES = {
  g100: {
    slug: "g100",
    modelNumber: "G100",
    badge: "Official Flagship Model",
    fullName: "ASMARATY G100 Super Yacht",
    tagline: "The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.",
    description:
      "A 100-foot tri-deck luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.",
    insigniaSrc: "/images/yachts/g100/2.png",
    brochureUrl: "/documents/asmaraty-g100-brochure.pdf",
    brochureLabel: "Brochure (PDF, 25.7 MB)",
    summaryLine: "Flagship Superyacht • 30.48 Metres • GRP Composite",
    heroImages: [
      { src: "/images/yachts/g100/0.jpg", label: "Burj Al Arab Daylight Profile" },
      { src: "/images/yachts/g100/5.jpg", label: "Dubai Marina Sunset Anchor" },
      { src: "/images/yachts/g100/37.jpg", label: "Atlantis The Royal Passage" },
      { src: "/images/yachts/g100/43.jpg", label: "Ain Dubai Night Illumination" }
    ],
    keyMetrics: [
      { label: "Length Overall (LOA)", main: "100 FT", sub: "30.48 Metres" },
      { label: "Maximum Beam", main: "22.91 FT", sub: "6.98 Metres" },
      { label: "Propulsion Power", main: "3,200 HP", sub: "2 × 1,600 HP MTU" },
      { label: "Accommodations", main: "5 + 2 Staterooms", sub: "12 + 5 Berths (17 Pax)" },
      { label: "Displacement", main: "95 TONS", sub: "Full Load" },
      { label: "Fuel Capacity", main: "2,900 GAL", sub: "10,970 Liters" }
    ],
    narrative: {
      eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
      headline: "Crafted for Unrivaled Luxury on the Water",
      paragraphs: [
        "Find yourself in a world of luxury with spacious interiors, a generous Burma teak cockpit, and a hospitable tri-deck flybridge. The main deck boasts an expansive open-plan saloon and formal dining area surrounded by ample lounge seating bathed in natural daylight thanks to broad, seamless panoramic side windows.",
        "The flybridge creates an elevated gathering point ideal for sunset cruising or midday relaxation across all three levels. The clever arrangement on the sky deck allows for an optional hot tub, generous sunbeds, a secondary steering station, and a full wet bar with BBQ grill for guests to savor.",
        "Providing exceptional comfort and privacy, the reinforced hull allows in an impressive amount of natural ocean light into every cabin. The spacious full-beam Owner's cabin is fitted with a King bed, an en-suite marble bathroom, and a walk-in wardrobe, accompanied by a forward VIP stateroom and twin guest cabins."
      ],
      cards: [
        {
          icon: "Layers",
          title: "Tri-Deck Engineering",
          description: "Hand-laid combination mat with foam-filled honeycomb-cored hull, deck, and flybridge with solid fiberglass keel and chines."
        },
        {
          icon: "Sparkles",
          title: "Sunlit Panoramic Saloon",
          description: "Floor-to-ceiling windows designed as a single continuous glass piece from the outside, flooding the formal salon with natural sea views."
        },
        {
          icon: "Anchor",
          title: "Full-Beam Owner's Suite",
          description: "King-size bed, private waterline horizon lounge, walk-in dressing wardrobe, and full marble rain shower ensuite bathroom."
        },
        {
          icon: "Compass",
          title: "Entertainer's Flybridge",
          description: "Al-fresco teak dining for 8, secondary steering console, full service wet bar, electric BBQ grill, and optional hot tub placement."
        }
      ]
    },
    deckPlans: [
      {
        id: "main-deck",
        name: "Main Deck",
        subtitle: "Panoramic Saloon & Dining",
        image3D: "/images/yachts/g100/33.jpg",
        caption: "3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse",
        features: [
          "Grand open-plan saloon bathed in sunlight through continuous floor-to-ceiling panoramic glass",
          "Designer sectional lounge seating with bespoke marble-top occasional tables",
          "Formal dining salon with 8 upholstered executive armchairs and crystal chandelier",
          "Fully enclosed professional galley with stainless steel induction, dual refrigeration & prep island",
          "Ergonomic forward raised wheelhouse with captain's command chairs & Ray-Chart displays",
          "Seamless transition to shaded aft cockpit with Burma teak dining table and bench seating"
        ]
      },
      {
        id: "lower-deck",
        name: "Lower Accommodations",
        subtitle: "5 Staterooms & Crew",
        image3D: "/images/yachts/g100/32.jpg",
        caption: "3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters",
        features: [
          "Full-beam Owner's Stateroom midships with king bed, executive vanity desk & private sea lounge",
          "Owner's ensuite marble bathroom with walk-in ocean-view rain shower & double basins",
          "Forward VIP stateroom with queen bed, geometric backlit headboard & en-suite facilities",
          "Two generous twin guest staterooms with private ensuites, hanging lockers & slatted berths",
          "Sound-insulated engine room housing twin 1,600 HP MTU engines and twin 50 kVA generators",
          "Aft crew quarters accommodating captain & 4 crew with private galley, mess & separate head"
        ]
      },
      {
        id: "flybridge",
        name: "Flybridge Deck",
        subtitle: "Sky Lounge & Wet Bar",
        image3D: "/images/yachts/g100/34.jpg",
        caption: "3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm",
        features: [
          "Secondary navigation helm station with duplicate electronic engine throttles",
          "Full service Corian wet bar with beverage refrigerator, ice maker & electric BBQ grill",
          "Teak al-fresco dining table comfortably seating 8 guests with 360° ocean views",
          "Spacious aft sunbathing deck with optional spa hot tub installation",
          "Aerodynamic fiberglass radar arch with integrated high-output marine searchlight",
          "Heavy-duty stainless-steel handrails and Burma teak stairway to aft cockpit"
        ]
      }
    ],
    specCategories: [
      {
        id: "dimensions",
        title: "Dimensions & Capacities",
        specs: [
          { label: "Length Overall (LOA)", value: "100 ft / 30.48 m" },
          { label: "Waterline Length (LWL)", value: "85 ft / 25.91 m" },
          { label: "Maximum Beam", value: "22.91 ft / 6.98 m" },
          { label: "Draft at Full Load", value: "7.5 ft / 2.29 m" },
          { label: "Height Above Waterline", value: "18 ft / 5.49 m" },
          { label: "Displacement", value: "95 Tons (Full Load)" },
          { label: "Fuel Capacity", value: "2,900 US Gal / 10,970 Liters" },
          { label: "Freshwater Capacity", value: "670 US Gal / 2,536 Liters" },
          { label: "Blackwater Tank", value: "334 US Gal / 1,265 Liters" },
          { label: "Greywater Tank", value: "334 US Gal / 1,265 Liters" }
        ]
      },
      {
        id: "propulsion",
        title: "Propulsion & Machinery",
        specs: [
          { label: "Main Propulsion Engines", value: "2 × 1,600 HP MTU Diesel" },
          { label: "Reduction Gearbox", value: "ZF Marine Reduction Gearboxes" },
          { label: "Propellers", value: "Twin 5-Bladed Nickel-Aluminum-Bronze (NAB)" },
          { label: "Propeller Shafts", value: "High-Tensile Stainless Steel Shafts with Water Seals" },
          { label: "Engine Exhaust System", value: "Underwater Exhausts with Low-Speed Bypasses" },
          { label: "Steering System", value: "Hydraulic Power Steering with Dual Helm Stations" },
          { label: "Trim Tabs", value: "Heavy-Duty Electro-Hydraulic Trim Tab System" },
          { label: "Thruster System", value: "Hydraulic Bow & Stern Thrusters with Dual Controls" }
        ]
      },
      {
        id: "electrical",
        title: "Electrical, AC & Generators",
        specs: [
          { label: "Marine Generators", value: "Twin 50 kVA Sound-Shielded Marine Generators" },
          { label: "Air Conditioning", value: "24-Ton Chilled Water Marine System" },
          { label: "Electrical Distribution", value: "380V / 220V 50Hz 3-Phase AC & 24V DC Systems" },
          { label: "Battery Banks", value: "Heavy-Duty Deep-Cycle Gel Battery Banks (House & Engines)" },
          { label: "Battery Chargers", value: "Automatic Multi-Bank Marine Battery Chargers & Inverters" },
          { label: "Shore Power", value: "Twin 63A Shore Power Inlets with Galvanic Isolators" },
          { label: "Water Heater", value: "Twin 100-Liter Electric & Heat-Exchanger Water Heaters" },
          { label: "Desalinator / Water Maker", value: "High-Capacity Marine Reverse Osmosis Water Maker" }
        ]
      },
      {
        id: "accommodations",
        title: "Accommodations & Staterooms",
        specs: [
          { label: "Total Staterooms", value: "5 Guest Bedrooms + 2 Crew Cabins" },
          { label: "Total Berths", value: "12 Guest Berths + 5 Crew Berths (17 Total)" },
          { label: "Head Compartments", value: "5 Guest Heads + 1 Crew Head (Electric Vacuum Flush)" },
          { label: "Master Suite", value: "Full-Beam King Stateroom with Walk-In Wardrobe & Marble Ensuite" },
          { label: "VIP Staterooms", value: "Forward Queen VIP with Geometric Backlit Headboard & Ensuite" },
          { label: "Guest Staterooms", value: "2 Twin Staterooms (Port & Starboard) with Ensuites" },
          { label: "Crew Quarters", value: "Captain's Private Cabin + 4-Bunk Crew Room, Kitchenette & Head" },
          { label: "Decking", value: "Natural Burma Teak on Aft Cockpit, Foredeck, Side Walks & Flybridge" },
          { label: "Transom Platform", value: "Heavy-Duty Hydraulic Swim Platform for Tender / Watercraft" }
        ]
      },
      {
        id: "navigation",
        title: "Navigation, Bridge & Electronics",
        specs: [
          { label: "Radar System", value: "Dual HD Color Display Radar System" },
          { label: "Chart Plotter", value: "Ray-Chart & Garmin Multifunction Navigation Suite" },
          { label: "Sensors", value: "High-Precision GPS Marine Sensor & 10-Inch Color Echo Sounder" },
          { label: "Autopilot", value: "Integrated Marine Autopilot with Heading Sensor" },
          { label: "Communications", value: "Marine VHF with DSC & Loud Hailer with Dual Helm Stations" },
          { label: "Entertainment", value: "Samsung Smart TVs & BOSE Surround Sound in Saloon & Suites" },
          { label: "Searchlight", value: "Remote-Controlled Dual-Station High-Intensity Searchlight" },
          { label: "Mooring Winches", value: "Twin 24V Heavy-Duty Anchor Winches & Dual Capstans" }
        ]
      }
    ],
    galleryCategories: [
      "All",
      "Exterior & Skyline",
      "Main Saloon & Dining",
      "Master & VIP Suites",
      "Luxury Ensuites",
      "Flybridge, Decks & Helm"
    ],
    gallery: [
      {
        id: "ext-burj",
        src: "/images/yachts/g100/0.jpg",
        title: "Burj Al Arab Cruising Profile",
        category: "Exterior & Skyline",
        description: "The ASMARATY G100 cruising gracefully off the Dubai coastline with the iconic Burj Al Arab in view."
      },
      {
        id: "ext-sunset",
        src: "/images/yachts/g100/5.jpg",
        title: "Dubai Marina Golden Hour Anchor",
        category: "Exterior & Skyline",
        description: "Golden hour reflection against Dubai Marina and Address Beach Resort as the G100 rests at anchor."
      },
      {
        id: "ext-atlantis",
        src: "/images/yachts/g100/37.jpg",
        title: "Atlantis The Royal Passage",
        category: "Exterior & Skyline",
        description: "Cutting through the azure waters of the Arabian Gulf past the architectural marvel of Atlantis The Royal."
      },
      {
        id: "ext-night-eye",
        src: "/images/yachts/g100/43.jpg",
        title: "Ain Dubai Night Illumination",
        category: "Exterior & Skyline",
        description: "Night profile illuminated by underwater LED hull lighting against the illuminated Ain Dubai Ferris wheel."
      },
      {
        id: "ext-night-bow",
        src: "/images/yachts/g100/35.png",
        title: "Foredeck Horizon at Dusk",
        category: "Exterior & Skyline",
        description: "Illuminated teak stairs and curved foredeck facing the glowing skyline of Bluewaters Island."
      },
      {
        id: "salon-forward",
        src: "/images/yachts/g100/6.jpg",
        title: "Panoramic Main Saloon",
        category: "Main Saloon & Dining",
        description: "Expansive floor-to-ceiling panoramic side windows, designer sectional couches, and bespoke marble coffee table."
      },
      {
        id: "salon-aft",
        src: "/images/yachts/g100/7.jpg",
        title: "Saloon Aft Lounge Perspective",
        category: "Main Saloon & Dining",
        description: "Seamless open-plan transition from the interior lounge to the electronically operated sliding glass aft doors."
      },
      {
        id: "salon-dining",
        src: "/images/yachts/g100/8.jpg",
        title: "Formal Dining Salon",
        category: "Main Saloon & Dining",
        description: "8-guest marble dining table with upholstered armchairs, integrated Samsung entertainment center, and crystal chandelier."
      },
      {
        id: "stateroom-owner-bed",
        src: "/images/yachts/g100/17.jpg",
        title: "Owner's Master Suite",
        category: "Master & VIP Suites",
        description: "King-size bed with leather upholstered base, custom tray ceiling with ambient lighting, and panoramic waterline window with twin armchairs."
      },
      {
        id: "stateroom-owner-desk",
        src: "/images/yachts/g100/15.jpg",
        title: "Master Suite Executive Lounge",
        category: "Master & VIP Suites",
        description: "Built-in executive desk, dressing room access, and plush window daybed overlooking the open sea."
      },
      {
        id: "stateroom-vip",
        src: "/images/yachts/g100/12.jpg",
        title: "Forward VIP Stateroom",
        category: "Master & VIP Suites",
        description: "Queen bed with geometric backlit headboard, nautical portholes, and extensive polyester-finish custom cabinetry."
      },
      {
        id: "stateroom-guest-bunk",
        src: "/images/yachts/g100/22.jpg",
        title: "Twin Guest / Crew Stateroom",
        category: "Master & VIP Suites",
        description: "Comfortable twin bunk berths with upholstered wall panels, stainless steel safety rails, and glass-top vanity desk."
      },
      {
        id: "bath-master-ensuite",
        src: "/images/yachts/g100/14.jpg",
        title: "Master Ensuite Bathroom",
        category: "Luxury Ensuites",
        description: "Backlit LED vanity mirror, white porcelain basin, marble walls, and walk-in rain shower with frameless glass."
      },
      {
        id: "bath-ocean-shower",
        src: "/images/yachts/g100/18.jpg",
        title: "Ocean-View Rain Shower Suite",
        category: "Luxury Ensuites",
        description: "Walk-in marble shower featuring a built-in bench and panoramic window with direct sea views."
      },
      {
        id: "bath-deck-door",
        src: "/images/yachts/g100/20.jpg",
        title: "Ensuite with Ocean Deck Access",
        category: "Luxury Ensuites",
        description: "Marble ensuite featuring a private glass door opening out directly to the azure ocean breeze."
      },
      {
        id: "view-ain-window",
        src: "/images/yachts/g100/21.jpg",
        title: "Framed Sunset at Ain Dubai",
        category: "Master & VIP Suites",
        description: "Breathtaking sunset captured through the panoramic stateroom ribbon window, framing the Dubai skyline."
      },
      {
        id: "fly-terrace",
        src: "/images/yachts/g100/30.jpg",
        title: "Flybridge Open-Air Sky Lounge",
        category: "Flybridge, Decks & Helm",
        description: "Spacious outdoor entertaining terrace featuring al-fresco teak dining, bar with dual refrigeration, and panoramic sunbed."
      },
      {
        id: "aft-cockpit",
        src: "/images/yachts/g100/27.jpg",
        title: "Teak Aft Cockpit & Swim Terrace",
        category: "Flybridge, Decks & Helm",
        description: "Generous Burma teak aft deck with built-in bench seating, dual transom gates, and stairs down to the hydraulic swim platform."
      },
      {
        id: "helm-station",
        src: "/images/yachts/g100/23.jpg",
        title: "Main Raised Wheelhouse Bridge",
        category: "Flybridge, Decks & Helm",
        description: "Enclosed bridge helm station with twin Ray-Chart multifunction displays, MTU electronic controls, and high-visibility captain's chairs."
      },
      {
        id: "galley-kitchen",
        src: "/images/yachts/g100/24.jpg",
        title: "Professional Enclosed Galley",
        category: "Main Saloon & Dining",
        description: "Fully equipped chef's galley with stainless steel induction range, dual convection ovens, full-height refrigerator, and dishwasher."
      },
      {
        id: "engine-room",
        src: "/images/yachts/g100/10.jpg",
        title: "MTU Twin Machinery Room",
        category: "Flybridge, Decks & Helm",
        description: "Immaculate engine compartment housing twin 1,600 HP MTU diesels, twin 50 kVA generators, and 24-ton chiller plant."
      }
    ]
  },

  g77: {
    slug: "g77",
    modelNumber: "G77",
    badge: "Two-Deck Masterpiece",
    fullName: "ASMARATY G77 Motor Yacht",
    tagline: "The Signature of the Sea — Where Master Craftsmanship Meets Panoramic Horizons.",
    description:
      "A 77-foot two-deck luxury yacht engineered in the United Arab Emirates. Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite, and four expansive guest staterooms across two generous decks.",
    insigniaSrc: "/images/yachts/g77/g77_asset_54_438x208.jpg",
    brochureUrl: null,
    brochureLabel: null,
    summaryLine: "Two-Deck Motor Yacht • 23.5 Metres • GRP Composite",
    heroImages: [
      { src: "/images/yachts/g77/g77_asset_01_1672x941.jpg", label: "Cruising Profile on Arabian Gulf Waters" },
      { src: "/images/yachts/g77/g77_asset_29_1672x941.jpg", label: "Flybridge Terrace & Quilted Leather Lounge" },
      { src: "/images/yachts/g77/g77_asset_50_1672x941.jpg", label: "Exterior Side Elevation at Anchor" },
      { src: "/images/yachts/g77/g77_asset_71_1672x941.jpg", label: "Foredeck Horizon & Bow Silhouette" }
    ],
    keyMetrics: [
      { label: "Length Overall (LOA)", main: "77 FT", sub: "23.5 Metres" },
      { label: "Maximum Beam", main: "20 FT", sub: "6.0 Metres" },
      { label: "Propulsion Power", main: "2,400 HP", sub: "Twin Inboard Diesel" },
      { label: "Accommodations", main: "4 + 2 Cabins", sub: "8 + 3 Berths (11 Pax)" },
      { label: "Displacement", main: "50 TONS", sub: "Full Load" },
      { label: "Fuel Capacity", main: "1,870 GAL", sub: "7,080 Liters" }
    ],
    narrative: {
      eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
      headline: "Crafted for Expansive Horizons & Supreme Comfort",
      paragraphs: [
        "At a glance, find yourself in a world of luxury aboard the ASMARATY G77. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 77-foot two-deck yacht unites expansive social spaces with peerless privacy.",
        "The main deck welcomes you into a bright, open-plan salon bathed in Arabian daylight through sweeping panoramic side windows. Formal dining for six, a concealed gourmet galley with Corian surfaces, and an ergonomic interior pilot house establish an atmosphere of serene sophistication.",
        "Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco dining table, full wet bar with BBQ grill, upper helm station, and space for an optional spa jacuzzi. Below, four luxurious guest staterooms and private aft crew quarters deliver uninterrupted tranquility for up to eleven guests."
      ],
      cards: [
        {
          icon: "Layers",
          title: "Two-Deck Architecture",
          description: "ISO Certified hand-laminated fiberglass with honeycomb-core support, deep-V keel, and reinforced longitudinal stringers."
        },
        {
          icon: "Sparkles",
          title: "Panoramic Main Saloon",
          description: "Floor-to-ceiling side windows flooding the open-plan lounge with daylight, curved bouclé sofas, and 60\" smart TV lift."
        },
        {
          icon: "Anchor",
          title: "Full-Beam Owner's Suite",
          description: "King bed (200×180cm), waterline horizon view, walk-in dressing wardrobe, and marble ensuite with rain shower."
        },
        {
          icon: "Compass",
          title: "Entertainer's Flybridge",
          description: "Al-fresco teak dining, secondary steering console, full service wet bar, electric BBQ grill, and optional spa hot tub."
        }
      ]
    },
    deckPlans: [
      {
        id: "main-deck",
        name: "Main Deck",
        subtitle: "Panoramic Saloon, Dining & Galley",
        image3D: "/images/yachts/g77/deck-main.png",
        caption: "3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse",
        features: [
          "Shaded aft cockpit with teak dining table, bench seating, and dual transom stairways",
          "Panoramic main saloon with curved bouclé luxury sofas and 60\" smart TV cabinet lift",
          "Formal dining suite seating 6 guests in tailored armchairs with sculptural glass table",
          "Fully equipped gourmet galley with ceramic cooktop, microwave oven & domestic fridge-freezer",
          "Enclosed interior pilot house with leather console, radar, and full engine instruments",
          "Direct teak side-deck walkways connecting aft cockpit to forward bow sunbeds"
        ]
      },
      {
        id: "lower-deck",
        name: "Lower Accommodations",
        subtitle: "4 Guest Cabins + 2 Crew (11 Berths)",
        image3D: "/images/yachts/g77/deck-lower.png",
        caption: "3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters",
        features: [
          "Full-beam Owner's Stateroom midships with king bed (200×180cm), ocean windows & walk-in wardrobe",
          "Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & rain shower",
          "Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV & private ensuite bathroom",
          "Two twin guest staterooms (4 berths total) with storage drawers and private ensuite heads",
          "Sound-insulated engine room with twin inboards and 28 kW sound-shielded generator",
          "Aft crew quarters accommodating captain & 2 crew with private galley, mess & separate head"
        ]
      },
      {
        id: "flybridge",
        name: "Flybridge & Bow Deck",
        subtitle: "Upper Helm, Al-Fresco Dining & Wet Bar",
        image3D: "/images/yachts/g77/deck-flybridge.png",
        caption: "3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm",
        features: [
          "Upper helm station with dual thruster joysticks, engine monitors & GPS chart plotter",
          "Full wet bar with marine refrigerator, stainless sink, and electric BBQ grill",
          "Al-fresco dining table with quilted wraparound leather lounge seating",
          "Expansive aft sunbathing area with optional spa hot tub placement",
          "Integrated radar arch in GRP with 35 NM colour radar and remote searchlight",
          "Forward deck with integrated double sunbeds and 40 kg anchor windlass"
        ]
      }
    ],
    specCategories: [
      {
        id: "dimensions",
        title: "Dimensions & Capacities",
        specs: [
          { label: "Length Overall (LOA)", value: "77 ft / 23.5 m" },
          { label: "Waterline Length (LWL)", value: "66 ft / 20.1 m" },
          { label: "Maximum Beam", value: "20 ft / 6.0 m" },
          { label: "Draft at Full Load", value: "3.5 ft / 1.06 m" },
          { label: "Height Above Waterline", value: "18 ft / 5.5 m" },
          { label: "Displacement", value: "50 Tons (Full Load)" },
          { label: "Fuel Capacity", value: "1,870 US Gal / 7,080 Liters" },
          { label: "Freshwater Capacity", value: "300 US Gal / 1,134 Liters" },
          { label: "Blackwater / Holding Tank", value: "120–150 US Gal / 567 Liters" }
        ]
      },
      {
        id: "propulsion",
        title: "Propulsion & Machinery",
        specs: [
          { label: "Main Propulsion Engines", value: "Twin Inboard Diesel (600 / 800 / 1000 / 1200 HP)" },
          { label: "Maximum Output", value: "Up to 2,400 Total HP (CAT / MAN / Volvo Penta)" },
          { label: "Reduction Gearbox", value: "ZF Marine Reduction Gearboxes with Electronic Controls" },
          { label: "Propellers", value: "4-Bladed High-Performance Bronze Propellers" },
          { label: "Propeller Shafts", value: "Twin Heavy-Duty SS 316 Stainless-Steel Shafts" },
          { label: "Exhaust System", value: "Underwater Engine Exhausts for Silent Cruising" },
          { label: "Steering System", value: "Hydraulic Power Steering for Dual Helm Stations" },
          { label: "Trim Tabs", value: "Electrical Hydraulic Trim Tabs with Helm Position Indicators" },
          { label: "Thruster System", value: "Italian Electrical Bow & Stern Thrusters with Joysticks" }
        ]
      },
      {
        id: "electrical",
        title: "Electrical, AC & Generators",
        specs: [
          { label: "Marine Generator", value: "1 × 28 kW with Sound Shield & Dedicated Gel Battery" },
          { label: "Air Conditioning", value: "210,000 BTU Chilled Water Marine System" },
          { label: "Electrical Distribution", value: "220V 50Hz AC Shore/Gen + 12V / 24V DC Systems" },
          { label: "Battery Banks", value: "8 × 200 Ah Gel Batteries in Acid-Proof Fiberglass Boxes" },
          { label: "Battery Chargers", value: "Automatic Multi-Bank Marine Battery Charger & Inverters" },
          { label: "Water Heater", value: "60-Liter Dual-Source (Engine Cooling Loop + 220V Element)" },
          { label: "Engine Room Clearance", value: "ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates" },
          { label: "Ventilation", value: "Twin 24V & 220V Engine Blowers + Side Air Intake Channels" }
        ]
      },
      {
        id: "accommodations",
        title: "Accommodations & Staterooms",
        specs: [
          { label: "Total Staterooms", value: "4 Guest Staterooms + 2 Crew Cabins" },
          { label: "Total Berths", value: "8 Guest Berths + 3 Crew Berths (11 Total)" },
          { label: "Master Suite", value: "Full-Beam King Stateroom (200×180cm) with Walk-In Wardrobe" },
          { label: "VIP Stateroom", value: "Forward Queen VIP (160×200cm) with 40\" TV & Ensuite Head" },
          { label: "Guest Staterooms", value: "2 Twin Staterooms (Port & Starboard) with Ensuites" },
          { label: "Crew Quarters", value: "Aft Crew Cabin with 2 Beds, 32\" TV, Private Galley & Head" },
          { label: "Sanitary System", value: "Sea-Land Vacuum Toilets with 3-Way Discharge & GROHE Faucets" },
          { label: "Decking", value: "Natural Teakwood on Flybridge, Cockpit, Steps & Swim Platform" },
          { label: "Transom Platform", value: "Heavy-Duty Hydraulic Submersible Swim Platform" }
        ]
      },
      {
        id: "navigation",
        title: "Navigation, Bridge & Electronics",
        specs: [
          { label: "Radar System", value: "35 NM Colour Radar with Black Radome Antenna" },
          { label: "Chart Plotter & GPS", value: "Multifunction Navigation Display Suite with Autopilot" },
          { label: "Sensors", value: "Color Echo Sounder, Magnetic Compass & Speed Log" },
          { label: "Communications", value: "Dual-Station Marine VHF Radio with DSC Functionality" },
          { label: "Sound System", value: "Fusion Marine Multi-Zone Sound System" },
          { label: "Searchlight", value: "Dual-Station Remote-Controlled High-Intensity Searchlight" },
          { label: "Anchor & Windlass", value: "40 kg Galvanised Anchor + 90 m of 12 mm Marine Chain" },
          { label: "Deck Fittings", value: "Handrails, Cleats & Transom Gates in SS 316 Stainless Steel" }
        ]
      }
    ],
    galleryCategories: [
      "All",
      "Exterior & Flybridge",
      "Main Saloon & Dining",
      "Master & VIP Suites",
      "Luxury Ensuites"
    ],
    gallery: [
      {
        id: "ext-running",
        src: "/images/yachts/g77/g77_asset_01_1672x941.jpg",
        title: "Cruising Profile on Open Waters",
        category: "Exterior & Flybridge",
        description: "The ASMARATY G77 gliding effortlessly with its high-efficiency deep-V hull and sculptural flybridge lines."
      },
      {
        id: "fly-terrace",
        src: "/images/yachts/g77/g77_asset_29_1672x941.jpg",
        title: "Flybridge Terrace & Quilted Lounges",
        category: "Exterior & Flybridge",
        description: "Expansive teak-laid flybridge featuring bespoke diamond-stitched leather seating, teak dining table, and wet bar."
      },
      {
        id: "salon-main",
        src: "/images/yachts/g77/g77_asset_03_1536x1024.jpg",
        title: "Panoramic Main Saloon & Curved Lounges",
        category: "Main Saloon & Dining",
        description: "Light-filled main saloon with curved bouclé luxury sofas, custom architectural joinery, and floor-to-ceiling panoramic windows."
      },
      {
        id: "dining-suite",
        src: "/images/yachts/g77/g77_asset_06_1536x1024.jpg",
        title: "Formal Glass Dining Suite",
        category: "Main Saloon & Dining",
        description: "Sculptural glass dining table with gold-leaf accents and six tailored armchairs overlooking panoramic ocean views."
      },
      {
        id: "owner-stateroom",
        src: "/images/yachts/g77/g77_asset_12_1536x1024.jpg",
        title: "Full-Beam Owner's Stateroom",
        category: "Master & VIP Suites",
        description: "Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."
      },
      {
        id: "owner-lounge",
        src: "/images/yachts/g77/g77_asset_14_1536x1024.jpg",
        title: "Owner's Suite Private Lounge",
        category: "Master & VIP Suites",
        description: "Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."
      },
      {
        id: "owner-ensuite",
        src: "/images/yachts/g77/g77_asset_16_1536x1024.jpg",
        title: "Owner's Ensuite Vanity & Grohe Fixtures",
        category: "Luxury Ensuites",
        description: "Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."
      },
      {
        id: "owner-shower",
        src: "/images/yachts/g77/g77_asset_18_1536x1024.jpg",
        title: "Designer Ensuite Rain Shower",
        category: "Luxury Ensuites",
        description: "Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."
      },
      {
        id: "linen-detail",
        src: "/images/yachts/g77/g77_asset_20_1536x1024.jpg",
        title: "Matte Black Basin & ASMARATY Linens",
        category: "Luxury Ensuites",
        description: "Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."
      },
      {
        id: "vip-cabin",
        src: "/images/yachts/g77/g77_asset_07_1536x1024.jpg",
        title: "Forward VIP Stateroom",
        category: "Master & VIP Suites",
        description: "Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."
      },
      {
        id: "twin-guest",
        src: "/images/yachts/g77/g77_asset_10_1536x1024.jpg",
        title: "Twin Guest Stateroom",
        category: "Master & VIP Suites",
        description: "Twin-berth stateroom with individual reading lights, custom carpeting, storage drawers, and dedicated ensuite facilities."
      },
      {
        id: "helm-station",
        src: "/images/yachts/g77/g77_asset_22_1535x1024.jpg",
        title: "Main Pilot House & Navigation Suite",
        category: "Exterior & Flybridge",
        description: "Ergonomic leather helm console with dual chart plotters, autopilot, bow/stern thruster joysticks, and 35 NM radar."
      },
      {
        id: "galley-prep",
        src: "/images/yachts/g77/g77_asset_25_1536x1024.jpg",
        title: "Galley Gourmet Induction & Prep Counter",
        category: "Main Saloon & Dining",
        description: "Fully equipped galley with Corian work surfaces, granite sink, ceramic cooktop, microwave oven, and domestic fridge-freezer."
      },
      {
        id: "cockpit-alfresco",
        src: "/images/yachts/g77/g77_asset_28_1536x1024.jpg",
        title: "Aft Cockpit Al-Fresco Dining",
        category: "Exterior & Flybridge",
        description: "Shaded aft cockpit with upholstered bench seating, teak dining table, and seamless sliding door connection to the main saloon."
      },
      {
        id: "side-anchor",
        src: "/images/yachts/g77/g77_asset_50_1672x941.jpg",
        title: "Side Profile at Anchor",
        category: "Exterior & Flybridge",
        description: "Harmonious hull lines displaying continuous dark-tinted glazing, integrated radar arch, and expansive hardtop."
      },
      {
        id: "foredeck-bow",
        src: "/images/yachts/g77/g77_asset_71_1672x941.jpg",
        title: "Foredeck Horizon & Bow Lounge",
        category: "Exterior & Flybridge",
        description: "Expansive forward deck with integrated sunbeds, non-skid teak decking, and 40 kg galvanised anchor windlass system."
      }
    ]
  },

  g66: {
    slug: "g66",
    modelNumber: "G66",
    badge: "High-Performance Luxury Cruiser",
    fullName: "ASMARATY G66 Motor Yacht",
    tagline: "The Signature of the Sea — Refined Luxury, Exceptional Comfort.",
    description:
      "A 66-foot high-performance luxury flybridge yacht engineered in the United Arab Emirates. Featuring an open-plan sunlit salon, expansive flybridge terrace with second helm, full-beam owner stateroom, and accommodations for ten guests across three levels.",
    insigniaSrc: "/images/yachts/g66/insignia.png",
    brochureUrl: "/documents/asmaraty-g66-brochure.pdf",
    brochureLabel: "Brochure (PDF, 10.0 MB)",
    summaryLine: "Flybridge Motor Yacht • 20.12 Metres • Hand-Laid GRP Composite",
    heroImages: [
      { src: "/images/yachts/g66/hero-01.jpg", label: "Burj Khalifa Skyline Sunset Profile" },
      { src: "/images/yachts/g66/hero-02.jpg", label: "Twilight Bow Anchor Horizon" },
      { src: "/images/yachts/g66/hero-03.jpg", label: "Foredeck Horizon & Sun Lounge" },
      { src: "/images/yachts/g66/hero-04.jpg", label: "Aft Cockpit Teak Dining Lounge" }
    ],
    keyMetrics: [
      { label: "Length Overall (LOA)", main: "66 FT", sub: "20.12 Metres" },
      { label: "Maximum Beam", main: "20 FT", sub: "6.10 Metres" },
      { label: "Propulsion Power", main: "1,600 HP", sub: "2 × 800 HP Volvo Inboards" },
      { label: "Accommodations", main: "4 + 2 Cabins", sub: "8 + 2 Berths (10 Pax)" },
      { label: "Displacement", main: "40 TONS", sub: "Full Load" },
      { label: "Fuel Capacity", main: "1,870 GAL", sub: "7,080 Liters" }
    ],
    narrative: {
      eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
      headline: "Engineered for Effortless Entertaining & Confident Cruising",
      paragraphs: [
        "At a glance, find yourself in a world of luxury aboard the ASMARATY G66. Conceived for owners who value both effortless entertaining and confident blue-water seakeeping, this 66-foot luxury flybridge cruiser unites expansive social spaces with peerless privacy and timeless Arabian craftsmanship.",
        "The main deck welcomes you into a bright, open-plan salon bathed in daylight through panoramic tinted side windows. Formal dining for eight, a gourmet galley with Corian work surfaces, an ergonomic interior pilot house, and a shaded teak cockpit establish an atmosphere of calm sophistication.",
        "Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations, complete with an al-fresco teak dining table, full wet bar with BBQ grill, secondary helm station, and space for an optional spa hot tub. Below, four luxurious guest quarters with large waterline windows and private aft crew quarters deliver uninterrupted tranquility for up to ten guests."
      ],
      cards: [
        {
          icon: "Layers",
          title: "Hand-Laid Composite Hull",
          description: "Deep V-shape keel with longitudinal stringers, ISO Certified hand-laminated fiberglass, and honeycomb-cored superstructure."
        },
        {
          icon: "Sparkles",
          title: "Sunlit Panoramic Saloon",
          description: "Broad tinted side windows flooding the open-plan lounge with daylight, pop-up 55\" smart TV cabinet, and custom leather joinery."
        },
        {
          icon: "Anchor",
          title: "Full-Beam Owner's Suite",
          description: "King bed (200×180cm), waterline horizon sofa, dressing room with illuminated wardrobe, makeup table, and marble ensuite with rain shower."
        },
        {
          icon: "Compass",
          title: "Entertainer's Flybridge",
          description: "Teakwood flooring, second helm console with GPS plotter, wet bar with sink, fridge & electric BBQ grill, and optional hot tub placement."
        }
      ]
    },
    deckPlans: [
      {
        id: "main-deck",
        name: "Main Deck",
        subtitle: "Panoramic Saloon, Dining & Galley",
        image3D: "/images/yachts/g66/deck-main.jpg",
        caption: "3D Cutaway — Formal Saloon, Dining Suite, Enclosed Galley & Wheelhouse",
        features: [
          "Open-plan main salon with designer sofas, coffee table, and pop-up 55\" smart TV cabinet",
          "Formal dining suite accommodating 8 guests with panoramic sea views through tinted glass",
          "Gourmet galley with Corian work surfaces, sink, ceramic cooktop, microwave, and fridge-freezer",
          "Forward interior pilot house with leather console, 35 NM radar, autopilot, and thruster joysticks",
          "Shaded aft cockpit with teak dining table, built-in sofa, and LED illuminated stairs",
          "Heavy-duty hydraulic submersible stern platform for tender and watercraft handling"
        ]
      },
      {
        id: "lower-deck",
        name: "Lower Accommodations",
        subtitle: "4 Guest Cabins + 2 Crew (10 Berths)",
        image3D: "/images/yachts/g66/deck-lower.jpg",
        caption: "3D Cutaway — Full-Beam Master Suite, Forward VIP, Guest Staterooms & Crew Quarters",
        features: [
          "Full-beam Owner's Stateroom midships with king bed (200×180cm), 2-seater horizon sofa & dressing wardrobe",
          "Owner's luxury ensuite bathroom with Corian vanity, Sea-Land vacuum toilet & walk-in rain shower",
          "Forward VIP stateroom with queen bed (160×200cm), 40\" smart TV, and ample closet storage",
          "Two twin guest staterooms (port & starboard) with dedicated ensuite bathrooms and reading lights",
          "Sound-insulated engine compartment housing twin 800 HP Volvo engines and 28 kVA generator",
          "Aft crew quarters accommodating captain & crew with 2 berths, private galley, and separate head"
        ]
      },
      {
        id: "flybridge",
        name: "Flybridge Deck",
        subtitle: "Sky Terrace, Upper Helm & Wet Bar",
        image3D: "/images/yachts/g66/deck-flybridge.jpg",
        caption: "3D Cutaway — Upper Sky Lounge, Sunbed Terraces & Secondary Helm",
        features: [
          "Secondary helm console with duplicate engine controls, compass & hydraulic power steering",
          "Full wet bar with marine sink, electric BBQ grill, and beverage refrigerator",
          "Al-fresco teak dining table with wrap-around passenger lounge seating",
          "Spacious aft sky terrace with sunbed cushions and optional spa hot tub placement",
          "Integrated aerodynamic GRP radar arch with remote high-intensity searchlight",
          "Natural teakwood flooring and safety handrails in marine-grade SS 316 stainless steel"
        ]
      }
    ],
    specCategories: [
      {
        id: "dimensions",
        title: "Dimensions & Capacities",
        specs: [
          { label: "Length Overall (LOA)", value: "66 ft / 20.12 m" },
          { label: "Waterline Length (LWL)", value: "55 ft / 16.76 m" },
          { label: "Maximum Beam", value: "20 ft / 6.10 m" },
          { label: "Draft at Full Load", value: "3.5 ft / 1.07 m" },
          { label: "Displacement", value: "40 Tons (Full Load)" },
          { label: "Fuel / Diesel Capacity", value: "1,870 US Gal / 7,080 Liters" },
          { label: "Freshwater Capacity", value: "300 US Gal / 1,135 Liters" },
          { label: "Blackwater / Holding Tank", value: "150 US Gal / 567 Liters" }
        ]
      },
      {
        id: "propulsion",
        title: "Propulsion & Machinery",
        specs: [
          { label: "Main Propulsion Engines", value: "2 × 800 HP Volvo Inboards" },
          { label: "Reduction Gearbox", value: "Marine Gearboxes matched to Volvo Inboard Package" },
          { label: "Propellers", value: "Twin 5-Bladed High-Performance Bronze Propellers" },
          { label: "Propeller Shafts", value: "Twin Heavy-Duty Stainless Steel Shafts with Water Seals" },
          { label: "Engine Exhaust System", value: "Underwater Engine Exhausts for Silent Cruising" },
          { label: "Steering System", value: "Hydraulic Power Steering for Dual Helm Stations" },
          { label: "Trim Tabs", value: "Electrical Hydraulic Trim Tabs with Helm Position Indicator" },
          { label: "Thruster System", value: "Electrical Bow & Stern Thrusters with Dual Helm Joysticks" }
        ]
      },
      {
        id: "electrical",
        title: "Electrical, AC & Generators",
        specs: [
          { label: "Marine Generator", value: "1 × 28 kVA Sound-Shielded Marine Generator" },
          { label: "Air Conditioning", value: "170,000 BTU Marine Chilled Water System" },
          { label: "Electrical Distribution", value: "220V 50Hz AC Shore/Gen + 12V / 24V DC Systems" },
          { label: "Battery Banks", value: "8 × 200 Ah Gel Batteries for Engine & House Service" },
          { label: "Starting Battery", value: "1 × 120 Ah Dedicated Starting Gel Battery for Generator" },
          { label: "Battery Enclosures", value: "Acid-Proof Fiberglass Battery Boxes with Ventilated Covers" },
          { label: "Water Heater", value: "60-Liter Dual-Source (Engine Cooling Loop + 220V Element)" },
          { label: "Engine Room Clearance", value: "ca. 6 ft (1.83 m) Standing Height with Steel Floor Plates" }
        ]
      },
      {
        id: "accommodations",
        title: "Accommodations & Staterooms",
        specs: [
          { label: "Total Staterooms", value: "4 Guest Staterooms + 2 Crew Cabins" },
          { label: "Total Berths", value: "8 Guest Berths + 2 Crew Berths (10 Total)" },
          { label: "Master Suite", value: "Full-Beam King Stateroom (200×180cm) with Dressing Room & Ensuite" },
          { label: "Forward VIP Stateroom", value: "Queen Bed (160×200cm) with 40\" Smart TV & Makeup Table" },
          { label: "Port Guest Cabin", value: "Twin Berths (60×200cm each) with Slatted Mattresses & Ensuite" },
          { label: "Starboard Guest Cabin", value: "Twin Berths (60×200cm each) with LED Reading Lights & Wardrobe" },
          { label: "Crew Quarters", value: "Private Aft Cabin with 2 Beds, Dedicated Galley & Separate Head" },
          { label: "Sanitary System", value: "Sea-Land Vacuum Toilets with 3-Way Discharge Valves" },
          { label: "Transom Platform", value: "Heavy-Duty Hydraulic Submersible Swim Platform" }
        ]
      },
      {
        id: "navigation",
        title: "Navigation, Bridge & Electronics",
        specs: [
          { label: "Radar System", value: "35 NM Colour Radar with Radome Antenna" },
          { label: "Chart Plotter & GPS", value: "Garmin Multifunction Navigation Suite with Integrated Autopilot" },
          { label: "Sensors", value: "Colour Echo Sounder, Speed Log & Magnetic Compass" },
          { label: "Communications", value: "Dual-Station Marine VHF Radio with DSC & Loud Hailer" },
          { label: "Entertainment", value: "60\" & 40\" Smart TVs, Pop-Up Saloon Lift & Fusion Multi-Zone Audio" },
          { label: "Searchlight", value: "Dual-Station Electric Remote-Controlled High-Intensity Searchlight" },
          { label: "Anchor & Windlass", value: "40 kg Galvanised Anchor with 90 m of 12 mm Marine Chain" },
          { label: "Deck Fittings", value: "SS 316 Stainless Steel Handrails, Cleats & Transom Gates" }
        ]
      }
    ],
    galleryCategories: [
      "All",
      "Exterior & Decks",
      "Main Saloon & Dining",
      "Master & VIP Suites",
      "Luxury Ensuites",
      "Flybridge Terrace"
    ],
    gallery: [
      {
        id: "ext-burj",
        src: "/images/yachts/g66/hero-01.jpg",
        title: "Burj Khalifa Skyline Sunset Profile",
        category: "Exterior & Decks",
        description: "The ASMARATY G66 cruising gracefully off the Dubai coastline with the Burj Khalifa and skyline glowing at sunset."
      },
      {
        id: "ext-twilight",
        src: "/images/yachts/g66/hero-02.jpg",
        title: "Twilight Bow Anchor Profile",
        category: "Exterior & Decks",
        description: "The G66 resting peacefully at anchor against twilight skies, showcasing its sculptural hull glazing and hardtop architecture."
      },
      {
        id: "ext-foredeck-bow",
        src: "/images/yachts/g66/gallery-foredeck-bow.jpg",
        title: "Foredeck Bow Island & Quilted Sunpads",
        category: "Exterior & Decks",
        description: "Expansive forward deck with integrated double sunbeds, non-skid teak decking, and stainless steel safety pulpit."
      },
      {
        id: "ext-foredeck-horizon",
        src: "/images/yachts/g66/gallery-foredeck-horizon.jpg",
        title: "Foredeck Horizon & Coastal Panorama",
        category: "Exterior & Decks",
        description: "Panoramic forward vistas from the bow teak walkway facing open azure waters and coastal skyline."
      },
      {
        id: "ext-cockpit",
        src: "/images/yachts/g66/gallery-cockpit.jpg",
        title: "Aft Cockpit Al-Fresco Dining",
        category: "Exterior & Decks",
        description: "Shaded Burma teak aft cockpit with upholstered U-shaped lounge, solid teak dining table, and direct swim platform access."
      },
      {
        id: "fly-helm",
        src: "/images/yachts/g66/gallery-fly-helm.jpg",
        title: "Flybridge Navigation Station",
        category: "Flybridge Terrace",
        description: "Elevated command station equipped with GPS chart plotter, autopilot, dual thruster joysticks, and captain's armchair."
      },
      {
        id: "fly-lounge",
        src: "/images/yachts/g66/gallery-fly-lounge.jpg",
        title: "Flybridge Hardtop Lounge & Dining",
        category: "Flybridge Terrace",
        description: "Covered flybridge lounge featuring caramel leather wrap-around seating, solid teak table, and LED overhead illumination."
      },
      {
        id: "fly-terrace",
        src: "/images/yachts/g66/gallery-fly-terrace.jpg",
        title: "Sky Terrace Entertaining Deck",
        category: "Flybridge Terrace",
        description: "Open-air sky lounge with 360-degree ocean views, wet bar service, and generous aft sunbathing area."
      },
      {
        id: "salon-fwd",
        src: "/images/yachts/g66/gallery-salon-fwd.jpg",
        title: "Panoramic Main Saloon & Interior Helm",
        category: "Main Saloon & Dining",
        description: "Light-filled open-plan main salon with designer bouclé sectional couches, continuous side windows, and forward wheelhouse."
      },
      {
        id: "salon-aft",
        src: "/images/yachts/g66/gallery-salon-aft.jpg",
        title: "Saloon Aft Lounge Perspective",
        category: "Main Saloon & Dining",
        description: "Seamless transition from the air-conditioned salon through stainless-steel sliding glass doors to the aft cockpit."
      },
      {
        id: "salon-seating",
        src: "/images/yachts/g66/gallery-salon-seating.jpg",
        title: "Contemporary Living Lounge & Pop-Up Media",
        category: "Main Saloon & Dining",
        description: "Generous conversational seating with bespoke coffee table, recessed LED ceiling lighting, and concealed 55\" smart TV lift."
      },
      {
        id: "galley-kitchen",
        src: "/images/yachts/g66/gallery-galley.jpg",
        title: "Gourmet Galley & Sunset Breakfast Bar",
        category: "Main Saloon & Dining",
        description: "Equipped chef's galley with Corian work surfaces, ceramic cooktop, microwave, and panoramic sunset water views."
      },
      {
        id: "companionway",
        src: "/images/yachts/g66/gallery-companionway.jpg",
        title: "Lower Deck LED Companionway Staircase",
        category: "Master & VIP Suites",
        description: "Illuminated architectural staircase providing elegant and quiet passage from the main salon to the guest staterooms."
      },
      {
        id: "master-bed",
        src: "/images/yachts/g66/gallery-master-bed.jpg",
        title: "Full-Beam Owner's Stateroom",
        category: "Master & VIP Suites",
        description: "Midships sanctuary with king-size bed (200×180cm), floating bedside pedestals, ambient cove lighting, and waterline windows."
      },
      {
        id: "master-lounge",
        src: "/images/yachts/g66/gallery-master-lounge.jpg",
        title: "Owner's Waterline Horizon Sofa",
        category: "Master & VIP Suites",
        description: "Dedicated 2-seater upholstered horizon daybed framed directly beneath wide ocean waterline windows."
      },
      {
        id: "master-vanity",
        src: "/images/yachts/g66/gallery-master-vanity.jpg",
        title: "Owner's Vanity Table & Dressing Desk",
        category: "Master & VIP Suites",
        description: "Built-in vanity dressing desk in high-gloss marine wood veneer with tailored armchair and illuminated makeup mirrors."
      },
      {
        id: "master-wardrobe",
        src: "/images/yachts/g66/gallery-master-wardrobe.jpg",
        title: "Walk-In Dressing Wardrobe",
        category: "Master & VIP Suites",
        description: "Generous cedar-lined walk-in dressing wardrobe with integrated interior lighting, hanging rails, and storage drawers."
      },
      {
        id: "master-ensuite",
        src: "/images/yachts/g66/gallery-master-ensuite.jpg",
        title: "Owner's Marble Ensuite with Rain Shower",
        category: "Luxury Ensuites",
        description: "Bespoke ensuite bathroom featuring Italian marble finishes, porcelain vessel sink, teak grating, and frameless glass rain shower."
      },
      {
        id: "guest-twin",
        src: "/images/yachts/g66/gallery-guest-twin.jpg",
        title: "Guest Twin Stateroom",
        category: "Master & VIP Suites",
        description: "Spacious guest cabin with twin slatted berths (60×200cm), individual reading lights, storage drawers, and plush carpeting."
      },
      {
        id: "guest-ensuite",
        src: "/images/yachts/g66/gallery-guest-ensuite.jpg",
        title: "Guest Luxury Bathroom Suite",
        category: "Luxury Ensuites",
        description: "Dedicated guest bathroom equipped with Sea-Land vacuum sanitation, Corian countertop, mirror cabinet, and walk-in shower."
      }
    ]
  },
  g50: {
    slug: "g50",
    modelNumber: "G50",
    badge: "Motor Yacht Masterpiece",
    fullName: "ASMARATY G50 Motor Yacht",
    tagline: "The Signature of the Sea — Compact Elegance, Exceptional Comfort.",
    description:
      "A 50-foot luxury flybridge motor yacht engineered in the United Arab Emirates. Designed to deliver refined elegance and memorable cruising, featuring an open-plan salon, gourmet induction galley, 3 private staterooms, expansive entertaining flybridge, and twin 550 HP Cummins inboards.",
    insigniaSrc: "/images/yachts/g50/insignia.png",
    brochureUrl: "/documents/asmaraty-g50-brochure.pdf",
    brochureLabel: "Brochure (PDF, 6.9 MB)",
    summaryLine: "Flybridge Motor Yacht • 15.00 Metres • Hand-Laid Fiberglass Composite",
    heroImages: [
      { src: "/images/yachts/g50/hero-01.jpg", label: "Arabian Gulf Daylight Cruising Profile" },
      { src: "/images/yachts/g50/hero-02.jpg", label: "Burj Khalifa & Burj Al Arab Night Illumination" },
      { src: "/images/yachts/g50/hero-03.jpg", label: "Sunset Anchor on Calm Coastal Waters" },
      { src: "/images/yachts/g50/hero-04.jpg", label: "Illuminated Aft Cockpit & Teak Swim Platform at Dusk" }
    ],
    keyMetrics: [
      { label: "Length Overall (LOA)", main: "50 FT", sub: "15.00 Metres" },
      { label: "Maximum Beam", main: "15 FT", sub: "4.50 Metres" },
      { label: "Propulsion Power", main: "1,100 HP", sub: "2 × 550 HP Cummins Inboards" },
      { label: "Accommodations", main: "3 Cabins", sub: "6 Berths (15 Pax Capacity)" },
      { label: "Displacement", main: "15–20 TONS", sub: "Standard Load" },
      { label: "Fuel Capacity", main: "450 GAL", sub: "1,701 Liters" }
    ],
    narrative: {
      eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
      headline: "Compact Elegance Meets Exceptional Comfort",
      paragraphs: [
        "At a glance, find yourself in a world of luxury with a spacious interior, generous cockpit, and hospitable flybridge. The main deck boasts a comfortable saloon with ample lounge seating and dedicated dining space, surrounded by wide windows that bring in natural light and sweeping sea views.",
        "The flybridge serves as an elevated retreat, perfect for entertaining family and guests. It features generous wrap-around seating, sunbeds, a wet bar with BBQ grill, and a secondary steering station for commanding the waters under open skies.",
        "Accommodations are designed with privacy and comfort in mind, offering a restful haven after a day on the sea. The forward Owner's Master Suite features a Queen island bed with channel headboard and panoramic waterline ribbon windows, complemented by two twin guest staterooms and two luxury bathroom suites with circular walk-in showers."
      ],
      cards: [
        {
          icon: "Layers",
          title: "Composite Hull Engineering",
          description: "Deep V-shape keel with longitudinal stringers, hand-laid fiberglass laminate hull, and high-density foam-core sandwich deck construction."
        },
        {
          icon: "Sparkles",
          title: "Sunlit Panoramic Saloon",
          description: "Floor-to-ceiling tinted glass, stainless steel sliding doors, recessed LED ceiling spots, and pop-up high-low smart TV cabinet."
        },
        {
          icon: "Anchor",
          title: "Forward Master Suite",
          description: "Queen-size island bed (150×200cm), wood finishes, leather headboard, 40\" smart TV, wardrobe storage, and private ensuite bathroom."
        },
        {
          icon: "Compass",
          title: "Entertainer's Flybridge",
          description: "Secondary helm station with Garmin navigation, wrap-around sky lounge, teakwood flooring, bimini canopy, and full wet bar with BBQ grill."
        }
      ]
    },
    deckPlans: [
      {
        id: "main-deck",
        name: "Main Deck",
        subtitle: "Panoramic Saloon, Galley & Wheelhouse",
        image3D: "/images/yachts/g50/deck-main.png",
        caption: "3D Cutaway — Open-Plan Saloon, Gourmet Galley, Pilot House & Aft Cockpit",
        features: [
          "Air-conditioned open-plan saloon with U-shaped cream leather sofa and designer coffee table",
          "Opposing conversation couch and high-low motorized cabinet for 50\" smart TV",
          "Gourmet induction galley with Corian counters, stainless sink, ceramic cooktop, and microwave",
          "Interior pilot house with electric leather helm seat, wooden steering wheel, and dual screens",
          "Stainless-steel sliding glass doors opening seamlessly to the shaded aft cockpit",
          "Teak swim platform with telescopic boarding ladder and transom freshwater shower"
        ]
      },
      {
        id: "lower-deck",
        name: "Lower Accommodations",
        subtitle: "3 Staterooms & 2 Bathrooms (6 Berths)",
        image3D: "/images/yachts/g50/deck-lower.png",
        caption: "3D Cutaway — Forward Master Suite, Port & Starboard Guest Cabins & Engine Room",
        features: [
          "Forward Owner's Master Suite with queen island bed (150×200cm), slatted mattress & 40\" smart TV",
          "Private master ensuite bathroom with circular shower enclosure, teak grating & Sea-Land vacuum toilet",
          "Portside guest stateroom with two twin berths (60×200cm each), wardrobe, and LED reading lights",
          "Starboard guest stateroom with two twin berths (60×200cm each) and dedicated storage drawers",
          "Second luxury bathroom suite with Corian countertop, vanity mirror, and extractor fan",
          "Sound-insulated engine compartment housing twin 550 HP Cummins diesels and marine generator"
        ]
      },
      {
        id: "flybridge",
        name: "Flybridge Deck",
        subtitle: "Sky Lounge, Upper Helm & Wet Bar",
        image3D: "/images/yachts/g50/deck-flybridge.png",
        caption: "3D Cutaway — Upper Sky Lounge, Secondary Helm Station & Teak Terrace",
        features: [
          "Secondary helm station with full engine instrumentation, compass, and rudder angle indicator",
          "Garmin GPS chart plotter with integrated autopilot and depth sounder",
          "Wrap-around U-shaped passenger lounge seating with central dining table",
          "Wet bar station equipped with marine sink, beverage refrigerator, and electric BBQ grill",
          "High-grade stainless steel windshield frame and protective SS & canvas bimini top",
          "Natural teakwood flooring and aerodynamic GRP radar arch with navigation lights"
        ]
      }
    ],
    specCategories: [
      {
        id: "dimensions",
        title: "Dimensions & Capacities",
        specs: [
          { label: "Length Overall (LOA)", value: "50 ft / 15.00 m" },
          { label: "Waterline Length (LWL)", value: "40 ft / 12.00 m" },
          { label: "Maximum Beam", value: "15 ft / 4.50 m" },
          { label: "Draft at Full Load", value: "4 ft / 1.35 m" },
          { label: "Displacement", value: "15 to 20 Tons (Standard Load)" },
          { label: "Vessel Type", value: "Pleasure Boat / Luxury Motor Yacht" },
          { label: "Passenger Capacity", value: "15 Passengers" },
          { label: "Fuel Tank Capacity", value: "450 US Gal / 1,701 Liters" },
          { label: "Freshwater Capacity", value: "100 US Gal / 378 Liters" }
        ]
      },
      {
        id: "propulsion",
        title: "Propulsion & Machinery",
        specs: [
          { label: "Main Propulsion Engines", value: "2 × 550 HP Cummins Inboards (or equivalent)" },
          { label: "Reduction Gearbox", value: "Marine Gearboxes matched to Cummins Propulsion" },
          { label: "Propellers", value: "Twin 4-Bladed High-Performance Bronze Propellers" },
          { label: "Propeller Shafts", value: "Twin Heavy-Duty Stainless Steel Shafts with Water Seals" },
          { label: "Engine Exhausts", value: "Underwater Engine Exhausts for Quiet Cruising" },
          { label: "Steering System", value: "Dual-Station Hydraulic Power Steering" },
          { label: "Trim Tabs", value: "Electro-Hydraulic Trim Tabs with Helm Position Indicator" },
          { label: "Engine Cooling", value: "Closed-Circuit Fresh Water Cooling with Heat Exchangers" }
        ]
      },
      {
        id: "electrical",
        title: "Electrical, AC & Generators",
        specs: [
          { label: "Electrical Distribution", value: "220V 50Hz AC Shore/Generator + 12V / 24V DC Systems" },
          { label: "Marine Generator", value: "Sound-Shielded Marine Diesel Generator" },
          { label: "Battery Banks", value: "6 × 200 Ah Gel Batteries for Engine & Domestic Service" },
          { label: "Generator Battery", value: "1 × 120 Ah Dedicated Starting Gel Battery for Generator" },
          { label: "Battery Enclosures", value: "Acid-Proof Fiberglass Battery Boxes with Ventilated Covers" },
          { label: "Battery Charger", value: "Automatic Multi-Stage Marine Battery Charger" },
          { label: "Water Heater", value: "40-Liter Dual-Source (Engine Cooling Loop + 220V Element)" },
          { label: "Underwater Lighting", value: "6 High-Intensity Underwater LED Hull Lights" }
        ]
      },
      {
        id: "accommodations",
        title: "Accommodations & Staterooms",
        specs: [
          { label: "Total Staterooms", value: "3 Private Staterooms (Master + 2 Guest Cabins)" },
          { label: "Total Berths", value: "6 Berths (Queen Master + 4 Twin Berths)" },
          { label: "Master Stateroom", value: "Forward Island Queen Bed (150×200cm) with 40\" TV & Ensuite" },
          { label: "Port Guest Stateroom", value: "Twin Berths (60×200cm each) with Wardrobe & Nightstand" },
          { label: "Starboard Guest Stateroom", value: "Twin Berths (60×200cm each) with Reading Lights & Drawers" },
          { label: "Bathrooms / Heads", value: "2 Luxury Bathrooms with Circular Showers & Teak Grating" },
          { label: "Sanitary System", value: "Sea-Land Vacuum Toilets with 3-Way Discharge Valves" },
          { label: "Crew Facilities", value: "Dedicated Crew Berth & Private Head Compartment" }
        ]
      },
      {
        id: "navigation",
        title: "Navigation, Bridge & Deck Hardware",
        specs: [
          { label: "Radar System", value: "35 NM Colour Radar with Radome Antenna" },
          { label: "Chart Plotter & GPS", value: "Garmin Multifunction Navigation Display Suite" },
          { label: "Autopilot", value: "Integrated Autopilot hooked up to Chart Plotter" },
          { label: "Echo Sounder & Log", value: "Digital Echo Sounder & Speed Log" },
          { label: "Communications", value: "Dual-Station Marine VHF Radio with Distress Calling" },
          { label: "Searchlight", value: "Dual-Station Electric Remote-Controlled High-Intensity Searchlight" },
          { label: "Windlass & Anchor", value: "Electric Windlass with Remote + 40 kg SS Anchor & 40 m Chain" },
          { label: "Deck Hardware", value: "Marine-Grade Stainless Steel 316 Handrails, Cleats & Pulpit" }
        ]
      }
    ],
    galleryCategories: [
      "All",
      "Exterior & Decks",
      "Main Saloon & Galley",
      "Master & Guest Staterooms",
      "Luxury Ensuites",
      "Flybridge Terrace"
    ],
    gallery: [
      {
        id: "ext-daylight",
        src: "/images/yachts/g50/hero-01.jpg",
        title: "Arabian Gulf Daylight Cruising Profile",
        category: "Exterior & Decks",
        description: "The ASMARATY G50 slicing through open blue waters, showcasing its sleek hydrodynamic hull profile and raked flybridge superstructure."
      },
      {
        id: "ext-night",
        src: "/images/yachts/g50/hero-02.jpg",
        title: "Burj Khalifa Skyline Night Profile",
        category: "Exterior & Decks",
        description: "The G50 illuminated off the Dubai coastline with turquoise underwater hull lighting and iconic skyline monuments in the background."
      },
      {
        id: "ext-sunset",
        src: "/images/yachts/g50/gallery-ext-sunset.jpg",
        title: "Mangrove Shoreline Sunset Anchor",
        category: "Exterior & Decks",
        description: "Resting quietly at anchor against serene sunset waters and coastal nature, reflecting warmth and calm luxury."
      },
      {
        id: "ext-foredeck-bow",
        src: "/images/yachts/g50/gallery-foredeck-bow.jpg",
        title: "Foredeck Sunbed Island & Pulpit",
        category: "Exterior & Decks",
        description: "Spacious bow deck featuring integrated upholstered sunbed cushions, non-skid teak decking, and stainless steel safety pulpit."
      },
      {
        id: "ext-cockpit-dusk",
        src: "/images/yachts/g50/gallery-cockpit-dusk.jpg",
        title: "Illuminated Aft Cockpit & Swim Platform",
        category: "Exterior & Decks",
        description: "Dusk ambience on the aft cockpit showcasing Burmese teak decking, blue courtesy LED step lights, and direct swim platform access."
      },
      {
        id: "salon-fwd",
        src: "/images/yachts/g50/gallery-salon-fwd.jpg",
        title: "Main Saloon Looking Forward to Helm",
        category: "Main Saloon & Galley",
        description: "Bright open-plan saloon featuring cream leather lounge seating, natural wood paneling, and forward raised helm console."
      },
      {
        id: "salon-aft",
        src: "/images/yachts/g50/gallery-salon-aft.jpg",
        title: "Saloon Perspective Facing Cockpit & Sea",
        category: "Main Saloon & Galley",
        description: "Seamless connection through stainless-steel sliding doors from the comfortable salon to the open-air cockpit and ocean horizon."
      },
      {
        id: "salon-lounge",
        src: "/images/yachts/g50/gallery-salon-lounge.jpg",
        title: "Conversational Lounge & Pop-Up Media",
        category: "Main Saloon & Galley",
        description: "Luxurious L-shaped sofa seating with marble occasional table, recessed LED ceiling spots, and concealed high-low smart TV cabinet."
      },
      {
        id: "galley",
        src: "/images/yachts/g50/gallery-galley.jpg",
        title: "Gourmet Galley with Ocean View",
        category: "Main Saloon & Galley",
        description: "Chef's induction galley fitted with Corian countertops, stainless sink, ceramic cooktop, microwave oven, and panoramic sea windows."
      },
      {
        id: "helm-main",
        src: "/images/yachts/g50/gallery-helm-main.jpg",
        title: "Interior Wheelhouse Helm Station",
        category: "Main Saloon & Galley",
        description: "Ergonomic interior command station with leather captain's armchair, wood-rimmed steering wheel, Garmin displays, and full engine gauges."
      },
      {
        id: "companionway",
        src: "/images/yachts/g50/gallery-companionway.jpg",
        title: "Lower Deck Architectural Staircase",
        category: "Master & Guest Staterooms",
        description: "Illuminated companionway staircase with circular overhead skylight guiding guests gracefully to the lower deck staterooms."
      },
      {
        id: "master-stateroom",
        src: "/images/yachts/g50/gallery-master-stateroom.jpg",
        title: "Forward Owner's Master Suite",
        category: "Master & Guest Staterooms",
        description: "Forward sanctuary featuring an island queen bed (150×200cm), channel upholstered headboard, waterline ribbon windows, and 40\" smart TV."
      },
      {
        id: "guest-twin",
        src: "/images/yachts/g50/gallery-guest-twin.jpg",
        title: "Twin Guest Stateroom",
        category: "Master & Guest Staterooms",
        description: "Comfortable guest cabin with two single berths (60×200cm each), central nightstand, reading lights, and cedar-lined wardrobe storage."
      },
      {
        id: "ensuite-bath",
        src: "/images/yachts/g50/gallery-ensuite-bath.jpg",
        title: "Luxury Ensuite Bathroom Suite",
        category: "Luxury Ensuites",
        description: "Designer ensuite bathroom with circular walk-in shower, natural teak grating, Corian vanity countertop, and Sea-Land vacuum toilet."
      },
      {
        id: "fly-helm",
        src: "/images/yachts/g50/gallery-fly-helm.jpg",
        title: "Flybridge Command Station & Bimini",
        category: "Flybridge Terrace",
        description: "Elevated outdoor helm with duplicate engine controls, Garmin navigation display, protective bimini top, and quilted caramel seating."
      },
      {
        id: "fly-lounge",
        src: "/images/yachts/g50/gallery-fly-lounge.jpg",
        title: "Flybridge Sky Lounge & Dining",
        category: "Flybridge Terrace",
        description: "Spacious sky deck lounge featuring wrap-around seating, solid dining table, and wet bar for al-fresco entertaining under the sun."
      },
      {
        id: "fly-terrace",
        src: "/images/yachts/g50/gallery-fly-terrace.jpg",
        title: "Sky Terrace & Radar Arch",
        category: "Flybridge Terrace",
        description: "Aft flybridge terrace with natural teak flooring, stainless steel safety railings, and aerodynamic radar arch with satellite radome."
      }
    ]
  }
};

/**
 * Helper to get showcase by slug, including aliases
 */
export function getYachtShowcaseData(slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase().trim();
  if (s === "g100" || s === "g-100") return YACHT_SHOWCASES.g100;
  if (s === "g77" || s === "as-77" || s === "as77" || s === "g-77") return YACHT_SHOWCASES.g77;
  if (s === "g66" || s === "g-66" || s === "as-66" || s === "as66") return YACHT_SHOWCASES.g66;
  if (s === "g50" || s === "g-50" || s === "as-50" || s === "as50" || s === "g55") return YACHT_SHOWCASES.g50;
  return null;
}

/**
 * Merges authoritative CMS yacht data with static showcase visual assets.
 * CMS fields take priority for editable content, with showcase data serving as
 * authentic fallback for visual cutaways and presentation details.
 */
export function mergeYachtWithShowcase(cmsYacht, staticShowcase) {
  if (!cmsYacht && !staticShowcase) return null;

  const cms = cmsYacht || {};
  const showcase = staticShowcase || {};
  const fullName = cms.fullName || cms.name || showcase.fullName || "ASMARATY Yacht";
  const modelNumber = cms.modelNumber || showcase.modelNumber || "G-Series";
  const name = cms.name || showcase.modelNumber || fullName;
  const badge = cms.badge !== undefined ? cms.badge : (showcase.badge || "Official Model");
  const tagline = cms.tagline || showcase.tagline || "";
  const description = cms.description || showcase.description || "";
  const summaryLine = cms.summaryLine || showcase.summaryLine || "";
  const insigniaSrc = cms.insigniaSrc || showcase.insigniaSrc || "";
  const brochureUrl = cms.brochureUrl || showcase.brochureUrl || "";
  const brochureLabel = cms.brochureLabel || showcase.brochureLabel || "Brochure (PDF)";

  let heroImages = [];
  if (Array.isArray(cms.heroImages) && cms.heroImages.length > 0) {
    heroImages = cms.heroImages;
  } else if (Array.isArray(showcase.heroImages) && showcase.heroImages.length > 0) {
    heroImages = JSON.parse(JSON.stringify(showcase.heroImages));
    const primaryHero = cms.heroImage || cms.mainImage;
    if (primaryHero && heroImages[0]) {
      heroImages[0].src = primaryHero;
    }
  } else {
    const primary = cms.heroImage || cms.mainImage || "/images/yachts/g100/0.jpg";
    heroImages = [{ src: primary, label: fullName }];
  }

  // 4. Key Metrics Bar (6 cards)
  let keyMetrics = [];
  if (Array.isArray(cms.keyMetrics) && cms.keyMetrics.length > 0) {
    keyMetrics = cms.keyMetrics;
  } else if (Array.isArray(showcase.keyMetrics) && showcase.keyMetrics.length > 0) {
    keyMetrics = JSON.parse(JSON.stringify(showcase.keyMetrics));
  } else {
    const snap = cms.specsSnapshot || {};
    keyMetrics = [
      { label: "Length Overall (LOA)", main: snap.loa || "—", sub: "" },
      { label: "Maximum Beam", main: snap.beam || "—", sub: "" },
      { label: "Propulsion Power", main: snap.power || "—", sub: "" },
      { label: "Accommodations", main: snap.cabins || "—", sub: snap.berths || "" },
      { label: "Displacement", main: snap.displacement || "—", sub: "Full Load" },
      { label: "Fuel Capacity", main: snap.fuel || "—", sub: "" }
    ];
  }

  // 5. Narrative & Architecture Cards
  const narrative = {
    eyebrow: cms.narrative?.eyebrow || showcase.narrative?.eyebrow || "AT A GLANCE • ARCHITECTURAL NARRATIVE",
    headline: cms.narrative?.headline || showcase.narrative?.headline || "Crafted for Unrivaled Luxury on the Water",
    paragraphs: (cms.narrative?.paragraphs && cms.narrative.paragraphs.length > 0)
      ? cms.narrative.paragraphs
      : (showcase.narrative?.paragraphs || (description ? [description] : [])),
    cards: (cms.narrative?.cards && cms.narrative.cards.length > 0)
      ? cms.narrative.cards
      : (showcase.narrative?.cards || [])
  };

  // 6. Interactive Deck Plans
  let deckPlans = [];
  if (Array.isArray(cms.deckPlans) && cms.deckPlans.length > 0) {
    deckPlans = JSON.parse(JSON.stringify(cms.deckPlans));
  } else if (Array.isArray(showcase.deckPlans) && showcase.deckPlans.length > 0) {
    deckPlans = JSON.parse(JSON.stringify(showcase.deckPlans));
    if (cms.floorplanUrl && deckPlans[0]) {
      deckPlans[0].image3D = cms.floorplanUrl;
    }
  }

  // Ensure authoritative deck order: 1st Main Deck, 2nd Lower Deck, 3rd Flybridge Deck
  if (deckPlans.length > 1) {
    const orderRank = { "main-deck": 1, "main": 1, "lower-deck": 2, "lower": 2, "flybridge": 3, "flybridge-deck": 3 };
    deckPlans.sort((a, b) => (orderRank[a.id] || 99) - (orderRank[b.id] || 99));
  }

  // 7. Technical Specifications (11 Dimensions Sync)
  let specCategories = [];
  if (Array.isArray(cms.specCategories) && cms.specCategories.length > 0) {
    specCategories = JSON.parse(JSON.stringify(cms.specCategories));
  } else if (Array.isArray(showcase.specCategories) && showcase.specCategories.length > 0) {
    specCategories = JSON.parse(JSON.stringify(showcase.specCategories));
  }

  const snapshot = cms.specsSnapshot || cms.comparisonMatrix || {};
  if (specCategories.length > 0) {
    specCategories.forEach((cat) => {
      (cat.specs || []).forEach((specItem) => {
        const label = (specItem.label || "").toLowerCase();
        if (label.includes("length overall") || label.includes("(loa)")) {
          if (snapshot.loa) specItem.value = snapshot.loa;
        } else if (label.includes("waterline length") || label.includes("(lwl)")) {
          if (snapshot.lwl) specItem.value = snapshot.lwl;
        } else if (label.includes("beam")) {
          if (snapshot.beam) specItem.value = snapshot.beam;
        } else if (label.includes("draft")) {
          if (snapshot.draft) specItem.value = snapshot.draft;
        } else if (label.includes("displacement")) {
          if (snapshot.displacement) specItem.value = snapshot.displacement;
        } else if (label.includes("propulsion") || label.includes("engine")) {
          if (snapshot.power) specItem.value = snapshot.power;
        } else if (label.includes("stateroom") || label.includes("bedroom") || label.includes("cabin")) {
          if (snapshot.cabins) specItem.value = snapshot.cabins;
        } else if (label.includes("berth")) {
          if (snapshot.berths) specItem.value = snapshot.berths;
        } else if (label.includes("fuel")) {
          if (snapshot.fuel) specItem.value = snapshot.fuel;
        } else if (label.includes("water") && !label.includes("waterline") && !label.includes("blackwater") && !label.includes("greywater")) {
          if (snapshot.water) specItem.value = snapshot.water;
        } else if (label.includes("hull construction") || label.includes("hull material")) {
          if (snapshot.hull) specItem.value = snapshot.hull;
        }
      });
    });
  }

  // 8. Photo Gallery Synchronization
  let gallery = [];
  let galleryCategories = (Array.isArray(cms.galleryCategories) && cms.galleryCategories.length > 0)
    ? cms.galleryCategories
    : (showcase.galleryCategories || ["All", "Exterior", "Interior", "Flybridge"]);

  const showcaseGallery = showcase.gallery || [];
  if (Array.isArray(cms.gallery) && cms.gallery.length > 0) {
    gallery = cms.gallery.map((imgItem, idx) => {
      const src = typeof imgItem === "string" ? imgItem : imgItem.src || imgItem.url;
      const matched = showcaseGallery.find((sg) => sg.src === src);
      if (typeof imgItem === "object") {
        return {
          id: imgItem.id || (matched ? matched.id : `gallery-cms-${idx}`),
          src,
          title: imgItem.title || (matched ? matched.title : `${fullName} — Perspective ${idx + 1}`),
          category: imgItem.category || (matched ? matched.category : "Exterior"),
          description: imgItem.description || (matched ? matched.description : `Official shipyard visual of ${fullName}.`)
        };
      }
      if (matched) {
        return matched;
      }
      return {
        id: `gallery-cms-${idx}`,
        src,
        title: `${fullName} — Perspective ${idx + 1}`,
        category: "Exterior",
        description: `Official shipyard visual of ${fullName}.`
      };
    });
  } else if (Array.isArray(showcaseGallery) && showcaseGallery.length > 0) {
    gallery = showcaseGallery;
  }

  return {
    ...showcase,
    ...cms,
    modelNumber,
    name,
    fullName,
    badge,
    tagline,
    description,
    summaryLine,
    insigniaSrc,
    brochureUrl,
    brochureLabel,
    heroImages,
    keyMetrics,
    narrative,
    deckPlans,
    specCategories,
    gallery,
    galleryCategories,
    status: cms.status || "published",
    slug: cms.slug || showcase.slug || "g100"
  };
}

