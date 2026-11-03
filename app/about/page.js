"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Anchor, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  Maximize2,
  PhoneCall
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

export default function AboutPage() {
  const [page, setPage] = useState(() => getPageBySlug("/about"));

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
    { value: "1979", label: "Year Founded in UAE", desc: "Four decades of pioneering shipbuilding" },
    { value: "45+", label: "Years of Heritage", desc: "Master naval architecture & composite science" },
    { value: "100 FT", label: "Flagship Capability", desc: "Multi-deck ocean-crossing superyachts" },
    { value: "100%", label: "Bespoke In-House", desc: "Direct owner dialogue with naval architects" }
  ];

  const pillars = [
    {
      icon: <Compass className="w-6 h-6 text-[#C6A155]" />,
      number: "01",
      title: "Master Naval Architecture",
      desc: "Hydrodynamically refined hull geometries, sharp bow entries, and generous beam proportions engineered for uncompromised stability and effortless ocean-going efficiency."
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
      desc: "Every ASMARATY commission is a personal journey. Owners collaborate directly with our senior naval engineers and master builders from preliminary sketches to the maiden voyage."
    }
  ];

  const interiorHighlights = [
    {
      title: "Navigation Bridge & Glass Cockpit",
      subtitle: "State-of-the-Art Helm Station",
      image: "/images/interiors/g100-helm-station.jpg"
    },
    {
      title: "Grand Main Salon & Ocean Lounge",
      subtitle: "Panoramic Living & Formal Dining",
      image: "/images/interiors/g100-main-salon.jpg"
    },
    {
      title: "Full-Beam Owner’s Master Suite",
      subtitle: "Handcrafted Luxury Stateroom",
      image: "/images/interiors/g100-master-suite.jpg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#08101C] text-[#E8EAEE] selection:bg-[#C6A155] selection:text-black">
      <PublicNavbar currentPageId={page?.id || "page-about"} />

      <main className="flex-1">
        {/* =========================================================
            1. HERO SECTION: Cinematic Heritage & Maritime Masterpiece
           ========================================================= */}
        <section className="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden bg-[#080B10]">
          {/* Background Photo with Dark Luxury Vignette Gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/asmaraty-shipyard-facility.jpg"
              alt="ASMARATY Shipyard Facility UAE"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.4] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/60 to-[#08101C]/80" />
            <div className="absolute inset-0 bg-radial-vignette opacity-80" />
          </div>

          {/* ASMARATY Monogram Watermark Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none z-[1] select-none opacity-5"
            style={{
              backgroundImage: "url('/images/asmaraty-wings-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
              backgroundSize: "280px"
            }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 text-center pt-28 pb-16 flex flex-col items-center">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C6A155]/40 bg-[#C6A155]/10 backdrop-blur-md mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A155] animate-pulse" />
              <span className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-[#DFBA73] font-medium font-sans">
                Heritage of Naval Excellence • UAE Shipyard
              </span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[0.03em] leading-[1.08] text-white max-w-5xl">
              The Signature <span className="italic font-light text-[#DFBA73]">Of The Sea</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-base sm:text-lg md:text-xl text-[#B9C2CE] max-w-3xl font-light leading-relaxed">
              Born from over four decades of Emirati maritime distinction, ASMARATY crafts tailor-made superyachts that unite classical naval architecture with aerospace composite engineering.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/yachts"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-colors shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Explore The Fleet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
              >
                Inquire With Shipyard
              </Link>
            </div>
          </div>

          {/* Bottom subtle divider */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C6A155]/30 to-transparent" />
        </section>

        {/* =========================================================
            2. HERITAGE STATS BANNER
           ========================================================= */}
        <section className="bg-[#0A1322] border-b border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-12 sm:py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="text-center lg:text-left border-l border-[#C6A155]/20 pl-6 sm:pl-8">
                  <div className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#C6A155] font-normal tracking-wide">
                    {stat.value}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white font-medium mt-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-[#828F9E] mt-1 font-light">
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            3. CHAPTER I: A Shared Passion for Life at Sea
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#08101C] relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Story */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-semibold">
                  <span className="w-6 h-[1.5px] bg-[#C6A155]" />
                  CHAPTER I • OUR ORIGINS
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                  Crafting Timeless Sovereignty Across Open Waters
                </h2>

                <p className="text-base sm:text-lg text-[#C8D1DC] font-light leading-relaxed">
                  ASMARATY was founded with a singular conviction: that a true superyacht is not merely an assembly of composite hulls and engines, but a floating sanctuary of freedom, grace, and unmatched bespoke tailoring.
                </p>

                <p className="text-sm sm:text-base text-[#8D9CAA] font-light leading-relaxed">
                  Headquartered in the United Arab Emirates and collaborating with legendary shipwright traditions dating back to 1979 through Al Shaali Marine, our naval architects harmonize deep Arabian seafaring heritage with avant-garde composite engineering. Every line drawn by our studio reflects a commitment to long-range cruising capability, silence underway, and commanding presence in any harbor worldwide.
                </p>

                {/* Quote Block */}
                <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-[#0F1B2F] to-[#0A1322] border-l-2 border-[#C6A155] rounded-r">
                  <p className="font-serif italic text-lg sm:text-xl text-[#F0F2F5] leading-relaxed">
                    &ldquo;We do not build for the masses. We build for the discerning voyager who demands that every seam, every grain of timber, and every degree of hull deadrise is executed to absolute perfection.&rdquo;
                  </p>
                  <div className="mt-4 text-xs uppercase tracking-[0.2em] text-[#C6A155] font-sans font-semibold">
                    — ASMARATY Naval Architecture Directorate
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Frame */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-none overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/images/yachts/g100.jpg"
                    alt="ASMARATY G100 Superyacht"
                    className="w-full h-full object-cover object-center scale-100 hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08101C]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                      Flagship Masterpiece
                    </span>
                    <h3 className="font-serif text-2xl text-white font-normal">
                      ASMARATY G100
                    </h3>
                    <p className="text-xs text-white/70 mt-1 font-light">
                      100 FT Tri-Deck Ocean Superyacht cruising off Dubai Marina
                    </p>
                  </div>
                </div>
                {/* Decorative border box behind */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border border-[#C6A155]/25 pointer-events-none hidden sm:block -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. CHAPTER II: The UAE Shipyard & Master Craftsmanship
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#FAF9F6] text-[#0E2047] relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Shipyard Image Grid */}
              <div className="lg:col-span-6 order-2 lg:order-1 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative aspect-[4/5] overflow-hidden shadow-lg border border-[#0E2047]/10">
                    <img
                      src="/images/asmaraty-shipyard-facility.jpg"
                      alt="ASMARATY Shipbuilding Hangar"
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#08101C]/80 backdrop-blur-sm text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]">
                      Composite Hall
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden shadow-lg border border-[#0E2047]/10">
                      <img
                        src="/images/interiors/g100-helm-station.jpg"
                        alt="Precision Glass Helm Cockpit"
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute bottom-3 left-3 bg-[#08101C]/80 backdrop-blur-sm text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]">
                        Bridge Ergonomics
                      </div>
                    </div>
                    <div className="relative aspect-square overflow-hidden shadow-lg border border-[#0E2047]/10">
                      <img
                        src="/images/interiors/g100-master-suite.jpg"
                        alt="Master Suite Joinery"
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute bottom-3 left-3 bg-[#08101C]/80 backdrop-blur-sm text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]">
                        Artisan Joinery
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Shipyard Heritage */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-semibold">
                  <span className="w-6 h-[1.5px] bg-[#C6A155]" />
                  CHAPTER II • SHIPYARD DISTINCTION
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-[#0E2047]">
                  The Art of In-House Shipbuilding
                </h2>

                <p className="text-base sm:text-lg text-[#0E2047]/80 font-normal leading-relaxed">
                  Located along the Arabian Gulf, our expansive shipyard complex integrates every phase of yacht construction under one roof: from hydrodynamic hull molding and resin infusion to electrical engineering, bespoke carpentry, and rigorous sea trials.
                </p>

                <p className="text-sm sm:text-base text-[#0E2047]/70 font-normal leading-relaxed">
                  In an industry increasingly dominated by mass modular assembly, ASMARATY proudly preserves the tradition of custom craftsmanship. Our master carpenters, leather tailors, and naval engineers work hand-in-hand with every patron, allowing infinite personalization of deck layouts, stateroom configurations, and propulsion systems.
                </p>

                {/* Key Facility Highlights */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A155] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-[#0E2047]">Climate-Controlled Infusion</h4>
                      <p className="text-xs text-[#0E2047]/70 mt-0.5">Strict temperature & humidity control for composite integrity.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A155] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-[#0E2047]">Direct Owner Engagement</h4>
                      <p className="text-xs text-[#0E2047]/70 mt-0.5">Walk the shipyard floor and monitor your build milestone by milestone.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A155] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-[#0E2047]">International Classification</h4>
                      <p className="text-xs text-[#0E2047]/70 mt-0.5">Engineered to RINA, CE, and US Coast Guard safety standards.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#C6A155] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-[#0E2047]">Private Deep-Water Launch</h4>
                      <p className="text-xs text-[#0E2047]/70 mt-0.5">Direct slipway access to open sea for multi-point dynamic testing.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            5. CHAPTER III: Engineering & Naval Architecture
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#0A1322] text-[#E8EAEE] relative border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Philosophy */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-semibold">
                  <span className="w-6 h-[1.5px] bg-[#C6A155]" />
                  CHAPTER III • NAVAL ARCHITECTURE
                </div>

                <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                  Engineered For Ocean Mastery & Utmost Silence
                </h2>

                <p className="text-base sm:text-lg text-[#C8D1DC] font-light leading-relaxed">
                  A yacht must not only captivate when berthed at the marina; it must excel in unpredictable open ocean swells. Our hull architectures are engineered with deep-V forward deadrise angles and spray-deflecting chines that ensure dry decks and silky sea-keeping.
                </p>

                <p className="text-sm sm:text-base text-[#8D9CAA] font-light leading-relaxed">
                  Utilizing state-of-the-art computational fluid dynamics (CFD) and structural FEA analysis, ASMARATY optimizes every bulkhead and longitudinal stringer. Combined with advanced vibration-dampening engine mounts and soundproofing insulation, voyages remain peaceful even at top cruising speeds.
                </p>

                <div className="pt-4 flex flex-wrap gap-6 text-sm text-[#DFBA73]">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span>Catamaran & Monohull R&D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Vinylester Vacuum Infusion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    <span>Global Range Autonomy</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hull Blueprint Diagram Graphic */}
              <div className="lg:col-span-6 relative">
                <div className="p-8 sm:p-10 rounded-none bg-[#080E18] border border-[#C6A155]/30 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold">
                      Engineering Specifications
                    </div>
                    <div className="text-[10px] tracking-widest text-[#828F9E] uppercase">
                      Class: Tri-Deck Superyacht
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-[#828F9E]">Hull Material</span>
                      <span className="text-white">Vacuum-Infused Vinylester & Carbon Hybrid</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-[#828F9E]">Naval Architecture</span>
                      <span className="text-white">ASMARATY In-House Marine Directorate</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-[#828F9E]">Propulsion Options</span>
                      <span className="text-white">Twin MAN / MTU Turbocharged Marine Diesels</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-[#828F9E]">Stabilization</span>
                      <span className="text-white">Zero-Speed Gyroscopic & Underway Fins</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 py-2">
                      <span className="text-[#828F9E]">Acoustic Insulation</span>
                      <span className="text-white">Multi-Layer Decibel Barrier Sub-Flooring</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-[#828F9E]">Certification</span>
                      <span className="text-[#DFBA73]">RINA Pleasure Yacht / CE Ocean Cat A</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <img 
                      src="/images/yachts/g100-hd.jpg" 
                      alt="ASMARATY G100 Profile" 
                      className="w-full aspect-[21/9] object-cover object-center border border-white/10 filter brightness-90"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. FOUR PILLARS OF ASMARATY
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#08101C] relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                OUR PHILOSOPHY
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">
                The Four Pillars of ASMARATY
              </h2>
              <p className="text-sm sm:text-base text-[#8D9CAA] font-light leading-relaxed">
                Every vessel leaving our UAE shipyard is an embodiment of four uncompromising principles that guide our naval architects and shipwrights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-8 bg-[#0F1B2F]/60 border border-white/5 hover:border-[#C6A155]/40 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-none bg-[#C6A155]/10 flex items-center justify-center border border-[#C6A155]/20 group-hover:border-[#C6A155]/60 transition-colors">
                        {pillar.icon}
                      </div>
                      <span className="font-serif text-2xl font-light text-white/20 group-hover:text-[#C6A155]/60 transition-colors">
                        {pillar.number}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl font-normal text-white group-hover:text-[#DFBA73] transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8D9CAA] font-light leading-relaxed">
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
        <section className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
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
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold block mb-1">
                        {item.subtitle}
                      </span>
                      <h4 className="font-serif text-lg font-normal text-[#0E2047]">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            8. PRIVATE SHIPYARD DIALOGUE & VIP TOUR CONCIERGE (CTA)
           ========================================================= */}
        <section className="py-20 sm:py-28 bg-[#08101C] text-white relative overflow-hidden border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 sm:px-12 lg:px-16 text-center relative z-10 space-y-6">
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
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
