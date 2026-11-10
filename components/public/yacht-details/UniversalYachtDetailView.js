"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Anchor,
  Check,
  Layers,
  Sparkles,
  Download,
  Compass,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  X,
  MessageCircle,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

// Icon mapping helper for narrative cards
const ICON_MAP = {
  Layers: Layers,
  Sparkles: Sparkles,
  Anchor: Anchor,
  Compass: Compass
};

export default function UniversalYachtDetailView({
  data,
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
  showNavAndFooter = true,
}) {
  if (!data) return null;

  // Auto-changing Hero Background Index
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  // Smooth Auto-changing Banner Interval (5 seconds)
  useEffect(() => {
    if (!data.heroImages || data.heroImages.length === 0) return;
    const timer = setInterval(() => {
      setActiveHeroIdx((prev) => (prev + 1) % data.heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.heroImages]);

  // Deck Plan Interactive State
  const [activeDeckTab, setActiveDeckTab] = useState(
    data.deckPlans && data.deckPlans.length > 0 ? data.deckPlans[0].id : "main-deck"
  );

  // Specs Tab State
  const [activeSpecCategory, setActiveSpecCategory] = useState(
    data.specCategories && data.specCategories.length > 0 ? data.specCategories[0].id : "dimensions"
  );

  // Gallery Filter & Lightbox State
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deckModalOpen, setDeckModalOpen] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (deckModalOpen) setDeckModalOpen(false);
        if (lightboxIndex !== null) setLightboxIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deckModalOpen, lightboxIndex]);

  // Filter gallery items
  const filteredGallery =
    galleryFilter === "All"
      ? data.gallery || []
      : (data.gallery || []).filter((item) => item.category === galleryFilter);

  // Lightbox navigation
  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredGallery.length - 1));
  };
  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev < filteredGallery.length - 1 ? prev + 1 : 0));
  };

  const activeDeck =
    (data.deckPlans || []).find((d) => d.id === activeDeckTab) || data.deckPlans?.[0];
  const activeSpec =
    (data.specCategories || []).find((s) => s.id === activeSpecCategory) || data.specCategories?.[0];

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] selection:bg-[#C8A870] selection:text-[#080B10]">
      {showNavAndFooter && <PublicNavbar />}

      <main>
        {/* Top Breadcrumb & Status Ribbon */}
        <section className="bg-[#0A0D14] border-b border-white/5 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#828F9E]">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/yachts" className="hover:text-white transition-colors">Fleet</Link>
              <span>/</span>
              <span className="text-[#C8A870] font-medium">
                <InlineEditableText
                  as="span"
                  value={data.fullName || data.name}
                  isEditable={isEditable}
                  onChange={(val) => {
                    onUpdateField && onUpdateField("fullName", val);
                    onUpdateField && onUpdateField("name", val);
                  }}
                  placeholder="Vessel Full Name"
                />
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C8A870]/10 border border-[#C8A870]/30 text-[#E5C392] text-[11px] uppercase tracking-wider font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870] animate-pulse"></span>
                <InlineEditableText
                  as="span"
                  value={data.badge || "Official Fleet Model"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("badge", val)}
                  placeholder="Official Fleet Model"
                />
              </span>

              {/* Brochure Button in Ribbon - 100% Inline Editable */}
              <InlineButtonEditor
                config={{
                  label: data.brochureLabel || "Brochure (PDF)",
                  url: data.brochureUrl || "/contact",
                  target: data.brochureUrl ? "_blank" : "_self",
                  type: data.brochureUrl ? "external" : "internal",
                  visible: true,
                }}
                text={data.brochureLabel || "Brochure (PDF)"}
                url={data.brochureUrl || "/contact"}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  onUpdateField && onUpdateField("brochureLabel", newText);
                  onUpdateField && onUpdateField("brochureUrl", newUrl);
                }}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 text-[#C8A870] hover:text-white transition-colors text-xs font-medium cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>{data.brochureLabel || "Brochure (PDF)"}</span>
              </InlineButtonEditor>
            </div>
          </div>
        </section>

        {/* Hero Section with Auto-Changing Crossfade Background */}
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-end overflow-hidden">
          {/* Background Images with Silky Crossfade Transition */}
          <div className="absolute inset-0 bg-[#080B10]">
            {(data.heroImages || []).map((img, idx) => (
              <img
                key={img.src || idx}
                src={img.src}
                alt={img.label}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out scale-[1.01] ${
                  activeHeroIdx === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            ))}
            {/* Dark & Gold Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#080B10]/85 via-[#080B10]/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(8,11,16,0.6)_100%)] pointer-events-none"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16 w-full pt-32 sm:pt-40">
            <div className="max-w-3xl space-y-6">
              {/* Title & Tagline */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-light text-white leading-[1.15] tracking-tight">
                  <InlineEditableText
                    as="span"
                    value={data.brandPrefix || "ASMARATY"}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("brandPrefix", val)}
                    placeholder="ASMARATY"
                  />{" "}
                  <span className="font-sans font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#E5C392] to-[#C8A870]">
                    <InlineEditableText
                      as="span"
                      value={data.modelNumber}
                      isEditable={isEditable}
                      onChange={(val) => onUpdateField && onUpdateField("modelNumber", val)}
                      placeholder="Model..."
                    />
                  </span>
                </h1>
                <p className="mt-3 text-xs sm:text-sm md:text-base text-[#E0E6EF] font-light max-w-2xl leading-relaxed">
                  <InlineEditableText
                    as="span"
                    value={data.tagline}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("tagline", val)}
                    placeholder="Enter vessel tagline..."
                    multiline={true}
                  />
                </p>
              </div>

              {/* Key Highlights Subtitle */}
              <p 
                className="text-xs sm:text-sm text-[#9DAAB8] font-light max-w-xl leading-relaxed text-justify"
                style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
              >
                <InlineEditableText
                  as="span"
                  value={data.description}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Enter vessel description..."
                  multiline={true}
                />
              </p>

              {/* Action Buttons: 100% Inline Editable (Label, URL, Style) */}
              <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                <InlineButtonEditor
                  text={data.heroPrimaryButtonText || "Book Private Viewing"}
                  url={data.heroPrimaryButtonUrl || "/contact"}
                  isEditable={isEditable}
                  onSave={(newText, newUrl) => {
                    onUpdateField && onUpdateField("heroPrimaryButtonText", newText);
                    onUpdateField && onUpdateField("heroPrimaryButtonUrl", newUrl);
                  }}
                  className="w-full sm:w-auto saxdor-btn-solid !h-auto min-h-[44px] sm:!h-[52px] !px-4 sm:!px-8 text-[11px] sm:text-xs font-semibold tracking-wider rounded-none inline-flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>{data.heroPrimaryButtonText || "Book Private Viewing"}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </InlineButtonEditor>

                <InlineButtonEditor
                  config={{
                    label: data.brochureLabel || "Download Brochure (PDF)",
                    url: data.brochureUrl || "/contact",
                    target: data.brochureUrl ? "_blank" : "_self",
                    type: data.brochureUrl ? "external" : "internal",
                    visible: true,
                    style: "outline-gold",
                  }}
                  text={data.brochureLabel || "Download Brochure (PDF)"}
                  url={data.brochureUrl || "/contact"}
                  isEditable={isEditable}
                  onSave={(newText, newUrl) => {
                    onUpdateField && onUpdateField("brochureLabel", newText);
                    onUpdateField && onUpdateField("brochureUrl", newUrl);
                  }}
                  className="w-full sm:w-auto saxdor-btn-outline !h-auto min-h-[44px] sm:!h-[52px] !px-4 sm:!px-6 text-[11px] sm:text-xs font-medium tracking-wider rounded-none inline-flex items-center justify-center gap-2 bg-[#080B10]/60 backdrop-blur-sm cursor-pointer text-center"
                >
                  <Download className="w-4 h-4 text-[#C8A870] shrink-0" />
                  <span>{data.brochureLabel || "Download Brochure (PDF)"}</span>
                </InlineButtonEditor>

                <InlineButtonEditor
                  text={data.deckPlansButtonText || "Explore 3D Deck Plans"}
                  url={data.deckPlansButtonUrl || "#deck-plans"}
                  isEditable={isEditable}
                  onSave={(newText, newUrl) => {
                    onUpdateField && onUpdateField("deckPlansButtonText", newText);
                    onUpdateField && onUpdateField("deckPlansButtonUrl", newUrl);
                  }}
                  className="text-xs uppercase tracking-luxury text-[#E5C392] hover:text-white px-4 py-3 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{data.deckPlansButtonText || "Explore 3D Deck Plans"}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </InlineButtonEditor>
              </div>
            </div>

            {/* Auto-Slide Indicator Dots & Slide Management */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(data.heroImages || []).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeroIdx(idx)}
                    aria-label={img.label}
                    title={img.label}
                    className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                      activeHeroIdx === idx
                        ? "w-8 bg-[#C8A870]"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
                <span className="ml-3 text-[11px] text-[#828F9E] font-mono">
                  0{activeHeroIdx + 1} / 0{data.heroImages?.length || 1}
                </span>

                {/* Hero Slide In-Line Controls */}
                {isEditable && (
                  <div className="flex items-center gap-1.5 ml-4">
                    {onOpenMediaPicker && (
                      <button
                        type="button"
                        onClick={() => {
                          const cur = data.heroImages?.[activeHeroIdx]?.src || "";
                          onOpenMediaPicker(`heroImages[${activeHeroIdx}].src`, cur);
                        }}
                        className="px-2.5 py-1 bg-[#0E1522] border border-[#C8A870]/60 text-[#DFBA73] text-[10px] font-mono flex items-center gap-1 hover:bg-[#C8A870] hover:text-[#080B10] transition-colors cursor-pointer"
                        title="Replace photo for this active slide"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Change Photo</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const slides = [...(data.heroImages || [])];
                        slides.push({
                          src: "/images/yachts/g100/0.jpg",
                          label: `${data.fullName || "Vessel"} Daylight View`,
                        });
                        onUpdateField && onUpdateField("heroImages", slides);
                        setActiveHeroIdx(slides.length - 1);
                      }}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      title="Add a new slide to hero carousel"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Slide</span>
                    </button>
                    {(data.heroImages || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const slides = [...(data.heroImages || [])];
                          slides.splice(activeHeroIdx, 1);
                          onUpdateField && onUpdateField("heroImages", slides);
                          setActiveHeroIdx(Math.max(0, activeHeroIdx - 1));
                        }}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-xs transition-colors cursor-pointer"
                        title="Delete this slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right text-[11px] text-[#828F9E] tracking-wider uppercase hidden sm:block">
                <InlineEditableText
                  as="span"
                  value={data.summaryLine}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("summaryLine", val)}
                  placeholder="Summary Line..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Floating Key Metrics Strip */}
        <section className="bg-[#0C1017] border-y border-white/10 py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {(data.keyMetrics || []).map((metric, idx) => (
              <div
                key={idx}
                className={`space-y-1 ${idx > 0 ? "sm:border-l sm:border-white/5" : ""} ${isEditable ? "p-1 hover:bg-white/[0.03] transition-colors" : ""}`}
              >
                <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                  <InlineEditableText
                    as="span"
                    value={metric.label}
                    isEditable={isEditable}
                    onChange={(val) => {
                      const updated = [...(data.keyMetrics || [])];
                      updated[idx] = { ...updated[idx], label: val };
                      onUpdateField && onUpdateField("keyMetrics", updated);
                    }}
                    placeholder="Metric Label"
                  />
                </span>
                <p className="font-serif text-xl sm:text-2xl text-white font-medium">
                  <InlineEditableText
                    as="span"
                    value={metric.main}
                    isEditable={isEditable}
                    onChange={(val) => {
                      const updated = [...(data.keyMetrics || [])];
                      updated[idx] = { ...updated[idx], main: val };
                      onUpdateField && onUpdateField("keyMetrics", updated);
                    }}
                    placeholder="Value"
                  />
                </p>
                <span className="text-[11px] text-[#C8A870] font-mono block">
                  <InlineEditableText
                    as="span"
                    value={metric.sub}
                    isEditable={isEditable}
                    onChange={(val) => {
                      const updated = [...(data.keyMetrics || [])];
                      updated[idx] = { ...updated[idx], sub: val };
                      onUpdateField && onUpdateField("keyMetrics", updated);
                    }}
                    placeholder="Sub-label"
                  />
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Overview & Architectural Narrative Section */}
        <section id="overview" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                  <InlineEditableText
                    as="span"
                    value={data.narrative?.eyebrow || "AT A GLANCE • ARCHITECTURAL NARRATIVE"}
                    isEditable={isEditable}
                    onChange={(val) =>
                      onUpdateField &&
                      onUpdateField("narrative", { ...(data.narrative || {}), eyebrow: val })
                    }
                    placeholder="EYEBROW..."
                  />
                </span>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-white leading-tight">
                  <InlineEditableText
                    as="span"
                    value={data.narrative?.headline || "Crafted for Unrivaled Luxury on the Water"}
                    isEditable={isEditable}
                    onChange={(val) =>
                      onUpdateField &&
                      onUpdateField("narrative", { ...(data.narrative || {}), headline: val })
                    }
                    placeholder="HEADLINE..."
                  />
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                {(data.narrative?.paragraphs || []).map((p, idx) => (
                  <p 
                    key={idx}
                    className="text-justify"
                    style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                  >
                    <InlineEditableText
                      as="span"
                      value={p}
                      isEditable={isEditable}
                      multiline={true}
                      onChange={(val) => {
                        const paras = [...(data.narrative?.paragraphs || [])];
                        paras[idx] = val;
                        onUpdateField &&
                          onUpdateField("narrative", { ...(data.narrative || {}), paragraphs: paras });
                      }}
                      placeholder="Story paragraph..."
                    />
                  </p>
                ))}
              </div>
            </div>

            {/* Narrative Visual Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data.narrative?.cards || []).map((card, idx) => {
                const IconComponent = ICON_MAP[card.icon] || Layers;
                return (
                  <div
                    key={idx}
                    className="group relative overflow-hidden bg-[#0E131C] border border-white/10 p-6 space-y-3 hover:border-[#C8A870]/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-none bg-[#17202C] border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870]">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg text-white font-medium">
                      <InlineEditableText
                        as="span"
                        value={card.title}
                        isEditable={isEditable}
                        onChange={(val) => {
                          const cards = [...(data.narrative?.cards || [])];
                          cards[idx] = { ...cards[idx], title: val };
                          onUpdateField &&
                            onUpdateField("narrative", { ...(data.narrative || {}), cards });
                        }}
                        placeholder="Feature title..."
                      />
                    </h3>
                    <p 
                      className="text-xs text-[#828F9E] leading-relaxed font-light text-justify"
                      style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                    >
                      <InlineEditableText
                        as="span"
                        value={card.description}
                        isEditable={isEditable}
                        multiline={true}
                        onChange={(val) => {
                          const cards = [...(data.narrative?.cards || [])];
                          cards[idx] = { ...cards[idx], description: val };
                          onUpdateField &&
                            onUpdateField("narrative", { ...(data.narrative || {}), cards });
                        }}
                        placeholder="Feature description..."
                      />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive 3D Cutaway Deck Plans & General Arrangement Section */}
        <section id="deck-plans" className="py-20 sm:py-28 bg-[#0A0D14] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                GENERAL ARRANGEMENT • DECK-BY-DECK 3D CUTAWAY
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-white">
                Explore the Three Expansive Decks
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                Inspect the authentic 3D architectural cutaway models and official general arrangement (GA) drawings engineered for the {data.fullName}.
              </p>
            </div>

            {/* Deck Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 border-b border-white/10 pb-4">
              {(data.deckPlans || []).map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setActiveDeckTab(deck.id)}
                  className={`px-5 py-3 text-xs uppercase tracking-luxury font-medium transition-all border ${
                    activeDeckTab === deck.id
                      ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870] shadow-[0_0_20px_rgba(200,168,112,0.3)]"
                      : "bg-[#0E131C] text-[#8E9AA8] border-white/10 hover:text-white hover:border-white/30"
                  }`}
                >
                  {deck.name}
                </button>
              ))}
            </div>

            {/* Active Deck Display Card */}
            {activeDeck && (
              <div className="bg-[#0E131C] border border-white/10 p-6 sm:p-10 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-luxury text-[#C8A870] font-medium block">
                      Deck Layout Specification
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-white font-light mt-0.5">
                      {activeDeck.name} —{" "}
                      <span className="text-[#E5C392]">
                        <InlineEditableText
                          as="span"
                          value={activeDeck.subtitle}
                          isEditable={isEditable}
                          onChange={(val) => {
                            const decks = (data.deckPlans || []).map((d) =>
                              d.id === activeDeck.id ? { ...d, subtitle: val } : d
                            );
                            onUpdateField && onUpdateField("deckPlans", decks);
                          }}
                          placeholder="Subtitle..."
                        />
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditable && onOpenMediaPicker && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMediaPicker(`deckPlan_${activeDeck.id}`, activeDeck.image3D)
                        }
                        className="saxdor-btn-outline !h-[42px] !min-w-0 !px-4 text-xs font-medium tracking-wider rounded-none inline-flex items-center justify-center gap-2 border-[#C8A870]/60 text-[#DFBA73] hover:bg-[#C8A870] hover:text-[#080B10]"
                      >
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Change 3D Cutaway</span>
                      </button>
                    )}

                    {isEditable ? (
                      <InlineButtonEditor
                        text={activeDeck.resolutionLabel || "View Full Resolution"}
                        url={activeDeck.image3D}
                        isEditable={isEditable}
                        onSave={(newText, newUrl) => {
                          const decks = (data.deckPlans || []).map((d) =>
                            d.id === activeDeck.id ? { ...d, resolutionLabel: newText, image3D: newUrl } : d
                          );
                          onUpdateField && onUpdateField("deckPlans", decks);
                        }}
                        className="saxdor-btn-outline !h-[42px] !min-w-0 !px-4 text-xs font-medium tracking-wider rounded-none inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C8A870] shrink-0" />
                        <span>{activeDeck.resolutionLabel || "View Full Resolution"}</span>
                      </InlineButtonEditor>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeckModalOpen(true)}
                        className="saxdor-btn-outline !h-[42px] !min-w-0 !px-4 text-xs font-medium tracking-wider rounded-none inline-flex items-center justify-center gap-2 cursor-pointer hover:border-[#C8A870] hover:text-[#C8A870] transition-colors"
                        title="Open full resolution deck specification"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#C8A870] shrink-0" />
                        <span>{activeDeck.resolutionLabel || "View Full Resolution"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Deck Image Preview */}
                <div
                  onClick={() => !isEditable && setDeckModalOpen(true)}
                  className={`relative bg-[#080B10] p-4 sm:p-8 border border-white/5 overflow-hidden group ${
                    !isEditable ? "cursor-zoom-in" : ""
                  }`}
                  title={!isEditable ? "Click to view full resolution" : ""}
                >
                  <img
                    src={activeDeck.image3D}
                    alt={activeDeck.caption}
                    className="w-full h-auto max-h-[550px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-xs text-[#828F9E] tracking-wider font-mono">
                      <InlineEditableText
                        as="span"
                        value={activeDeck.caption}
                        isEditable={isEditable}
                        onChange={(val) => {
                          const decks = (data.deckPlans || []).map((d) =>
                            d.id === activeDeck.id ? { ...d, caption: val } : d
                          );
                          onUpdateField && onUpdateField("deckPlans", decks);
                        }}
                        placeholder="Deck Caption..."
                      />
                    </p>
                  </div>
                </div>

                {/* Key Highlights for this Deck */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-xs uppercase tracking-luxury text-[#C8A870] font-semibold">
                      Key Deck Appointments & Features
                    </h4>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          const decks = (data.deckPlans || []).map((d) => {
                            if (d.id === activeDeck.id) {
                              return {
                                ...d,
                                features: [...(d.features || []), "New premium deck feature / appointment"],
                              };
                            }
                            return d;
                          });
                          onUpdateField && onUpdateField("deckPlans", decks);
                        }}
                        className="px-2.5 py-1 bg-[#C8A870]/20 hover:bg-[#C8A870]/40 text-[#DFBA73] border border-[#C8A870]/50 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Deck Feature</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(activeDeck.features || []).map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#0A0D14] border border-white/5 flex items-start gap-3 group/feat"
                      >
                        <div className="w-5 h-5 rounded-none bg-[#C8A870]/10 border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870] flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-[#C9D2DF] font-light leading-relaxed flex-1">
                          <InlineEditableText
                            as="span"
                            value={feat}
                            isEditable={isEditable}
                            onChange={(val) => {
                              const decks = (data.deckPlans || []).map((d) => {
                                if (d.id === activeDeck.id) {
                                  const feats = [...(d.features || [])];
                                  feats[idx] = val;
                                  return { ...d, features: feats };
                                }
                                return d;
                              });
                              onUpdateField && onUpdateField("deckPlans", decks);
                            }}
                            placeholder="Deck feature..."
                          />
                        </span>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => {
                              const decks = (data.deckPlans || []).map((d) => {
                                if (d.id === activeDeck.id) {
                                  const feats = (d.features || []).filter((_, fIdx) => fIdx !== idx);
                                  return { ...d, features: feats };
                                }
                                return d;
                              });
                              onUpdateField && onUpdateField("deckPlans", decks);
                            }}
                            className="text-rose-400 hover:text-rose-200 opacity-60 hover:opacity-100 p-0.5 transition-opacity cursor-pointer"
                            title="Delete feature"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Technical Specifications Dossier Section */}
        <section id="specifications" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
              OFFICIAL BROCHURE DATA • NAVAL ARCHITECTURE
            </span>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-white">
              Technical Specifications Dossier
            </h2>
            <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
              Exacting engineering standards, propulsion systems, and capacity matrices as certified for the {data.fullName}.
            </p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-white/10 pb-4">
            {(data.specCategories || []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSpecCategory(cat.id)}
                className={`px-4 py-2.5 text-xs uppercase tracking-luxury font-medium transition-all border ${
                  activeSpecCategory === cat.id
                    ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870]"
                    : "bg-[#0E131C] text-[#8E9AA8] border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Active Specification Table Grid */}
          {activeSpec && (
            <div className="bg-[#0E131C] border border-white/10 divide-y divide-white/5">
              <div className="p-4 sm:p-6 bg-[#0A0D14] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-[#C8A870]" />
                  <h3 className="font-serif text-lg sm:text-xl text-white font-light">
                    {activeSpec.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#828F9E] font-mono uppercase tracking-wider hidden sm:inline">
                    Certified Shipyard Matrix
                  </span>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => {
                        const cats = (data.specCategories || []).map((c) => {
                          if (c.id === activeSpec.id) {
                            const specs = [
                              ...(c.specs || []),
                              { label: "New Specification Parameter", value: "Standard / Custom" },
                            ];
                            return { ...c, specs };
                          }
                          return c;
                        });
                        onUpdateField && onUpdateField("specCategories", cats);
                      }}
                      className="px-2.5 py-1 bg-[#C8A870]/20 hover:bg-[#C8A870]/40 text-[#DFBA73] border border-[#C8A870]/50 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Spec Row</span>
                    </button>
                  )}
                </div>
              </div>

              {(activeSpec.specs || []).map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-5 text-xs hover:bg-[#121824] transition-colors gap-2 items-center group/spec"
                >
                  <div className="sm:col-span-5 text-[#8E9EAF] uppercase tracking-wider font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870]/40"></span>
                    <span>
                      <InlineEditableText
                        as="span"
                        value={item.label}
                        isEditable={isEditable}
                        onChange={(val) => {
                          const cats = (data.specCategories || []).map((c) => {
                            if (c.id === activeSpec.id) {
                              const specs = [...(c.specs || [])];
                              specs[idx] = { ...specs[idx], label: val };
                              return { ...c, specs };
                            }
                            return c;
                          });
                          onUpdateField && onUpdateField("specCategories", cats);
                        }}
                        placeholder="Spec label..."
                      />
                    </span>
                  </div>
                  <div className="sm:col-span-7 text-white font-medium sm:text-right font-mono text-sm flex items-center justify-between sm:justify-end gap-3">
                    <InlineEditableText
                      as="span"
                      value={item.value}
                      isEditable={isEditable}
                      onChange={(val) => {
                        const cats = (data.specCategories || []).map((c) => {
                          if (c.id === activeSpec.id) {
                            const specs = [...(c.specs || [])];
                            specs[idx] = { ...specs[idx], value: val };
                            return { ...c, specs };
                          }
                          return c;
                        });
                        onUpdateField && onUpdateField("specCategories", cats);
                      }}
                      placeholder="Spec value..."
                    />
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => {
                          const cats = (data.specCategories || []).map((c) => {
                            if (c.id === activeSpec.id) {
                              const specs = (c.specs || []).filter((_, sIdx) => sIdx !== idx);
                              return { ...c, specs };
                            }
                            return c;
                          });
                          onUpdateField && onUpdateField("specCategories", cats);
                        }}
                        className="text-rose-400 hover:text-rose-200 opacity-60 hover:opacity-100 p-1 cursor-pointer transition-opacity"
                        title="Delete specification row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Original High-Definition Photo Gallery */}
        <section id="gallery" className="py-20 sm:py-28 bg-[#0A0D14] border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs uppercase tracking-luxury text-[#C8A870] font-medium block">
                  ORIGINAL SHIPYARD PORTFOLIO ({data.gallery?.length || 0} PHOTOGRAPHS)
                </span>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light text-white">
                  Luxury In Every Perspective
                </h2>
                <p 
                  className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed text-justify"
                  style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                >
                  Original photography showcasing exterior skyline cruises, handcrafted teak decks, master staterooms, and marble ensuite suites.
                </p>
              </div>

              {/* Gallery Filter Buttons & Add Photo Button */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      const newPhoto = {
                        id: `photo-${Date.now()}`,
                        src: "/images/yachts/g100/0.jpg",
                        title: "New Yacht Visual",
                        category: "Exterior",
                        description: `Official shipyard visual for ${data.fullName}.`,
                      };
                      const updated = [newPhoto, ...(data.gallery || [])];
                      onUpdateField && onUpdateField("gallery", updated);
                    }}
                    className="px-3.5 py-1.5 bg-[#C8A870] text-[#080B10] font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#DFBA73] transition-colors cursor-pointer mr-2 shadow-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                )}

                {(data.galleryCategories || ["All"]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryFilter(cat)}
                    className={`px-3 py-1.5 transition-all border ${
                      galleryFilter === cat
                        ? "bg-[#C8A870] text-[#080B10] font-semibold border-[#C8A870]"
                        : "bg-[#0E131C] text-[#828F9E] border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item, idx) => (
                <div
                  key={item.id || idx}
                  onClick={() => openLightbox(idx)}
                  className="group relative h-72 sm:h-80 bg-[#080B10] border border-white/10 overflow-hidden cursor-pointer hover:border-[#C8A870]/50 transition-all"
                >
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                  {/* Gallery In-Line Controls */}
                  {isEditable && (
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = (data.gallery || []).filter((g) => g.id !== item.id);
                          onUpdateField && onUpdateField("gallery", updated);
                        }}
                        className="px-2 py-1 bg-rose-950/90 text-rose-300 border border-rose-500/50 text-[10px] font-mono flex items-center gap-1 hover:bg-rose-900 transition-colors shadow-xl cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>

                      {onOpenMediaPicker && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMediaPicker(`gallery_${item.id}`, item.src);
                          }}
                          className="px-2.5 py-1 bg-[#080B10]/90 text-[#DFBA73] border border-[#C8A870]/60 text-[10px] font-mono flex items-center gap-1 hover:bg-[#C8A870] hover:text-[#080B10] transition-colors shadow-xl cursor-pointer"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Replace</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                    <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-mono block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base text-white font-medium group-hover:text-[#E5C392] transition-colors">
                      <InlineEditableText
                        as="span"
                        value={item.title}
                        isEditable={isEditable}
                        onChange={(val) => {
                          const updated = (data.gallery || []).map((g) =>
                            g.id === item.id ? { ...g, title: val } : g
                          );
                          onUpdateField && onUpdateField("gallery", updated);
                        }}
                        placeholder="Photo title..."
                      />
                    </h3>
                    <p className="text-xs text-[#9DAAB8] line-clamp-1 font-light">
                      <InlineEditableText
                        as="span"
                        value={item.description}
                        isEditable={isEditable}
                        onChange={(val) => {
                          const updated = (data.gallery || []).map((g) =>
                            g.id === item.id ? { ...g, description: val } : g
                          );
                          onUpdateField && onUpdateField("gallery", updated);
                        }}
                        placeholder="Photo caption..."
                      />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Private Viewing Call to Action Section */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0E131C] via-[#141C2A] to-[#0E131C] border border-[#C8A870]/30 p-8 sm:p-14 text-center space-y-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C8A870] font-semibold block">
                <InlineEditableText
                  as="span"
                  value={data.ctaBadge || "PRIVATE VIEWINGS & SEA TRIALS"}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("ctaBadge", val)}
                  placeholder="CTA Badge..."
                />
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-white font-light">
                <InlineEditableText
                  as="span"
                  value={data.ctaHeadline || `Schedule a Private Viewing of the ${data.modelNumber || "Vessel"}`}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("ctaHeadline", val)}
                  placeholder="CTA Headline..."
                />
              </h2>
              <p 
                className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed text-justify"
                style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
              >
                <InlineEditableText
                  as="span"
                  value={
                    data.ctaDescription ||
                    "We coordinate confidential dockside viewings and sea trials departing from Dubai Harbour Marina for qualified prospective owners and yacht management representatives."
                  }
                  isEditable={isEditable}
                  multiline={true}
                  onChange={(val) => onUpdateField && onUpdateField("ctaDescription", val)}
                  placeholder="CTA description text..."
                />
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full max-w-3xl mx-auto px-2">
              <InlineButtonEditor
                text={data.ctaPrimaryButtonText || "REQUEST PRIVATE VIEWING / CONSULTATION"}
                url={data.ctaPrimaryButtonUrl || "/contact"}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  onUpdateField && onUpdateField("ctaPrimaryButtonText", newText);
                  onUpdateField && onUpdateField("ctaPrimaryButtonUrl", newUrl);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 bg-[#C8A870] hover:bg-[#D4B67F] text-black font-semibold text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-luxury transition-all shadow-lg hover:shadow-[#C8A870]/20 cursor-pointer text-center"
              >
                <span>{data.ctaPrimaryButtonText || "REQUEST PRIVATE VIEWING / CONSULTATION"}</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </InlineButtonEditor>

              <InlineButtonEditor
                text={data.ctaWhatsappButtonText || "CHAT ON WHATSAPP"}
                url={
                  data.ctaWhatsappButtonUrl ||
                  `https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20request%20a%20private%20viewing%20for%20the%20${data.modelNumber || "yacht"}%20yacht.`
                }
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  onUpdateField && onUpdateField("ctaWhatsappButtonText", newText);
                  onUpdateField && onUpdateField("ctaWhatsappButtonUrl", newUrl);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-medium text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-luxury transition-all cursor-pointer text-center"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{data.ctaWhatsappButtonText || "CHAT ON WHATSAPP"}</span>
              </InlineButtonEditor>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-[#080B10]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col bg-[#0A0D14] border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-mono block">
                  {filteredGallery[lightboxIndex].category}
                </span>
                <h4 className="font-serif text-lg text-white font-medium">
                  {filteredGallery[lightboxIndex].title}
                </h4>
              </div>
              <button
                onClick={closeLightbox}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image & Navigation */}
            <div className="relative flex-1 min-h-[300px] max-h-[70vh] bg-[#05070A] flex items-center justify-center overflow-hidden">
              <img
                src={filteredGallery[lightboxIndex].src}
                alt={filteredGallery[lightboxIndex].title}
                className="w-full h-full object-contain"
              />

              <button
                onClick={prevLightbox}
                className="absolute left-3 p-3 bg-[#080B10]/80 hover:bg-[#080B10] text-white border border-white/10 transition-colors"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextLightbox}
                className="absolute right-3 p-3 bg-[#080B10]/80 hover:bg-[#080B10] text-white border border-white/10 transition-colors"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-[#828F9E]">
              <p>{filteredGallery[lightboxIndex].description}</p>
              <span className="font-mono text-[#C8A870]">
                {lightboxIndex + 1} / {filteredGallery.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Deck Plan Full Resolution Lightbox Modal */}
      {deckModalOpen && activeDeck && (
        <div
          className="fixed inset-0 z-50 bg-[#080B10]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setDeckModalOpen(false)}
        >
          <div
            className="relative max-w-7xl w-full max-h-[95vh] flex flex-col bg-[#0A0D14] border border-white/10 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#070A0F]">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-4 h-4 text-[#C8A870]" />
                <div>
                  <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-mono block">
                    {data.name || "ASMARATY YACHT"} • FULL RESOLUTION DECK SPECIFICATION
                  </span>
                  <h4 className="font-serif text-base sm:text-lg text-white font-medium">
                    {activeDeck.name} {activeDeck.subtitle ? `— ${activeDeck.subtitle}` : ""}
                  </h4>
                </div>
              </div>

              {/* Deck tabs inside modal if multiple decks */}
              {Array.isArray(data.deckPlans) && data.deckPlans.length > 1 && (
                <div className="hidden md:flex items-center gap-1.5 bg-[#0E131C] p-1 border border-white/10">
                  {data.deckPlans.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => setActiveDeckTab(deck.id)}
                      className={`px-3 py-1 text-xs tracking-wider uppercase transition-all cursor-pointer ${
                        activeDeckTab === deck.id
                          ? "bg-[#C8A870] text-[#080B10] font-bold"
                          : "text-[#8E9AA8] hover:text-white"
                      }`}
                    >
                      {deck.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Prominent Close button / Cross Symbol */}
              <button
                onClick={() => setDeckModalOpen(false)}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 hover:bg-[#C8A870] text-white hover:text-[#080B10] border border-white/20 hover:border-[#C8A870] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                aria-label="Close full resolution deck view"
              >
                <span>CLOSE</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-res Image Canvas */}
            <div className="relative flex-1 min-h-[350px] max-h-[78vh] bg-[#05070A] flex items-center justify-center p-4 overflow-auto">
              <img
                src={activeDeck.image3D}
                alt={activeDeck.caption || activeDeck.name}
                className="w-full h-auto max-h-[75vh] object-contain mx-auto"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-[#070A0F] flex flex-wrap items-center justify-between text-xs text-[#828F9E] gap-2">
              <p className="font-mono text-[11px] text-[#A2B0C0]">
                {activeDeck.caption || `${activeDeck.name} architectural GA drawing & 3D cutaway specification.`}
              </p>
              <span className="text-[10px] text-[#C8A870] font-mono tracking-wider">
                PRESS ESC OR CLICK CLOSE TO RETURN
              </span>
            </div>
          </div>
        </div>
      )}

      {showNavAndFooter && <PublicFooter />}
    </div>
  );
}

