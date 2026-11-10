"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Ship, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Phone,
  Mail,
  ExternalLink,
  Layers,
  Eye
} from "lucide-react";
import UpcomingEventSection from "@/components/public/news/UpcomingEventSection";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import { getAllArticles, syncArticlesFromServer } from "@/lib/cmsStore";
import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

// Curated Past Exhibition Showcases (Abu Dhabi & Dubai are upcoming and exclusively featured in the Upcoming section)
const PAST_EVENT_SHOWCASES = [
  {
    id: "qibs-2026",
    title: "Qatar International Boat Show 2026",
    subtitle: "Regional Debut of ASMARATY G77 Luxury Yacht",
    category: "Boat Show",
    badge: "REGIONAL DEBUT",
    dateBadge: { day: "04 — 07", monthYear: "NOV 2026", locationShort: "OLD DOHA PORT" },
    dates: "4th – 7th November 2026",
    venue: "Stand D06 | Old Doha Port, Doha, Qatar",
    vessel: "ASMARATY G77 Luxury Yacht (77 FT)",
    presentedBy: "AL SHAALI MARINE – UAE",
    featuredImage: "/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg",
    featuredImageAlt: "ASMARATY G77 official inauguration on the teak foredeck at Old Doha Port",
    excerpt:
      "Al Shaali Marine and ASMARATY officially unveiled the newly launched G77 luxury yacht at Stand D06 at Old Doha Port, introducing our landmark 25-Year Shipyard Warranty.",
    description:
      "Measuring 77 feet in length overall with an imposing tri-deck architectural profile, the newly launched ASMARATY G77 represents the dawn of a new era in regional yacht design. Handcrafted entirely at Al Shaali Marine's waterfront facility in Ajman, the vessel synthesizes oceanic performance with peerless interior serenity.\n\nThe dockside showcase welcomed royal dignitaries, private yacht owners, and maritime aficionados. Centerpiece announcements included ASMARATY's industry-first 25-Year Shipyard Hull Integrity Warranty, daily private technical walkthroughs with master naval architects, and an illuminated evening fireworks celebration over the Doha skyline.",
    highlights: [
      "Official regional debut of the newly launched ASMARATY G77 luxury yacht",
      "Commanding dockside presentation at Stand D06 within Old Doha Port marina basin",
      "Announcement of the landmark, industry-leading 25-Year Shipyard Hull Integrity Warranty",
      "Secured priority build allocations and custom interior commissioning slots",
      "Private technical walkthroughs conducted with senior naval architects and composite engineers",
      "Evening fireworks celebration viewed from the G77 teak foredeck"
    ],
    pressDispatchSlug: "asmaraty-g77-qatar-international-boat-show-2026",
    photos: [
      {
        id: "qibs-p1",
        url: "/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg",
        alt: "Official inauguration and ribbon ceremony on the teak foredeck of ASMARATY G77",
        title: "Official Inauguration & Ribbon Ceremony",
        caption: "Hostesses in tailored ASMARATY embroidered abayas on the teak foredeck of the G77 during the official inauguration ceremony at Old Doha Port.",
        tag: "INAUGURATION"
      },
      {
        id: "qibs-p2",
        url: "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
        alt: "ASMARATY G77 waterfront night view with blue underwater LEDs and fireworks at Old Doha Port",
        title: "Evening Waterfront Celebration & Fireworks",
        caption: "The illuminated ASMARATY G77 at Stand D06, with sapphire underwater LEDs casting vibrant reflections as monumental fireworks light up the Doha skyline.",
        tag: "EVENING SHOWCASE"
      },
      {
        id: "qibs-p3",
        url: "/images/news/qibs-2026-asmaraty-g77-emblem-detail.jpg",
        alt: "Chrome ASMARATY G77 emblem on flybridge wing with branded attire",
        title: "Emblem Detail & Flybridge Architecture",
        caption: "Precision marine-grade chrome ASMARATY G77 emblem mounted on the aerodynamic flybridge wing, reflecting master composite finish and Emirati shipyard heritage.",
        tag: "CRAFTSMANSHIP"
      }
    ]
  }
];

export default function UniversalEventsView() {
  const [articles, setArticles] = useState(() => getAllArticles(true));
  const [selectedCardEvent, setSelectedCardEvent] = useState(null); // The event opened in the Detail Modal
  const [activePhotoModal, setActivePhotoModal] = useState(null); // Fullscreen single photo lightbox

  useEffect(() => {
    syncArticlesFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setArticles(synced.filter((a) => a.status === "published"));
      }
    });

    const handleUpdate = () => {
      setArticles(getAllArticles(true));
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Upcoming events extracted for UpcomingEventSection below (Abu Dhabi & Dubai)
  const upcomingEvents = useMemo(() => {
    const list = articles.filter(
      (a) => a.status === "published" && (a.articleType === "event" || a.eventDetails?.isUpcoming)
    );
    if (list.length > 0) return list;
    return DEFAULT_ARTICLES.filter((a) => a.articleType === "event" || a.eventDetails?.isUpcoming);
  }, [articles]);

  // Close modals on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activePhotoModal) {
          setActivePhotoModal(null);
        } else if (selectedCardEvent) {
          setSelectedCardEvent(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoModal, selectedCardEvent]);

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. HERO HEADER BANNER
          ------------------------------------------------------------- */}
      <section className="relative min-h-[46vh] lg:min-h-[52vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"
            alt="ASMARATY International Events and Exhibitions"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/75 to-[#080B10]/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-20 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#0E1A2D]/85 border border-[#C6A155]/40 backdrop-blur-md mb-5">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#DFBA73]">
              International Exhibitions & Experiences
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-white uppercase tracking-[0.03em] leading-[1.18] mb-4 max-w-3xl">
            Events & Boat Shows
          </h1>

          <p className="text-xs sm:text-sm text-white/75 font-light max-w-2xl mx-auto leading-relaxed mb-6">
            Explore official photo showcases from our exhibitions across the Arabian Gulf, and view our upcoming boat show calendar below.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#showcase-grid"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#0E1A2D]/90 border border-[#C6A155]/60 hover:border-[#DFBA73] text-xs font-mono text-[#DFBA73] hover:text-white transition-all shadow-xl"
            >
              <span>View Exhibition Showcases ↓</span>
            </a>
            <a
              href="#upcoming-events"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#DFBA73] text-xs font-mono text-white/80 hover:text-white transition-all shadow-xl"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A155] animate-ping" />
              <span>Upcoming Boat Shows (Abu Dhabi & Dubai) ↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. EXHIBITION SHOWCASES (3-COLUMN GRID ROW LAYOUT)
          ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24" id="showcase-grid">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-1">
                EXHIBITION RETROSPECTIVE & PHOTO ARCHIVES
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-white font-normal uppercase tracking-wide">
                Exhibition Showcases
              </h2>
            </div>
            <span className="text-xs font-mono text-white/50">
              Click card to view all event photos & details
            </span>
          </div>

          {/* 3-GRID ROW: Cards sit in standard 3-column slots (1 col mobile, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PAST_EVENT_SHOWCASES.map((event) => {
              const { day, monthYear, locationShort } = event.dateBadge;
              return (
                <article
                  key={event.id}
                  onClick={() => setSelectedCardEvent(event)}
                  className="group bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/80 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)] cursor-pointer"
                >
                  {/* Card Media Header with Date Badge & Status */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#06090D]">
                    <img
                      src={event.featuredImage}
                      alt={event.featuredImageAlt}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-transparent to-black/30" />

                    {/* Date Typography Overlay */}
                    <div className="absolute top-3 left-3 p-2.5 bg-[#080B10]/95 backdrop-blur-md border border-white/15 text-left pointer-events-none shadow-xl">
                      <span className="block font-serif text-xl sm:text-2xl font-light text-white leading-none tracking-tight">
                        {day}
                      </span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#DFBA73] font-semibold mt-1">
                        {monthYear}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-white/60 font-mono mt-0.5 border-t border-white/10 pt-0.5">
                        {locationShort}
                      </span>
                    </div>

                    {/* Top Right Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-[#080B10]/90 backdrop-blur-md border border-[#C6A155]/50 text-[#DFBA73] text-[9px] font-mono uppercase tracking-[0.16em] font-semibold">
                        {event.badge}
                      </span>
                    </div>

                    {/* Bottom Right Photo Count Tag */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono uppercase tracking-wider">
                        <Camera className="w-3 h-3 text-[#C6A155]" />
                        <span>{event.photos.length} Photos</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Venue Strip */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#DFBA73] truncate">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>

                      {/* Event Title */}
                      <h3 className="font-serif text-base sm:text-lg font-normal text-white uppercase tracking-[0.02em] leading-snug line-clamp-2 group-hover:text-[#DFBA73] transition-colors">
                        {event.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed line-clamp-3">
                        {event.excerpt}
                      </p>
                    </div>

                    {/* Vessel Callout */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-mono text-white/60">
                      <Ship className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                      <span className="truncate">{event.vessel}</span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-4 border-t border-white/5 bg-[#0A101A] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-white/50">
                      Click to open details
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>View Gallery & Info</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. UPCOMING BOAT SHOWS (ABU DHABI & DUBAI - SOLE LOCATION)
          ------------------------------------------------------------- */}
      <UpcomingEventSection events={upcomingEvents} />

      {/* -------------------------------------------------------------
          4. INTERACTIVE EVENT DETAIL & PHOTO GALLERY MODAL
          ------------------------------------------------------------- */}
      {selectedCardEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 lg:p-10 overflow-y-auto"
          onClick={() => setSelectedCardEvent(null)}
        >
          {/* Modal Container */}
          <div
            className="relative max-w-4xl w-full bg-[#0D1522] border-2 border-[#C6A155]/60 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[92vh] flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Sticky Top Header */}
            <div className="p-6 sm:p-7 bg-[#0A101A] border-b border-white/10 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 bg-[#C6A155]/20 text-[#DFBA73] text-[9px] font-mono uppercase tracking-widest font-semibold">
                    {selectedCardEvent.badge}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                    {selectedCardEvent.presentedBy}
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-2xl font-normal text-white uppercase tracking-[0.02em]">
                  {selectedCardEvent.title}
                </h3>
                <p className="text-xs text-[#DFBA73] font-light">
                  {selectedCardEvent.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedCardEvent(null)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close event details"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Event Metadata Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/80 bg-[#08101C] p-4 border border-white/10">
                <div className="flex items-center gap-1.5 text-[#DFBA73]">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{selectedCardEvent.venue}</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Calendar className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                  <span>{selectedCardEvent.dates}</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-1.5 text-white/70">
                  <Ship className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                  <span>{selectedCardEvent.vessel}</span>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold">
                  Event Overview & Dispatch
                </h4>
                <div className="text-white/85 font-light leading-relaxed space-y-3 whitespace-pre-line text-xs sm:text-sm">
                  {selectedCardEvent.description}
                </div>
              </div>

              {/* Event Highlights */}
              <div className="bg-[#08101C]/80 p-5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold border-b border-white/10 pb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Key Showcase Highlights</span>
                </div>
                <div className="space-y-2">
                  {selectedCardEvent.highlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/90 font-light">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ALL PHOTOS SHOWCASE GALLERY GRID */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#C6A155]" />
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-white font-semibold">
                      Event Photo Gallery ({selectedCardEvent.photos.length} Photographs)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    Click any photo to enlarge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedCardEvent.photos.map((photo, pIdx) => (
                    <div
                      key={photo.id}
                      onClick={() => setActivePhotoModal({ event: selectedCardEvent, photoIndex: pIdx })}
                      className="group/p relative bg-[#06090D] border border-white/10 hover:border-[#C6A155] overflow-hidden cursor-pointer transition-all duration-300 shadow-md"
                    >
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img
                          src={photo.url}
                          alt={photo.alt}
                          className="w-full h-full object-cover object-center group-hover/p:scale-108 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover/p:opacity-30 transition-opacity" />

                        {/* Top Tag Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 bg-black/80 border border-white/15 text-[#DFBA73] text-[8px] font-mono uppercase tracking-wider font-semibold">
                            {photo.tag}
                          </span>
                        </div>

                        {/* Enlarge Hover Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/p:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                          <span className="p-2 bg-[#0E1A2D] border border-[#C6A155] text-[#DFBA73]">
                            <Maximize2 className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Photo Caption Strip */}
                      <div className="p-3 bg-[#0A101A] border-t border-white/5 space-y-0.5">
                        <h5 className="text-[11px] font-serif text-white uppercase tracking-wider line-clamp-1 group-hover/p:text-[#DFBA73] transition-colors">
                          {photo.title}
                        </h5>
                        <p className="text-[10px] text-white/60 font-light leading-snug line-clamp-2">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 sm:p-6 bg-[#0A101A] border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {selectedCardEvent.pressDispatchSlug && (
                  <Link
                    href={`/news/${selectedCardEvent.pressDispatchSlug}`}
                    className="saxdor-btn-solid !h-[42px] !px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Read Press Dispatch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                <a
                  href={`https://wa.me/971565268126?text=${encodeURIComponent(
                    `Hello ASMARATY Yachts, I am inquiring regarding ${selectedCardEvent.title}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="saxdor-btn-outline !h-[42px] !px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Advisory</span>
                </a>
              </div>

              <button
                onClick={() => setSelectedCardEvent(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-mono uppercase tracking-wider border border-white/10 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          5. FULLSCREEN PHOTO LIGHTBOX MODAL (FROM INSIDE DETAIL VIEW)
          ------------------------------------------------------------- */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setActivePhotoModal(null)}
        >
          {(() => {
            const ev = activePhotoModal.event;
            const photo = ev.photos[activePhotoModal.photoIndex];
            const total = ev.photos.length;

            const navigatePhoto = (direction) => {
              const nextIndex = (activePhotoModal.photoIndex + direction + total) % total;
              setActivePhotoModal({ event: ev, photoIndex: nextIndex });
            };

            return (
              <div
                className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#0A101A] border border-white/20 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Lightbox Top Bar */}
                <div className="px-6 py-4 bg-[#080B10] border-b border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-[#C6A155]/20 text-[#DFBA73] text-[9px] font-mono uppercase tracking-widest font-semibold">
                      {photo.tag}
                    </span>
                    <span className="font-serif text-sm text-white uppercase tracking-wider hidden sm:inline">
                      {photo.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-mono text-white/50">
                      {activePhotoModal.photoIndex + 1} / {total}
                    </span>
                    <button
                      onClick={() => setActivePhotoModal(null)}
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
                    src={photo.url}
                    alt={photo.alt}
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
                      {photo.title}
                    </h4>
                    <p className="text-white/70 font-light leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>

                  <div className="text-[11px] font-mono text-[#DFBA73] whitespace-nowrap">
                    {ev.venue}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
