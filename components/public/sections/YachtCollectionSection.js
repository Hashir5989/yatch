"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllYachts } from "@/lib/cmsStore";
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
    description = "ASMARATY offers a versatile range of models based on the same core ideas: lightweight composite construction, sharp hull shapes, and well-utilized deck space. From the AS 38 to the AS 100, each boat is designed to provide a confident, efficient, and enjoyable driving experience.",
    filterCategory = "all",
    limit = 8,
    layoutStyle = "grid",
    buttonText = "EXPLORE ALL MODELS",
    buttonUrl = "/yachts"
  } = data;

  const [yachts, setYachts] = useState(() => {
    return getAllYachts().filter((y) => y.status !== "draft");
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getAllYachts().filter((y) => y.status !== "draft");
      setYachts(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const categories = [
    { id: "all", label: "All Series" },
    { id: "Superyacht", label: "Superyachts" },
    { id: "Explorer", label: "Explorers" },
    { id: "Flybridge", label: "Flybridge" },
    { id: "Sports Cruiser", label: "Sports Cruisers" },
    { id: "Island Explorer", label: "Day Boats" },
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
                  value={description || "ASMARATY offers a versatile range of models based on the same core ideas: lightweight composite construction, sharp hull shapes, and well-utilized deck space. From the AS 38 to the AS 100, each boat is designed to provide a confident, efficient, and enjoyable driving experience."}
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
                    className="saxdor-btn-navy-outline !h-[52px] !px-8"
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
     MODE 2: Saxdor Signature Full-Bleed Dark Model Slider
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
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Previous yacht"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % filteredYachts.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer"
              aria-label="Next yacht"
            >
              <ChevronRight className="w-6 h-6" />
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
                {currentYacht.specs?.lengthOverall} • {currentYacht.specs?.maxSpeed} • {currentYacht.specs?.staterooms}
              </p>
              <div>
                <Link
                  href={`/yachts/${currentYacht.slug}`}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white hover:text-[#C6A155] border-b border-white hover:border-[#C6A155] pb-1 transition-colors font-semibold"
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
     MODE 3: Full Fleet Series Catalog Grid View (for /yachts page)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredYachts.map((yacht) => (
            <div
              key={yacht.id}
              className="group bg-[#0E2047] border border-white/10 hover:border-[#C6A155] transition-all duration-500 flex flex-col overflow-hidden"
            >
              <div className="relative h-64 sm:h-72 overflow-hidden bg-black/50">
                <img
                  src={yacht.mainImage}
                  alt={yacht.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2047] via-transparent to-black/30"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#08101C] text-white border border-white/10">
                    {yacht.category}
                  </span>
                  {yacht.featured && (
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-[#C6A155] text-[#08101C]">
                      Flagship
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-4 text-xs font-mono text-white/80 tracking-wider">
                  {yacht.specs?.lengthOverall}
                </div>
              </div>

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-xl sm:text-2xl font-light text-white uppercase group-hover:text-[#DFBA73] transition-colors">
                    {yacht.name}
                  </h3>
                  <p className="text-xs text-[#C6A155] font-sans tracking-wider uppercase mt-1 mb-3 font-medium">
                    {yacht.tagline || yacht.series}
                  </p>
                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-5 font-normal">
                    {yacht.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/10 text-center text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">Speed</span>
                      <span className="text-xs text-white font-medium">{yacht.specs?.maxSpeed || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">Cabins</span>
                      <span className="text-xs text-white font-medium">{yacht.specs?.staterooms?.split(" ")[0] || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">Guests</span>
                      <span className="text-xs text-white font-medium">{yacht.specs?.guests?.split(" ")[0] || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <Link
                    href={`/yachts/${yacht.slug}`}
                    className="w-full py-3 px-4 bg-[#08101C] hover:bg-white hover:text-[#0E2047] text-white text-xs uppercase tracking-[0.14em] font-bold transition-all duration-300 flex items-center justify-between group/btn border border-white/10"
                  >
                    <span>View Specifications</span>
                    <ArrowUpRight className="w-4 h-4 text-[#C6A155] group-hover/btn:text-[#0E2047]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
