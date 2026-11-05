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
  MessageCircle
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";

// Icon mapping helper for narrative cards
const ICON_MAP = {
  Layers: Layers,
  Sparkles: Sparkles,
  Anchor: Anchor,
  Compass: Compass
};

export default function UniversalYachtDetailView({ data }) {
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
    data.deckPlans && data.deckPlans.length > 0 ? data.deckPlans[0].id : "flybridge"
  );

  // Specs Tab State
  const [activeSpecCategory, setActiveSpecCategory] = useState(
    data.specCategories && data.specCategories.length > 0 ? data.specCategories[0].id : "dimensions"
  );

  // Gallery Filter & Lightbox State
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
      <PublicNavbar />

      <main>
        {/* Top Breadcrumb & Status Ribbon */}
        <section className="bg-[#0A0D14] border-b border-white/5 py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#828F9E]">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <Link href="/yachts" className="hover:text-white transition-colors">Fleet</Link>
              <span>/</span>
              <span className="text-[#C8A870] font-medium">{data.fullName}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#C8A870]/10 border border-[#C8A870]/30 text-[#E5C392] text-[11px] uppercase tracking-wider font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870] animate-pulse"></span>
                {data.badge || "Official Fleet Model"}
              </span>

              {data.brochureUrl && (
                <a
                  href={data.brochureUrl}
                  download
                  className="hidden sm:inline-flex items-center gap-1.5 text-[#C8A870] hover:text-white transition-colors text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{data.brochureLabel || "Brochure (PDF)"}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section with Auto-Changing Crossfade Background (No Manual Buttons) */}
        <section className="relative min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-end overflow-hidden">
          {/* Background Images with Silky Crossfade Transition */}
          <div className="absolute inset-0 bg-[#080B10]">
            {(data.heroImages || []).map((img, idx) => (
              <img
                key={img.src}
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
              {/* Official Metallic Winged Insignia Emblem */}
              {data.insigniaSrc && (
                <div>
                  <img
                    src={data.insigniaSrc}
                    alt={`${data.fullName} Insignia Emblem`}
                    className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
              )}

              {/* Title & Tagline */}
              <div>
                <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-white leading-[1.05] tracking-tight">
                  ASMARATY{" "}
                  <span className="font-sans font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#E5C392] to-[#C8A870]">
                    {data.modelNumber}
                  </span>
                </h1>
                <p className="mt-3 text-lg sm:text-2xl text-[#E0E6EF] font-light max-w-2xl leading-relaxed">
                  {data.tagline}
                </p>
              </div>

              {/* Key Highlights Subtitle */}
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light max-w-xl leading-relaxed">
                {data.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/contact"
                  className="saxdor-btn-solid !h-[52px] px-8 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
                >
                  <span>Book Private Viewing</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                {data.brochureUrl ? (
                  <a
                    href={data.brochureUrl}
                    download
                    className="saxdor-btn-outline !h-[52px] px-6 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2 bg-[#080B10]/60 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 text-[#C8A870]" />
                    <span>Download Brochure (PDF)</span>
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="saxdor-btn-outline !h-[52px] px-6 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2 bg-[#080B10]/60 backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4 text-[#C8A870]" />
                    <span>Request Full Brochure</span>
                  </Link>
                )}

                <a
                  href="#deck-plans"
                  className="text-xs uppercase tracking-luxury text-[#E5C392] hover:text-white px-4 py-3 transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore 3D Deck Plans</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Auto-Slide Indicator Dots (Clean & Minimal) */}
            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(data.heroImages || []).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveHeroIdx(idx)}
                    aria-label={img.label}
                    title={img.label}
                    className={`h-1.5 transition-all duration-500 rounded-full ${
                      activeHeroIdx === idx
                        ? "w-8 bg-[#C8A870]"
                        : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
                <span className="ml-3 text-[11px] text-[#828F9E] font-mono">
                  0{activeHeroIdx + 1} / 0{data.heroImages?.length || 1}
                </span>
              </div>

              <div className="text-right text-[11px] text-[#828F9E] tracking-wider uppercase hidden sm:block">
                {data.summaryLine}
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
                className={`space-y-1 ${idx > 0 ? "sm:border-l sm:border-white/5" : ""}`}
              >
                <span className="text-[10px] sm:text-[11px] uppercase tracking-luxury text-[#828F9E] block">
                  {metric.label}
                </span>
                <p className="font-serif text-xl sm:text-2xl text-white font-medium">{metric.main}</p>
                <span className="text-[11px] text-[#C8A870] font-mono block">{metric.sub}</span>
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
                  {data.narrative?.eyebrow || "AT A GLANCE • ARCHITECTURAL NARRATIVE"}
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-white leading-tight">
                  {data.narrative?.headline || "Crafted for Unrivaled Luxury on the Water"}
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#9DAAB8] font-light leading-relaxed">
                {(data.narrative?.paragraphs || []).map((p, idx) => (
                  <p key={idx}>{p}</p>
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
                    <h3 className="font-serif text-lg text-white font-medium">{card.title}</h3>
                    <p className="text-xs text-[#828F9E] leading-relaxed font-light">
                      {card.description}
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
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
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
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-light mt-0.5">
                      {activeDeck.name} — <span className="text-[#E5C392]">{activeDeck.subtitle}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={activeDeck.image3D}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="saxdor-btn-outline !h-[42px] px-4 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#C8A870]" />
                      <span>View Full Resolution</span>
                    </a>
                  </div>
                </div>

                {/* Deck Image Preview */}
                <div className="relative bg-[#080B10] p-4 sm:p-8 border border-white/5 overflow-hidden group">
                  <img
                    src={activeDeck.image3D}
                    alt={activeDeck.caption}
                    className="w-full h-auto max-h-[550px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-xs text-[#828F9E] tracking-wider font-mono">
                      {activeDeck.caption}
                    </p>
                  </div>
                </div>

                {/* Key Highlights for this Deck */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-luxury text-[#C8A870] font-semibold">
                    Key Deck Appointments & Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(activeDeck.features || []).map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#0A0D14] border border-white/5 flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-none bg-[#C8A870]/10 border border-[#C8A870]/30 flex items-center justify-center text-[#C8A870] flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-xs text-[#C9D2DF] font-light leading-relaxed">
                          {feat}
                        </span>
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
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
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
              <div className="p-4 sm:p-6 bg-[#0A0D14] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-[#C8A870]" />
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-light">
                    {activeSpec.title}
                  </h3>
                </div>
                <span className="text-xs text-[#828F9E] font-mono uppercase tracking-wider">
                  Certified Shipyard Matrix
                </span>
              </div>

              {(activeSpec.specs || []).map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-5 text-xs hover:bg-[#121824] transition-colors gap-2"
                >
                  <div className="sm:col-span-5 text-[#8E9EAF] uppercase tracking-wider font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A870]/40"></span>
                    <span>{item.label}</span>
                  </div>
                  <div className="sm:col-span-7 text-white font-medium sm:text-right font-mono text-sm">
                    {item.value}
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
                <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
                  Luxury In Every Perspective
                </h2>
                <p className="text-xs sm:text-sm text-[#9DAAB8] font-light">
                  Original photography showcasing exterior skyline cruises, handcrafted teak decks, master staterooms, and marble ensuite suites.
                </p>
              </div>

              {/* Gallery Filter Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
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
                  key={item.id}
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

                  <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                    <span className="text-[10px] uppercase tracking-luxury text-[#C8A870] font-mono block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-base text-white font-medium group-hover:text-[#E5C392] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#9DAAB8] line-clamp-1 font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Private Viewing Call to Action Section (Redirects directly to /contact) */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0E131C] via-[#141C2A] to-[#0E131C] border border-[#C8A870]/30 p-8 sm:p-14 text-center space-y-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C8A870] font-semibold block">
                PRIVATE VIEWINGS & SEA TRIALS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white font-light">
                Schedule a Private Viewing of the {data.modelNumber}
              </h2>
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                We coordinate confidential dockside viewings and sea trials departing from Dubai Harbour Marina for qualified prospective owners and yacht management representatives.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C8A870] hover:bg-[#D4B67F] text-black font-semibold text-xs uppercase tracking-luxury transition-all shadow-lg hover:shadow-[#C8A870]/20"
              >
                <span>REQUEST PRIVATE VIEWING / CONSULTATION</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20request%20a%20private%20viewing%20for%20the%20${data.modelNumber}%20yacht.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-medium text-xs uppercase tracking-luxury transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>CHAT ON WHATSAPP</span>
              </a>
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

      <PublicFooter />
    </div>
  );
}

