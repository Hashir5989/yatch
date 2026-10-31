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

export const DEFAULT_INTERIOR_SLIDES = [
  {
    id: "interior-g100-helm",
    title: "ASMARATY G-100",
    subtitle: "Navigation Bridge & Glass Cockpit Helm Station",
    image: "/images/interiors/g100-helm-station.jpg",
    modelSlug: "g100"
  },
  {
    id: "interior-g100-salon",
    title: "ASMARATY G-100",
    subtitle: "Grand Main Salon & Panoramic Ocean Lounge",
    image: "/images/interiors/g100-main-salon.jpg",
    modelSlug: "g100"
  },
  {
    id: "interior-g100-master",
    title: "ASMARATY G-100",
    subtitle: "Full-Beam Owner’s Master Suite",
    image: "/images/interiors/g100-master-suite.jpg",
    modelSlug: "g100"
  },
  {
    id: "interior-g66-helm",
    title: "ASMARATY G-66",
    subtitle: "Main Indoor Steering Position & Navigation Helm",
    image: "/images/interiors/g66-helm-station.jpg",
    modelSlug: "g66"
  },
  {
    id: "interior-g66-flybridge-helm",
    title: "ASMARATY G-66",
    subtitle: "Elevated Flybridge Driver Station & Panoramic Deck",
    image: "/images/interiors/g66-flybridge-helm.jpg",
    modelSlug: "g66"
  },
  {
    id: "interior-g66-salon",
    title: "ASMARATY G-66",
    subtitle: "Open-Plan Main Salon & Formal Dining",
    image: "/images/interiors/g66-main-salon.jpg",
    modelSlug: "g66"
  },
  {
    id: "interior-g66-stateroom",
    title: "ASMARATY G-66",
    subtitle: "Handcrafted Luxury Master Stateroom",
    image: "/images/interiors/g66-master-stateroom.jpg",
    modelSlug: "g66"
  },
  {
    id: "interior-g50-helm",
    title: "ASMARATY G-50",
    subtitle: "Indoor Driver Position & Navigation Controls",
    image: "/images/interiors/g50-helm-station.jpg",
    modelSlug: "g50"
  },
  {
    id: "interior-g50-flybridge-helm",
    title: "ASMARATY G-50",
    subtitle: "Open Sky Flybridge Driver Station & Lounge",
    image: "/images/interiors/g50-flybridge-helm.jpg",
    modelSlug: "g50"
  },
  {
    id: "interior-g50-salon",
    title: "ASMARATY G-50",
    subtitle: "Sunlit Salon & Entertainment Lounge",
    image: "/images/interiors/g50-luxury-salon.jpg",
    modelSlug: "g50"
  },
  {
    id: "interior-g50-cabin",
    title: "ASMARATY G-50",
    subtitle: "Forward Owner’s Master Stateroom",
    image: "/images/interiors/g50-owner-cabin.jpg",
    modelSlug: "g50"
  }
];

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

  const gallerySlides = data.interiorSlides && data.interiorSlides.length > 0
    ? data.interiorSlides
    : DEFAULT_INTERIOR_SLIDES;

  // Auto-rotate slider in gallery mode when not editing
  useEffect(() => {
    if (layoutStyle !== "model_gallery") return;
    if (isEditable || gallerySlides.length === 0) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % gallerySlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [layoutStyle, isEditable, gallerySlides.length]);

  const currentYacht = filteredYachts[activeSlide] || filteredYachts[0];
  const currentSlide = gallerySlides[activeSlide] || gallerySlides[0];
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
      <section className="py-14 sm:py-20 lg:py-24 bg-[#FAF8F5] text-[#0E2047] border-y border-[#E2D9CC]" id="the-fleet">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-stretch">
            {/* Left Column: Signature Cursive Heading + Eyebrow at bottom (equal height) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="font-signature text-6xl sm:text-7xl md:text-8xl lg:text-[84px] xl:text-[96px] font-normal text-[#0E2047] tracking-normal normal-case leading-[1.05] select-none whitespace-pre-line">
                  <InlineEditableText
                    as="span"
                    value={heading ? heading.replace(/[≈~]/g, "").trim() : "The Signature\nOf the Sea"}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                    placeholder="The Signature\nOf the Sea"
                    multiline={true}
                  />
                  <span className="inline-block ml-3 sm:ml-4 -translate-y-1 sm:-translate-y-2 align-middle">
                    <svg
                      viewBox="0 0 32 14"
                      className="w-6 h-3 sm:w-8 sm:h-4 md:w-9 md:h-4.5 text-[#0E2047]/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 4.5 C 5 1.8, 8 1.8, 11 4.5 C 14 7.2, 17 7.2, 20 4.5 C 23 1.8, 26 1.8, 30 4.5" />
                      <path d="M2 9.5 C 5 6.8, 8 6.8, 11 9.5 C 14 12.2, 17 12.2, 20 9.5 C 23 6.8, 26 6.8, 30 9.5" />
                    </svg>
                  </span>
                </h2>
              </div>

              <div className="text-xs sm:text-[13px] font-sans font-semibold uppercase tracking-[0.28em] text-[#0E2047]/75 pt-6 sm:pt-8">
                <InlineEditableText
                  as="span"
                  value={eyebrow || "ASMARATY FLEET"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  placeholder="ASMARATY FLEET..."
                />
              </div>
            </div>

            {/* Right Column: Narrative + Action Button at bottom (equal height) */}
            <div className="lg:col-span-7 flex flex-col justify-between lg:pl-6 space-y-6">
              <div>
                <p className="text-[15px] sm:text-base md:text-[17px] text-[#0E2047]/85 font-normal leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                  <InlineEditableText
                    as="span"
                    value={description || "ASMARATY brings a distinct personality to the water, unified by an emphasis on contemporary aesthetics, generous living spaces, and thoughtful on-board comfort. Built on a shared passion for design, craftsmanship, and life at sea, our yachts are created to be as rewarding to spend time aboard as they are to admire from the shore."}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("description", val)}
                    placeholder="Enter fleet narrative..."
                    multiline={true}
                  />
                </p>
              </div>

              {buttonText && (
                <div className="pt-2 sm:pt-4">
                  <InlineButtonEditor
                    text={buttonText || "DISCOVER OUR STORY"}
                    url={buttonUrl || "/about"}
                    isEditable={isEditable}
                    onSave={(newText, newUrl) => {
                      if (onUpdateField) {
                        onUpdateField("buttonText", newText);
                        onUpdateField("buttonUrl", newUrl);
                      }
                    }}
                    className="inline-flex items-center justify-center h-[46px] sm:h-[50px] px-8 text-xs font-semibold tracking-[0.2em] uppercase border border-[#0E2047] text-[#0E2047] bg-transparent hover:bg-[#0E2047] hover:text-white transition-colors duration-200 cursor-pointer"
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
        {/* ASMARATY Luxury Wings Watermark Monogram Pattern (Section Background) */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 select-none"
          style={{
            backgroundImage: "url('/images/asmaraty-wings-pattern.svg')",
            backgroundRepeat: "repeat",
            backgroundPosition: "center top",
            backgroundSize: "220px 120px",
            opacity: isDark ? 0.04 : 0.08,
          }}
          aria-hidden="true"
        />

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

            {/* Catchy Action Button redirecting to collection listing page */}
            <div className="pt-4 flex justify-center">
              <InlineButtonEditor
                text={buttonText || "DISCOVER THE COMPLETE FLEET"}
                url={buttonUrl || "/yachts"}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  if (onUpdateField) {
                    onUpdateField("buttonText", newText);
                    onUpdateField("buttonUrl", newUrl);
                  }
                }}
                className={`${isDark ? "saxdor-btn-outline" : "saxdor-btn-navy-outline"} !h-[52px] !px-8 cursor-pointer`}
              />
            </div>
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
                            className={`${isDark ? "saxdor-btn-outline" : "saxdor-btn-navy-outline"} !h-[50px] !px-8 cursor-pointer`}
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
                          <div className="relative aspect-video overflow-hidden bg-[#0A1322]">
                            <img
                              src={model.mainImage || model.primaryImage || "/images/hero-yacht.jpg"}
                              alt={model.name}
                              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
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
      <section className="w-full h-[calc(100vh-70px)] min-h-[580px] max-h-[860px] bg-[#08101C] relative overflow-hidden flex items-end">
        {/* Active Interior Background Images with Preloaded Smooth Dissolve */}
        {gallerySlides.map((slide, idx) => {
          const isActive = idx === activeSlide;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-0 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
              }`}
            >
              <img
                src={slide.image}
                alt={`${slide.title} - ${slide.subtitle}`}
                className="w-full h-full object-cover object-center transform-gpu"
                style={{
                  imageRendering: "-webkit-optimize-contrast",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
                loading={idx <= 1 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* Minimal bottom gradient only behind caption - keeps the interior image 100% crisp & visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08101C]/85 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}

        {/* Left & Right Slider Arrows */}
        {gallerySlides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + gallerySlides.length) % gallerySlides.length)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl rounded-none"
              aria-label="Previous interior slide"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % gallerySlides.length)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-[#08101C]/60 hover:bg-white text-white hover:text-[#0E2047] backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl rounded-none"
              aria-label="Next interior slide"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Clean, Non-intrusive Interior Caption & Minimal Pagination */}
        {currentSlide && (
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pb-8 sm:pb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pointer-events-none">
            <div className="max-w-xl pointer-events-auto">
              <span className="text-[11px] uppercase tracking-[0.26em] text-[#C6A155] font-semibold block mb-1.5 drop-shadow-sm">
                {currentSlide.title} • BESPOKE INTERIOR
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-light text-white uppercase tracking-tight leading-tight drop-shadow">
                {currentSlide.subtitle}
              </h3>
            </div>

            {/* Slide Pagination Bars */}
            <div className="flex items-center gap-1.5 pointer-events-auto" aria-label="Interior gallery pagination">
              {gallerySlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 transition-all cursor-pointer ${
                    activeSlide === idx
                      ? "w-7 bg-[#C6A155]"
                      : "w-2 bg-white/40 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
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
              <div className="relative aspect-video overflow-hidden bg-[#0A1322]">
                <img
                  src={yacht.mainImage}
                  alt={yacht.name}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
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
