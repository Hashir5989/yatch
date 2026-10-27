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
                  value={description || "Immerse yourself in the distinguished world of ASMARATY. Explore our expanding portfolio of bespoke motor yachts and superyachts, engineered with cutting-edge naval architecture, expansive living spaces, and peerless composite craftsmanship."}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Description..."
                  multiline={true}
                />
              </p>
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
                  const isG100 = yacht.slug === "g100" || yacht.id === "yacht-g100";
                  const isG66 = yacht.slug === "g66" || yacht.id === "yacht-g66";
                  const isG50 = yacht.slug === "g50" || yacht.id === "yacht-g50" || yacht.slug === "g55";
                  const isG77 = yacht.slug === "g77" || yacht.slug === "as-77" || yacht.id === "yacht-g77" || yacht.id === "yacht-as-77";
                  const shortName = isG100 ? "G-100" : isG66 ? "G-66" : isG50 ? "G-50" : isG77 ? "G77" : yacht.name.replace("ASMARATY ", "").replace(" Super Yacht", "").replace(" Luxury Yacht", "").replace(" Luxury Motor Yacht", "");

                  // Specification condition: true only when confirmed technical specifications exist
                  const hasSpecs = Boolean(yacht.specs && Object.keys(yacht.specs).length > 2 && (yacht.specs.engines || yacht.specs.inboardEngines || yacht.specs.lengthOverall));

                  // Extract card key specifications
                  const lengthVal = yacht.specs?.lengthOverall || yacht.length || (isG100 ? "100 ft / 30.48 m" : isG66 ? "66 ft / 20.12 m" : isG50 ? "50 ft / 15 m" : isG77 ? "78 ft (23.7 m)" : "Bespoke Length");
                  const beamVal = yacht.specs?.maximumBeam || yacht.specs?.beam || (isG100 ? "22.91 ft / 6.98 m" : isG66 ? "20 ft / 6.10 m" : isG50 ? "15 ft / 4.5 m" : isG77 ? "20 ft (6 m)" : "Bespoke");
                  const engineVal = yacht.specs?.engines || yacht.specs?.inboardEngines || (isG100 ? "2 × 1,600 hp MTU" : isG66 ? "2 × 800 Volvo engines" : isG50 ? "Twin 550 HP Cummins" : isG77 ? "2 × 600–1200 HP Inboard" : "Twin Marine Propulsion");
                  const cabinVal = yacht.specs?.bedrooms 
                    ? (yacht.specs?.berths ? `${yacht.specs.bedrooms} (${yacht.specs.berths} Berths)` : `${yacht.specs.bedrooms}`) 
                    : (isG100 ? "5 + 2 Cabins (12 + 5)" : isG66 ? "4 + 2 Cabins (8 + 2)" : isG50 ? "Owner Cabin + Guest" : isG77 ? "4 + 2 (8 + 3 Berths)" : "Luxury Staterooms");
                  const draftVal = yacht.specs?.draftAtFullLoad || yacht.specs?.draft || (isG100 ? "7.5 ft / 2.29 m" : isG66 ? "3.5 ft / 1.07 m" : isG50 ? "4 ft / 1.35 m" : isG77 ? "3.5 ft (1.06 m)" : "Full Load Draft");
                  const hullVal = yacht.specs?.hullConstruction || yacht.specs?.hullMaterial || (isG100 ? "GRP Superyacht" : isG66 ? "GRP Luxury Yacht" : isG50 ? "Fiberglass Motor Yacht" : isG77 ? "GRP Composite" : "Advanced Composite");

                  return (
                    <div
                      key={yacht.id}
                      className="group relative bg-[#091322] border border-white/10 hover:border-[#C6A155] transition-all duration-500 overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    >
                      {/* Image Area with Zoom & Badges */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#060D18]">
                        <Link href={`/yachts/${yacht.slug}`} className="block w-full h-full cursor-pointer">
                          <img
                            src={yacht.mainImage || yacht.primaryImage || "/images/hero-yacht.jpg"}
                            alt={yacht.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#091322] via-[#091322]/20 to-transparent opacity-90" />
                        </Link>
                        
                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                          <span className="px-3 py-1 bg-[#08101C]/90 backdrop-blur-md border border-[#C6A155]/40 text-[#C6A155] text-[10px] font-semibold tracking-[0.2em] uppercase">
                            {yacht.category}
                          </span>
                          {(idx === 0 || isG100) && (
                            <span className="px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                              Flagship Superyacht
                            </span>
                          )}
                          {isG66 && (
                            <span className="px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                              Luxury Yacht
                            </span>
                          )}
                          {isG50 && (
                            <span className="px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                              Motor Yacht
                            </span>
                          )}
                          {isG77 && (
                            <span className="px-2.5 py-1 bg-[#C6A155] text-[#08101C] text-[9px] font-bold tracking-[0.16em] uppercase">
                              Flybridge Yacht
                            </span>
                          )}
                        </div>

                        <div className="absolute top-4 right-4 pointer-events-none">
                          <span className="px-3 py-1 bg-[#08101C]/90 backdrop-blur-md border border-white/15 text-white/90 font-mono text-[11px] font-medium tracking-wider">
                            {lengthVal.toUpperCase()}
                          </span>
                        </div>

                        {/* Bottom Image Micro-Label */}
                        <div className="absolute bottom-3 right-4 flex items-center justify-end text-[11px] text-white/70">
                          <Link
                            href={`/yachts/${yacht.slug}`}
                            className="!text-white hover:text-[#DFBA73] font-semibold tracking-wider uppercase text-[10px] group-hover:translate-x-1 transition-all inline-flex items-center gap-1 cursor-pointer"
                            style={{ color: "#FFFFFF" }}
                          >
                            <span className="!text-white" style={{ color: "#FFFFFF" }}>Explore {shortName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155]" />
                          </Link>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6A155] font-semibold">
                              {yacht.series || `ASMARATY ${yacht.category}`}
                            </span>
                          </div>

                          <Link href={`/yachts/${yacht.slug}`}>
                            <h3 className="font-sans text-2xl sm:text-3xl font-light text-white uppercase tracking-[0.04em] group-hover:text-[#DFBA73] transition-colors cursor-pointer">
                              {yacht.name}
                            </h3>
                          </Link>

                          {yacht.tagline && (
                            <p className="text-xs sm:text-sm text-[#C6A155]/90 italic font-serif tracking-wide">
                              “{yacht.tagline}”
                            </p>
                          )}

                          <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed line-clamp-3">
                            {yacht.description}
                          </p>
                        </div>

                        {/* Comprehensive Technical Specifications Grid (conditionally rendered) */}
                        {hasSpecs ? (
                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold mb-2">
                              Key Marine Specifications
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Length Overall
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {lengthVal}
                                </span>
                              </div>

                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Maximum Beam
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {beamVal}
                                </span>
                              </div>

                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Twin Engines
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {engineVal}
                                </span>
                              </div>

                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Cabins / Berths
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {cabinVal}
                                </span>
                              </div>

                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Draft Full Load
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {draftVal}
                                </span>
                              </div>

                              <div className="bg-[#0D1B2E] p-2.5 border border-white/5">
                                <span className="text-[9px] uppercase tracking-wider text-white/40 block">
                                  Hull / Construction
                                </span>
                                <span className="font-semibold text-white mt-0.5 block truncate text-[11px]">
                                  {hullVal}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Specifications Pending Confirmation Notice */
                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold mb-2">
                              Technical Specifications
                            </div>
                            <div className="bg-[#0D1B2E] p-3.5 border border-white/5 flex items-start gap-3">
                              <Sliders className="w-4 h-4 text-[#C6A155] flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-white/70 leading-relaxed font-light">
                                Please contact our private client team for confirmed technical specifications, engine details, passenger capacity, and accommodation layout.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Architectural Highlights */}
                        {yacht.highlights && yacht.highlights.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/10">
                            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C6A155] font-semibold mb-1">
                              Key Features & Highlights
                            </div>
                            <ul className="space-y-1.5 text-xs text-white/70">
                              {yacht.highlights.slice(0, hasSpecs ? 3 : 5).map((h, hIdx) => (
                                <li key={hIdx} className="flex items-start gap-2">
                                  <Check className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                                  <span className="line-clamp-1">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Buttons: Explore Specifications & Enquire About Model */}
                        <div className="pt-4 mt-auto border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                          <Link
                            href={`/yachts/${yacht.slug}`}
                            className="h-[48px] min-h-[48px] max-h-[48px] w-full px-3 sm:px-4 text-[11px] font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border border-[#C6A155]/70 hover:border-[#DFBA73] bg-[#0E1A2D] hover:bg-[#152744] text-white hover:text-white rounded-none shadow-none m-0 box-border leading-none select-none"
                            style={{ color: "#FFFFFF", height: "48px", minHeight: "48px", maxHeight: "48px", margin: 0, boxSizing: "border-box" }}
                          >
                            <Sliders className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                            <span className="truncate text-white font-bold tracking-[0.14em]" style={{ color: "#FFFFFF" }}>Explore Specifications</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleEnquireModel(yacht.name)}
                            className="h-[48px] min-h-[48px] max-h-[48px] w-full px-3 sm:px-4 text-[11px] font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 border border-white hover:border-white/90 bg-white hover:bg-[#F2F5F8] text-[#08101C] hover:text-black rounded-none shadow-none m-0 box-border leading-none appearance-none select-none"
                            style={{ height: "48px", minHeight: "48px", maxHeight: "48px", margin: 0, boxSizing: "border-box" }}
                          >
                            <span className="truncate tracking-[0.14em]">Enquire About {shortName}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#08101C] flex-shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Right: Clean View More Button with Right Arrow */}
              <div className={`pt-8 sm:pt-10 flex items-center ${yachts.length > 4 ? "justify-between" : "justify-end"} gap-4`}>
                {yachts.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllModels(!showAllModels)}
                    className="saxdor-btn-navy-outline !h-[48px] !px-8 text-xs font-bold text-white border-white/20 hover:border-[#C6A155] inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{showAllModels ? "SHOW INITIAL 4 MODELS" : `SHOW ALL FLEET MODELS (${yachts.length})`}</span>
                    <ArrowRight className={`w-4 h-4 text-[#C6A155] transition-transform ${showAllModels ? "-rotate-90" : "rotate-90"}`} />
                  </button>
                )}

                <Link
                  href="/yachts"
                  className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 bg-[#0E1A2D] hover:bg-[#152744] border border-[#C6A155]/60 hover:border-[#DFBA73] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white hover:text-[#DFBA73] transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <span>VIEW MORE</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A155] group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
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
