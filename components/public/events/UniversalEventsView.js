"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Ship, 
  ArrowRight, 
  Sparkles, 
  Camera, 
  Layers
} from "lucide-react";
import UpcomingEventSection from "@/components/public/news/UpcomingEventSection";
import { getAllEvents, syncEventsFromServer, getAllArticles, syncArticlesFromServer } from "@/lib/cmsStore";
import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

export default function UniversalEventsView() {
  const [events, setEvents] = useState(() => getAllEvents(true));
  const [articles, setArticles] = useState(() => DEFAULT_ARTICLES.filter((a) => a.status === "published"));

  useEffect(() => {
    // Read client storage immediately upon mount
    setEvents(getAllEvents(true));
    setArticles(getAllArticles(true));

    syncEventsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setEvents(synced.filter((e) => e.status === "published"));
      }
    });

    syncArticlesFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setArticles(synced.filter((a) => a.status === "published"));
      }
    });

    const handleUpdate = () => {
      setEvents(getAllEvents(true));
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
            Explore official photo showcases from our exhibitions across the Arabian Gulf, and view our upcoming boat show calendar below. Click any card to open the complete event detail page.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-2xl px-2">
            <a
              href="#showcase-grid"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#0E1A2D]/90 border border-[#C6A155]/60 hover:border-[#DFBA73] text-[11px] sm:text-xs font-mono text-[#DFBA73] hover:text-white transition-all shadow-xl text-center"
            >
              <span>View Exhibition Showcases ↓</span>
            </a>
            <a
              href="#upcoming-events"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#DFBA73] text-[11px] sm:text-xs font-mono text-white/80 hover:text-white transition-all shadow-xl text-center"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A155] animate-ping shrink-0" />
              <span>Upcoming Boat Shows (Abu Dhabi & Dubai) ↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. EXHIBITION SHOWCASES (3-COLUMN GRID ROW LAYOUT - DIRECT PAGE LINKS)
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
              Click card to open full event detail page & gallery
            </span>
          </div>

          {/* 3-GRID ROW: Cards sit in standard 3-column slots (1 col mobile, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const day = event.dateBadge?.day || "04 — 07";
              const monthYear = event.dateBadge?.monthYear || "NOV 2026";
              const locationShort = event.dateBadge?.locationShort || "WATERFRONT";
              const photoCount = Array.isArray(event.photos) ? event.photos.length : 0;
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/80 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
                >
                  {/* Card Media Header with Date Badge & Status */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#06090D]">
                    <img
                      src={event.featuredImage || "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"}
                      alt={event.featuredImageAlt || event.title}
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
                        {event.badge || "EXHIBITION"}
                      </span>
                    </div>

                    {/* Bottom Right Photo Count Tag */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono uppercase tracking-wider">
                        <Camera className="w-3 h-3 text-[#C6A155]" />
                        <span>{photoCount} Photos</span>
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
                      Open Event Page
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] group-hover:text-white group-hover:translate-x-1 transition-all">
                      <span>View Full Details & Photos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. UPCOMING BOAT SHOWS (ABU DHABI & DUBAI - SOLE LOCATION)
          ------------------------------------------------------------- */}
      <UpcomingEventSection events={upcomingEvents} />
    </div>
  );
}
