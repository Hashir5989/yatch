"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Anchor, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Maximize2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
  Gauge,
  Sliders,
  Ship,
  Eye,
  Calendar,
  Waves,
  Zap,
  Building2,
  Cpu,
  FileText,
  Check
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

export default function AboutPage() {
  const [page, setPage] = useState(() => getPageBySlug("/about"));
  const [activePrecinct, setActivePrecinct] = useState(0);

  useEffect(() => {
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/about");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/about");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // 1. Core Shipyard Key Stats (DMYC Style Key Metrics Bar)
  const stats = [
    { value: "1979", label: "Year Founded in UAE", desc: "Four decades of pioneering Arabian composite boatbuilding" },
    { value: "45+", label: "Years of Heritage", desc: "Unbroken lineage of naval architecture & maritime craft" },
    { value: "100 FT", label: "Flagship Capability", desc: "Multi-deck ocean-going bespoke superyachts" },
    { value: "100%", label: "In-House Shipyard", desc: "Direct shipyard dialogue from sketch to open-ocean sea trial" }
  ];

  // 2. Shipyard Precincts & Facilities (Matching DMYC "Our Marinas" Card Grid)
  const precincts = [
    {
      id: "infusion",
      title: "Climate-Controlled Composite Infusion Halls",
      subtitle: "Precision Vacuum Lamination Facility",
      tagline: "100% Void-Free • Multi-Axial Carbon & Glass",
      description: "Regulated temperature and humidity environments where vinylester resin and multi-axial carbon fibers are consolidated under high-vacuum pressure. This advanced process eliminates air pockets, achieves a 35% weight reduction over traditional fiberglass, and ensures whisper-quiet acoustic dampening at sea.",
      specs: [
        { label: "Infusion Technology", val: "Vacuum Resin Consolidation" },
        { label: "Structural Longevity", val: "Osmosis-Resistant Vinylester" },
        { label: "Acoustic Metric", val: "Whisper-Quiet Dampening" },
        { label: "Weight Savings", val: "35% Hull Mass Reduction" }
      ],
      image: "/images/asmaraty-shipyard-facility.jpg",
      badge: "Precinct 01"
    },
    {
      id: "joinery",
      title: "Bespoke Joinery & Interior Ateliers",
      subtitle: "Artisan Marine Cabinetmaking & Marble Studio",
      tagline: "Burma Teak • Italian Calacatta • Full-Grain Leather",
      description: "Our private in-house atelier brings together master cabinetmakers, leather saddlers, and stonemasons. From hand-laid parquet flooring and bookmatched walnut veneers to aerospace honeycomb-backed Italian marbles, every interior surface is tailored to the owner's personal aesthetic.",
      specs: [
        { label: "Timber Curation", val: "Hand-Laid Burma Teak & Walnut" },
        { label: "Stone Engineering", val: "Weight-Compensated Italian Marble" },
        { label: "Saddlery", val: "UV & Salt-Resistant Marine Leather" },
        { label: "Craftsman Tolerance", val: "Sub-Millimeter Joinery Precision" }
      ],
      image: "/images/interiors/g100-main-salon.jpg",
      badge: "Precinct 02"
    },
    {
      id: "marina",
      title: "Deep-Water Launch Slipways & Marina Basin",
      subtitle: "Private Sea Trials & Commissioning Berths",
      tagline: "Direct Arabian Gulf Access • 100 FT Berthing",
      description: "Located along the deep-water maritime coastline of Ajman, UAE, our private launch marina accommodates multi-deck superyachts up to 100 feet. Yachts move directly from final assembly to deep-water berths for rigorous propulsion stress-testing and open-sea trials.",
      specs: [
        { label: "Berth Capacity", val: "Vessels up to 100 FT / 30.5 M" },
        { label: "Water Access", val: "Direct Deep-Water Channel to Sea" },
        { label: "Testing Basin", val: "High-Speed Dynamic Testing" },
        { label: "Handover Facility", val: "VIP Private Marina Pier" }
      ],
      image: "/images/asmaraty-shared-passion.jpg",
      badge: "Precinct 03"
    },
    {
      id: "avionics",
      title: "Glass Cockpit Bridge & Marine Electronics Lab",
      subtitle: "Integrated Garmin Navigation & Power Management",
      tagline: "Fly-By-Wire • Digital Switching • Radar Arrays",
      description: "Modern yachting demands effortless command. Our electrical engineers pre-wire, integrate, and bench-test Garmin glass helm touchscreens, fly-by-wire joystick controls, FLIR thermal night-vision sensors, and digital circuit breaker systems before vessel launch.",
      specs: [
        { label: "Navigation Suite", val: "Garmin Glass Bridge Multi-Displays" },
        { label: "Vessel Control", val: "Integrated Digital Switching" },
        { label: "Safety Systems", val: "Dual Radar & Thermal Night Vision" },
        { label: "Auxiliary Power", val: "Whisper-Quiet Marine Generators" }
      ],
      image: "/images/interiors/g100-helm-station.jpg",
      badge: "Precinct 04"
    }
  ];

  // 3. Exclusive Shipyard Benefits & Standards (Matching DMYC 6-card Icon Grid)
  const benefits = [
    {
      icon: <Award className="w-6 h-6 text-[#C6A155]" />,
      number: "01",
      title: "ISO 9001 & CE Class A Standards",
      desc: "All vessels engineered and built in strict accordance with ISO 9001 quality management, CE Category A Ocean classifications, and US Coast Guard safety requirements."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C6A155]" />,
      number: "02",
      title: "Vacuum-Infused Composites",
      desc: "Advanced multi-axial glass and carbon fiber reinforcements consolidated under high-vacuum with vinylester resin, ensuring zero voiding and maximum structural rigidity."
    },
    {
      icon: <Compass className="w-6 h-6 text-[#C6A155]" />,
      number: "03",
      title: "Direct Shipyard Dialogue",
      desc: "Every commission is deeply personal. Owners collaborate directly with our senior naval architects and master builders from preliminary sketches to maiden voyage."
    },
    {
      icon: <Clock className="w-6 h-6 text-[#C6A155]" />,
      number: "04",
      title: "45+ Years Maritime Heritage",
      desc: "Four decades of continuous Arabian boatbuilding innovation, proprietary mold fabrication, and open-ocean seakeeping optimization since 1979."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C6A155]" />,
      number: "05",
      title: "100% In-House Atelier",
      desc: "Cabinetry, joinery, upholstery, electrical engineering, and composite infusion executed by our own dedicated master craftsmen under unified quality controls."
    },
    {
      icon: <Anchor className="w-6 h-6 text-[#C6A155]" />,
      number: "06",
      title: "White-Glove Sea Trials & Handover",
      desc: "Comprehensive offshore sea trials in the Arabian Gulf verifying every mechanical and navigational system, followed by full captain orientation and celebration."
    }
  ];

  // 4. The 5-Step Owner Commissioning Process (Matching DMYC Step Roadmap)
  const commissionSteps = [
    {
      number: "01",
      phase: "Phase I",
      title: "Direct Architectural Dialogue",
      desc: "Owners meet directly with our chief naval architects to define vessel dimensions, deck layout flow, cabin arrangements, and lifestyle amenities.",
      timeline: "Week 01 — 04"
    },
    {
      number: "02",
      phase: "Phase II",
      title: "CFD Hydrodynamic Simulation",
      desc: "Computational fluid dynamics simulations optimize the deadrise, spray rails, and propulsion packages for fuel economy, top speed, and seakeeping stability.",
      timeline: "Week 04 — 08"
    },
    {
      number: "03",
      phase: "Phase III",
      title: "Atelier Material Selection",
      desc: "Hand-selection of rare veneers, bookmatched Italian marbles, lighting architectures, and supple leathers inside our private shipyard material atelier.",
      timeline: "Week 08 — 14"
    },
    {
      number: "04",
      phase: "Phase IV",
      title: "Vacuum Infusion & Craft",
      desc: "Execution of vacuum resin infusion in climate-controlled bays, followed by precision joinery installation, digital switching, and mechanical rigging.",
      timeline: "Week 14 — Handover"
    },
    {
      number: "05",
      phase: "Phase V",
      title: "Open-Water Sea Trials & Handover",
      desc: "Stress-testing in Arabian Gulf open waters, captain certification, and a formal private maiden voyage handover ceremony.",
      timeline: "Delivery Day"
    }
  ];

  // 5. Fleet Collection Cards (Matching DMYC Vessel Capabilities)
  const fleetCollection = [
    {
      model: "ASMARATY G-100",
      tag: "Flagship Superyacht",
      length: "100 FT / 30.5 M",
      speed: "35 Knots",
      guests: "12 Guests",
      image: "/images/yachts/g100.jpg",
      slug: "g100",
      desc: "Our tri-deck flagship masterpiece embodying the pinnacle of contemporary naval architecture and private ocean-going luxury."
    },
    {
      model: "ASMARATY G-77",
      tag: "Luxury Ocean Cruiser",
      length: "77 FT / 23.5 M",
      speed: "32 Knots",
      guests: "10 Guests",
      image: "/images/yachts/g77.jpg",
      slug: "g77",
      desc: "A bold, athletic long-range cruising yacht combining panoramic flybridge living with exhilarating offshore performance."
    },
    {
      model: "ASMARATY G-66",
      tag: "Flybridge Yacht",
      length: "66 FT / 20.1 M",
      speed: "34 Knots",
      guests: "8 Guests",
      image: "/images/yachts/g66.jpg",
      slug: "g66",
      desc: "Harmonizing expansive outdoor entertainment decks with an open-plan salon and generous lower accommodations."
    },
    {
      model: "ASMARATY G-50",
      tag: "Sports Cruiser",
      length: "50 FT / 15.2 M",
      speed: "38 Knots",
      guests: "6 Guests",
      image: "/images/yachts/g50.jpg",
      slug: "g50",
      desc: "Nimble, sharp, and exhilarating — the ideal day yacht and weekend cruiser with double master cabins and sun lounge decks."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#08101C] text-[#E8EAEE] selection:bg-[#C6A155] selection:text-black">
      <PublicNavbar currentPageId={page?.id || "page-about"} />

      <main className="flex-1">
        {/* =========================================================
            1. CINEMATIC HERO SECTION (DMYC Style Hero)
               Full-width backdrop, gold badge, headline, and actions
           ========================================================= */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#080B10]">
          {/* Background Shipyard Photo with Vignette Gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/asmaraty-shipyard-facility.jpg"
              alt="ASMARATY Luxury Yachts Shipyard Facility Ajman UAE"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.34] contrast-[1.18]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/60 to-[#08101C]/85" />
            <div className="absolute inset-0 bg-radial-vignette opacity-80" />
          </div>

          {/* ASMARATY Monogram Pattern Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-[1] select-none opacity-[0.04]"
            style={{
              backgroundImage: "url('/images/asmaraty-wings-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center top",
              backgroundSize: "220px 120px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center space-y-6 pt-28 sm:pt-36 pb-16">
            {/* ASMARATY Brand Emblem Crest */}
            <div className="flex justify-center">
              <AsmaratyLogo variant="emblem" tone="light" className="h-11 sm:h-14 opacity-95 hover:opacity-100 transition-opacity" priority />
            </div>

            {/* DMYC-Style Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-sans font-semibold">
              <span className="w-6 sm:w-10 h-[1.5px] bg-[#C6A155]" />
              PIONEERING ARABIAN SHIPBUILDING • EST. 1979 • AJMAN, UAE
              <span className="w-6 sm:w-10 h-[1.5px] bg-[#C6A155]" />
            </div>

            {/* Grand Architectural Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[1.06] text-white tracking-[0.02em]">
              The Architecture of <br className="hidden sm:inline" />
              <span className="italic font-normal">Maritime Distinction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-3xl mx-auto font-sans">
              Where four decades of master boatbuilding heritage converge with vacuum composite engineering, panoramic ocean living, and bespoke yachts crafted for the open sea.
            </p>

            {/* Action Buttons */}
            <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <a
                href="#shipyard-precincts"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Explore Shipyard Precincts
                <ChevronRight className="w-4 h-4 ml-2" />
              </a>
              <Link
                href="/yachts"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-white/25 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 transition-colors cursor-pointer"
              >
                View Fleet Collection
              </Link>
            </div>
          </div>

          {/* DMYC-Style Quick Section Anchors Ribbon */}
          <div className="relative z-10 w-full border-t border-white/10 bg-[#08101C]/85 backdrop-blur-md py-4">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-center gap-5 sm:gap-9 text-[11px] sm:text-xs font-sans tracking-[0.18em] uppercase text-white/60">
              <a href="#philosophy" className="hover:text-[#C6A155] transition-colors">Philosophy</a>
              <span className="text-white/20">•</span>
              <a href="#shipyard-precincts" className="hover:text-[#C6A155] transition-colors">Shipyard Precincts</a>
              <span className="text-white/20">•</span>
              <a href="#standards-benefits" className="hover:text-[#C6A155] transition-colors">Standards & Benefits</a>
              <span className="text-white/20">•</span>
              <a href="#commission-journey" className="hover:text-[#C6A155] transition-colors">Bespoke Process</a>
              <span className="text-white/20">•</span>
              <a href="#fleet-collection" className="hover:text-[#C6A155] transition-colors">Fleet Collection</a>
              <span className="text-white/20">•</span>
              <a href="#shipyard-enquiry" className="hover:text-[#C6A155] transition-colors">Enquiry Concierge</a>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. KEY METRICS BAR (DMYC Style 4-Point Stat Strip)
           ========================================================= */}
        <section className="py-14 sm:py-16 bg-[#0B1424] border-b border-white/10 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-2 border-r last:border-r-0 border-white/10 pr-4">
                  <div className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-[#C6A155] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.18em] text-white">
                    {stat.label}
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed font-light max-w-[220px] mx-auto">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            3. PHILOSOPHY & STORY OVERVIEW (Editorial Split)
           ========================================================= */}
        <section id="philosophy" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative & Philosophy */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.24em] text-[#C6A155]">
                  OUR PHILOSOPHY • THE SHIPYARD STORY
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#0E2047] tracking-[0.02em]">
                  A Shared Passion for <br />
                  <span className="font-signature text-5xl sm:text-6xl text-[#C6A155] block mt-1 normal-case tracking-normal">
                    Life at Sea
                  </span>
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-[#0E2047]/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                  <p>
                    ASMARATY was founded on a shared passion for design, craftsmanship, and life at sea. Bringing a distinct personality to the water, our boatbuilding journey is unified by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful on-board comfort.
                  </p>
                  <p>
                    Rooted in the rich maritime heritage of the United Arab Emirates and driven by continuous innovation, we build yachts that balance modern exterior lines with broad proportions, usable deck space, and the creature comforts that make longer voyages at sea truly memorable.
                  </p>
                  <p>
                    Every vessel that leaves our docks represents an unyielding devotion to safety, sea-keeping excellence, and bespoke personalization — engineered to be as rewarding to spend time aboard as it is to admire from the shore.
                  </p>
                </div>

                {/* Pull Quote */}
                <div className="pt-4 border-l-2 border-[#C6A155] pl-6 italic font-serif text-base sm:text-lg text-[#0E2047]/90 leading-snug">
                  “A true luxury yacht is an architectural expression of freedom — built not for compromise, but for the purest enjoyment of the open water.”
                </div>
              </div>

              {/* Right Column: Hero Visual with Lightbox Card */}
              <div className="lg:col-span-6">
                <div className="relative group overflow-hidden shadow-2xl bg-[#08101C]">
                  <img
                    src="/images/asmaraty-shared-passion.jpg"
                    alt="ASMARATY Luxury Yacht cruising at sunset with illuminated emblem"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-black/65 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Signature Aesthetics</span>
                    Illuminated ASMARATY wing emblem and panoramic flybridge architecture cruising the coast.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. SHIPYARD PRECINCTS & FACILITIES (DMYC "Our Marinas" Section)
               Card Grid with Interactive Detail Modal / Tabs
           ========================================================= */}
        <section id="shipyard-precincts" className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.24em] text-[#C6A155]">
                SHIPYARD INFRASTRUCTURE
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                Our Shipyard Precincts
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                Explore the specialized manufacturing divisions that power ASMARATY yacht construction along the deep-water coast of Ajman, UAE.
              </p>

              {/* Precinct Quick Selector Tabs */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {precincts.map((precinct, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePrecinct(idx)}
                    className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 border cursor-pointer ${
                      activePrecinct === idx
                        ? "bg-[#C6A155] text-black border-[#C6A155] shadow-lg shadow-[#C6A155]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {precinct.badge} • {precinct.title.split(" ")[0]} {precinct.title.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Precinct Featured Showcase (DMYC Detailed Marina Layout) */}
            <div className="bg-[#0B1526]/85 border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-sm mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Precinct Photo */}
                <div className="lg:col-span-6 relative group overflow-hidden bg-black border border-white/10 shadow-xl">
                  <div className="aspect-[16/11] relative overflow-hidden">
                    <img
                      src={precincts[activePrecinct].image}
                      alt={precincts[activePrecinct].title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute top-4 left-4 bg-[#C6A155] text-black text-[11px] font-bold px-3 py-1 uppercase tracking-wider shadow">
                    {precincts[activePrecinct].badge}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-xs text-white/90 bg-black/60 backdrop-blur-sm p-3 border border-white/10">
                    <span className="text-[#C6A155] font-semibold block uppercase tracking-wider">{precincts[activePrecinct].tagline}</span>
                  </div>
                </div>

                {/* Right: Precinct Capabilities & Technical Specifications */}
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-2">
                      {precincts[activePrecinct].subtitle}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight">
                      {precincts[activePrecinct].title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light text-justify" style={{ textJustify: "inter-word" }}>
                    {precincts[activePrecinct].description}
                  </p>

                  {/* 4 Technical Specification Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    {precincts[activePrecinct].specs.map((item, sIdx) => (
                      <div key={sIdx} className="p-3 bg-white/5 border border-white/10 rounded-sm">
                        <span className="text-[10px] uppercase tracking-wider text-white/50 block font-semibold">{item.label}</span>
                        <span className="text-xs font-semibold text-[#C6A155] mt-0.5 block">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <a
                      href="#shipyard-enquiry"
                      className="inline-flex items-center text-xs font-semibold tracking-wider text-[#C6A155] hover:text-white transition-colors"
                    >
                      <span>Inquire About Facility Tours</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Card Overview Grid of All Precincts (DMYC Card Pattern) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {precincts.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePrecinct(idx)}
                  className={`p-6 rounded bg-[#0E1A2E]/70 border transition-all duration-300 flex flex-col justify-between group shadow-lg cursor-pointer ${
                    activePrecinct === idx
                      ? "border-[#C6A155] ring-1 ring-[#C6A155]/40"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#C6A155] uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono text-white/40">0{idx + 1}</span>
                    </div>

                    <h4 className="font-serif text-lg font-normal text-white leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-white/60 leading-relaxed font-light line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-[#C6A155] group-hover:translate-x-1 transition-transform">
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. EXCLUSIVE SHIPYARD STANDARDS & BENEFITS (DMYC 6-Grid)
               Clean 6-Card Icon Grid Highlighting Seakeeping & Build Quality
           ========================================================= */}
        <section id="standards-benefits" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.24em] text-[#C6A155]">
                BENEFITS & EXCELLENCE
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#0E2047]">
                The ASMARATY Standard
              </h2>
              <p className="text-sm sm:text-base text-[#0E2047]/75 font-normal leading-relaxed">
                Six foundational principles and manufacturing assurances built into every luxury motor yacht produced at our shipyard.
              </p>
            </div>

            {/* 6-Card Icon Grid (DMYC Berthing Benefits Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded bg-[#FAF9F6] border border-[#0E2047]/10 hover:border-[#C6A155]/50 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded bg-white border border-[#0E2047]/10 group-hover:border-[#C6A155]/40 transition-colors shadow-sm">
                        {item.icon}
                      </div>
                      <span className="font-serif text-2xl font-light text-[#0E2047]/30 group-hover:text-[#C6A155] transition-colors">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-normal text-[#0E2047]">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#0E2047]/75 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            6. BESPOKE OWNER COMMISSIONING PROCESS (DMYC Process Roadmap)
               5-Step Sequential Journey from Sketch to Maiden Handover
           ========================================================= */}
        <section id="commission-journey" className="py-20 sm:py-28 lg:py-32 bg-[#091322] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.24em] text-[#C6A155]">
                TAILOR-MADE COMMISSIONING
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                The Commission Journey
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                From preliminary design dialogue to open-water sea trials, every build is an individualized partnership.
              </p>
            </div>

            {/* 5-Step Process Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {commissionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded bg-[#0E1A2E]/80 border border-white/10 hover:border-[#C6A155]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl sm:text-4xl font-light text-[#C6A155]">
                        {step.number}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 px-2 py-0.5 border border-white/10 rounded">
                        {step.timeline}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C6A155] block">
                        {step.phase}
                      </span>
                      <h4 className="font-serif text-lg font-normal text-white leading-snug">
                        {step.title}
                      </h4>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between text-[11px] text-white/40 group-hover:text-[#C6A155] transition-colors">
                    <span>Step {step.number}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            7. CURATED FLEET COLLECTION (DMYC Vessel Capabilities Grid)
           ========================================================= */}
        <section id="fleet-collection" className="py-20 sm:py-28 lg:py-32 bg-[#0B1424] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.24em] text-[#C6A155]">
                THE FLEET COLLECTION
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                Engineered for the Open Sea
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                Explore our signature fleet models, each embodying the unique balance of contemporary naval architecture and ocean-going luxury.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {fleetCollection.map((item, idx) => (
                <div
                  key={idx}
                  className="group bg-[#0E1A2D] border border-white/10 hover:border-[#C6A155]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    <img
                      src={item.image}
                      alt={item.model}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2D] via-transparent to-transparent opacity-80 pointer-events-none" />
                    <div className="absolute top-4 left-4 bg-[#08101C]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#C6A155] border border-[#C6A155]/30">
                      {item.tag}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-serif text-2xl font-normal text-white">
                          {item.model}
                        </h3>
                        <span className="text-xs font-mono text-[#C6A155]">{item.length}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-white/60 font-mono">
                        <span>Speed: {item.speed}</span>
                        <span>•</span>
                        <span>{item.guests}</span>
                      </div>
                      <Link
                        href={`/yachts/${item.slug}`}
                        className="inline-flex items-center text-xs font-semibold tracking-wider text-[#C6A155] hover:text-white transition-colors group-hover:translate-x-1 duration-200"
                      >
                        Explore Model Dossier
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-12 text-center">
              <Link
                href="/yachts"
                className="inline-flex items-center justify-center h-[52px] px-10 text-xs font-semibold tracking-[0.2em] uppercase border border-[#C6A155] text-[#C6A155] hover:bg-[#C6A155] hover:text-black transition-colors cursor-pointer"
              >
                View Full Fleet Specifications
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            8. VIP MARITIME CONCIERGE & SHIPYARD ENQUIRY (DMYC Enquiry Form Style)
               Direct Contact, WhatsApp, Phone, and Appointment Booking
           ========================================================= */}
        <section id="shipyard-enquiry" className="py-20 sm:py-28 bg-[#080B10] text-white relative overflow-hidden border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center relative z-10 space-y-6">
            {/* ASMARATY Wings Emblem */}
            <div className="flex justify-center mb-2">
              <AsmaratyLogo variant="emblem" tone="light" className="h-10 sm:h-12 opacity-90" />
            </div>

            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-semibold">
              <span className="w-6 h-[1.5px] bg-[#C6A155]" />
              VIP MARITIME CONCIERGE & SHIPYARD VISIT
              <span className="w-6 h-[1.5px] bg-[#C6A155]" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight text-white uppercase tracking-[0.03em]">
              Experience ASMARATY in Person
            </h2>

            <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed max-w-2xl mx-auto">
              We warmly welcome prospective owners, captains, and maritime connoisseurs to tour our UAE shipyard facility. Inspect our vacuum lamination halls, examine our joinery ateliers, or schedule a private sea trial aboard the fleet.
            </p>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Schedule Shipyard Visit
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a
                href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20inquire%20about%20a%20private%20shipyard%20tour."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-[#25D366]/40 text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 mr-2" />
                WhatsApp Concierge
              </a>
              <Link
                href="/yachts"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
              >
                Explore Fleet Collection
              </Link>
            </div>

            {/* Direct Contact Bar */}
            <div className="pt-10 max-w-2xl mx-auto border-t border-white/10 flex flex-wrap items-center justify-around gap-6 text-xs text-white/70">
              <a
                href="tel:+971565268126"
                className="flex items-center gap-2 hover:text-[#C6A155] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C6A155]" />
                <span>+971 56 526 8126</span>
              </a>
              <a
                href="mailto:info@asmaraty.com"
                className="flex items-center gap-2 hover:text-[#C6A155] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#C6A155]" />
                <span>info@asmaraty.com</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C6A155]" />
                <span>Rashidia 1, Ajman, UAE</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
