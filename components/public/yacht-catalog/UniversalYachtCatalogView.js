"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Download, 
  ArrowRight, 
  ArrowUpRight, 
  Mail
} from "lucide-react";
import { YACHT_SHOWCASES } from "@/lib/data/yachtShowcaseData";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import { 
  getAllYachts, 
  syncYachtsFromServer, 
  getPageBySlug, 
  getPageById, 
  syncPagesFromServer 
} from "@/lib/cmsStore";
import { DEFAULT_PAGES, DEFAULT_YACHTS_PAGE } from "@/lib/data/defaultPages";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";
import { formatButtonHref, formatPdfZoomUrl } from "@/lib/data/buttonSchema";

// Canonical hardcoded fallback models to guarantee 100% zero-regression uptime
const FALLBACK_FLEET_MODELS = [
  {
    ...YACHT_SHOWCASES.g100,
    categoryKey: "superyacht",
    categoryLabel: "Superyacht",
    decks: "Super Yacht",
    heroImage: "/images/yachts/g100/0.jpg",
    specsSnapshot: {
      loa: "100 FT (30.48 M)",
      lwl: "85 FT (25.91 M)",
      beam: "22.91 FT (6.98 M)",
      draft: "7.5 FT (2.29 M)",
      power: "3,200 HP (2 × 1,600 HP MTU)",
      cabins: "5 + 2 Staterooms",
      berths: "12 + 5 Berths (17 Pax)",
      displacement: "95 Tons",
      fuel: "2,900 Gal (10,970 L)",
      water: "670 Gal (2,536 L)",
      hull: "Hand-Laid Honeycomb Composite",
    }
  },
  {
    ...YACHT_SHOWCASES.g77,
    categoryKey: "two-deck",
    categoryLabel: "Two-Deck Yacht",
    decks: "Two Decks",
    heroImage: "/images/yachts/g77/g77_asset_01_1672x941.jpg",
    specsSnapshot: {
      loa: "77 FT (23.47 M)",
      lwl: "65 FT (19.81 M)",
      beam: "19.35 FT (5.90 M)",
      draft: "4.5 FT (1.37 M)",
      power: "2,400 HP (2 × 1,200 HP CAT)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "55 Tons",
      fuel: "1,600 Gal (6,056 L)",
      water: "400 Gal (1,514 L)",
      hull: "GRP Composite Two-Deck",
    }
  },
  {
    ...YACHT_SHOWCASES.g66,
    categoryKey: "motor-yacht",
    categoryLabel: "Motor Yacht",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g66/hero-01.jpg",
    specsSnapshot: {
      loa: "66 FT (20.12 M)",
      lwl: "55 FT (16.76 M)",
      beam: "20.00 FT (6.10 M)",
      draft: "3.5 FT (1.07 M)",
      power: "1,600 HP (2 × 800 HP Volvo)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "40 Tons",
      fuel: "1,870 Gal (7,080 L)",
      water: "300 Gal (1,135 L)",
      hull: "Hand-Laid Fiberglass Composite",
    }
  },
  {
    ...YACHT_SHOWCASES.g50,
    categoryKey: "motor-yacht",
    categoryLabel: "Motor Yacht",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g50/hero-01.jpg",
    specsSnapshot: {
      loa: "50 FT (15.00 M)",
      lwl: "40 FT (12.00 M)",
      beam: "15.00 FT (4.50 M)",
      draft: "4.0 FT (1.35 M)",
      power: "1,100 HP (2 × 550 HP Cummins)",
      cabins: "3 Staterooms",
      berths: "6 Berths (15 Pax Capacity)",
      displacement: "15–20 Tons",
      fuel: "450 Gal (1,701 L)",
      water: "100 Gal (378 L)",
      hull: "Fiberglass Composite Sandwich",
    }
  }
];

export default function UniversalYachtCatalogView() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Dynamic Yachts state from authoritative CMS store (initialized with baseline to guarantee exact SSR hydration)
  const [yachts, setYachts] = useState(() => DEFAULT_YACHTS);

  // Dynamic Page metadata from authoritative CMS store
  const [page, setPage] = useState(() => DEFAULT_YACHTS_PAGE);

  useEffect(() => {
    // Read local cache immediately upon hydration
    const localYachts = getAllYachts();
    if (Array.isArray(localYachts) && localYachts.length > 0) {
      queueMicrotask(() => setYachts(localYachts));
    }
    const localPage = getPageBySlug("/yachts") || getPageById("page-yachts") || DEFAULT_YACHTS_PAGE;
    if (localPage) {
      queueMicrotask(() => setPage(localPage));
    }

    // Dynamic sync from server database API
    syncYachtsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachts(synced);
      }
    });
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/yachts" || p.id === "page-yachts");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updatedYachts = getAllYachts();
      if (updatedYachts && Array.isArray(updatedYachts)) setYachts(updatedYachts);
      const updatedPage = getPageBySlug("/yachts") || getPageById("page-yachts") || DEFAULT_YACHTS_PAGE;
      if (updatedPage) setPage(updatedPage);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Filter published yachts only; exclude drafts from public visitor site
  const rawYachtsList = Array.isArray(yachts) && yachts.length > 0 ? yachts : DEFAULT_YACHTS;
  const publishedYachts = rawYachtsList
    .filter((y) => y.status === "published" || y.status === undefined)
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  // Merge each model with baseline DEFAULT_YACHTS and YACHT_SHOWCASES to ensure 100% complete specifications
  const effectiveModels = (publishedYachts.length > 0 ? publishedYachts : FALLBACK_FLEET_MODELS).map((m) => {
    const baseline = DEFAULT_YACHTS.find((d) => d.slug === m.slug || d.id === m.id) || {};
    const showcase = YACHT_SHOWCASES[m.slug] || {};
    return {
      ...baseline,
      ...showcase,
      ...m,
      fullName: m.name || m.fullName || baseline.fullName || showcase.fullName,
      modelNumber: m.modelNumber || baseline.modelNumber || showcase.modelNumber || m.slug?.toUpperCase(),
      badge: m.badge || baseline.badge || showcase.badge,
      decks: m.decks || baseline.decks || showcase.decks || "Multi-Deck",
      categoryLabel: m.categoryLabel || baseline.categoryLabel || m.category,
      categoryKey: m.categoryKey || baseline.categoryKey || (m.category ? m.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "superyacht"),
      heroImage: m.heroImage || m.mainImage || baseline.heroImage || showcase.heroImages?.[0]?.src || "/images/yachts/g100/0.jpg",
      specsSnapshot: {
        ...(baseline.specsSnapshot || showcase.specsSnapshot || {}),
        ...(m.specsSnapshot || m.specs || {}),
      },
      comparisonMatrix: {
        ...(baseline.comparisonMatrix || baseline.specsSnapshot || showcase.specsSnapshot || {}),
        ...(m.comparisonMatrix || m.specsSnapshot || m.specs || {}),
      },
    };
  });

  // Extract individual sections from page-yachts with fallback
  const heroSection = page?.sections?.find((s) => s.id === "yachts-hero" || s.type === "hero_banner") || DEFAULT_YACHTS_PAGE?.sections?.[0];
  const gridSection = page?.sections?.find((s) => s.id === "yachts-grid" || s.type === "yacht_collection") || DEFAULT_YACHTS_PAGE?.sections?.[1];
  const matrixSection = page?.sections?.find((s) => s.id === "yachts-matrix" || s.type === "comparison_matrix") || DEFAULT_YACHTS_PAGE?.sections?.[2];
  const customSection = page?.sections?.find((s) => s.id === "yachts-custom" || s.type === "image_text") || DEFAULT_YACHTS_PAGE?.sections?.[3];
  const conciergeSection = page?.sections?.find((s) => s.id === "yachts-concierge" || s.type === "call_to_action") || DEFAULT_YACHTS_PAGE?.sections?.[4];

  const hasLuxuryMotorYacht = effectiveModels.some((m) => {
    const k = (m.categoryKey || "").toLowerCase();
    const c = (m.category || m.categoryLabel || "").toLowerCase();
    return k === "luxury-motor-yacht" || c.includes("luxury motor yacht");
  });

  // Dynamic Series Filter categories
  const categories = [
    { id: "all", label: `All Fleet (${effectiveModels.length})` },
    { id: "superyacht", label: "Superyachts" },
    { id: "two-deck", label: "Two-Deck Yachts" },
    { id: "flybridge", label: "Flybridge Cruisers" },
    { id: "motor-yacht", label: "Motor Yachts" },
    ...(hasLuxuryMotorYacht ? [{ id: "luxury-motor-yacht", label: "Luxury Motor Yachts" }] : [])
  ];

  // Filtered models based on category selection
  const filteredModels = effectiveModels.filter((m) => {
    if (activeCategory === "all") return true;
    const catKey = m.categoryKey || m.category?.toLowerCase() || "";
    return catKey === activeCategory || catKey.includes(activeCategory);
  });

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. CATALOG HERO BANNER
          ------------------------------------------------------------- */}
      {heroSection?.visible !== false && (
        <section className="relative min-h-[75vh] lg:min-h-[82vh] flex items-center justify-center overflow-hidden border-b border-white/10">
          {/* Background Image with Deep Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroSection?.imageUrl || "/images/yachts/g100/0.jpg"}
              alt={heroSection?.imageAlt || "ASMARATY Luxury Yacht Fleet"}
              className="w-full h-full object-cover object-center filter brightness-[0.6] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-[#080B10]/60" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#080B10]/40 to-[#080B10]/90 pointer-events-none" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-28 text-center flex flex-col items-center">
            {/* Insignia / Eyebrow */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#0E1A2D]/80 border border-[#C6A155]/40 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
              <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#DFBA73]">
                {heroSection?.eyebrow || "The Official ASMARATY Fleet"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-white uppercase tracking-[0.03em] leading-[1.18] mb-4 max-w-3xl">
              {heroSection?.heading || "The Fleet of Distinction"}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-white/75 font-light max-w-2xl mx-auto leading-relaxed mb-6 text-center">
              {heroSection?.subheading ||
                "Handcrafted composite superyachts and luxury motor yachts engineered in the United Arab Emirates since 1979. Each vessel unites naval precision, sunlit panoramic architecture, and bespoke master craftsmanship."}
            </p>

            {/* Quick Model Jump Pills (Manageable via CMS, default hidden) */}
            {heroSection?.showModelPills && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-12">
                {effectiveModels.map((m) => {
                  const loaNumber = m.specsSnapshot?.loa?.split(' ')?.[0] || m.length?.split(' ')?.[0] || "";
                  return (
                    <a
                      key={m.slug}
                      href={`#yacht-${m.slug}`}
                      className="px-5 py-2.5 bg-white/5 hover:bg-[#C6A155] text-white hover:text-[#080B10] border border-white/15 hover:border-[#C6A155] text-xs font-semibold uppercase tracking-wider transition-all duration-300 backdrop-blur-sm cursor-pointer"
                    >
                      <span>{m.modelNumber || m.slug.toUpperCase()}</span>
                      {loaNumber && <span className="opacity-60 ml-1.5 font-normal">({loaNumber} FT)</span>}
                    </a>
                  );
                })}
                {heroSection?.secondaryButton?.visible !== false && (
                  <a
                    href={heroSection?.secondaryButton?.url || heroSection?.secondaryButtonUrl || "#comparison-matrix"}
                    className="px-5 py-2.5 bg-[#C6A155]/20 hover:bg-[#C6A155] text-[#DFBA73] hover:text-[#080B10] border border-[#C6A155]/60 text-xs font-semibold uppercase tracking-wider transition-all duration-300 backdrop-blur-sm cursor-pointer"
                  >
                    {heroSection?.secondaryButton?.label || heroSection?.secondaryButtonText || "Compare Specs Matrix"}
                  </a>
                )}
              </div>
            )}

            {/* Key Fleet Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl pt-8 border-t border-white/15">
              {(heroSection?.stats || [
                { value: "50–100 FT", label: "Fleet Length Span" },
                { value: "3,200 HP", label: "Peak Propulsion Power" },
                { value: "4 Classes", label: "Distinct Naval Series" },
                { value: "1979", label: "Shipyard Heritage (45+ Yrs)" }
              ]).map((stat, idx) => (
                <div key={idx}>
                  <div className={`font-serif text-xl sm:text-2xl font-normal ${idx % 2 === 0 ? "text-[#DFBA73]" : "text-white"}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          2. FLEET SERIES SHOWCASE & FILTER
          ------------------------------------------------------------- */}
      {gridSection?.visible !== false && (
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16" id="fleet-catalog">
          {/* Header with Series Filter */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
                {gridSection?.eyebrow || "CATALOGUE DOSSIER"}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em]">
                {gridSection?.heading || "Explore the Models"}
              </h2>
            </div>

            {/* Series Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs px-4 py-2.5 uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#C6A155] text-[#080B10] font-bold shadow-lg"
                      : "bg-[#0E1A2D] text-white/70 hover:text-white border border-white/10 hover:border-white/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Yacht Model Cards - Detailed Editorial Presentation */}
          <div className="space-y-20 lg:space-y-24">
            {filteredModels.map((model, idx) => {
              const isEven = idx % 2 === 0;
              const cardImage = model.heroImage || model.mainImage || model.primaryImage || "/images/yachts/g100/0.jpg";
              const specs = model.specsSnapshot || {};

              return (
                <article
                  key={model.slug}
                  id={`yacht-${model.slug}`}
                  className="scroll-mt-28 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-500 overflow-hidden shadow-2xl"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Image Column */}
                    <div
                      className={`lg:col-span-7 relative overflow-hidden bg-[#0A101A] flex items-center justify-center p-2 sm:p-4 min-h-[340px] sm:min-h-[420px] ${
                        isEven ? "lg:order-1" : "lg:order-2"
                      }`}
                    >
                      <Link href={`/yachts/${model.slug}`} className="block w-full h-full relative group flex items-center justify-center">
                        <img
                          src={cardImage}
                          alt={model.name || model.fullName}
                          className="w-full h-full object-contain object-center transition-opacity duration-300 group-hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-transparent to-transparent opacity-60 lg:opacity-30" />

                        {/* View Showcase Hover Pill */}
                        <div className="absolute bottom-4 right-4 px-4 py-2 bg-[#080B10]/90 backdrop-blur-md border border-white/20 text-white group-hover:border-[#C6A155] group-hover:text-[#DFBA73] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all">
                          <span>View Showcase</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155]" />
                        </div>
                      </Link>
                    </div>

                    {/* Details Column */}
                    <div
                      className={`lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 ${
                        isEven ? "lg:order-2" : "lg:order-1"
                      }`}
                    >
                      <div>
                        {/* Model Number Pill */}
                        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold mb-2">
                          {model.modelNumber || model.slug.toUpperCase()} • {model.decks || "Multi-Deck"}
                        </div>

                        {/* Model Title */}
                        <Link href={`/yachts/${model.slug}`} className="group block">
                          <h3 className="font-serif text-xl sm:text-2xl text-white font-normal group-hover:text-[#DFBA73] transition-colors leading-tight mb-2">
                            {model.name || model.fullName}
                          </h3>
                        </Link>

                        {/* Tagline */}
                        {model.tagline && (
                          <p className="text-[11px] sm:text-xs text-[#C6A155] italic font-serif leading-relaxed mb-3">
                            “{model.tagline}”
                          </p>
                        )}

                        {/* Narrative Description */}
                        <p className="text-[11px] sm:text-xs text-white/70 font-light leading-relaxed mb-5 text-justify" style={{ textJustify: "inter-word" }}>
                          {model.description}
                        </p>

                        {/* Key Specs Snapshot Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#080B10]/60 border border-white/5 mb-6">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Length (LOA)</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{specs.loa || model.length || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Beam</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{specs.beam || model.specs?.maximumBeam || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Propulsion</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{(specs.power?.split('(')[0] || model.specs?.engines || "—")}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Cabins</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{specs.cabins || model.specs?.bedrooms || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Capacity</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{specs.berths || model.specs?.berths || "—"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Fuel Tank</div>
                            <div className="text-[11px] font-semibold text-white mt-0.5">{specs.fuel || model.specs?.fuelCapacity || "—"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full">
                        <Link
                          href={`/yachts/${model.slug}`}
                          className="w-full sm:w-auto flex-1 sm:flex-initial sm:min-w-[150px] max-w-full overflow-hidden saxdor-btn-solid !h-auto min-h-[44px] sm:!h-[46px] !px-4 sm:!px-5 text-[11px] sm:text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none text-center"
                        >
                          <span className="truncate max-w-full">Explore Dossier</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </Link>

                        {model.brochureUrl ? (
                          <a
                            href={formatPdfZoomUrl(model.brochureUrl, 33)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex-1 sm:flex-initial sm:min-w-[150px] max-w-full overflow-hidden saxdor-btn-outline !h-auto min-h-[44px] sm:!h-[46px] !px-4 sm:!px-5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none hover:border-[#C6A155] hover:text-[#DFBA73] text-center"
                          >
                            <Download className="w-3.5 h-3.5 text-[#C6A155] shrink-0" />
                            <span className="truncate max-w-full">{model.brochureLabel || "Brochure (PDF)"}</span>
                          </a>
                        ) : (
                          <Link
                            href="/contact"
                            className="w-full sm:w-auto flex-1 sm:flex-initial sm:min-w-[150px] max-w-full overflow-hidden saxdor-btn-outline !h-auto min-h-[44px] sm:!h-[46px] !px-4 sm:!px-5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none hover:border-[#C6A155] hover:text-[#DFBA73] text-center"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#C6A155] shrink-0" />
                            <span className="truncate max-w-full">Request Brochure</span>
                          </Link>
                        )}

                        <Link
                          href="/contact"
                          className="w-full text-center text-xs text-[#C6A155] hover:text-white uppercase tracking-wider font-semibold pt-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>Book Private Sea Trial / Consultation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          3. COMPREHENSIVE SIDE-BY-SIDE FLEET COMPARISON MATRIX
          ------------------------------------------------------------- */}
      {matrixSection?.visible !== false && (
        <section className="py-20 sm:py-28 bg-[#06090D] border-t border-b border-white/10" id="comparison-matrix">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
                {matrixSection?.eyebrow || "TECHNICAL SPECIFICATIONS"}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em] mb-3">
                {matrixSection?.heading || "Side-by-Side Fleet Comparison"}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 font-light">
                {matrixSection?.description ||
                  "Compare naval dimensions, propulsion packages, accommodations, and engineering across all four ASMARATY yacht models."}
              </p>
            </div>

            {/* Comparison Table Container with Horizontal Scroll */}
            <div className="overflow-x-auto shadow-2xl border border-white/10 bg-[#0A101A]">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/15 bg-[#0E1A2D]">
                    <th className="py-4 px-6 text-xs uppercase tracking-wider text-[#DFBA73] font-semibold font-mono w-1/5">
                      Specification Dimension
                    </th>
                    {effectiveModels.map((m) => (
                      <th key={m.slug} className="py-4 px-6 text-center border-l border-white/10 w-1/5">
                        <div className="font-serif text-base sm:text-lg text-white font-normal">{m.modelNumber || m.slug.toUpperCase()}</div>
                        <div className="text-[10px] text-[#C6A155] uppercase tracking-wider mt-0.5">{m.categoryLabel || m.category}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Length Overall (LOA)
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 font-semibold text-white">
                        {m.comparisonMatrix?.loa || m.specsSnapshot?.loa || m.specs?.lengthOverall || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Waterline Length (LWL)
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.lwl || m.specsSnapshot?.lwl || m.specs?.lengthWaterline || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Maximum Beam
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.beam || m.specsSnapshot?.beam || m.specs?.maximumBeam || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Draft at Full Load
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.draft || m.specsSnapshot?.draft || m.specs?.draftAtFullLoad || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Displacement
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.displacement || m.specsSnapshot?.displacement || m.specs?.displacement || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Propulsion Power
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 font-semibold text-[#DFBA73]">
                        {m.comparisonMatrix?.power || m.specsSnapshot?.power || m.specs?.engines || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Staterooms & Accommodations
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.cabins || m.specsSnapshot?.cabins || m.specs?.bedrooms || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Sleeping Berths / Passenger Capacity
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.berths || m.specsSnapshot?.berths || m.specs?.berths || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Fuel Tank Capacity
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.fuel || m.specsSnapshot?.fuel || m.specs?.fuelCapacity || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Freshwater Capacity
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                        {m.comparisonMatrix?.water || m.specsSnapshot?.water || m.specs?.freshwaterCapacity || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                      Hull & Deck Construction
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-xs text-white/80">
                        {m.comparisonMatrix?.hull || m.specsSnapshot?.hull || m.specs?.hullConstruction || "—"}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#0E1A2D]/40">
                    <td className="py-5 px-6 text-[#C6A155] font-semibold text-xs uppercase tracking-wider">
                      Dossier & Brochure Links
                    </td>
                    {effectiveModels.map((m) => (
                      <td key={m.slug} className="py-5 px-6 text-center border-l border-white/10 space-y-2">
                        <Link
                          href={`/yachts/${m.slug}`}
                          className="block w-full py-2 px-3 bg-[#C6A155] hover:bg-white text-[#080B10] text-[11px] font-bold uppercase tracking-wider transition-colors"
                        >
                          Explore {m.modelNumber || m.slug.toUpperCase()}
                        </Link>
                        {m.brochureUrl ? (
                          <a
                            href={formatPdfZoomUrl(m.brochureUrl, 33)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-1.5 px-2 text-[10px] uppercase tracking-wider text-white/70 hover:text-[#DFBA73] transition-colors"
                          >
                            Brochure PDF ↓
                          </a>
                        ) : (
                          <Link
                            href="/contact"
                            className="block w-full py-1.5 px-2 text-[10px] uppercase tracking-wider text-white/50 hover:text-[#DFBA73] transition-colors"
                          >
                            Request Brochure
                          </Link>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          4. BESPOKE COMMISSIONING & CRAFTSMANSHIP
          ------------------------------------------------------------- */}
      {customSection?.visible !== false && (
        <section className="py-24 sm:py-32 bg-[#08101C] relative overflow-hidden border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block">
                  {customSection?.eyebrow || "CUSTOM COMMISSIONS • SHIPYARD HERITAGE"}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em] leading-tight">
                  {customSection?.heading || "Every Vessel Tailored to Your Vision"}
                </h2>
                <blockquote className="border-l-2 border-[#C6A155] pl-5 text-xs sm:text-sm md:text-[15px] italic font-serif text-[#DFBA73] leading-relaxed">
                  {customSection?.quote ||
                    "“A yacht is not simply an engineering achievement; it is an architectural sanctuary forged between sky and ocean.”"}
                </blockquote>
                <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed text-justify" style={{ textJustify: "inter-word" }}>
                  {customSection?.description ||
                    "At ASMARATY, no two vessels leaving our shipyard facility are identical. From selecting book-matched Italian marbles and bespoke marine leather finishes to custom audio-visual installations and private tender arrangements, our master shipwrights partner with owners throughout every stage of the build."}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {(customSection?.stats || [
                    { value: "100%", label: "Bespoke Interior Options" },
                    { value: "UAE", label: "Direct Shipyard Direct Access" }
                  ]).map((stat, idx) => (
                    <div key={idx} className="p-4 bg-[#0E1A2D]/60 border border-white/5">
                      <div className={`font-serif text-xl font-normal ${idx === 0 ? "text-[#C6A155]" : "text-white"}`}>
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-white/70 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href={formatButtonHref(
                      customSection?.primaryButton?.url || customSection?.buttonUrl || "/contact",
                      customSection?.primaryButton?.type || "internal"
                    )}
                    target={customSection?.primaryButton?.target || "_self"}
                    rel={customSection?.primaryButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                    className="saxdor-btn-solid !h-[48px] !px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 rounded-none"
                  >
                    <span>{customSection?.primaryButton?.label || customSection?.buttonText || "Discuss a Custom Commission"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Showcase */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#0A101A] shadow-2xl border border-white/10">
                  <img
                    src={customSection?.imageUrl || "/images/interiors/g100-main-salon.jpg"}
                    alt={customSection?.imageAlt || "ASMARATY Custom Craftsmanship"}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08101C]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#08101C]/90 backdrop-blur-md border border-white/15">
                    <span className="text-[10px] uppercase tracking-wider text-[#C6A155] font-semibold block mb-1">
                      Shipyard Facility • Ajman, UAE
                    </span>
                    <p className="text-xs text-white/80 font-light">
                      Over 45 years of continuous marine craftsmanship by Al Shaali Marine.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          5. VIP CONCIERGE & CONTACT REDIRECT SECTION
          ------------------------------------------------------------- */}
      {conciergeSection?.visible !== false && (
        <section className="py-20 sm:py-28 bg-gradient-to-b from-[#080B10] to-[#05070A] border-t border-white/10 text-center relative overflow-hidden" id="catalog-contact">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C6A155]/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12">
            <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-3">
              {conciergeSection?.eyebrow || "VIP CONCIERGE & ADVISORY"}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em] leading-tight mb-4">
              {conciergeSection?.heading || "Begin Your Voyage With ASMARATY"}
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-light max-w-2xl mx-auto leading-relaxed mb-8">
              {conciergeSection?.description ||
                "Whether you wish to arrange a private sea trial, commission a bespoke naval build, or request confidential fleet pricing, our yacht advisory team in the UAE is at your service."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={formatButtonHref(
                  conciergeSection?.primaryButton?.url || conciergeSection?.primaryButtonUrl || "/contact",
                  conciergeSection?.primaryButton?.type || "internal"
                )}
                target={conciergeSection?.primaryButton?.target || "_self"}
                rel={conciergeSection?.primaryButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                className="w-full sm:w-auto saxdor-btn-solid !h-[52px] !px-10 text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2.5 rounded-none shadow-2xl"
              >
                <span>{conciergeSection?.primaryButton?.label || conciergeSection?.primaryButtonText || "Contact Us"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={formatButtonHref(
                  conciergeSection?.secondaryButton?.url ||
                    conciergeSection?.secondaryButtonUrl ||
                    "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet.",
                  conciergeSection?.secondaryButton?.type || "external"
                )}
                target={conciergeSection?.secondaryButton?.target || "_blank"}
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-widest transition-all rounded-none shadow-xl"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>{conciergeSection?.secondaryButton?.label || conciergeSection?.secondaryButtonText || "WhatsApp VIP Concierge"}</span>
              </a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
