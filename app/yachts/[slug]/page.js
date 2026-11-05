"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Anchor,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
  ZoomIn,
  X,
  Download,
  Compass,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  FileText
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getYachtBySlug, getAllYachts, syncYachtsFromServer } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Per user instruction, only G100 detail page is active; all other yacht slugs show Under Construction.
 */
const IS_UNDER_CONSTRUCTION = true;

// Original G100 Curated Photography Gallery
const G100_GALLERY = [
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
    description: "Al-fresco Burma teak dining table for 8, full wet bar, BBQ grill, and sun loungers under the composite hardtop."
  },
  {
    id: "fly-helm",
    src: "/images/yachts/g100/27.jpg",
    title: "Flybridge Upper Helm Station",
    category: "Flybridge, Decks & Helm",
    description: "Secondary steering station featuring Garmin nautical chart plotter, thruster joystick control, and 360-degree visibility."
  },
  {
    id: "deck-cockpit-dining",
    src: "/images/yachts/g100/23.jpg",
    title: "Shaded Aft Cockpit Dining",
    category: "Flybridge, Decks & Helm",
    description: "Curved Burma teak dining table, sweeping banquette seating, teak stairs up to flybridge, and Ain Dubai view."
  },
  {
    id: "deck-cockpit-marina",
    src: "/images/yachts/g100/24.jpg",
    title: "Cockpit Marina Panorama",
    category: "Flybridge, Decks & Helm",
    description: "Expansive aft entertaining area overlooking the iconic towers of Jumeirah Beach Residence and Dubai Marina."
  },
  {
    id: "deck-foredeck-windlass",
    src: "/images/yachts/g100/28.jpg",
    title: "Foredeck Mooring & Anchor Station",
    category: "Flybridge, Decks & Helm",
    description: "Hand-laid Burma teak foredeck equipped with twin heavy-duty stainless steel anchor winches and windlass systems."
  },
  {
    id: "deck-bow-sunbed",
    src: "/images/yachts/g100/29.jpg",
    title: "Bow Circular Sunbed Lounge",
    category: "Flybridge, Decks & Helm",
    description: "Generous circular sunbathing island on the bow for sun worshippers, offering front-row vistas across the Arabian Gulf."
  },
  {
    id: "helm-pilothouse",
    src: "/images/yachts/g100/10.jpg",
    title: "Main Pilothouse Glass Cockpit",
    category: "Flybridge, Decks & Helm",
    description: "Advanced bridge helm station with dual high-definition multifunction displays, leather pilot seat, and full vessel telemetry."
  }
];

// Interactive Deck Plans Data
const DECK_PLANS = [
  {
    id: "flybridge",
    name: "Flybridge Deck",
    subtitle: "Sky Lounge & Al-Fresco Entertainment",
    image3D: "/images/yachts/g100/34.jpg",
    caption: "3D Cutaway Render — Flybridge Sky Deck with Upper Helm, Bar & Dining",
    features: [
      "Secondary full-instrumentation steering station with Garmin chartplotter",
      "Full wet bar counter with built-in ice maker, refrigerator & sink",
      "Integrated electric BBQ grill system for open-air culinary entertainment",
      "8-person solid teak al-fresco dining table with luxury wicker armchairs",
      "Forward circular sunbed lounge and optional Jacuzzi / hot tub placement",
      "Custom composite hardtop with recessed LED downlights and stereo speakers"
    ]
  },
  {
    id: "main-deck",
    name: "Main Deck",
    subtitle: "Panoramic Saloon & Formal Dining",
    image3D: "/images/yachts/g100/33.jpg",
    caption: "3D Cutaway Render — Main Deck with Salon, Dining, Galley & VIP Cabin",
    features: [
      "Expansive shaded aft cockpit with curved teak dining table for up to 12 guests",
      "Large electronically operated curved stainless steel sliding door to salon",
      "Sunlit main saloon surrounded by panoramic floor-to-ceiling side windows",
      "Formal dining area for 8 pax with Samsung television & Bose sound system",
      "Full professional galley with Corian countertops, electric oven & dishwasher",
      "Forward main-deck VIP stateroom and day head with marble finishes"
    ]
  },
  {
    id: "lower-deck",
    name: "Lower Deck",
    subtitle: "Owner's Stateroom & Guest Accommodations",
    image3D: "/images/yachts/g100/32.jpg",
    caption: "3D Cutaway Render — Lower Deck Staterooms, Engine Room & Crew Quarters",
    features: [
      "Full-beam Owner's Master Suite with King bed, dressing room & walk-in wardrobe",
      "Private Master Ensuite featuring walk-in rain shower with panoramic ocean view",
      "Forward VIP Stateroom with queen berth, private ensuite & ample storage",
      "Two dedicated twin guest staterooms (port & starboard) with individual heads",
      "Soundproofed engine room housing twin 1,600 hp MTU propulsion units & ZF gearboxes",
      "Independent crew quarters (2 cabins, 5 berths) with private galley & bathroom"
    ]
  },
  {
    id: "blueprint",
    name: "Architectural GA Blueprint",
    subtitle: "Official General Arrangement Drawings",
    image3D: "/images/yachts/g100/31.jpg",
    caption: "Official ASMARATY G100 General Arrangement (GA) Technical Blueprint (Flybridge, Main Deck & Lower Deck)",
    features: [
      "Complete 2D technical layout drawn to naval architectural scale",
      "Detailed structural bulkheads, safety egress paths & escape hatches",
      "Fuel tank, freshwater tank, blackwater & greywater tank locations",
      "Chain locker room, hydraulic steering compartment & tender bay dimensions",
      "Comprehensive machinery arrangement and electrical distribution centers"
    ]
  }
];

// Technical Specification Dossier Categories
const SPEC_CATEGORIES = [
  {
    id: "dimensions",
    title: "Dimensions & Naval Architecture",
    specs: [
      { label: "Length Overall (LOA)", value: "100 Feet / 30.48 m" },
      { label: "Length Waterline (LWL)", value: "85 Feet / 25.91 m" },
      { label: "Maximum Beam", value: "22.91 Feet / 6.98 m" },
      { label: "Draft (at Full Load)", value: "7.5 Feet / 2.28 m" },
      { label: "Height Above Waterline", value: "18 Feet / 5.49 m" },
      { label: "Displacement", value: "95 Tons" },
      { label: "Hull Construction", value: "Hand-Laid GRP with Foam-Filled Honeycomb Core" },
      { label: "Keel & Chines", value: "Solid Fiberglass Laminate Keel & Chines" },
      { label: "Exterior Finish", value: "High-Performance Splinter-Resistant Exterior Gel Coat" }
    ]
  },
  {
    id: "propulsion",
    title: "Propulsion & Machinery",
    specs: [
      { label: "Main Engines", value: "2 × 1,600 hp MTU Diesel Engines" },
      { label: "Gearboxes", value: "ZF Reduction Marine Gearboxes" },
      { label: "Propellers", value: "5-Bladed Nickel-Aluminum-Bronze Propellers" },
      { label: "Exhaust System", value: "Underwater Main Engine Exhaust with Idle Bypass" },
      { label: "Steering", value: "Electro-Hydraulic 24V Power Steering System" },
      { label: "Air Conditioning", value: "24-Ton Chiller Water Climate System" },
      { label: "Freshwater Maker", value: "Marine Reverse-Osmosis Desalination System" },
      { label: "Water Heater", value: "Marine 160 Liters Quick-Recovery Water Heater" },
      { label: "Engine Room Insulation", value: "Acoustical & Thermal Multi-Layer Heavy Insulation" }
    ]
  },
  {
    id: "capacities",
    title: "Capacities & Electrical",
    specs: [
      { label: "Fuel Capacity", value: "2,900 US Gallons / 10,970 Liters (Aluminum Tanks)" },
      { label: "Freshwater Capacity", value: "670 US Gallons / 2,536 Liters" },
      { label: "Blackwater Tank", value: "334 US Gallons / 1,265 Liters (with Sewage Treatment)" },
      { label: "Greywater Tank", value: "334 US Gallons / 1,265 Liters" },
      { label: "Marine Generators", value: "Twin 50 KVA Heavy-Duty Generators" },
      { label: "Shore Power", value: "150A / 220V Dual Inlets (Port & Stbd) with 24V Auto Reel" },
      { label: "DC System", value: "Heavy-Duty 24V Battery Banks & Automated Chargers" },
      { label: "Deck Washdown", value: "Fresh & Sea Water Outlets (Fore & Aft Decks)" }
    ]
  },
  {
    id: "accommodations",
    title: "Accommodations & Deck Living",
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
];

function G100DetailPage() {
  // Active Hero Background
  const heroImages = [
    { src: "/images/yachts/g100/0.jpg", label: "Burj Al Arab Daylight" },
    { src: "/images/yachts/g100/5.jpg", label: "Dubai Marina Sunset" },
    { src: "/images/yachts/g100/37.jpg", label: "Atlantis The Royal" },
    { src: "/images/yachts/g100/43.jpg", label: "Ain Dubai Night Illumination" }
  ];
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Deck Plan Interactive State
  const [activeDeckTab, setActiveDeckTab] = useState("flybridge");

  // Specs Tab State
  const [activeSpecCategory, setActiveSpecCategory] = useState("dimensions");

  // Gallery Filter & Lightbox State
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Filter gallery items
  const filteredGallery = galleryFilter === "All"
    ? G100_GALLERY
    : G100_GALLERY.filter((item) => item.category === galleryFilter);

  // Lightbox navigation
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredGallery.length - 1));
  };
  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev < filteredGallery.length - 1 ? prev + 1 : 0));
  };

  const activeDeck = DECK_PLANS.find((d) => d.id === activeDeckTab) || DECK_PLANS[0];
  const activeSpec = SPEC_CATEGORIES.find((s) => s.id === activeSpecCategory) || SPEC_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] selection:bg-[#C8A870] selection:text-[#080B10]">
      <PublicNavbar />

      <main>
        {/* Top Breadcrumb & Status Ribbon */}
        <section className="bg-[#0A0D14] border-b border-white/5 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#828F9E]">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/yachts" className="hover:text-white transition-colors">Fleet</Link>
              <span>/</span>
              <span className="text-[#C8A870] font-medium">ASMARATY G100 Super Yacht</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C8A870]/10 border border-[#C8A870]/30 text-[#E5C392] text-[11px] uppercase tracking-wider font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870] animate-pulse"></span>
                Official Flagship Model
              </span>
              <a
                href="/documents/asmaraty-g100-brochure.pdf"
                download="ASMARATY-G100-Official-Brochure.pdf"
                className="hidden sm:inline-flex items-center gap-1.5 text-[#C8A870] hover:text-white transition-colors text-xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Brochure (PDF, 25.7 MB)</span>
              </a>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-end overflow-hidden">
          {/* Background Image Carousel */}
          <div className="absolute inset-0 bg-[#080B10]">
            <img
              src={heroImages[activeHeroIdx].src}
              alt={heroImages[activeHeroIdx].label}
              className="w-full h-full object-cover object-center transition-all duration-1000 scale-[1.01]"
            />
            {/* Dark & Gold Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B10]/85 via-[#080B10]/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(8,11,16,0.6)_100%)] pointer-events-none"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16 w-full pt-32 sm:pt-40">
            <div className="max-w-3xl space-y-6">
              {/* Official Metallic Winged Insignia Emblem */}
              <div className="flex items-center gap-4">
                <img
                  src="/images/yachts/g100/2.png"
                  alt="ASMARATY G100 Insignia Emblem"
                  className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                />
                <div className="h-8 w-[1px] bg-white/20"></div>
                <div className="space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#E5C392] font-semibold block">
                    Al Shaali Marine Shipyard
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#9DAAB8] tracking-wider block">
                    UAE Shipbuilding Heritage Since 1979
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] tracking-tight">
                  ASMARATY <span className="font-sans font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#E5C392] to-[#C8A870]">G100</span>
                </h1>
                <p className="mt-3 text-lg sm:text-2xl text-[#E0E6EF] font-light max-w-2xl leading-relaxed">
                  The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur.
                </p>
              </div>

              {/* Key Highlights Subtitle */}
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light max-w-xl leading-relaxed">
                A 100-foot tri-deck luxury superyacht engineered in the United Arab Emirates. Featuring a hand-laid honeycomb-cored composite hull, floor-to-ceiling panoramic salon, full-beam owner stateroom, and expansive entertaining flybridge.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/contact"
                  className="saxdor-btn-solid !h-[52px] px-8 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
                >
                  <span>Book Private Viewing</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href="/documents/asmaraty-g100-brochure.pdf"
                  download="ASMARATY-G100-Official-Brochure.pdf"
                  className="saxdor-btn-outline !h-[52px] px-6 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2 bg-[#080B10]/60 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4 text-[#C8A870]" />
                  <span>Download Brochure (PDF)</span>
                </a>

                <a
                  href="#deck-plans"
                  className="text-xs uppercase tracking-luxury text-[#E5C392] hover:text-white px-4 py-3 transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore 3D Deck Plans</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Hero Background Selector Pills */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-[#828F9E] text-[11px] uppercase tracking-wider mr-2 hidden sm:inline">
                  Vessel Perspectives:
                </span>
                {heroImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeroIdx(idx)}
                    className={`px-3 py-1.5 text-xs transition-all border ${
                      activeHeroIdx === idx
                        ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870]"
                        : "bg-[#0A0D14]/80 text-[#C9D2DF] border-white/10 hover:border-white/30"
                    }`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>

              <div className="text-right text-[11px] text-[#828F9E] tracking-wider uppercase hidden md:block">
                Flagship Superyacht • 30.48 Metres • GRP Composite
              </div>
            </div>
          </div>
        </section>

        {/* Floating Key Metrics Strip */}
        <section className="bg-[#0C1017] border-y border-white/10 py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Length Overall (LOA)
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">100 FT</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">30.48 Metres</span>
            </div>

            <div className="space-y-1 border-l border-white/5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Maximum Beam
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">22.91 FT</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">6.98 Metres</span>
            </div>

            <div className="space-y-1 border-l border-white/5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Propulsion Power
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">3,200 HP</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">2 × 1,600 HP MTU</span>
            </div>

            <div className="space-y-1 border-l border-white/5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Accommodations
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">5 + 2 Staterooms</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">12 + 5 Berths (17 Pax)</span>
            </div>

            <div className="space-y-1 border-l border-white/5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Displacement
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">95 TONS</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">Full Load</span>
            </div>

            <div className="space-y-1 border-l border-white/5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                Fuel Capacity
              </span>
              <p className="font-serif text-xl sm:text-2xl text-white font-medium">2,900 GAL</p>
              <span className="text-[11px] text-[#C8A870] font-mono block">10,970 Liters</span>
            </div>
          </div>
        </section>

        {/* Overview & Architectural Narrative Section */}
        <section id="overview" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                  AT A GLANCE • ARCHITECTURAL NARRATIVE
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                  Crafted for Unrivaled Luxury on the Water
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#9DAAB8] font-light leading-relaxed">
                <p>
                  Find yourself in a world of luxury with spacious interiors, a generous Burma teak cockpit, and a hospitable tri-deck flybridge. The main deck boasts an expansive open-plan saloon and formal dining area surrounded by ample lounge seating bathed in natural daylight thanks to broad, seamless panoramic side windows.
                </p>
                <p>
                  The flybridge creates an elevated gathering point ideal for sunset cruising or midday relaxation across all three levels. The clever arrangement on the sky deck allows for an optional hot tub, generous sunbeds, a secondary steering station, and a full wet bar with BBQ grill for guests to savor.
                </p>
                <p>
                  Providing exceptional comfort and privacy, the reinforced hull allows in an impressive amount of natural ocean light into every cabin. The spacious full-beam Owner's cabin is fitted with a King bed, an en-suite marble bathroom, and a walk-in wardrobe, accompanied by a forward VIP stateroom and twin guest cabins.
                </p>
              </div>

              {/* Shipyard Trust Badge */}
              <div className="p-5 bg-[#0E131C] border border-[#C8A870]/25 rounded-none space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#E5C392] font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#C8A870]" />
                  <span>Al Shaali Marine Shipbuilding Heritage (Est. 1979)</span>
                </div>
                <p className="text-xs text-[#828F9E] leading-relaxed">
                  Established by Abdullah Al Shaali in 1979, the shipyard has pioneered composite boat manufacturing in the Middle East. With decades of international quality certificates and maritime pedigree, the G100 represents the pinnacle of Emirati naval craft.
                </p>
              </div>
            </div>

            {/* Narrative Visual Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group relative overflow-hidden bg-[#0E131C] border border-white/10 p-6 space-y-3 hover:border-[#C8A870]/40 transition-all">
                <div className="w-10 h-10 rounded-none bg-[#17202C] border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870]">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">Tri-Deck Engineering</h3>
                <p className="text-xs text-[#828F9E] leading-relaxed font-light">
                  Hand-laid combination mat with foam-filled honeycomb-cored hull, deck, and flybridge with solid fiberglass keel and chines.
                </p>
              </div>

              <div className="group relative overflow-hidden bg-[#0E131C] border border-white/10 p-6 space-y-3 hover:border-[#C8A870]/40 transition-all">
                <div className="w-10 h-10 rounded-none bg-[#17202C] border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">Sunlit Panoramic Saloon</h3>
                <p className="text-xs text-[#828F9E] leading-relaxed font-light">
                  Floor-to-ceiling windows designed as a single continuous glass piece from the outside, flooding the formal salon with natural sea views.
                </p>
              </div>

              <div className="group relative overflow-hidden bg-[#0E131C] border border-white/10 p-6 space-y-3 hover:border-[#C8A870]/40 transition-all">
                <div className="w-10 h-10 rounded-none bg-[#17202C] border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870]">
                  <Anchor className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">Full-Beam Owner's Suite</h3>
                <p className="text-xs text-[#828F9E] leading-relaxed font-light">
                  King-size bed, private waterline horizon lounge, walk-in dressing wardrobe, and full marble rain shower ensuite bathroom.
                </p>
              </div>

              <div className="group relative overflow-hidden bg-[#0E131C] border border-white/10 p-6 space-y-3 hover:border-[#C8A870]/40 transition-all">
                <div className="w-10 h-10 rounded-none bg-[#17202C] border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870]">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">Entertainer's Flybridge</h3>
                <p className="text-xs text-[#828F9E] leading-relaxed font-light">
                  Al-fresco teak dining for 8, secondary steering console, full service wet bar, electric BBQ grill, and optional hot tub placement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive 3D Cutaway Deck Plans & General Arrangement Section */}
        <section id="deck-plans" className="py-20 sm:py-28 bg-[#0A0D14] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                GENERAL ARRANGEMENT • DECK-BY-DECK 3D CUTAWAY
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                Explore the Three Expansive Decks
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                Inspect the authentic 3D architectural cutaway models and official general arrangement (GA) drawings engineered for the ASMARATY G100.
              </p>
            </div>

            {/* Deck Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 border-b border-white/10 pb-4">
              {DECK_PLANS.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setActiveDeckTab(deck.id)}
                  className={`px-5 py-3 text-xs uppercase tracking-luxury font-medium transition-all border ${
                    activeDeckTab === deck.id
                      ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870] shadow-[0_0_20px_rgba(200,168,112,0.3)]"
                      : "bg-[#0E131C] text-[#8E9AA8] border-white/10 hover:text-white hover:border-white/30"
                  }`}
                >
                  {deck.name}
                </button>
              ))}
            </div>

            {/* Active Deck Display Card */}
            <div className="bg-[#0E131C] border border-white/10 p-6 sm:p-10 space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-luxury text-[#C8A870] font-medium block">
                    Deck Layout Specification
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mt-0.5">
                    {activeDeck.name} — <span className="text-[#E5C392]">{activeDeck.subtitle}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={activeDeck.image3D}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saxdor-btn-outline !h-[42px] px-4 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#C8A870]" />
                    <span>View Full Resolution</span>
                  </a>
                </div>
              </div>

              {/* Deck Image Preview */}
              <div className="relative bg-[#080B10] p-4 sm:p-8 border border-white/5 overflow-hidden group">
                <img
                  src={activeDeck.image3D}
                  alt={activeDeck.caption}
                  className="w-full h-auto max-h-[550px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="mt-4 text-center">
                  <p className="text-xs text-[#828F9E] tracking-wider font-mono">
                    {activeDeck.caption}
                  </p>
                </div>
              </div>

              {/* Key Highlights for this Deck */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-luxury text-[#C8A870] font-semibold">
                  Key Deck Appointments & Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeDeck.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#0A0D14] border border-white/5 flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-none bg-[#C8A870]/10 border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870] flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-[#C9D2DF] font-light leading-relaxed">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications Dossier Section */}
        <section id="specifications" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
              OFFICIAL BROCHURE DATA • NAVAL ARCHITECTURE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              Technical Specifications Dossier
            </h2>
            <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
              Exacting engineering standards, propulsion systems, and capacity matrices as certified by Al Shaali Marine for the ASMARATY G100.
            </p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-white/10 pb-4">
            {SPEC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSpecCategory(cat.id)}
                className={`px-4 py-2.5 text-xs uppercase tracking-luxury font-medium transition-all border ${
                  activeSpecCategory === cat.id
                    ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870]"
                    : "bg-[#0E131C] text-[#8E9AA8] border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Active Specification Table Grid */}
          <div className="bg-[#0E131C] border border-white/10 divide-y divide-white/5">
            <div className="p-4 sm:p-6 bg-[#0A0D14] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-[#C8A870]" />
                <h3 className="font-serif text-xl sm:text-2xl text-white font-light">
                  {activeSpec.title}
                </h3>
              </div>
              <span className="text-xs text-[#828F9E] font-mono uppercase tracking-wider">
                Certified Shipyard Matrix
              </span>
            </div>

            {activeSpec.specs.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-5 text-xs hover:bg-[#121824] transition-colors gap-2"
              >
                <div className="sm:col-span-5 text-[#8E9EAF] uppercase tracking-wider font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870]/40"></span>
                  <span>{item.label}</span>
                </div>
                <div className="sm:col-span-7 text-white font-medium sm:text-right font-mono text-sm">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Original High-Definition Photo Gallery */}
        <section id="gallery" className="py-20 sm:py-28 bg-[#0A0D14] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                  ORIGINAL SHIPYARD PORTFOLIO ({G100_GALLERY.length} PHOTOGRAPHS)
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                  Luxury In Every Perspective
                </h2>
                <p className="text-xs sm:text-sm text-[#9DAAB8] font-light">
                  Original photography showcasing the exterior skyline cruises, handcrafted teak decks, master staterooms, and marble ensuite suites.
                </p>
              </div>

              {/* Gallery Filter Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                {["All", "Exterior & Skyline", "Main Saloon & Dining", "Master & VIP Suites", "Luxury Ensuites", "Flybridge, Decks & Helm"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-3 py-1.5 transition-all border ${
                      galleryFilter === cat
                        ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870]"
                        : "bg-[#0E131C] text-[#828F9E] border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(idx)}
                  className="group relative h-72 sm:h-80 bg-[#080B10] border border-white/10 overflow-hidden cursor-pointer hover:border-[#C8A870]/50 transition-all"
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity"></div>

                  {/* Caption & Category Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-5 space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <span className="text-[10px] uppercase tracking-luxury text-[#E5C392] font-semibold block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#9DAAB8] line-clamp-2 font-light">
                      {item.description}
                    </p>
                  </div>

                  {/* Zoom Icon Button */}
                  <div className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4 text-[#C8A870]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Official Brochure Download Banner Card */}
        <section id="brochure" className="py-20 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0E1420] via-[#0A0E17] to-[#080B10] border border-[#C8A870]/30 p-8 sm:p-14">
            <div className="absolute -right-16 -bottom-16 w-96 h-96 rounded-full bg-[#C8A870]/5 blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8A870]/10 border border-[#C8A870]/30 text-[#E5C392] text-xs font-semibold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official Shipyard Publication • 25.7 MB PDF</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                  Download the Official ASMARATY G100 Brochure
                </h2>

                <p className="text-sm sm:text-base text-[#9DAAB8] font-light max-w-2xl leading-relaxed">
                  Discover the complete catalog including all 40 pages of naval architecture, high-definition deck arrangements, engine performance curves, standard mechanical checklists, and custom finish options.
                </p>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <a
                    href="/documents/asmaraty-g100-brochure.pdf"
                    download="ASMARATY-G100-Official-Brochure.pdf"
                    className="saxdor-btn-solid !h-[52px] px-8 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF (25.7 MB)</span>
                  </a>

                  <span className="text-xs text-[#828F9E] tracking-wider">
                    Instant direct download • Verified high-res asset
                  </span>
                </div>
              </div>

              {/* Brochure Preview Thumbnail Box */}
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative p-2 bg-[#080B10] border border-[#C8A870]/40 shadow-2xl rotate-1 hover:rotate-0 transition-transform">
                  <img
                    src="/images/yachts/g100/0.jpg"
                    alt="ASMARATY G100 Brochure Cover"
                    className="w-64 h-auto object-cover border border-white/10"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm p-3 text-center border border-white/10">
                    <p className="font-serif text-sm text-white font-medium">ASMARATY G100</p>
                    <p className="text-[10px] text-[#C8A870] uppercase tracking-wider font-mono">Official Tri-Deck Dossier</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Private Viewings & Sea Trials CTA Banner */}
        <section className="py-20 sm:py-24 bg-[#0C121B] border-t border-[#1C2533] text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-6">
            <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
              PRIVATE VIEWINGS & SEA TRIALS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              Experience the ASMARATY G100 in Dubai
            </h2>
            <p className="text-sm sm:text-base text-[#9DAAB8] font-light max-w-xl mx-auto leading-relaxed">
              Contact our team to arrange a confidential private sea trial or discuss bespoke specifications for the ASMARATY G100.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href="/contact"
                className="saxdor-btn-solid !h-[54px] px-10 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
              >
                <span>Contact Us</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={prevLightbox}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 border border-white/10 hover:border-white/30 transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextLightbox}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 border border-white/10 hover:border-white/30 transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center text-center space-y-3">
            <img
              src={filteredGallery[lightboxIndex]?.src}
              alt={filteredGallery[lightboxIndex]?.title}
              className="max-h-[75vh] w-auto object-contain border border-white/10 shadow-2xl"
            />
            <div>
              <p className="font-serif text-lg text-white font-medium">
                {filteredGallery[lightboxIndex]?.title}
              </p>
              <p className="text-xs text-[#9DAAB8] max-w-xl mx-auto font-light">
                {filteredGallery[lightboxIndex]?.description}
              </p>
              <span className="text-[10px] text-[#C8A870] font-mono mt-1 block">
                {lightboxIndex + 1} of {filteredGallery.length} • {filteredGallery[lightboxIndex]?.category}
              </span>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}

function YachtDetailPageInner() {
  const params = useParams();
  const slug = params?.slug;

  const [yacht, setYacht] = useState(() => (slug ? getYachtBySlug(slug) : null));

  useEffect(() => {
    syncYachtsFromServer().then((synced) => {
      if (slug && synced) {
        const found = synced.find((y) => y.slug === slug);
        if (found) setYacht(found);
      }
    });

    const handleUpdate = () => {
      if (slug) {
        const y = getYachtBySlug(slug);
        setYacht(y);
      }
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  // If this is the G100 model, display the full-scale luxury showcase
  if (slug === "g100") {
    return <G100DetailPage />;
  }

  // If Under Construction flag is active and this is NOT G100, show Under Construction
  if (IS_UNDER_CONSTRUCTION) {
    const modelTitle = yacht?.name ? `${yacht.name} — Specification Dossier` : "Yacht Model Dossier";
    const modelDesc = yacht?.name
      ? `The dedicated specification dossier and interactive configurator for ${yacht.name} are currently under construction. Complete specifications and photo galleries can be explored on our Home page.`
      : "The individual yacht specification dossier is currently under construction. Complete specifications for our featured yacht models are on the Home page.";

    return (
      <UnderConstructionView
        pageTitle={modelTitle}
        pageSlug={`/yachts/${slug || ""}`}
        description={modelDesc}
        customBadge="UNDER CONSTRUCTION"
        yacht={yacht}
      />
    );
  }

  // Fallback for non-existent yacht
  if (!yacht) {
    return (
      <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] flex flex-col justify-between">
        <PublicNavbar />
        <div className="py-40 text-center space-y-4">
          <h1 className="font-serif text-3xl text-white">Yacht Model Not Found</h1>
          <p className="text-sm text-[#828F9E]">The requested vessel could not be found or has not been published.</p>
          <Link href="/yachts" className="saxdor-btn-solid !h-[48px] px-8 text-xs inline-flex items-center justify-center mt-4 rounded-none">
            Return to Fleet
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return <G100DetailPage />;
}

export default function YachtDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B10] text-white flex items-center justify-center font-serif text-sm">Loading Yacht...</div>}>
      <YachtDetailPageInner />
    </Suspense>
  );
}
