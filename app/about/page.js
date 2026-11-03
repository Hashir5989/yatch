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
              backgroundPosition: "center top",
              backgroundSize: "220px 120px",
            }}
            aria-hidden="true"
          />

          <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 text-center relative z-10 py-24 sm:py-32">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
              <span className="text-xs uppercase tracking-[0.24em] font-sans font-medium text-[#C6A155]">
                ASMARATY SHIPYARD • EST. 1979 • UNITED ARAB EMIRATES
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal uppercase tracking-[0.03em] text-white leading-[1.08] max-w-4xl mx-auto">
              The Signature <span className="block italic text-[#C6A155] font-normal">Of The Sea</span>
            </h1>

            {/* Subheading Narrative */}
            <p className="text-base sm:text-lg lg:text-xl text-white/80 font-normal leading-relaxed max-w-3xl mx-auto mt-6">
              United by contemporary aesthetics, expansive living volumes, and peerless composite craftsmanship, ASMARATY designs yachts that are as rewarding to spend time aboard as they are to admire from the shore.
            </p>

            {/* Quick Links / CTAs */}
            <div className="pt-8 sm:pt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a
                href="#our-story"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase bg-[#C6A155] text-black hover:bg-[#DFBA73] transition-all duration-300 shadow-lg shadow-[#C6A155]/20 cursor-pointer"
              >
                Discover Our Story
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-[52px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                Visit UAE Shipyard
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. HERITAGE BY THE NUMBERS: Gold & Deep Navy Banner
           ========================================================= */}
        <section className="py-14 sm:py-16 bg-[#0B1424] border-y border-white/10 relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {stats.map((stat, idx) => (
                <div key={idx} className={`pt-6 lg:pt-0 ${idx !== 0 ? "lg:pl-8" : ""}`}>
                  <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#C6A155] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-white mt-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-white/60 mt-1 font-light">
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
        <section id="our-story" className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative & Philosophy */}
              <div className="lg:col-span-6 space-y-6">
                <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                  CHAPTER I • OUR PHILOSOPHY
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-[#0E2047] tracking-[0.02em]">
                  A Shared Passion for Life at Sea
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-[#0E2047]/80 leading-relaxed font-normal text-justify" style={{ textJustify: "inter-word" }}>
                  <p>
                    ASMARATY was founded on a shared passion for design, craftsmanship, and life at sea. Bringing a distinct personality to the water, our boatbuilding journey is united by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful on-board comfort.
                  </p>
                  <p>
                    Rooted in the maritime traditions of the United Arab Emirates and driven by continuous innovation, we build yachts that balance modern exterior lines with broad proportions, usable deck space, and the creature comforts that make longer voyages at sea truly memorable.
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
                    Illuminated ASMARATY wing emblem and panoramic flybridge architecture.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. CHAPTER II: The UAE Shipyard Facility (Al Shaali Marine)
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#08101C] text-white relative overflow-hidden border-t border-b border-white/10">
          {/* Wings watermark background */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 select-none opacity-5"
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
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded bg-[#08101C]/80 backdrop-blur-md border border-white/10 text-white text-xs">
                    <span className="font-semibold text-[#C6A155] uppercase tracking-wider block">Shipyard Infrastructure</span>
                    Direct deep-water marina berths & climate-controlled composite lamination halls.
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
        <section className="py-20 sm:py-28 lg:py-32 bg-white text-[#0E2047] relative overflow-hidden">
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
                    100 ft multi-deck naval architecture cruising the Arabian Gulf.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            6. FOUR PILLARS OF SHIPBUILDING EXCELLENCE
           ========================================================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#091322] text-white relative overflow-hidden border-t border-b border-white/10">
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
