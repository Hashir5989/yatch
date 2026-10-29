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
     MODE 2: Luxury Carousel Showcase for Signature Fleet Models
     ------------------------------------------------------------- */
  if (layoutStyle === "four_models_showcase") {
    const activeYacht = yachts[selectedModelIndex] || yachts[0];
    const isG100 = activeYacht?.slug === "g100" || activeYacht?.id === "yacht-g100";
    const isG66 = activeYacht?.slug === "g66" || activeYacht?.id === "yacht-g66";
    const isG50 = activeYacht?.slug === "g50" || activeYacht?.id === "yacht-g50" || activeYacht?.slug === "g55";
    const isG77 = activeYacht?.slug === "g77" || activeYacht?.slug === "as-77" || activeYacht?.id === "yacht-g77" || activeYacht?.id === "yacht-as-77";
    const shortName = isG100 ? "G-100" : isG66 ? "G-66" : isG50 ? "G-50" : isG77 ? "G77" : (activeYacht?.name || "").replace("ASMARATY ", "").replace(" Super Yacht", "").replace(" Luxury Yacht", "").replace(" Luxury Motor Yacht", "");
    const badgeLabel = isG100 ? "Flagship Superyacht" : isG77 ? "Flybridge Yacht" : isG66 ? "Luxury Yacht" : isG50 ? "Motor Yacht" : activeYacht?.category || "Yacht";

    const lengthVal = activeYacht?.specs?.lengthOverall || activeYacht?.length || (isG100 ? "100 ft / 30.48 m" : isG66 ? "66 ft / 20.12 m" : isG50 ? "50 ft / 15 m" : isG77 ? "78 ft (23.7 m)" : "Bespoke Length");
    const beamVal = activeYacht?.specs?.maximumBeam || activeYacht?.specs?.beam || (isG100 ? "22.91 ft / 6.98 m" : isG66 ? "20 ft / 6.10 m" : isG50 ? "15 ft / 4.5 m" : isG77 ? "20 ft (6 m)" : "Bespoke Beam");
    const engineVal = activeYacht?.specs?.engines || activeYacht?.specs?.inboardEngines || (isG100 ? "2 × 1,600 hp MTU" : isG66 ? "2 × 800 Volvo engines" : isG50 ? "Twin 550 HP Cummins" : isG77 ? "2 × 600–1200 HP Inboard" : "Twin Marine Propulsion");
    const cabinVal = activeYacht?.specs?.bedrooms 
      ? (activeYacht?.specs?.berths ? `${activeYacht.specs.bedrooms} (${activeYacht.specs.berths} Berths)` : `${activeYacht.specs.bedrooms}`) 
      : (isG100 ? "5 + 2 Cabins (12 + 5)" : isG66 ? "4 + 2 Cabins (8 + 2)" : isG50 ? "Owner Cabin + Guest" : isG77 ? "4 + 2 (8 + 3 Berths)" : "Luxury Staterooms");
    const draftVal = activeYacht?.specs?.draftAtFullLoad || activeYacht?.specs?.draft || (isG100 ? "7.5 ft / 2.29 m" : isG66 ? "3.5 ft / 1.07 m" : isG50 ? "4 ft / 1.35 m" : isG77 ? "3.5 ft (1.06 m)" : "Full Load Draft");
    const hullVal = activeYacht?.specs?.hullConstruction || activeYacht?.specs?.hullMaterial || (isG100 ? "GRP Superyacht" : isG66 ? "GRP Luxury Yacht" : isG50 ? "Fiberglass Motor Yacht" : isG77 ? "GRP Composite" : "Advanced Composite");

    const prevModel = () => setSelectedModelIndex((prev) => (prev - 1 + yachts.length) % yachts.length);
    const nextModel = () => setSelectedModelIndex((prev) => (prev + 1) % yachts.length);

    return (
      <section className="py-20 sm:py-28 bg-[#08101C] text-[#E8EEF5] relative overflow-hidden border-t border-b border-white/10" id="fleet">
        {/* Subtle decorative background gradient */}
        <div 
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(198, 161, 85, 0.25) 0%, transparent 70%)"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 space-y-10 sm:space-y-12">
          {/* Section Header with Description and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div className="max-w-3xl space-y-3">
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
              <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                <InlineEditableText
                  as="span"
                  value={description || "Immerse yourself in the distinguished world of ASMARATY. Explore our expanding portfolio of bespoke motor yachts and superyachts, engineered with cutting-edge naval architecture, expansive living spaces, and peerless composite craftsmanship."}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Description..."
                  multiline={true}
                />
              </p>
            </div>

            {/* Header Right Actions: Explore More Button & Circular Navigation Arrows */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap self-start lg:self-end">
              <InlineButtonEditor
                text={buttonText || "Explore More"}
                url={buttonUrl || "/yachts"}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  if (onUpdateField) {
                    onUpdateField("buttonText", newText);
                    onUpdateField("buttonUrl", newUrl);
                  }
                }}
                className="saxdor-btn-solid !h-[42px] sm:!h-[46px] !px-6 sm:!px-8 !text-xs font-bold rounded-none whitespace-nowrap shadow-xl cursor-pointer"
                icon={ArrowRight}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevModel}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0E1D33] hover:bg-white text-white hover:text-[#08101C] border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Previous model"
                  title="Previous model"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextModel}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0E1D33] hover:bg-white text-white hover:text-[#08101C] border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Next model"
                  title="Next model"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <span className="font-mono text-xs text-white/50 tracking-widest pl-1">
                <strong className="text-white text-sm">0{selectedModelIndex + 1}</strong> / 0{yachts.length}
              </span>
            </div>
          </div>

          {/* Empty State */}
          {(!yachts || yachts.length === 0 || !activeYacht) ? (
            <div className="p-16 text-center bg-[#0A1322] border border-white/10">
              <p className="text-white/70 text-sm">
                The ASMARATY fleet collection is currently being curated. Please explore our brand introduction or submit an enquiry to our private advisory team.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured Carousel Showcase Card */}
              <div className="relative bg-[#091322] border border-white/10 overflow-hidden shadow-2xl">
                {/* Large Featured Image View with In-Image Controls matching screenshot */}
                <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[2.35/1] overflow-hidden bg-[#060D18]">
                  <Link href={`/yachts/${activeYacht.slug}`} className="block w-full h-full cursor-pointer group">
                    <img
                      key={activeYacht.id}
                      src={activeYacht.mainImage || activeYacht.primaryImage || "/images/hero-yacht.jpg"}
                      alt={activeYacht.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#091322] via-[#091322]/20 to-transparent opacity-90 pointer-events-none" />
                  </Link>

                  {/* Top Left: Dot indicator + Category & Badge matching screenshot */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 pointer-events-none z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C6A155] shadow-[0_0_10px_#C6A155] animate-pulse" />
                    <span className="px-3 py-1 bg-[#08101C]/90 backdrop-blur-md border border-[#C6A155]/40 text-[#C6A155] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase">
                      {activeYacht.category}
                    </span>
                    <span className="hidden sm:inline-block px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Top Right: The 2 Circular Next/Prev Arrow Buttons matching user's screenshot */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex items-center gap-2.5 z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevModel();
                      }}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer shadow-2xl backdrop-blur-md"
                      aria-label="Previous yacht model"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextModel();
                      }}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/85 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white flex items-center justify-center transition-all cursor-pointer shadow-2xl backdrop-blur-md"
                      aria-label="Next yacht model"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom Right: Overall Length Badge */}
                  <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 pointer-events-none">
                    <span className="px-3.5 py-1.5 bg-[#08101C]/90 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-semibold tracking-wider">
                      {lengthVal.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Lower Detail Bar: Model Information & Technical Specifications */}
                <div className="p-6 sm:p-10 border-t border-white/10 bg-[#091322]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Model Narrative & Direct CTAs */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-[#C6A155] font-semibold">
                        {activeYacht.series || `ASMARATY ${activeYacht.category}`} • {shortName}
                      </div>

                      <Link href={`/yachts/${activeYacht.slug}`}>
                        <h3 className="font-sans text-2xl sm:text-4xl font-light text-white uppercase tracking-[0.04em] hover:text-[#DFBA73] transition-colors cursor-pointer">
                          {activeYacht.name}
                        </h3>
                      </Link>

                      {activeYacht.tagline && (
                        <p className="text-xs sm:text-sm text-[#C6A155]/90 italic font-serif tracking-wide">
                          “{activeYacht.tagline}”
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                        {activeYacht.description}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        <Link
                          href={`/yachts/${activeYacht.slug}`}
                          className="saxdor-btn-solid !h-[42px] !px-6 !text-xs font-bold whitespace-nowrap cursor-pointer inline-flex items-center gap-2"
                        >
                          <span>Explore {shortName}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEnquireModel(activeYacht.name)}
                          className="saxdor-btn-outline !h-[42px] !px-6 !text-xs font-bold whitespace-nowrap cursor-pointer"
                        >
                          Book Sea Trial
                        </button>
                      </div>
                    </div>

                    {/* Right: Marine Specifications Grid */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold">
                        Key Naval Specifications
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Length Overall</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{lengthVal}</span>
                        </div>
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Maximum Beam</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{beamVal}</span>
                        </div>
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Propulsion Engines</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{engineVal}</span>
                        </div>
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Staterooms / Berths</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{cabinVal}</span>
                        </div>
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Full Load Draft</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{draftVal}</span>
                        </div>
                        <div className="bg-[#0D1B2E] p-3.5 border border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/40 block">Hull Construction</span>
                          <span className="font-mono text-white text-xs sm:text-sm font-semibold">{hullVal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {yachts.map((m, idx) => {
                  const isCurrent = selectedModelIndex === idx;
                  const mShort = m.slug === "g100" ? "G-100" : m.slug === "g66" ? "G-66" : m.slug === "g50" ? "G-50" : m.slug === "g77" ? "G77" : m.name.replace("ASMARATY ", "");
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModelIndex(idx)}
                      className={`p-3.5 sm:p-4 text-left transition-all duration-300 border cursor-pointer relative overflow-hidden ${
                        isCurrent
                          ? "bg-[#0E2047] border-[#C6A155] shadow-xl"
                          : "bg-[#08101C]/70 border-white/10 hover:border-white/30 text-white/70 hover:text-white"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#C6A155]" />
                      )}
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#C6A155] font-semibold">
                        0${idx + 1} • ${m.category}
                      </div>
                      <div className="text-sm sm:text-base font-semibold text-white uppercase mt-0.5 truncate">
                        ${mShort}
                      </div>
                      <div className="text-[11px] text-white/50 mt-1 font-mono truncate">
                        ${m.specs?.lengthOverall || m.length}
                      </div>
                    </button>
                  );
                })}
              </div>
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
