"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Anchor,
  Check,
  Layers,
  Sparkles,
  ZoomIn,
  X,
  Compass,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Phone,
  MessageCircle,
  Wind,
  Shield,
  Gauge,
  Bed,
  Users
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";

// Auto-changing Hero Background Images for G77 (5-second crossfade)
const G77_HERO_IMAGES = [
  {
    src: "/images/yachts/g77/g77_asset_01_1672x941.jpg",
    label: "Cruising Profile on Arabian Gulf Waters"
  },
  {
    src: "/images/yachts/g77/g77_asset_29_1672x941.jpg",
    label: "Flybridge Terrace & Quilted Leather Lounge"
  },
  {
    src: "/images/yachts/g77/g77_asset_50_1672x941.jpg",
    label: "Exterior Side Elevation at Anchor"
  },
  {
    src: "/images/yachts/g77/g77_asset_71_1672x941.jpg",
    label: "Foredeck Horizon & Bow Silhouette"
  }
];

// Curated Photography Gallery for G77
const G77_GALLERY = [
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
    category: "Staterooms & Bathrooms",
    description: "Midships master sanctuary with king-size berth (200×180cm), panoramic hull windows, dressing room, and walk-in wardrobe."
  },
  {
    id: "owner-lounge",
    src: "/images/yachts/g77/g77_asset_14_1536x1024.jpg",
    title: "Owner's Suite Private Lounge",
    category: "Staterooms & Bathrooms",
    description: "Private dressing area with handcrafted wood paneling in high-gloss varnish finish and integrated wardrobe storage."
  },
  {
    id: "owner-ensuite",
    src: "/images/yachts/g77/g77_asset_16_1536x1024.jpg",
    title: "Owner's Ensuite Vanity & Grohe Fixtures",
    category: "Staterooms & Bathrooms",
    description: "Luxury master bathroom featuring Corian countertops, mirror cabinets, GROHE faucets, and Sea-Land vacuum sanitation."
  },
  {
    id: "owner-shower",
    src: "/images/yachts/g77/g77_asset_18_1536x1024.jpg",
    title: "Designer Ensuite Rain Shower",
    category: "Staterooms & Bathrooms",
    description: "Comfortable glass-enclosed rain shower with non-skid flooring, extractor ventilation, and premium marine fittings."
  },
  {
    id: "linen-detail",
    src: "/images/yachts/g77/g77_asset_20_1536x1024.jpg",
    title: "Matte Black Basin & ASMARATY Linens",
    category: "Staterooms & Bathrooms",
    description: "Signature matte black ceramic basin, high-gloss woodwork, and bespoke embroidered ASMARATY guest linens."
  },
  {
    id: "vip-cabin",
    src: "/images/yachts/g77/g77_asset_07_1536x1024.jpg",
    title: "Forward VIP Stateroom",
    category: "Staterooms & Bathrooms",
    description: "Forward stateroom featuring a centerline queen bed (160×200cm), 40\" smart TV, ample wardrobe storage, and en-suite head."
  },
  {
    id: "twin-guest",
    src: "/images/yachts/g77/g77_asset_10_1536x1024.jpg",
    title: "Twin Guest Stateroom",
    category: "Staterooms & Bathrooms",
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
];

// Interactive 3D Cutaway Deck Plans (Original Brochure Renders)
const G77_DECK_PLANS = [
  {
    id: "flybridge",
    title: "Flybridge & Bow Sunbed Deck",
    subtitle: "Upper Helm, Al-Fresco Dining, Wet Bar & Foredeck Lounge",
    cutawayImage: "/images/yachts/g77/g77_asset_30_1521x507.jpg",
    description:
      "The expansive flybridge creates a luxurious outdoor entertainment deck. Features an upper steering station with complete engine controls, Bosch Rexroth electronic throttles, full wet bar with BBQ grill and refrigerator, passenger dining table, comfortable sunbeds, and space for an optional spa hot tub. The foredeck includes built-in sunbathing cushions and anchor windlass.",
    highlights: [
      "Upper Helm Station with dual thruster joysticks & GPS chart plotter",
      "Full Wet Bar with marine refrigerator, sink, and electric BBQ grill",
      "Al-Fresco Dining table with quilted wraparound leather lounge seating",
      "Expansive aft sunbathing area with optional spa hot tub placement",
      "Integrated radar arch in GRP with 35 NM colour radar & searchlight",
      "Forward deck with integrated double sunbeds and anchor windlass"
    ]
  },
  {
    id: "main-deck",
    title: "Main Deck Saloon & Cockpit",
    subtitle: "Open-Plan Saloon, Formal Dining, Galley & Pilot House",
    cutawayImage: "/images/yachts/g77/g77_asset_31_1520x507.jpg",
    description:
      "The main deck offers seamless indoor-outdoor living. Starting from the shaded aft cockpit with upholstered bench seating, stainless-steel sliding doors open into the vast main saloon. Features curved bouclé lounge seating bathed in daylight through panoramic windows, formal glass dining for 6, gourmet galley with Corian worktops, and the interior pilot house with single-seat helm.",
    highlights: [
      "Aft Cockpit with teak table, bench seating, and dual transom stairways",
      "Panoramic Main Saloon with curved bouclé sofas & 60\" smart TV lift",
      "Formal Dining suite seating 6 guests in tailored armchairs",
      "Fully equipped Galley: ceramic cooktop, microwave, oven & fridge-freezer",
      "Enclosed Pilot House with leather console, radar, and full instruments",
      "Direct teak side-deck walkways connecting cockpit to bow sunbeds"
    ]
  },
  {
    id: "lower-deck",
    title: "Lower Deck Staterooms & Machinery",
    subtitle: "4 Guest Staterooms + 2 Crew Cabins (11 Berths Total)",
    cutawayImage: "/images/yachts/g77/g77_asset_32_1518x508.jpg",
    description:
      "The lower accommodation deck provides quiet sanctuaries for up to 11 guests and crew. Features a full-beam Owner's Stateroom midships with king bed, walk-in wardrobe, and en-suite rain shower. Forward VIP stateroom with queen bed and private bathroom, plus two twin guest cabins. Aft of the engine room lies the dedicated crew quarters with two berths, private galley, and bathroom, fronted by a hydraulic stern swim platform.",
    highlights: [
      "Full-Beam Owner's Suite: King bed (200×180cm), ocean windows & walk-in wardrobe",
      "Owner's Luxury Ensuite: Corian vanity, Sea-Land vacuum toilet & rain shower",
      "Forward VIP Stateroom: Queen bed (160×200cm), 40\" smart TV & ensuite head",
      "Two Twin Guest Staterooms: 4 berths total with storage drawers & private heads",
      "Aft Crew Quarters: 2 berths, 32\" TV, private crew galley, and separate bathroom",
      "Machinery & Platform: Twin inboards, 28 kW generator & hydraulic swim platform"
    ]
  }
];

// Exact Technical Specifications Categories (from Official Brochure)
const G77_SPEC_CATEGORIES = [
  { id: "all", label: "All Specifications" },
  { id: "dimensions", label: "Dimensions & Capacities" },
  { id: "propulsion", label: "Propulsion & Machinery" },
  { id: "electrical", label: "Electrical & Climate" },
  { id: "accommodations", label: "Accommodations & Luxury" },
  { id: "deck", label: "Deck Hardware & Navigation" }
];

const G77_SPECIFICATIONS = [
  // Dimensions & Capacities
  { category: "dimensions", label: "Length Overall (LOA)", value: "78 ft / 23.7 m", highlight: true },
  { category: "dimensions", label: "Waterline Length (LWL)", value: "66 ft / 20.1 m" },
  { category: "dimensions", label: "Maximum Beam", value: "20 ft / 6.0 m", highlight: true },
  { category: "dimensions", label: "Draft at Full Load", value: "3.5 ft / 1.06 m" },
  { category: "dimensions", label: "Height Above Waterline", value: "18 ft / 5.5 m" },
  { category: "dimensions", label: "Displacement", value: "50 Tons", highlight: true },
  {
    category: "dimensions",
    label: "Fuel Capacity (Diesel)",
    value: "1,870 US Gallons / 7,080 L",
    note: "Aluminium tanks with inspection hatches, sight gauges & helm indicators"
  },
  {
    category: "dimensions",
    label: "Freshwater Capacity",
    value: "300 US Gallons / 1,134 L",
    note: "Aluminium water tanks with sight gauges and dockside inlet"
  },
  {
    category: "dimensions",
    label: "Blackwater / Holding Tank",
    value: "120–150 US Gallons / 567 L",
    note: "With indicator at helm, macerator & Y-valve for sea or dockside pump-out"
  },

  // Propulsion & Machinery
  {
    category: "propulsion",
    label: "Engine Configuration",
    value: "Twin Inboard Diesel (600 / 800 / 1000 / 1200 HP)",
    highlight: true,
    note: "CAT, MAN, or Volvo Penta options with suitable reduction gearboxes"
  },
  { category: "propulsion", label: "Maximum Output", value: "Up to 2,400 Total HP", highlight: true },
  { category: "propulsion", label: "Exhaust System", value: "Underwater Exhausts for quiet cruising" },
  { category: "propulsion", label: "Propellers & Shafts", value: "4-Bladed Bronze Props + Twin SS 316 Shafts" },
  {
    category: "propulsion",
    label: "Steering & Trim",
    value: "Hydraulic Power Steering for 2 Stations + Electrical Hydraulic Trim Tabs"
  },
  {
    category: "propulsion",
    label: "Thrusters",
    value: "Italian Electrical Bow & Stern Thrusters with helm joystick controls"
  },
  {
    category: "propulsion",
    label: "Engine Room Clearance",
    value: "ca. 6 ft (1.83 m) Standing Height",
    note: "Steel floor plates, SS handrails, fire extinguishing system & dual 24V/220V blowers"
  },

  // Electrical & Climate
  {
    category: "electrical",
    label: "Marine Generator",
    value: "1 × 28 kW with Sound Shield",
    highlight: true,
    note: "Dedicated 120 Ah starting gel battery"
  },
  {
    category: "electrical",
    label: "Air Conditioning",
    value: "210,000 BTU Chilled Water System",
    highlight: true,
    note: "Independent digital thermostats across all staterooms and main saloon"
  },
  {
    category: "electrical",
    label: "Electrical Power",
    value: "220V 50Hz AC Shore/Gen + 12V / 24V DC Systems",
    note: "8 × 200 Ah Gel Batteries in acid-proof fiberglass boxes"
  },
  {
    category: "electrical",
    label: "Water Heater",
    value: "60 L Dual-Source Water Heater",
    note: "Engine cooling loop heat-exchange + 220V heating element"
  },
  { category: "electrical", label: "Lighting", value: "LED Ambient Recessed Spots & Step Courtesy Lights" },

  // Accommodations & Luxury
  {
    category: "accommodations",
    label: "Staterooms & Cabins",
    value: "4 Guest Staterooms + 2 Crew Cabins",
    highlight: true
  },
  {
    category: "accommodations",
    label: "Total Sleeping Berths",
    value: "8 Guest Berths + 3 Crew Berths (11 Total)",
    highlight: true
  },
  {
    category: "accommodations",
    label: "Owner's Master Suite",
    value: "Full-Beam King Bed (200×180cm)",
    note: "60\" Smart TV, sound system, walk-in wardrobe, dressing area & marble ensuite rain shower"
  },
  {
    category: "accommodations",
    label: "Forward VIP Stateroom",
    value: "Centerline Queen Bed (160×200cm)",
    note: "40\" Smart TV, wardrobe with integrated lighting & private ensuite bathroom"
  },
  {
    category: "accommodations",
    label: "Twin Guest Staterooms",
    value: "Two Twin Cabins (4 Berths Total)",
    note: "Slatted mattresses, reading lights, under-berth storage drawers & ensuite heads"
  },
  {
    category: "accommodations",
    label: "Crew Accommodation",
    value: "Aft Crew Quarters with 2 Beds & Galley",
    note: "32\" Smart TV, private crew mess, dedicated galley, and separate head with shower"
  },
  {
    category: "accommodations",
    label: "Sanitary Systems",
    value: "Sea-Land Vacuum Toilets with 3-Way Valves & GROHE Faucets"
  },

  // Deck Hardware & Navigation
  {
    category: "deck",
    label: "Hull & Deck Construction",
    value: "Deep V-shape Keel, ISO Certified Fiber & Honeycomb Support",
    highlight: true
  },
  {
    category: "deck",
    label: "Hydraulic Stern Platform",
    value: "Heavy-Duty Submersible Swim Platform",
    highlight: true,
    note: "Standard specification for tender, jet ski launch & beach-club water access"
  },
  {
    category: "deck",
    label: "Anchor & Windlass",
    value: "40 kg Galvanised Anchor + 90 m 12 mm Chain",
    note: "Electric windlass with remote operation & anchor locker wash-down outlet"
  },
  {
    category: "deck",
    label: "Navigation Suite",
    value: "35 NM Colour Radar, Dual Chart Plotters with GPS & Autopilot",
    note: "Compass, sounder, speed log, dual VHF radio stations & remote searchlight"
  },
  {
    category: "deck",
    label: "Flybridge Amenities",
    value: "Full Wet Bar, Fridge, BBQ Grill & Optional Spa Hot Tub",
    note: "Teakwood flooring, Fusion marine audio, and SS framed windscreen"
  },
  {
    category: "deck",
    label: "Deck Hardware & Fittings",
    value: "Handrail, Cleats & Fittings in Marine Grade SS 316",
    note: "Sausage fenders (6 pcs), mooring lines (3 pcs), and boathooks included"
  }
];

export default function G77DetailPage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeDeckTab, setActiveDeckTab] = useState("flybridge");
  const [activeGalleryFilter, setActiveGalleryFilter] = useState("All");
  const [activeSpecCategory, setActiveSpecCategory] = useState("all");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [zoomModalImage, setZoomModalImage] = useState(null);

  // Auto-changing banner: advances every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % G77_HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter gallery images
  const filteredGallery =
    activeGalleryFilter === "All"
      ? G77_GALLERY
      : G77_GALLERY.filter((item) => item.category === activeGalleryFilter);

  // Filter specifications
  const filteredSpecs =
    activeSpecCategory === "all"
      ? G77_SPECIFICATIONS
      : G77_SPECIFICATIONS.filter((s) => s.category === activeSpecCategory);

  const currentDeck = G77_DECK_PLANS.find((d) => d.id === activeDeckTab) || G77_DECK_PLANS[0];

  // Lightbox navigation
  const handleNextLightbox = () => {
    if (!lightboxImage) return;
    const currentIndex = filteredGallery.findIndex((img) => img.id === lightboxImage.id);
    const nextIndex = (currentIndex + 1) % filteredGallery.length;
    setLightboxImage(filteredGallery[nextIndex]);
  };

  const handlePrevLightbox = () => {
    if (!lightboxImage) return;
    const currentIndex = filteredGallery.findIndex((img) => img.id === lightboxImage.id);
    const prevIndex = (currentIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setLightboxImage(filteredGallery[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-[#06090E] text-[#E5E9F0] selection:bg-[#C8A870] selection:text-black">
      <PublicNavbar />

      <main className="relative">
        {/* ================================================================= */}
        {/* 1. HERO SECTION WITH AUTO-CHANGING BANNER (NO MANUAL BUTTON BAR)  */}
        {/* ================================================================= */}
        <section className="relative h-[92vh] min-h-[640px] max-h-[960px] w-full overflow-hidden flex items-end">
          {/* Background Crossfade Layers */}
          {G77_HERO_IMAGES.map((img, idx) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === heroIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
              style={{
                backgroundImage: `url(${img.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center 42%",
                transition: "opacity 1.2s ease-in-out, transform 8s ease-out"
              }}
              aria-hidden={idx !== heroIndex}
            />
          ))}

          {/* Luxury Atmospheric Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06090E] via-[#06090E]/40 to-[#06090E]/60 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(6,9,14,0.7)_100%)] pointer-events-none" />

          {/* Hero Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16 space-y-6">
            {/* Top Breadcrumb & Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/yachts"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-[#C8A870] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>FLEET COLLECTION</span>
              </Link>
              <span className="text-white/20">•</span>
              <span className="text-xs uppercase tracking-luxury text-white/70 font-mono">
                MODEL DOSSIER: G77
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8A870]/15 border border-[#C8A870]/40 text-[#C8A870] text-[10px] tracking-widest font-semibold uppercase">
                <Sparkles className="w-2.5 h-2.5" />
                THREE-DECK MASTERPIECE
              </span>
            </div>

            {/* Model Title & Tagline */}
            <div className="space-y-3 max-w-4xl">
              <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C8A870] font-medium block">
                ASMARATY G-SERIES • 78 FT LUXURY MOTOR YACHT
              </span>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-none">
                ASMARATY G77
              </h1>
              <p className="text-base sm:text-xl text-[#B9C4D0] font-light leading-relaxed max-w-3xl">
                The Signature of the Sea — Where master craftsmanship meets panoramic horizons.
                Featuring an open-plan saloon, welcoming flybridge terrace, full-beam owner's suite,
                and four expansive guest staterooms across three generous decks.
              </p>
            </div>

            {/* Direct Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#C8A870] hover:bg-[#D4B67F] text-black font-semibold text-xs uppercase tracking-luxury transition-all shadow-lg hover:shadow-[#C8A870]/20"
              >
                <span>BOOK SEA TRIAL / INQUIRE</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href="#deck-plans"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-medium text-xs uppercase tracking-luxury transition-all backdrop-blur-sm"
              >
                <Layers className="w-4 h-4 text-[#C8A870]" />
                <span>3D DECK PLANS</span>
              </a>

              <a
                href="#specifications"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-medium text-xs uppercase tracking-luxury transition-all backdrop-blur-sm"
              >
                <Sliders className="w-4 h-4 text-[#C8A870]" />
                <span>SPECIFICATIONS</span>
              </a>
            </div>

            {/* Key Metrics Floating Strip */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 border-t border-white/10">
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">LENGTH OVERALL</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">78 ft (23.7 m)</span>
              </div>
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">MAXIMUM BEAM</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">20 ft (6.0 m)</span>
              </div>
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">ACCOMMODATION</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">4 + 2 Cabins</span>
              </div>
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">SLEEPING BERTHS</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">11 Berths Total</span>
              </div>
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">PROPULSION</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">Twin Inboard</span>
              </div>
              <div className="p-3 bg-[#0E1520]/80 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase tracking-luxury text-[#8A97A6] block">CLIMATE CONTROL</span>
                <span className="text-sm sm:text-base font-serif text-white font-medium">210,000 BTU</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. OVERVIEW & ARCHITECTURAL NARRATIVE SECTION                     */}
        {/* ================================================================= */}
        <section id="overview" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                OFFICIAL FLEET ARCHITECTURE • THE SIGNATURE OF THE SEA
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                Crafted for Expansive Horizons & Supreme Comfort
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[#9DAAB8] font-light leading-relaxed">
                <p>
                  At a glance, find yourself in a world of luxury aboard the <strong className="text-white font-medium">ASMARATY G77</strong>.
                  Conceived for owners who value both effortless entertaining and confident blue-water seakeeping,
                  this 78-foot three-deck yacht unites expansive social spaces with peerless privacy.
                </p>
                <p>
                  The main deck welcomes you into a bright, open-plan salon bathed in Arabian daylight through sweeping
                  panoramic side windows. Formal dining for six, a concealed gourmet galley with Corian surfaces,
                  and an ergonomic interior pilot house establish an atmosphere of serene sophistication.
                </p>
                <p>
                  Above, the generous flybridge terrace stands ready for midday relaxation or sunset celebrations,
                  complete with an al-fresco dining table, full wet bar with BBQ grill, upper helm station, and space
                  for an optional spa jacuzzi. Below, four luxurious guest staterooms and private aft crew quarters
                  deliver uninterrupted tranquility for up to eleven guests.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-[#C8A870] hover:text-white font-medium group transition-colors"
                >
                  <span>REQUEST CONFIDENTIAL DOSSIER & VIEWING</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Architectural Highlight Card */}
            <div className="lg:col-span-5 relative group">
              <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-[#0E1520]">
                <img
                  src="/images/yachts/g77/g77_asset_29_1672x941.jpg"
                  alt="ASMARATY G77 Flybridge Terrace Lounge"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left space-y-1">
                  <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-semibold">
                    FLYBRIDGE ENTERTAINING TERRACE
                  </span>
                  <p className="text-xs text-white/90 font-light">
                    Teakwood decking, diamond-quilted leather lounges, full wet bar with BBQ grill, and 360° panoramic seascape views.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Architectural Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="p-6 bg-[#0E1520]/60 border border-white/10 hover:border-[#C8A870]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C8A870]/10 flex items-center justify-center text-[#C8A870]">
                <Wind className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-white font-medium">Hospitable Flybridge</h3>
              <p className="text-xs text-[#8E9CAE] leading-relaxed">
                Upper steering console, dual thruster joysticks, al-fresco dining table, sunbeds, wet bar, and optional spa jacuzzi.
              </p>
            </div>

            <div className="p-6 bg-[#0E1520]/60 border border-white/10 hover:border-[#C8A870]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C8A870]/10 flex items-center justify-center text-[#C8A870]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-white font-medium">Sunlit Panoramic Saloon</h3>
              <p className="text-xs text-[#8E9CAE] leading-relaxed">
                Sweeping floor-to-ceiling side windows, curved bouclé sofas, 60\" smart TV cabinet lift, and formal 6-seater dining suite.
              </p>
            </div>

            <div className="p-6 bg-[#0E1520]/60 border border-white/10 hover:border-[#C8A870]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C8A870]/10 flex items-center justify-center text-[#C8A870]">
                <Bed className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-white font-medium">Full-Beam Owner's Suite</h3>
              <p className="text-xs text-[#8E9CAE] leading-relaxed">
                King-size double bed (200×180cm), hull-view ocean windows, walk-in dressing wardrobe, and ensuite marble rain shower.
              </p>
            </div>

            <div className="p-6 bg-[#0E1520]/60 border border-white/10 hover:border-[#C8A870]/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#C8A870]/10 flex items-center justify-center text-[#C8A870]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-white font-medium">4+2 Stateroom Layout</h3>
              <p className="text-xs text-[#8E9CAE] leading-relaxed">
                Forward queen VIP cabin, two twin guest cabins, and independent aft crew quarters with private galley and head.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. INTERACTIVE 3D CUTAWAY DECK PLANS (GENERAL ARRANGEMENT)        */}
        {/* ================================================================= */}
        <section id="deck-plans" className="py-20 sm:py-28 bg-[#090D14] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                ARCHITECTURAL GENERAL ARRANGEMENT (GA)
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                Three-Deck 3D Cutaway Blueprints
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                Explore the authentic 3D interior architecture of the ASMARATY G77.
                Switch between the Flybridge, Main Deck Saloon, and Lower Stateroom Deck to inspect layouts and spatial volumes.
              </p>
            </div>

            {/* Deck Selector Tabs */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-[#06090E] border border-white/10 rounded-none">
                {G77_DECK_PLANS.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => setActiveDeckTab(deck.id)}
                    className={`px-5 py-3 text-xs uppercase tracking-luxury font-medium transition-all ${
                      activeDeckTab === deck.id
                        ? "bg-[#C8A870] text-black shadow-md font-semibold"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {deck.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Deck Display Card */}
            <div className="bg-[#0E1520] border border-white/10 p-6 sm:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-serif text-2xl text-white font-medium">{currentDeck.title}</h3>
                  <span className="text-xs text-[#C8A870] tracking-luxury uppercase">{currentDeck.subtitle}</span>
                </div>
                <button
                  onClick={() => setZoomModalImage(currentDeck.cutawayImage)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-white uppercase tracking-luxury transition-colors self-start md:self-auto"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#C8A870]" />
                  <span>Inspect High-Res Blueprint</span>
                </button>
              </div>

              {/* 3D Cutaway Graphic */}
              <div className="relative aspect-[3/1] min-h-[220px] max-h-[380px] bg-black/60 flex items-center justify-center p-4 border border-white/5 overflow-hidden">
                <img
                  src={currentDeck.cutawayImage}
                  alt={`${currentDeck.title} 3D Cutaway GA`}
                  className="w-full h-full object-contain cursor-zoom-in"
                  onClick={() => setZoomModalImage(currentDeck.cutawayImage)}
                />
              </div>

              {/* Deck Narrative & Feature Badges */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-semibold block">
                    DECK SPATIAL ARCHITECTURE
                  </span>
                  <p className="text-xs sm:text-sm text-[#9DAAB8] leading-relaxed font-light">
                    {currentDeck.description}
                  </p>
                </div>
                <div className="lg:col-span-7">
                  <span className="text-xs uppercase tracking-luxury text-white/70 font-semibold block mb-3">
                    KEY APPOINTMENTS & SPECIFICATIONS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentDeck.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#B2C0D0]">
                        <Check className="w-3.5 h-3.5 text-[#C8A870] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. CURATED HIGH-RESOLUTION PHOTOGRAPHY GALLERY                    */}
        {/* ================================================================= */}
        <section id="gallery" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                AUTHENTIC VESSEL PHOTOGRAPHY
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                Curated Photographic Showcase
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light">
                High-resolution photography captured from the official ASMARATY G77 dossier.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {["All", "Exterior & Flybridge", "Main Saloon & Dining", "Staterooms & Bathrooms"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveGalleryFilter(filter)}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-luxury font-medium transition-all border ${
                    activeGalleryFilter === filter
                      ? "bg-[#C8A870] border-[#C8A870] text-black font-semibold"
                      : "bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/30"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="group relative aspect-[4/3] bg-[#0E1520] border border-white/10 overflow-hidden cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/60 backdrop-blur-sm border border-white/15 text-white">
                  <Maximize2 className="w-3.5 h-3.5 text-[#C8A870]" />
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-left space-y-1">
                  <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-medium block">
                    {item.category}
                  </span>
                  <h4 className="font-serif text-sm text-white font-medium group-hover:text-[#C8A870] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#A6B4C4] font-light line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 5. EXACTING TECHNICAL SPECIFICATIONS DOSSIER                      */}
        {/* ================================================================= */}
        <section id="specifications" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
              OFFICIAL BROCHURE DATA • NAVAL ARCHITECTURE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              Technical Specifications Dossier
            </h2>
            <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
              Exacting engineering standards, propulsion systems, and capacity matrices as certified by ASMARATY Marine Engineering for the G77.
            </p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-white/10 pb-4">
            {G77_SPEC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSpecCategory(cat.id)}
                className={`px-4 py-2 text-xs uppercase tracking-luxury font-medium transition-all border ${
                  activeSpecCategory === cat.id
                    ? "bg-[#C8A870] border-[#C8A870] text-black font-semibold"
                    : "bg-transparent border-white/10 text-white/70 hover:text-white hover:border-white/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Specifications Matrix Table */}
          <div className="bg-[#0E1520] border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/10">
              {filteredSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                    spec.highlight ? "bg-[#C8A870]/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-luxury text-white font-medium">
                      {spec.label}
                    </span>
                    {spec.note && (
                      <p className="text-[11px] text-[#8E9CAE] font-light">{spec.note}</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <span
                      className={`font-serif text-sm sm:text-base font-medium ${
                        spec.highlight ? "text-[#C8A870]" : "text-white/90"
                      }`}
                    >
                      {spec.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 6. CALL TO ACTION: PRIVATE VIEWING (ALL BUTTONS REDIRECT TO /CONTACT) */}
        {/* ================================================================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0E1520] via-[#141C2A] to-[#0E1520] border border-[#C8A870]/30 p-8 sm:p-14 text-center space-y-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C8A870] font-semibold block">
                PRIVATE VIEWINGS & SEA TRIALS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white font-light">
                Experience the ASMARATY G77 Firsthand
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                We coordinate confidential dockside viewings and sea trials departing from Dubai Harbour Marina for qualified prospective owners and yacht management representatives.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C8A870] hover:bg-[#D4B67F] text-black font-semibold text-xs uppercase tracking-luxury transition-all shadow-lg hover:shadow-[#C8A870]/20"
              >
                <span>REQUEST PRIVATE VIEWING / CONSULTATION</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href="https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20request%20a%20private%20viewing%20for%20the%20G77%20yacht."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-medium text-xs uppercase tracking-luxury transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>CHAT ON WHATSAPP</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ================================================================= */}
      {/* LIGHTBOX MODAL FOR CURATED GALLERY                                */}
      {/* ================================================================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col bg-[#0A0E17] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-semibold block">
                  {lightboxImage.category}
                </span>
                <h3 className="font-serif text-lg text-white font-medium">{lightboxImage.title}</h3>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative flex-1 min-h-[300px] max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full h-full object-contain"
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-3 p-3 bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextLightbox}
                className="absolute right-3 p-3 bg-black/60 hover:bg-black/90 text-white border border-white/15 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 text-xs text-[#8E9CAE]">
              {lightboxImage.description}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ZOOM MODAL FOR 3D GA DECK PLANS                                   */}
      {/* ================================================================= */}
      {zoomModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setZoomModalImage(null)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col bg-[#0A0E17] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-semibold">
                ASMARATY G77 • 3D GENERAL ARRANGEMENT CUTAWAY
              </span>
              <button
                onClick={() => setZoomModalImage(null)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close blueprint zoom"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative flex-1 min-h-[400px] max-h-[75vh] bg-black/80 flex items-center justify-center p-4 overflow-auto">
              <img
                src={zoomModalImage}
                alt="3D General Arrangement Cutaway"
                className="w-full h-auto object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}

