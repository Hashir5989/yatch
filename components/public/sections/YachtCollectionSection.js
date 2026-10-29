"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight,
  ArrowUpRight, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Anchor, 
  Compass, 
  Sparkles, 
  Layers,
  Sliders,
  X,
  Gauge,
  BedDouble,
  Maximize2,
  CheckCircle2
} from "lucide-react";
import { getAllYachts, syncYachtsFromServer } from "@/lib/cmsStore";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";

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
    backgroundStyle = "white",
    buttonText = "EXPLORE ALL MODELS",
    buttonUrl = "/#fleet"
  } = data;

  // Initialize with DEFAULT_YACHTS so server SSR and client hydration match 100%
  const [yachts, setYachts] = useState(() => {
    return DEFAULT_YACHTS.filter((y) => y.status === "published");
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);

  // State for dynamic models showcase
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showAllModels, setShowAllModels] = useState(false);

  useEffect(() => {
    // Dynamic sync from authoritative server content source after hydration
    syncYachtsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachts(synced.filter((y) => y.status === "published"));
      } else {
        const local = getAllYachts().filter((y) => y.status === "published");
        setYachts(local);
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
            {/* Left Column: Official Dark Logo + Eyebrow + Huge Title */}
            <div className="lg:col-span-4 space-y-4">
              <div className="mb-4 sm:mb-6">
                <AsmaratyLogo
                  variant="full"
                  tone="dark"
                  href={null}
                  imgClassName="h-12 sm:h-14 md:h-16"
                />
              </div>
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
              <p className="text-base sm:text-lg text-[#0E2047]/80 font-normal leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
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
     MODE 2: Editorial Alternating Showcase for Signature Fleet Models
     - 1st Model: Left Description & Explore Button, Right Image
     - 2nd Model: Left Image, Right Description & Explore Button
     - 3rd Model: Left Description & Explore Button, Right Image
     - 4th Model: Left Image, Right Description & Explore Button
     - Pure Narrative & Visuals without measurements/specifications table
     ------------------------------------------------------------- */
  if (layoutStyle === "four_models_showcase") {
    const isDark = backgroundStyle === "dark";
    const showcaseModels = (yachts && yachts.length > 0) ? yachts.slice(0, 4) : [];

    return (
      <section 
        className={`py-20 sm:py-28 lg:py-32 relative overflow-hidden ${
          isDark 
            ? "bg-[#08101C] text-[#E8EEF5] border-t border-b border-white/10" 
            : "bg-white text-[#0E2047] border-b border-[#0E2047]/10"
        }`} 
        id="fleet"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
          {/* Section Header: Centered on Screen */}
          <div className={`max-w-4xl mx-auto text-center space-y-4 pb-16 sm:pb-24 border-b ${isDark ? "border-white/10" : "border-black/10"}`}>
            <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
              <InlineEditableText
                as="span"
                value={eyebrow || "ASMARATY SIGNATURE FLEET"}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                placeholder="EYEBROW..."
              />
            </div>
            <h2 className={`font-serif text-3xl sm:text-5xl lg:text-6xl font-normal uppercase tracking-[0.03em] leading-tight ${isDark ? "text-white" : "text-[#0E2047]"}`}>
              <InlineEditableText
                as="span"
                value={heading || "OUR SUPERYACHT COLLECTION"}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                placeholder="HEADING..."
              />
            </h2>
            {description && (
              <p className={`text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto ${isDark ? "text-white/70" : "text-[#0E2047]/75"}`}>
                <InlineEditableText
                  as="span"
                  value={description}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Description..."
                  multiline={true}
                />
              </p>
            )}
          </div>

          {/* Empty State */}
          {showcaseModels.length === 0 ? (
            <div className={`p-16 text-center ${isDark ? "bg-[#0A1322] border border-white/10" : "bg-neutral-50 border border-black/10"}`}>
              <p className={`text-sm ${isDark ? "text-white/70" : "text-neutral-600"}`}>
                The ASMARATY fleet collection is currently being curated. Please explore our brand introduction or submit an enquiry to our private advisory team.
              </p>
            </div>
          ) : (
            /* Alternating Editorial Showcase Rows */
            <div className={`divide-y ${isDark ? "divide-white/10" : "divide-black/10"}`}>
              {showcaseModels.map((model, idx) => {
                // Alternating layout:
                // idx = 0 (1st): Text Left, Image Right
                // idx = 1 (2nd): Image Left, Text Right
                // idx = 2 (3rd): Text Left, Image Right
                // idx = 3 (4th): Image Left, Text Right
                const isEven = idx % 2 === 0;
                const modelCategory = model.category ? `ASMARATY • ${model.category}` : "ASMARATY FLEET";

                return (
                  <div
                    key={model.id || idx}
                    className="py-16 sm:py-24 lg:py-28 first:pt-16 sm:first:pt-20 last:pb-0"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                      {/* Description & Button Column */}
                      <div
                        className={`lg:col-span-5 space-y-5 sm:space-y-6 ${
                          isEven
                            ? "lg:order-1 order-1 lg:pr-4"
                            : "lg:order-2 order-2 lg:pl-4"
                        }`}
                      >
                        {/* Eyebrow / Category */}
                        <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                          {modelCategory}
                        </div>

                        {/* Model Heading (Serif Typography matching Majesty / luxury editorial) */}
                        <Link href={`/yachts/${model.slug}`} className="block group">
                          <h3 className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[0.02em] transition-colors ${
                            isDark 
                              ? "text-white group-hover:text-[#C6A155]" 
                              : "text-[#0E2047] group-hover:text-[#C6A155]"
                          }`}>
                            {model.name}
                          </h3>
                        </Link>

                        {/* Tagline / Subtitle */}
                        {model.tagline && (
                          <p className="text-xs sm:text-sm text-[#C6A155] italic font-serif tracking-wide">
                            “{model.tagline}”
                          </p>
                        )}

                        {/* Narrative Description (No measurements, pure story) */}
                        <p className={`text-sm sm:text-base font-normal leading-relaxed text-justify ${
                          isDark ? "text-white/75" : "text-[#0E2047]/80"
                        }`} style={{ textJustify: "inter-word" }}>
                          {model.description}
                        </p>

                        {/* Explore Button matching user's reference screenshot */}
                        <div className="pt-2 sm:pt-4">
                          <Link
                            href={`/yachts/${model.slug}`}
                            className="inline-flex items-center justify-center px-8 sm:px-10 py-3.5 bg-[#787268] hover:bg-[#0E2047] text-white text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            Explore More
                          </Link>
                        </div>
                      </div>

                      {/* Image Column */}
                      <div
                        className={`lg:col-span-7 ${
                          isEven
                            ? "lg:order-2 order-2"
                            : "lg:order-1 order-1"
                        }`}
                      >
                        <Link
                          href={`/yachts/${model.slug}`}
                          className="block group overflow-hidden bg-[#0A1322] shadow-xl border border-black/5"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                              src={model.mainImage || model.primaryImage || "/images/hero-yacht.jpg"}
                              alt={model.name}
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    );
  }

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
                <Link
                  href={`/yachts/${currentYacht.slug}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white hover:text-[#C6A155] border-b border-white hover:border-[#C6A155] pb-1 transition-colors font-semibold cursor-pointer"
                >
                  <span>EXPLORE {currentYacht.name} SPECIFICATIONS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155]" />
                </Link>
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
          <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
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

        {/* Bottom Right: Clean View More Button with Right Arrow */}
        <div className="pt-10 flex items-center justify-end">
          <Link
            href="/yachts"
            className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 bg-[#0E1A2D] hover:bg-[#152744] border border-[#C6A155]/60 hover:border-[#DFBA73] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#DFBA73] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>VIEW MORE</span>
            <ArrowRight className="w-4 h-4 text-[#C6A155] group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
