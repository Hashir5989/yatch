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
  Ship
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

export default function AboutPage() {
  const [page, setPage] = useState(() => getPageBySlug("/about"));
  const [activeTab, setActiveTab] = useState("all");

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

  const stats = [
    { value: "1979", label: "Year Founded in UAE", desc: "Four decades of pioneering Arabian composite boatbuilding" },
    { value: "45+", label: "Years of Heritage", desc: "Unbroken lineage of naval architecture & maritime craft" },
    { value: "100 FT", label: "Flagship Capability", desc: "Multi-deck ocean-going bespoke superyachts" },
    { value: "100%", label: "In-House Craftsmanship", desc: "Direct owner collaboration from preliminary sketch to sea trial" }
  ];

  const pillars = [
    {
      icon: <Compass className="w-6 h-6 text-[#C6A155]" />,
      number: "01",
      title: "Master Naval Architecture",
      desc: "Hydrodynamically refined hull geometries, razor-sharp bow entries, and generous beam proportions engineered for uncompromised stability and effortless ocean-going efficiency."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C6A155]" />,
      number: "02",
      title: "Vacuum-Infused Composites",
      desc: "Advanced multi-axial glass and carbon fiber reinforcements consolidated with high-grade vinylester resin via vacuum infusion, delivering whisper-quiet acoustics and supreme structural longevity."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[#C6A155]" />,
      number: "03",
      title: "Artisan Interior Tailoring",
      desc: "Handcrafted book-matched veneers, precision Italian fittings, marine-grade marbles, and hand-stitched leathers created in our private in-house atelier to each owner's exact vision."
    },
    {
      icon: <Anchor className="w-6 h-6 text-[#C6A155]" />,
      number: "04",
      title: "Direct Shipyard Dialogue",
      desc: "Every ASMARATY commission is a deeply personal journey. Owners collaborate directly with our senior naval engineers and master builders from preliminary sketches to the maiden voyage."
    }
  ];

  const interiorHighlights = [
    {
      title: "Navigation Bridge & Glass Cockpit",
      subtitle: "State-of-the-Art Ergonomic Helm",
      description: "Integrated Garmin glass displays, ergonomic leather helm chairs, and 360-degree panoramic sightlines engineered for captain and owner confidence.",
      image: "/images/interiors/g100-helm-station.jpg"
    },
    {
      title: "Grand Main Salon & Ocean Lounge",
      subtitle: "Panoramic Living & Formal Dining",
      description: "Expansive floor-to-ceiling salon windows, hand-laid parquet flooring, Italian bespoke upholstery, and direct flush access to the aft cockpit deck.",
      image: "/images/interiors/g100-main-salon.jpg"
    },
    {
      title: "Full-Beam Owner’s Master Suite",
      subtitle: "Handcrafted Luxury Stateroom",
      description: "Spanning the yacht's complete beam with walk-around king berth, bespoke vanity desk, Italian marble ensuite, and whisper-quiet acoustic insulation.",
      image: "/images/interiors/g100-master-suite.jpg"
    }
  ];

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
            1. HERO SECTION: Cinematic Heritage & Maritime Masterpiece
           ========================================================= */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col justify-center items-center overflow-hidden bg-[#080B10]">
          {/* Background Photo with Dark Luxury Vignette Gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/asmaraty-shipyard-facility.jpg"
              alt="ASMARATY Shipyard Facility UAE"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.38] contrast-[1.15]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/65 to-[#08101C]/80" />
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

          <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center space-y-6 pt-24 sm:pt-32 pb-16">
            {/* ASMARATY Brand Emblem */}
            <div className="flex justify-center">
              <AsmaratyLogo variant="emblem" tone="light" className="h-11 sm:h-14 opacity-95 hover:opacity-100 transition-opacity" priority />
            </div>

            {/* Eyebrow with gold bars */}
            <div className="inline-flex items-center gap-2 sm:gap-3 text-xs sm:text-[13px] uppercase tracking-[0.28em] text-[#C6A155] font-sans font-medium">
              <span className="w-8 sm:w-12 h-[1px] bg-[#C6A155]/80" />
              PIONEERING ARABIAN SHIPBUILDING • EST. 1979
              <span className="w-8 sm:w-12 h-[1px] bg-[#C6A155]/80" />
            </div>

            {/* Grand Title */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[1.08] text-white tracking-[0.02em]">
              The Architecture of <br className="hidden sm:inline" />
              <span className="italic font-normal">Maritime Distinction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 font-light leading-relaxed max-w-3xl mx-auto font-sans">
              Where four decades of master boatbuilding heritage converge with avant-garde composite science, expansive luxury living, and the eternal allure of the open sea.
            </p>

            {/* Action Buttons */}
            <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <a
                href="#our-story"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Discover Our Heritage
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
          <div className="relative z-10 w-full border-t border-white/10 bg-[#08101C]/80 backdrop-blur-md py-4">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-sans tracking-[0.18em] uppercase text-white/60">
              <a href="#our-story" className="hover:text-[#C6A155] transition-colors">I. Heritage</a>
              <span className="text-white/20">•</span>
              <a href="#shipyard" className="hover:text-[#C6A155] transition-colors">II. Shipyard</a>
              <span className="text-white/20">•</span>
              <a href="#engineering" className="hover:text-[#C6A155] transition-colors">III. Engineering</a>
              <span className="text-white/20">•</span>
              <a href="#pillars" className="hover:text-[#C6A155] transition-colors">IV. Pillars</a>
              <span className="text-white/20">•</span>
              <a href="#interiors" className="hover:text-[#C6A155] transition-colors">V. Interiors</a>
              <span className="text-white/20">•</span>
              <a href="#fleet" className="hover:text-[#C6A155] transition-colors">VI. Fleet</a>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. HERITAGE STATS: Proven Shipyard Pedigree
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
            3. CHAPTER I: A Shared Passion for Life at Sea (Philosophy)
           ========================================================= */}
        <section id="our-story" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
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

              {/* Right Column: Hero Visual */}
              <div className="lg:col-span-6">
                <div className="relative group overflow-hidden shadow-2xl bg-[#08101C]">
                  <img
                    src="/images/asmaraty-shared-passion.jpg"
                    alt="ASMARATY Luxury Yacht cruising at sunset with illuminated emblem"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Signature Aesthetics</span>
                    Illuminated ASMARATY wing emblem and panoramic flybridge architecture cruising the coast.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. CHAPTER II: The UAE Shipyard Facility (Al Shaali Marine)
           ========================================================= */}
        <section id="shipyard" className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          {/* Wings watermark background */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 select-none opacity-[0.05]"
            style={{
              backgroundImage: "url('/images/asmaraty-wings-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center top",
              backgroundSize: "220px 120px",
            }}
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Shipyard Photo */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="relative group overflow-hidden shadow-2xl bg-[#0B1424] border border-white/10">
                  <img
                    src="/images/asmaraty-shipyard-facility.jpg"
                    alt="Al Shaali Marine - ASMARATY Luxury Yachts Shipyard Facility UAE"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-[#08101C]/85 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Shipyard Infrastructure</span>
                    Direct deep-water marina berths & climate-controlled composite lamination halls in Ajman, UAE.
                  </div>
                </div>
              </div>

              {/* Right Column: Shipyard Capabilities Narrative */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER II • SHIPYARD EXCELLENCE
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white tracking-[0.02em]">
                  Where Masterpieces Take Form
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-white/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                  <p>
                    Nestled along the deep-water maritime coastline of the United Arab Emirates, our shipyard spans modern construction facilities designed to handle every facet of luxury yacht manufacturing in-house.
                  </p>
                  <p>
                    Built in collaboration with Al Shaali Marine — one of the Arabian Gulf&apos;s most respected boatbuilding pioneers established in 1979 — ASMARATY draws upon four decades of proprietary mold fabrication, structural naval engineering, and ocean testing.
                  </p>
                  <p>
                    From multi-deck superyachts up to 100 feet to high-performance open cruisers, our craftsmen, laminators, marine electricians, and interior cabinetmakers work side by side under rigorous international quality controls.
                  </p>
                </div>

                {/* Facility Key Features */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-white/90">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A155] shrink-0 mt-0.5" />
                    <span>Climate-controlled composite infusion halls</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A155] shrink-0 mt-0.5" />
                    <span>In-house bespoke joinery & upholstery ateliers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A155] shrink-0 mt-0.5" />
                    <span>Comprehensive marine electrical & hydraulic testing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#C6A155] shrink-0 mt-0.5" />
                    <span>Private marina berths for open-water sea trials</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center h-[50px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors cursor-pointer"
                  >
                    Request Private Tour
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. CHAPTER III: Advanced Naval Architecture & Hydrodynamics
           ========================================================= */}
        <section id="engineering" className="py-20 sm:py-28 lg:py-32 bg-[#FAF8F5] text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Engineering Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER III • NAVAL ENGINEERING
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#0E2047] tracking-[0.02em]">
                  Advanced Vacuum-Infused Composites
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-[#0E2047]/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
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
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#0E2047]/10">
                  <div className="space-y-1">
                    <div className="font-serif text-2xl font-normal text-[#C6A155]">35%</div>
                    <div className="text-[11px] uppercase tracking-wider text-[#0E2047]/70 font-semibold">Weight Reduction</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-2xl font-normal text-[#C6A155]">100%</div>
                    <div className="text-[11px] uppercase tracking-wider text-[#0E2047]/70 font-semibold">Void-Free Infusion</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-serif text-2xl font-normal text-[#C6A155]">Whisper</div>
                    <div className="text-[11px] uppercase tracking-wider text-[#0E2047]/70 font-semibold">Acoustic Dampening</div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    href="/yachts/g100"
                    className="inline-flex items-center justify-center h-[50px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-[#0E2047] text-[#0E2047] hover:bg-[#0E2047] hover:text-white transition-colors cursor-pointer"
                  >
                    Explore Flagship G-100
                  </Link>
                </div>
              </div>

              {/* Right Column: G100 Yacht Photo past Burj Al Arab */}
              <div className="lg:col-span-6">
                <div className="relative group overflow-hidden shadow-2xl bg-[#08101C]">
                  <img
                    src="/images/yachts/g100.jpg"
                    alt="ASMARATY G100 Superyacht cruising past Burj Al Arab in Dubai"
                    className="w-full h-[460px] sm:h-[540px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Flagship G-100 Superyacht</span>
                    100 ft multi-deck naval architecture cruising the Arabian Gulf past Burj Al Arab.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. FOUR PILLARS OF SHIPBUILDING EXCELLENCE
           ========================================================= */}
        <section id="pillars" className="py-20 sm:py-28 lg:py-32 bg-[#091322] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                FOUNDATIONAL PILLARS
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal uppercase tracking-[0.03em] text-white">
                The Pillars of ASMARATY
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                Four guiding principles that distinguish every yacht designed and built within our Arabian Gulf shipyard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-lg bg-[#0E1A2E]/60 border border-white/10 hover:border-[#C6A155]/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:border-[#C6A155]/40 transition-colors">
                        {pillar.icon}
                      </div>
                      <span className="font-serif text-2xl font-light text-white/30 group-hover:text-[#C6A155] transition-colors">
                        {pillar.number}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-normal text-white mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            7. CHAPTER IV: Artisan Interiors & Bespoke Custom Tailoring
           ========================================================= */}
        <section id="interiors" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-18">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER IV • BESPOKE CRAFTSMANSHIP
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#0E2047]">
                Intimate Spaces, Peerless Comfort
              </h2>
              <p className="text-sm sm:text-base text-[#0E2047]/75 font-normal leading-relaxed">
                From full-beam master staterooms and sunlit main salons to ergonomic navigation bridges, our interior ateliers curate living spaces tailored to each client&apos;s individual lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {interiorHighlights.map((item, idx) => (
                <div key={idx} className="group overflow-hidden bg-[#0A1322] shadow-xl border border-black/5 flex flex-col">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="p-6 bg-[#FAF9F6] flex-1 flex flex-col justify-between border-t border-[#0E2047]/10">
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold block">
                        {item.subtitle}
                      </span>
                      <h4 className="font-serif text-lg font-normal text-[#0E2047]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#0E2047]/70 leading-relaxed font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            8. CHAPTER V: THE ASMARATY FLEET OVERVIEW
           ========================================================= */}
        <section id="fleet" className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                CHAPTER V • THE FLEET
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
            9. PRIVATE SHIPYARD DIALOGUE & VIP TOUR CONCIERGE (CTA)
           ========================================================= */}
        <section className="py-20 sm:py-28 bg-[#080B10] text-white relative overflow-hidden border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center relative z-10 space-y-6">
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
