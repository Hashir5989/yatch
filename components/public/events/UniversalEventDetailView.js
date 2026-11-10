"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Ship, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Phone, 
  Mail, 
  Share2, 
  Award,
  ShieldCheck
} from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";

export default function UniversalEventDetailView({ event }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null); // Lightbox index
  const [copiedShare, setCopiedShare] = useState(false);

  // Keyboard navigation for photo lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === "Escape") {
        setActivePhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        navigatePhoto(-1);
      } else if (e.key === "ArrowRight") {
        navigatePhoto(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, event]);

  if (!event) return null;

  const photos = event.photos || [];
  const currentPhoto = activePhotoIndex !== null ? photos[activePhotoIndex] : null;

  const navigatePhoto = (direction) => {
    if (activePhotoIndex === null || photos.length === 0) return;
    const total = photos.length;
    const next = (activePhotoIndex + direction + total) % total;
    setActivePhotoIndex(next);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const paragraphs = (event.description || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. TOP NAVIGATION / BREADCRUMB STRIP
          ------------------------------------------------------------- */}
      <div className="bg-[#0A101A] border-b border-white/10 py-3.5 px-6 sm:px-12 lg:px-16 sticky top-[73px] z-30 backdrop-blur-md bg-[#0A101A]/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#DFBA73] font-mono uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Events</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-[#C6A155] uppercase tracking-wider hidden sm:inline">
              {event.badge}
            </span>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 transition-all text-xs font-mono cursor-pointer"
              title="Share event link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>{copiedShare ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          2. IMMERSIVE EVENT HERO BANNER
          ------------------------------------------------------------- */}
      <section className="relative min-h-[50vh] lg:min-h-[58vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src={event.featuredImage}
            alt={event.featuredImageAlt || event.title}
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-12 py-20 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#0E1A2D]/90 border border-[#C6A155]/50 backdrop-blur-md mb-6 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#DFBA73] font-semibold">
              {event.presentedBy} • {event.dates}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal text-white uppercase tracking-[0.03em] leading-[1.2] mb-4">
            {event.title}
          </h1>

          <p className="text-sm sm:text-base text-[#DFBA73] font-light max-w-3xl mx-auto mb-8 leading-relaxed">
            {event.subtitle}
          </p>

          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs font-mono text-white/80 bg-[#08101C]/90 px-6 py-3 border border-white/15 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 text-[#DFBA73]">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{event.venue}</span>
            </div>
            <span className="text-white/25 hidden sm:inline">•</span>
            <div className="flex items-center gap-2 text-white/90">
              <Calendar className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
              <span>{event.dates}</span>
            </div>
            <span className="text-white/25 hidden sm:inline">•</span>
            <div className="flex items-center gap-2 text-white/80">
              <Ship className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
              <span>{event.vessel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. MAIN CONTENT: EVENT OVERVIEW & HIGHLIGHTS
          ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Full Editorial Narrative */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
                  OFFICIAL EXHIBITION DISPATCH
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide">
                  The Regional Debut & Showcase
                </h2>
              </div>

              {/* Story Paragraphs */}
              <div className="text-sm sm:text-base text-white/85 font-light leading-relaxed space-y-5">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* 25-Year Warranty Highlight Callout */}
              {event.warrantyCallout && (
                <div className="p-6 sm:p-8 bg-[#0E1A2D]/90 border-l-4 border-[#C6A155] shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#DFBA73] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#C6A155]" />
                    <span>LANDMARK 25-YEAR SHIPYARD HULL INTEGRITY WARRANTY</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 font-light leading-relaxed">
                    {event.warrantyCallout}
                  </p>
                </div>
              )}

              {/* Press Dispatch Link */}
              {event.pressDispatchSlug && (
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-white/50">
                    Published in ASMARATY Maritime Press
                  </span>
                  <Link
                    href={`/news/${event.pressDispatchSlug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] hover:text-white group transition-colors"
                  >
                    <span>Read Full Editorial Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column: Highlights & Yacht Profile Card */}
            <div className="lg:col-span-4 space-y-8">
              {/* Highlights Card */}
              <div className="bg-[#0D1522] border-2 border-white/10 p-6 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-[#C6A155] font-semibold border-b border-white/10 pb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Showcase Highlights</span>
                </div>
                <div className="space-y-3">
                  {event.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/90 font-light">
                      <CheckCircle2 className="w-4 h-4 text-[#C6A155] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Vessel Card */}
              <div className="bg-[#0D1522] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C6A155] font-semibold block">
                  FEATURED SUPERYACHT MODEL
                </span>
                <div className="aspect-[16/10] overflow-hidden bg-black/50 border border-white/10">
                  <img
                    src="/images/g77-luxury-yacht.jpg"
                    alt="ASMARATY G77 Luxury Yacht"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-white uppercase tracking-wider">
                    ASMARATY G77
                  </h4>
                  <p className="text-xs text-white/70 font-light mt-1">
                    77 FT Two-Deck Luxury Motor Yacht with 25-Year Shipyard Warranty.
                  </p>
                </div>
                <Link
                  href="/yachts/g77"
                  className="saxdor-btn-solid !h-[42px] !w-full text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Explore G77 Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* VIP Contact Desk Box */}
              <div className="bg-[#0A101A] border border-white/10 p-6 space-y-3 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-semibold block">
                  Direct Shipyard Inquiries
                </span>
                <p className="text-white/70 font-light leading-relaxed">
                  Interested in commission build slots or private walkthroughs? Contact our senior advisory desk directly.
                </p>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20the%20G77%20and%20QIBS%20showcase."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saxdor-btn-outline !h-[40px] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp Advisory</span>
                  </a>
                  <Link
                    href="/contact"
                    className="saxdor-btn-solid !h-[40px] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Submit Enquiry</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. THE OFFICIAL PHOTO SHOWCASE GALLERY (ALL PHOTOS SHOWCASED)
          ------------------------------------------------------------- */}
      <section className="py-20 bg-[#06090D] border-t border-b border-white/10" id="photo-gallery">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 space-y-12">
          {/* Gallery Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold mb-2">
                <Camera className="w-4 h-4" />
                <span>OFFICIAL PHOTOGRAPHIC RECORD ({photos.length} PHOTOGRAPHS)</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide">
                The Showcase Gallery
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-md leading-relaxed">
              Click any photograph to open the high-resolution fullscreen lightbox view with detailed captions and zoom controls.
            </p>
          </div>

          {/* All Photos Gallery Grid (Pure Visual Grid, No Description Below) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                onClick={() => setActivePhotoIndex(idx)}
                className="group relative aspect-[16/10] bg-[#06090D] border border-white/10 hover:border-[#C6A155] overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl"
              >
                <img
                  src={photo.url}
                  alt={photo.alt || event.title}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* Top Tag Badge */}
                {photo.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-[#08101C]/90 backdrop-blur-md border border-white/15 text-[#DFBA73] text-[9px] font-mono uppercase tracking-[0.18em] font-semibold">
                      {photo.tag}
                    </span>
                  </div>
                )}

                {/* Hover Enlarge Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E1A2D]/95 border border-[#C6A155] text-xs font-mono uppercase tracking-wider text-[#DFBA73] shadow-2xl">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Full Resolution</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. BOTTOM NAVIGATION & UPCOMING EVENTS CALLOUT
          ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 bg-[#080B10]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-12">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-1">
              CONTINUE EXPLORING
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-white font-normal uppercase tracking-wide">
              Upcoming Boat Shows & Exhibitions
            </h3>
            <p className="text-xs text-white/60 font-light mt-1">
              Discover our upcoming calendar including Abu Dhabi and Dubai International Boat Shows.
            </p>
          </div>

          <Link
            href="/events#upcoming-events"
            className="saxdor-btn-solid !h-[46px] !px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-xl flex-shrink-0"
          >
            <span>View Upcoming Calendar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. FULLSCREEN HIGH-RESOLUTION PHOTO LIGHTBOX
          ------------------------------------------------------------- */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#0A101A] border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Top Bar */}
            <div className="px-6 py-4 bg-[#080B10] border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 bg-[#C6A155]/20 text-[#DFBA73] text-[9px] font-mono uppercase tracking-widest font-semibold">
                  {currentPhoto.tag}
                </span>
                <span className="font-serif text-sm text-white uppercase tracking-wider hidden sm:inline">
                  {currentPhoto.title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono text-white/50">
                  {activePhotoIndex + 1} / {photos.length}
                </span>
                <button
                  onClick={() => setActivePhotoIndex(null)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                  aria-label="Close photo preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Frame */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] sm:min-h-[480px]">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt}
                className="max-h-[70vh] w-auto max-w-full object-contain select-none"
              />

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto(-1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-[#080B10]/80 hover:bg-[#C6A155] border border-white/20 hover:border-[#C6A155] text-white hover:text-black transition-all cursor-pointer shadow-xl"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePhoto(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-[#080B10]/80 hover:bg-[#C6A155] border border-white/20 hover:border-[#C6A155] text-white hover:text-black transition-all cursor-pointer shadow-xl"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Bottom Caption */}
            <div className="p-5 sm:p-6 bg-[#080B10] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1 max-w-2xl">
                <h4 className="font-serif text-sm text-white uppercase tracking-wider">
                  {currentPhoto.title}
                </h4>
                <p className="text-white/70 font-light leading-relaxed">
                  {currentPhoto.caption}
                </p>
              </div>

              <div className="text-[11px] font-mono text-[#DFBA73] whitespace-nowrap">
                {event.venue}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

