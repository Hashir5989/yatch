"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Anchor, 
  Compass, 
  Sparkles, 
  Layers 
} from "lucide-react";
import { getAllYachts, syncYachtsFromServer } from "@/lib/cmsStore";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function YachtCollectionSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "ASMARATY MODELS",
    heading = "THE FLEET",
    description = "ASMARATY offers a versatile range of models based on the same core ideas: lightweight composite construction, sharp hull shapes, and well-utilized deck space. Each yacht is designed to provide a confident, efficient, and enjoyable driving experience.",
    filterCategory = "all",
    limit = 8,
    layoutStyle = "grid",
    buttonText = "EXPLORE ALL MODELS",
    buttonUrl = "/#fleet"
  } = data;

  const [yachts, setYachts] = useState(() => {
    return getAllYachts().filter((y) => y.status === "published");
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);

  // State for dynamic models showcase
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showAllModels, setShowAllModels] = useState(false);

  useEffect(() => {
    // Dynamic sync from authoritative server content source
    syncYachtsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced)) {
        setYachts(synced.filter((y) => y.status === "published"));
      }
    });

    const handleUpdate = () => {
      const updated = getAllYachts().filter((y) => y.status === "published");
      setYachts(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Listen for external switch event (e.g. from hero or slider)
  useEffect(() => {
    const handleSwitchModel = (e) => {
      if (!e.detail?.slug) return;
      const idx = yachts.findIndex((y) => y.slug === e.detail.slug);
      if (idx !== -1) {
        setSelectedModelIndex(idx);
        setSelectedPhotoIndex(0);
      }
    };
    window.addEventListener("asm-switch-fleet-model", handleSwitchModel);
    return () => window.removeEventListener("asm-switch-fleet-model", handleSwitchModel);
  }, [yachts]);

  const categories = [
    { id: "all", label: "All Series" },
    { id: "Superyacht", label: "Superyachts" },
    { id: "Explorer", label: "Explorers" },
    { id: "Flybridge", label: "Flybridge" },
    { id: "Sports Cruiser", label: "Sports Cruisers" },
  ];

  const filteredYachts = yachts
    .filter((y) => {
      if (activeCategory === "all") return true;
      return y.category === activeCategory;
    })
    .slice(0, limit || 8);

  // Auto-rotate slider in gallery mode when not editing
  useEffect(() => {
    if (layoutStyle !== "model_gallery") return;
    if (isEditable || filteredYachts.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % filteredYachts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [layoutStyle, isEditable, filteredYachts.length]);

  const currentYacht = filteredYachts[activeSlide] || filteredYachts[0];
  const activeModel = yachts[selectedModelIndex] || yachts[0];

  const handleEnquireModel = (modelName) => {
    window.dispatchEvent(new CustomEvent("asm-select-model", { detail: { modelName } }));
    const enquiryElem = document.getElementById("enquiry-form");
    if (enquiryElem) {
      enquiryElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* -------------------------------------------------------------
     MODE 1: Saxdor Signature 'The Fleet' Pure White Split Feature
     ------------------------------------------------------------- */
  if (layoutStyle === "fleet_feature") {
    return (
      <section className="py-20 sm:py-28 bg-white text-[#0E2047] border-b border-[#0E2047]/10" id="the-fleet">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left Column: Eyebrow + Huge Title */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                <InlineEditableText
                  as="span"
                  value={eyebrow || "ASMARATY MODELS"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  placeholder="ASMARATY MODELS..."
                />
              </div>
              <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-light text-[#0E2047] tracking-[0.04em] uppercase leading-none">
                <InlineEditableText
                  as="span"
                  value={heading || "THE FLEET"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="THE FLEET..."
                />
              </h2>
            </div>

            {/* Right Column: Narrative + Action Button */}
            <div className="lg:col-span-8 space-y-6 lg:pl-6">
              <p className="text-base sm:text-lg text-[#0E2047]/80 font-normal leading-relaxed">
                <InlineEditableText
                  as="span"
                  value={description || "ASMARATY offers a versatile range of models based on the same core ideas: lightweight composite construction, sharp hull shapes, and well-utilized deck space. From the AS 68 to the AS 100, each boat is designed to provide a confident, efficient, and enjoyable driving experience."}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Enter fleet narrative..."
                  multiline={true}
                />
              </p>

              {buttonText && (
                <div className="pt-2">
                  <InlineButtonEditor
                    text={buttonText}
                    url={buttonUrl}
                    isEditable={isEditable}
                    onSave={(newText, newUrl) => {
                      if (onUpdateField) {
                        onUpdateField("buttonText", newText);
                        onUpdateField("buttonUrl", newUrl);
                      }
                    }}
                    className="saxdor-btn-navy-outline !h-[52px] !px-8 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------
     MODE 2: 2x2 Animated Showcase Grid (Clickable Yacht Cards)
     ------------------------------------------------------------- */
  if (layoutStyle === "four_models_showcase") {
    const displayedYachts = showAllModels ? yachts : yachts.slice(0, 4);

    return (
      <section className="py-24 sm:py-32 bg-[#08101C] text-[#E8EEF5] relative overflow-hidden border-t border-b border-white/10" id="fleet">
        {/* Subtle decorative background gradient */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(198, 161, 85, 0.25) 0%, transparent 70%)"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 space-y-12 sm:space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                <InlineEditableText
                  as="span"
                  value={eyebrow || "VERIFIED SPECIFICATIONS & FLEET DOSSIER"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  placeholder="EYEBROW..."
                />
              </div>
              <h2 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-light text-white uppercase tracking-[0.04em] leading-tight">
                <InlineEditableText
                  as="span"
                  value={heading || "SIGNATURE FLEET MODELS"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="HEADING..."
                />
              </h2>
              <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed">
                <InlineEditableText
                  as="span"
                  value={description || "Discover the ASMARATY collection. Click any model to review its dedicated specification dossier, naval architecture, and verified accommodations."}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Description..."
                  multiline={true}
                />
              </p>
            </div>

            {/* Quick Fleet Counter Badge */}
            <div className="flex items-center gap-3 self-start md:self-end">
              <div className="px-4 py-2 bg-[#0E1A2D] border border-white/10 text-xs font-mono text-white/80">
                <span className="text-[#C6A155] font-bold">{yachts.length}</span> Published Models
              </div>
            </div>
          </div>

          {/* Empty State */}
          {yachts.length === 0 ? (
            <div className="p-16 text-center bg-[#0A1322] border border-white/10">
              <p className="text-white/70 text-sm">
                The ASMARATY fleet collection is currently being curated. Please explore our brand introduction or submit an enquiry to our private advisory team.
              </p>
            </div>
          ) : (
            <>
              {/* 2x2 Animated Luxury Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {displayedYachts.map((yacht, idx) => {
                  return (
                    <Link
                      key={yacht.id}
                      href={`/yachts/${yacht.slug}`}
                      className="group relative bg-[#091322] border border-white/10 hover:border-[#C6A155] transition-all duration-500 overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer"
                    >
                      {/* Image Area with Zoom & Badges */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#060D18]">
                        <img
                          src={yacht.mainImage || yacht.primaryImage || "/images/hero-yacht.jpg"}
                          alt={yacht.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#091322] via-[#091322]/20 to-transparent opacity-90" />
                        
                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <span className="px-3 py-1 bg-[#08101C]/90 backdrop-blur-md border border-[#C6A155]/40 text-[#C6A155] text-[10px] font-semibold tracking-[0.2em] uppercase">
                            {yacht.category}
                          </span>
                          {idx === 0 && (
                            <span className="px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                              Flagship
                            </span>
                          )}
                        </div>

                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-[#08101C]/90 backdrop-blur-md border border-white/15 text-white/90 font-mono text-[11px] font-medium tracking-wider">
                            {(yacht.specs?.lengthOverall || yacht.length || "").toUpperCase()}
                          </span>
                        </div>

                        {/* Bottom Image Micro-Label */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-white/70">
                          <span className="font-mono text-white/50">Model 0{idx + 1}</span>
                          <span className="text-[#DFBA73] font-semibold tracking-wider uppercase text-[10px] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                            <span>Inspect Dossier</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6A155] font-semibold">
                              {yacht.series || `ASMARATY ${yacht.category}`}
                            </span>
                            <span className="text-xs text-white/40 font-mono">0{idx + 1} / 0{yachts.length}</span>
                          </div>

                          <h3 className="font-sans text-2xl sm:text-3xl font-light text-white uppercase tracking-[0.04em] group-hover:text-[#DFBA73] transition-colors">
                            {yacht.name}
                          </h3>

                          {yacht.tagline && (
                            <p className="text-xs sm:text-sm text-[#C6A155]/90 italic font-serif tracking-wide">
                              “{yacht.tagline}”
                            </p>
                          )}

                          <p className="text-xs sm:text-sm text-white/70 font-normal leading-relaxed line-clamp-2">
                            {yacht.description}
                          </p>
                        </div>

                        {/* Verified Specs Row */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                          <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                            <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                              Length Overall
                            </span>
                            <span className="font-semibold text-white mt-0.5 block truncate">
                              {yacht.specs?.lengthOverall || yacht.length || "Bespoke"}
                            </span>
                          </div>
                          <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                            <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                              Hull Construction
                            </span>
                            <span className="font-semibold text-white mt-0.5 block truncate">
                              {yacht.specs?.hullMaterial || "Advanced Composite"}
                            </span>
                          </div>
                        </div>

                        {/* Architectural Highlights */}
                        {yacht.highlights && yacht.highlights.length > 0 && (
                          <ul className="space-y-1.5 text-xs text-white/70">
                            {yacht.highlights.slice(0, 2).map((h, hIdx) => (
                              <li key={hIdx} className="flex items-start gap-2">
                                <Check className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                                <span className="truncate">{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Action Bar */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-white/90 font-semibold tracking-wider uppercase group-hover:text-[#C6A155] inline-flex items-center gap-1.5 transition-colors">
                            <span>VIEW MODEL DETAILS</span>
                            <ArrowUpRight className="w-4 h-4 text-[#C6A155] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEnquireModel(yacht.name);
                            }}
                            className="text-[11px] text-[#C6A155] hover:text-white uppercase tracking-wider font-semibold border-b border-[#C6A155]/40 hover:border-white pb-0.5 transition-colors cursor-pointer"
                          >
                            Enquire Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Show More / Show Less Toggle Button (if more than 4 models) */}
              {yachts.length > 4 && (
                <div className="text-center pt-8">
                  <button
                    type="button"
                    onClick={() => setShowAllModels(!showAllModels)}
                    className="saxdor-btn-navy-outline !h-[50px] !px-10 text-xs font-bold text-white border-white/20 hover:border-[#C6A155] inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{showAllModels ? "SHOW INITIAL 4 MODELS" : `SHOW ALL FLEET MODELS (${yachts.length})`}</span>
                    <ArrowUpRight className={`w-4 h-4 text-[#C6A155] transition-transform ${showAllModels ? "rotate-180" : ""}`} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------
     MODE 3: Saxdor Signature Full-Bleed Dark Model Slider
     ------------------------------------------------------------- */
  if (layoutStyle === "model_gallery") {
    return (
      <section className="w-full h-[calc(100vh-70px)] min-h-[570px] max-h-[820px] bg-[#08101C] relative overflow-hidden flex items-end">
        {/* Active Yacht Background Image */}
        {currentYacht && (
          <div className="absolute inset-0">
            <img
              src={currentYacht.mainImage}
              alt={currentYacht.name}
              className="w-full h-full object-cover transition-opacity duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/35 to-transparent"></div>
            <div 
              className="absolute -left-[20vw] -bottom-[30vh] w-[130vw] h-[130vh] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 30% 72%, rgba(6, 16, 34, 0.75) 0%, rgba(6, 16, 34, 0.40) 30%, transparent 70%)"
              }}
            />
          </div>
        )}

        {/* Left & Right Slider Arrows */}
        {filteredYachts.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + filteredYachts.length) % filteredYachts.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous yacht"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % filteredYachts.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next yacht"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Bottom Info Overlay & Pagination */}
        {currentYacht && (
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-12 sm:pb-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-[11px] uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
                MODEL
              </span>
              <h3 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-light text-white uppercase tracking-tight leading-none mb-3">
                {currentYacht.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-mono tracking-wider mb-4">
                {[currentYacht.specs?.lengthOverall || currentYacht.length, currentYacht.category, currentYacht.specs?.hullMaterial].filter(Boolean).join(" • ")}
              </p>
              <div>
                <a
                  href="#fleet"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("asm-switch-fleet-model", { detail: { slug: currentYacht.slug } }));
                    const fleetElem = document.getElementById("fleet");
                    if (fleetElem) fleetElem.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white hover:text-[#C6A155] border-b border-white hover:border-[#C6A155] pb-1 transition-colors font-semibold cursor-pointer"
                >
                  <span>EXPLORE {currentYacht.name} SPECIFICATIONS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155]" />
                </a>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2" aria-label="Model gallery pagination">
              {filteredYachts.map((yacht, idx) => (
                <button
                  key={yacht.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 transition-all cursor-pointer ${
                    activeSlide === idx
                      ? "w-8 bg-white"
                      : "w-2.5 bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Show ${yacht.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }

  /* -------------------------------------------------------------
     MODE 4: Full Fleet Series Catalog Grid View
     ------------------------------------------------------------- */
  return (
    <section className="py-20 sm:py-28 bg-[#08101C] text-[#E8EEF5] relative overflow-hidden border-t border-white/10" id="fleet-grid">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155] mb-3">
            <InlineEditableText
              as="span"
              value={eyebrow || "ASMARATY FLEET"}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
              placeholder="EYEBROW..."
            />
          </div>
          <h2 className="font-sans text-3xl sm:text-5xl font-light text-white uppercase tracking-[0.04em] leading-tight mb-4">
            <InlineEditableText
              as="span"
              value={heading || "EXPLORE ALL YACHT SERIES"}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="TITLE..."
            />
          </h2>
          <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed">
            <InlineEditableText
              as="span"
              value={description || "Click any model to view comprehensive technical specifications, engine configurations, interior deck layouts, and bespoke customization packages."}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("description", val)}
              placeholder="Description..."
              multiline={true}
            />
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold">
            Series Filter:
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory(cat.id);
                  setActiveSlide(0);
                }}
                className={`text-xs px-5 py-2.5 uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-none ${
                  activeCategory === cat.id
                    ? "bg-white text-[#0E2047] font-bold"
                    : "bg-[#0E2047] text-white/70 hover:text-white border border-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yacht Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredYachts.map((yacht) => (
            <div
              key={yacht.id}
              className="group bg-[#0E2047] border border-white/10 hover:border-[#C6A155] transition-all duration-500 flex flex-col overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0A1322]">
                <img
                  src={yacht.mainImage}
                  alt={yacht.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 bg-[#08101C]/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C6A155] font-semibold border border-[#C6A155]/30">
                  {yacht.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-sans text-lg font-light text-white uppercase tracking-wider">
                    {yacht.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-1">
                    {[yacht.specs?.lengthOverall || yacht.length, yacht.category].filter(Boolean).join(" • ")}
                  </p>
                  <p className="text-xs text-white/70 mt-3 line-clamp-3 leading-relaxed">
                    {yacht.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleEnquireModel(yacht.name)}
                    className="text-xs text-[#C6A155] hover:text-white uppercase tracking-wider font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Enquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="#fleet"
                    onClick={(e) => {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("asm-switch-fleet-model", { detail: { slug: yacht.slug } }));
                      const fleetElem = document.getElementById("fleet");
                      if (fleetElem) fleetElem.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-xs text-white/60 hover:text-white uppercase tracking-wider cursor-pointer"
                  >
                    Specs
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
