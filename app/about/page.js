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
  Cpu
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

export default function AboutPage() {
  const [page, setPage] = useState(() => getPageBySlug("/about"));
  const [activeDecade, setActiveDecade] = useState(0);
  const [activeMaterial, setActiveMaterial] = useState(0);

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

  // 1. Key Shipyard Stats (Inspired by Riva & Sunseeker)
  const stats = [
    { value: "1979", label: "Year Founded in UAE", desc: "Four decades of pioneering Arabian composite boatbuilding" },
    { value: "45+", label: "Years of Heritage", desc: "Unbroken lineage of naval architecture & maritime craft" },
    { value: "100 FT", label: "Flagship Capability", desc: "Multi-deck ocean-going bespoke superyachts" },
    { value: "100%", label: "In-House Shipyard", desc: "Direct shipyard dialogue from sketch to open-ocean sea trial" }
  ];

  // 2. Interactive Decades Timeline (Inspired by Sanlorenzo & Riva Heritage)
  const decades = [
    {
      period: "1979 — 1989",
      shortYear: "1979",
      title: "The Genesis of Arabian Boatbuilding",
      badge: "Shipyard Founding • Ajman, UAE",
      subtitle: "Pioneering Modern Composite Construction in the Gulf",
      narrative: "In 1979, the foundations of modern yacht building in the United Arab Emirates were established at our Ajman shipyard. Pioneering the adoption of advanced fiberglass construction in the Arabian Gulf, our shipyard gave regional mariners robust vessels engineered specifically to withstand the extreme heat, salinity, and open-ocean conditions of the Arabian Sea.",
      highlights: [
        "First serial fiberglass hull production facility in the Emirates",
        "Deep-water marina slipways commissioned in Ajman",
        "Direct collaboration with regional fishing & maritime fleets"
      ],
      metric: "1st Generation",
      metricLabel: "Composite Hulls in UAE",
      image: "/images/a77-journey-vintage.jpg"
    },
    {
      period: "1990 — 2005",
      shortYear: "1990s",
      title: "The Composite Engineering Revolution",
      badge: "Naval Architecture Expansion",
      subtitle: "Introduction of Multi-Axial Composites & Global Standards",
      narrative: "Transitioning into the modern luxury era, our naval architects introduced multi-axial fiberglass laminates, vinylester resins, and computational weight optimization. The shipyard expanded its engineering atelier to construct ocean-going cruisers compliant with stringent international CE Category A and RINA maritime standards.",
      highlights: [
        "Deployment of multi-axial laminates for superior impact strength",
        "Introduction of long-range ocean hull forms with reduced draft",
        "Expansion into international export markets across the GCC & Europe"
      ],
      metric: "CE Class A",
      metricLabel: "Ocean-Going Certification",
      image: "/images/asmaraty-racing-yacht-journey.jpg"
    },
    {
      period: "2006 — 2018",
      shortYear: "2006",
      title: "The G-Class Flybridge Architectural Era",
      badge: "Modern Flybridge Fleet",
      subtitle: "Harmonizing Panoramic Glass with Aerodynamic Silhouettes",
      narrative: "Recognizing that contemporary yacht owners seek expansive social spaces and seamless connection with the sea, ASMARATY developed the G-Class line. Characterized by wide-beam flybridges, flush main salon entries, and integrated glass cockpit bridges, this generation redefined Arabian motor yacht elegance.",
      highlights: [
        "Unveiling of the G-50 Sports Cruiser and G-66 Flybridge models",
        "Glass-cockpit helm integration with Garmin navigation avionics",
        "Handcrafted in-house marine joinery and panoramic salon glazing"
      ],
      metric: "G-Class",
      metricLabel: "Flybridge Fleet Launch",
      image: "/images/a77-journey-bg.jpg"
    },
    {
      period: "2019 — Present",
      shortYear: "Present",
      title: "The Bespoke Superyacht Age",
      badge: "Flagship G-100 & Bespoke Ateliers",
      subtitle: "100% Vacuum Resin Infusion & Private Owner Commissions",
      narrative: "Today, ASMARATY represents the pinnacle of bespoke yacht manufacturing in the United Arab Emirates. With our flagship 100-foot G-100 tri-deck superyacht, 100% void-free vacuum resin infusion, and direct owner collaboration, each yacht is an individualized work of art crafted for captains and maritime connoisseurs worldwide.",
      highlights: [
        "100 ft multi-deck flagship capability with ocean-crossing range",
        "100% void-free vacuum infusion composite construction",
        "Tailor-made owner bespoke commissioning program"
      ],
      metric: "100 FT",
      metricLabel: "Bespoke Flagship Capability",
      image: "/images/g100-flagship.jpg"
    }
  ];

  // 3. Tactile Materials Showcase (Inspired by Ferretti, Riva & Azimut Ateliers)
  const materials = [
    {
      id: "teak",
      name: "Burma Teak Marine Decking",
      category: "Exterior Carpentry",
      origin: "Hand-Selected Marine Hardwood",
      description: "Carefully seasoned natural teak planks, hand-laid and rubber-caulked across swim platforms, flybridges, and side-decks. Rich in natural oils, it resists intense solar radiation and saltwater while providing velvety barefoot grip.",
      attributes: ["Hand-Caulked Joints", "Quarter-Sawn Grain", "High Salt & UV Resilience"],
      image: "/images/interiors/g50-flybridge-helm.jpg"
    },
    {
      id: "marble",
      name: "Weight-Compensated Italian Marbles",
      category: "Stateroom & Bar Ateliers",
      origin: "Carrara & Nero Marquina, Italy",
      description: "Authentic Calacatta Gold and Nero Marquina slabs precision-sliced to thin veneers and bonded onto aerospace-grade aluminum honeycomb backing. Delivers the palatial grandeur of solid stone with zero weight penalty on vessel performance.",
      attributes: ["Aerospace Honeycomb Backing", "Zero Speed Penalty", "Seamless Bookmatched Veins"],
      image: "/images/interiors/g100-master-suite.jpg"
    },
    {
      id: "leather",
      name: "Full-Grain Saddle-Stitched Leathers",
      category: "Helm & Salon Upholstery",
      origin: "Tuscan Marine Tanneries",
      description: "Supple, drum-dyed full-grain leather treated with specialized hydrophobic, salt-mist, and UV-inhibiting coatings. Hand-stitched by our master saddlers onto helm steering consoles, ergonomic captain chairs, and salon headboards.",
      attributes: ["Drum-Dyed Full Grain", "Hydrophobic UV Treatment", "Artisan Twin-Needle Stitching"],
      image: "/images/interiors/g100-helm-station.jpg"
    },
    {
      id: "steel",
      name: "Marine Grade 316L Stainless Steel & Titanium",
      category: "Architectural Metalwork",
      origin: "In-House Metallurgy Atelier",
      description: "All deck cleats, stanchions, handrails, swim ladders, and signature wing emblems are fabricated from high-grade 316L marine stainless steel, hand-buffed to a mirror reflection that defies coastal oxidation.",
      attributes: ["Electropolished 316L Alloy", "Corrosion-Proof Salt Mirror", "In-House TIG Welded"],
      image: "/images/interiors/g100-main-salon.jpg"
    }
  ];

  // 4. The 5-Step Owner Commissioning Process (Inspired by Sanlorenzo Tailor-Made & Riva)
  const commissionSteps = [
    {
      number: "01",
      phase: "The Preliminary Vision",
      title: "Direct Architectural Dialogue",
      desc: "Every ASMARATY commission begins with a private conversation. Prospective owners meet directly with our chief naval architects to define hull scale, layout flow, lifestyle requirements, and ocean-cruising intentions.",
      badge: "Week 01 — 04"
    },
    {
      number: "02",
      phase: "Hydrodynamic Engineering",
      title: "CFD Modeling & Hull Optimization",
      desc: "Our engineering bureau runs computational fluid dynamics simulations on hull geometry, propeller pitch, and weight distribution to balance fuel efficiency, top speed, and offshore wave-slicing stability.",
      badge: "Week 04 — 08"
    },
    {
      number: "03",
      phase: "Artisan Material Curation",
      title: "Bespoke Interior Atelier",
      desc: "Owners hand-select timber veneers, Italian marbles, lighting architectures, and upholstery leathers inside our shipyard atelier, creating a private ocean sanctuary tailored to their individual aesthetics.",
      badge: "Week 08 — 14"
    },
    {
      number: "04",
      phase: "Precision Shipyard Craft",
      title: "Vacuum Infusion & Assembly",
      desc: "Within our climate-controlled Ajman halls, multi-axial composite laminates are vacuum infused with vinylester resin. Craftsmen fit custom cabinetry, hydraulic systems, and Garmin glass bridge electronics.",
      badge: "Week 14 — Handover"
    },
    {
      number: "05",
      phase: "Sea Trials & Delivery",
      title: "Open-Water Handover & Maiden Voyage",
      desc: "Prior to delivery, every vessel undergoes extensive sea trials in the Arabian Gulf. All mechanical, electrical, and navigation systems are stress-tested before a formal handover ceremony and maiden voyage.",
      badge: "Delivery Day"
    }
  ];

  // 5. Shipyard Facility Infrastructure (Certified Quality & Advanced Manufacturing)
  const facilityAreas = [
    {
      icon: <Layers className="w-5 h-5 text-[#C6A155]" />,
      title: "Climate-Controlled Infusion Halls",
      desc: "Regulated temperature and humidity environments ensuring flawless vinylester resin curing and zero-void composite consolidation."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#C6A155]" />,
      title: "ISO 9001 & CE Class A Ocean Standards",
      desc: "Built to stringent ISO 9001 quality management, CE Category A Ocean classifications, and US Coast Guard safety requirements."
    },
    {
      icon: <Building2 className="w-5 h-5 text-[#C6A155]" />,
      title: "In-House Joinery & Cabinetmaking Atelier",
      desc: "Master woodworkers handcrafting bookmatched veneers, teak decks, and bespoke architectural cabinetry with millimeter precision."
    },
    {
      icon: <Anchor className="w-5 h-5 text-[#C6A155]" />,
      title: "Deep-Water Launch Slipways & Marina",
      desc: "Direct deep-water berths in Ajman, UAE, enabling immediate open-sea testing and commissioning for yachts up to 100 feet."
    }
  ];

  // 6. Curated Fleet Showcase (Inspired by Riva & Sanlorenzo)
  const fleetOverview = [
    {
      model: "ASMARATY G-100",
      category: "Flagship Superyacht",
      length: "100 FT / 30.5 M",
      speed: "35 Knots",
      guests: "12 Guests",
      image: "/images/yachts/g100.jpg",
      slug: "g100",
      desc: "Our tri-deck flagship masterpiece embodying the pinnacle of contemporary naval architecture and private ocean-going luxury."
    },
    {
      model: "ASMARATY G-77",
      category: "Luxury Ocean Cruiser",
      length: "77 FT / 23.5 M",
      speed: "32 Knots",
      guests: "10 Guests",
      image: "/images/yachts/g77.jpg",
      slug: "g77",
      desc: "A bold, athletic long-range cruising yacht combining panoramic flybridge living with exhilarating offshore performance."
    },
    {
      model: "ASMARATY G-66",
      category: "Flybridge Yacht",
      length: "66 FT / 20.1 M",
      speed: "34 Knots",
      guests: "8 Guests",
      image: "/images/yachts/g66.jpg",
      slug: "g66",
      desc: "Harmonizing expansive outdoor entertainment decks with an open-plan salon and generous lower accommodations."
    },
    {
      model: "ASMARATY G-50",
      category: "Sports Cruiser",
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
            1. CINEMATIC HERO SECTION (Inspired by Riva & Sanlorenzo)
               Features Coordinates, Brand Crest, Grand Serif Typography
           ========================================================= */}
        <section className="relative min-h-[90vh] sm:min-h-[94vh] flex flex-col justify-center items-center overflow-hidden bg-[#080B10]">
          {/* Background Shipyard Facility Photo with Dark Vignette */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/asmaraty-shipyard-facility.jpg"
              alt="ASMARATY Shipyard Facility Ajman UAE"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.34] contrast-[1.18]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/60 to-[#08101C]/85" />
            <div className="absolute inset-0 bg-radial-vignette opacity-80" />
          </div>

          {/* ASMARATY Monogram Watermark Pattern Overlay */}
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

            {/* GPS Coordinates & Origin Badge (Signature Superyacht Section Pattern) */}
            <div className="inline-flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-sans font-medium">
              <span className="w-6 sm:w-10 h-[1px] bg-[#C6A155]/80" />
              25°25&apos;08&quot;N 55°30&apos;14&quot;E • AJMAN, UNITED ARAB EMIRATES
              <span className="w-6 sm:w-10 h-[1px] bg-[#C6A155]/80" />
            </div>

            {/* Grand Architectural Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[78px] font-normal leading-[1.06] text-white tracking-[0.02em]">
              The Architecture of <br className="hidden sm:inline" />
              <span className="italic font-normal">Maritime Distinction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-3xl mx-auto font-sans">
              Where four decades of master boatbuilding heritage converge with vacuum composite engineering, panoramic ocean living, and the bespoke visions of discerning yacht owners.
            </p>

            {/* Action Buttons */}
            <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <a
                href="#heritage-timeline"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Explore Shipyard Heritage
                <ChevronRight className="w-4 h-4 ml-2" />
              </a>
              <Link
                href="/yachts"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-white/25 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 transition-colors cursor-pointer"
              >
                Explore Fleet Collection
              </Link>
            </div>
          </div>

          {/* Quick Chapter Navigation Ribbon */}
          <div className="relative z-10 w-full border-t border-white/10 bg-[#08101C]/85 backdrop-blur-md py-4">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-center gap-5 sm:gap-9 text-[11px] sm:text-xs font-sans tracking-[0.18em] uppercase text-white/60">
              <a href="#philosophy" className="hover:text-[#C6A155] transition-colors">I. Philosophy</a>
              <span className="text-white/20">•</span>
              <a href="#heritage-timeline" className="hover:text-[#C6A155] transition-colors">II. Heritage Timeline</a>
              <span className="text-white/20">•</span>
              <a href="#shipyard-facilities" className="hover:text-[#C6A155] transition-colors">III. Shipyard</a>
              <span className="text-white/20">•</span>
              <a href="#naval-architecture" className="hover:text-[#C6A155] transition-colors">IV. Engineering</a>
              <span className="text-white/20">•</span>
              <a href="#materials-atelier" className="hover:text-[#C6A155] transition-colors">V. Materials</a>
              <span className="text-white/20">•</span>
              <a href="#commission-journey" className="hover:text-[#C6A155] transition-colors">VI. Custom Process</a>
              <span className="text-white/20">•</span>
              <a href="#fleet-dossier" className="hover:text-[#C6A155] transition-colors">VII. Fleet</a>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. HERITAGE STATS BANNER (Inspired by Sunseeker & Riva)
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
            3. CHAPTER I: THE SHIPYARD PHILOSOPHY (Editorial Layout)
           ========================================================= */}
        <section id="philosophy" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative & Philosophy */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER I • OUR PHILOSOPHY
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
            4. CHAPTER II: INTERACTIVE HERITAGE TIMELINE (Decades Slider)
               (Signature Design Section of Sanlorenzo, Riva & Feadship)
           ========================================================= */}
        <section id="heritage-timeline" className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          {/* Wings watermark background */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 select-none opacity-[0.04]"
            style={{
              backgroundImage: "url('/images/asmaraty-wings-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center top",
              backgroundSize: "220px 120px",
            }}
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-18">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER II • DECADES OF DISTINCTION
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                The Heritage Timeline
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                An unbroken lineage of Arabian boatbuilding innovation, tracing our evolution from pioneer fiberglass workshops in 1979 to multi-deck superyachts.
              </p>

              {/* Interactive Decade Tabs */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {decades.map((dec, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveDecade(idx)}
                    className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 border cursor-pointer ${
                      activeDecade === idx
                        ? "bg-[#C6A155] text-black border-[#C6A155] shadow-lg shadow-[#C6A155]/20"
                        : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {dec.period}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Decade Editorial Display Card */}
            <div className="bg-[#0B1526]/80 border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Left: Historic Visual */}
                <div className="lg:col-span-6 relative group overflow-hidden bg-black/40 border border-white/10">
                  <div className="aspect-[16/11] relative overflow-hidden">
                    <img
                      src={decades[activeDecade].image}
                      alt={decades[activeDecade].title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute top-4 left-4 bg-[#C6A155] text-black text-[11px] font-bold px-3 py-1 uppercase tracking-wider shadow">
                    {decades[activeDecade].shortYear}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
                    <span className="font-mono text-[#C6A155]">{decades[activeDecade].metric}</span>
                    <span className="text-white/60">{decades[activeDecade].metricLabel}</span>
                  </div>
                </div>

                {/* Right: Narrative & Milestone Details */}
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-2">
                      {decades[activeDecade].badge}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight">
                      {decades[activeDecade].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 font-light mt-1 italic">
                      {decades[activeDecade].subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light text-justify" style={{ textJustify: "inter-word" }}>
                    {decades[activeDecade].narrative}
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-white/10">
                    {decades[activeDecade].highlights.map((item, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2.5 text-xs text-white/90">
                        <CheckCircle2 className="w-4 h-4 text-[#C6A155] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. CHAPTER III: THE UAE SHIPYARD & FACILITIES BLUEPRINT
               (Signature Design Section of Gulf Craft & Sunseeker)
           ========================================================= */}
        <section id="shipyard-facilities" className="py-20 sm:py-28 lg:py-32 bg-[#FAF8F5] text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Shipyard Photo */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative group overflow-hidden shadow-2xl bg-[#08101C]">
                  <img
                    src="/images/asmaraty-shipyard-facility.jpg"
                    alt="ASMARATY Luxury Yachts Shipyard Facility Ajman UAE"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-[#08101C]/85 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Shipyard Infrastructure</span>
                    Direct deep-water marina berths & climate-controlled composite lamination halls in Ajman, UAE.
                  </div>
                </div>
              </div>

              {/* Right Column: Shipyard Capabilities Narrative & Infrastructure Grid */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER III • SHIPYARD EXCELLENCE
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#0E2047] tracking-[0.02em]">
                  Where Masterpieces Take Form
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-[#0E2047]/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                  <p>
                    Nestled along the deep-water maritime coastline of the United Arab Emirates, our shipyard spans modern construction facilities designed to handle every facet of luxury yacht manufacturing in-house.
                  </p>
                  <p>
                    Rooted in an unbroken boatbuilding lineage established in 1979 — one of the Arabian Gulf&apos;s most respected maritime pioneers — ASMARATY draws upon four decades of proprietary mold fabrication, structural naval engineering, and offshore ocean testing.
                  </p>
                  <p>
                    From multi-deck superyachts up to 100 feet to high-performance open cruisers, our craftsmen, laminators, marine electricians, and interior cabinetmakers work side by side under rigorous international quality controls.
                  </p>
                </div>

                {/* Infrastructure Metric Grid */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {facilityAreas.map((area, idx) => (
                    <div key={idx} className="p-4 bg-white border border-[#0E2047]/10 shadow-sm space-y-1.5">
                      <div className="flex items-center gap-2">
                        {area.icon}
                        <h4 className="font-serif text-sm font-semibold text-[#0E2047]">{area.title}</h4>
                      </div>
                      <p className="text-xs text-[#0E2047]/70 leading-relaxed font-light">{area.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center h-[50px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors cursor-pointer shadow-md"
                  >
                    Request Shipyard Tour
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. CHAPTER IV: NAVAL ARCHITECTURE & COMPOSITE SCIENCE
               (Signature Design Section of Wally & Sanlorenzo)
           ========================================================= */}
        <section id="naval-architecture" className="py-20 sm:py-28 lg:py-32 bg-[#091322] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Engineering Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER IV • NAVAL ENGINEERING
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white tracking-[0.02em]">
                  Advanced Vacuum-Infused Composites
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                  <p>
                    Every ASMARATY yacht is conceived from the water up. Utilizing multi-axial glass fiber reinforcements, carbon fiber structural bulkheads, and high-performance vinylester resins processed via advanced vacuum resin infusion, our hulls achieve exceptional structural rigidity.
                  </p>
                  <p>
                    By precisely controlling the resin-to-fiber ratio, vacuum infusion eliminates air voids, minimizes overall hull displacement without sacrificing strength, and yields extraordinary acoustic dampening so cruising is whisper-quiet.
                  </p>
                  <p>
                    Combined with sharp bow entries, spray rails, and wide chines, our naval hulls plane cleanly, slice through choppy waves with minimal slamming, and deliver superior fuel economy across extended cruising ranges.
                  </p>
                </div>

                {/* Technical highlights */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <div className="space-y-1">
                    <div className="font-serif text-2xl sm:text-3xl font-light text-[#C6A155]">35%</div>
                    <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Weight Reduction</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-2xl sm:text-3xl font-light text-[#C6A155]">100%</div>
                    <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Void-Free Infusion</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-2xl sm:text-3xl font-light text-[#C6A155]">Whisper</div>
                    <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">Acoustic Dampening</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/yachts/g100"
                    className="inline-flex items-center justify-center h-[50px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-[#C6A155] text-[#C6A155] hover:bg-[#C6A155] hover:text-black transition-colors cursor-pointer"
                  >
                    Explore Flagship G-100 Dossier
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Flagship G100 past Burj Al Arab */}
              <div className="lg:col-span-6">
                <div className="relative group overflow-hidden shadow-2xl bg-[#08101C] border border-white/10">
                  <img
                    src="/images/yachts/g100.jpg"
                    alt="ASMARATY G100 Superyacht cruising past Burj Al Arab in Dubai"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-[#08101C]/85 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Flagship G-100 Superyacht</span>
                    100 ft multi-deck naval architecture cruising the Arabian Gulf past Burj Al Arab.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            7. CHAPTER V: THE ATELIER — NOBLE MATERIALS PALETTE
               (Signature Design Section of Riva, Ferretti & Azimut)
           ========================================================= */}
        <section id="materials-atelier" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-18">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER V • TACTILE CRAFTSMANSHIP
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#0E2047]">
                Materials of the Atelier
              </h2>
              <p className="text-sm sm:text-base text-[#0E2047]/75 font-normal leading-relaxed">
                The essence of superyacht luxury lives in the tactile touch. From seasoned Burma teak to aerospace-compensated Italian marbles, inspect the materials curated by our in-house ateliers.
              </p>

              {/* Material Tab Buttons */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {materials.map((mat, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMaterial(idx)}
                    className={`px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 border cursor-pointer ${
                      activeMaterial === idx
                        ? "bg-[#0E2047] text-white border-[#0E2047] shadow"
                        : "bg-[#F7F5F0] text-[#0E2047]/70 border-[#0E2047]/15 hover:border-[#0E2047]/40 hover:text-[#0E2047]"
                    }`}
                  >
                    {mat.name.split(" ")[0]} {mat.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Material Feature Box */}
            <div className="bg-[#FAF9F6] border border-[#0E2047]/10 p-6 sm:p-10 lg:p-12 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-6 relative aspect-[16/11] overflow-hidden shadow-lg bg-black">
                  <img
                    src={materials[activeMaterial].image}
                    alt={materials[activeMaterial].name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-[#C6A155] text-black text-[11px] font-bold px-3 py-1 uppercase tracking-wider shadow">
                    {materials[activeMaterial].category}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold block">
                      {materials[activeMaterial].origin}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0E2047]">
                      {materials[activeMaterial].name}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#0E2047]/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                    {materials[activeMaterial].description}
                  </p>

                  <div className="pt-2 border-t border-[#0E2047]/10 space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#0E2047]/60 font-semibold block">
                      Atelier Craftsmanship Highlights:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {materials[activeMaterial].attributes.map((attr, aIdx) => (
                        <span key={aIdx} className="inline-flex items-center px-3 py-1 bg-white text-xs text-[#0E2047] border border-[#0E2047]/15 rounded-full font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A155] mr-1.5" />
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            8. CHAPTER VI: THE 5-STEP BESPOKE COMMISSION JOURNEY
               (Signature Design Section of Sanlorenzo Tailor-Made & Riva)
           ========================================================= */}
        <section id="commission-journey" className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER VI • TAILOR-MADE PROCESS
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                The Owner Commission Journey
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                From the first sketch to the maiden voyage, every ASMARATY build is a personal collaboration between the owner and our senior naval engineers.
              </p>
            </div>

            {/* 5-Step Process Timeline Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {commissionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded bg-[#0E1A2E]/70 border border-white/10 hover:border-[#C6A155]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-3xl sm:text-4xl font-light text-[#C6A155]">
                        {step.number}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 px-2 py-0.5 border border-white/10 rounded">
                        {step.badge}
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
                    <span>Phase {step.number}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            9. CHAPTER VII: CURATED FLEET COLLECTION DOSSIER
               (Signature Design Section of World-Class Yacht Builders)
           ========================================================= */}
        <section id="fleet-dossier" className="py-20 sm:py-28 lg:py-32 bg-[#0B1424] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER VII • THE FLEET
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                Engineered for the Open Sea
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                Explore our signature fleet models, each embodying the unique balance of contemporary design and maritime engineering.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
              {fleetOverview.map((item, idx) => (
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
                      {item.category}
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
                        Explore Model
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
            10. VIP MARITIME CONCIERGE & SHIPYARD TOUR INVITATION (CTA)
           ========================================================= */}
        <section className="py-20 sm:py-28 bg-[#080B10] text-white relative overflow-hidden border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center relative z-10 space-y-6">
            {/* ASMARATY Wings Emblem */}
            <div className="flex justify-center mb-2">
              <AsmaratyLogo variant="emblem" tone="light" className="h-10 sm:h-12 opacity-90" />
            </div>

            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-semibold">
              <span className="w-6 h-[1.5px] bg-[#C6A155]" />
              VIP MARITIME CONCIERGE
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
