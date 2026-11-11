"use client";

import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Ship, 
  CheckCircle2, 
  Clock, 
  Phone,
  Mail,
  ChevronRight
} from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

function parseEventDateBadge(article) {
  if (article.dateBadge && article.dateBadge.day && article.dateBadge.monthYear) {
    return {
      day: article.dateBadge.day,
      monthYear: article.dateBadge.monthYear,
      locationShort: article.dateBadge.locationShort || "WATERFRONT",
    };
  }
  const dates = article.dates || article.eventDetails?.dates || "";
  
  if (dates.includes("25th – 29th November") || dates.includes("25-29") || dates.includes("25") || dates.includes("Dubai Harbour")) {
    return { day: "25 — 29", monthYear: "NOV 2026", locationShort: "DUBAI HARBOUR" };
  }
  if (dates.includes("19th – 22nd November") || dates.includes("19-22") || dates.includes("19")) {
    return { day: "19 — 22", monthYear: "NOV 2026", locationShort: "ADNEC MARINA" };
  }
  if (dates.includes("4th – 7th November") || dates.includes("4-7") || dates.includes("04")) {
    return { day: "04 — 07", monthYear: "NOV 2026", locationShort: "OLD DOHA PORT" };
  }
  if (dates.includes("February") || dates.includes("24th – 28th")) {
    return { day: "24 — 28", monthYear: "FEB 2027", locationShort: "DUBAI HARBOUR" };
  }

  // Fallback to publishedAt
  if (article.publishedAt) {
    const d = new Date(article.publishedAt);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const year = d.getFullYear();
      return { day, monthYear: `${month} ${year}`, locationShort: "INTERNATIONAL" };
    }
  }

  return { day: "19 — 22", monthYear: "NOV 2026", locationShort: "BOAT SHOW" };
}

export default function UpcomingEventSection({ events = [] }) {
  const displayEvents = (Array.isArray(events) && events.length > 0)
    ? events
    : DEFAULT_ARTICLES.filter((a) => a.articleType === "event" || a.eventDetails?.isUpcoming);

  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-[#06090D] border-t border-white/10 relative overflow-hidden" id="upcoming-events">
      {/* Ambient background lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#C6A155]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-[#0E1A2D]/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#0E1A2D] border border-[#C6A155]/40 text-[10px] font-mono uppercase tracking-[0.24em] text-[#DFBA73] font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-ping" />
              <span>CALENDAR OF EXHIBITIONS & BOAT SHOWS</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.02em]">
              Upcoming Events & Boat Shows
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/70 font-light max-w-lg leading-relaxed">
            Experience ASMARATY Luxury Yachts in person at premier international marine exhibitions. Connect with our client advisory desk to reserve private VIP walkthroughs, schedule sea trials, and meet our senior naval architects.
          </p>
        </div>

        {/* UPCOMING EVENTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16">
          {displayEvents.map((eventArticle) => {
            const event = eventArticle.eventDetails || eventArticle;
            const { day, monthYear, locationShort } = parseEventDateBadge(eventArticle);
            const exhibitionTitle = event.exhibition || eventArticle.title;
            const venue = event.venue || eventArticle.venue || "ADNEC Marina | Abu Dhabi, UAE";
            const dates = event.dates || eventArticle.dates || "19th – 22nd November 2026";
            const vessel = event.vesselShowcased || eventArticle.vessel || "ASMARATY Fleet";
            const badge = event.badge || eventArticle.badge || "UPCOMING BOAT SHOW";
            const rawHighlights = Array.isArray(event.highlights) && event.highlights.length > 0
              ? event.highlights
              : (Array.isArray(eventArticle.highlights) && eventArticle.highlights.length > 0 ? eventArticle.highlights : []);
            const highlights = rawHighlights.length > 0
              ? rawHighlights.slice(0, 4)
              : [
                  "Full fleet showcase at the region's premier maritime gathering",
                  "Dedicated private berths and dockside executive suite",
                  "VIP sea trials departing daily through coastal waters",
                  "Backed by our signature 25-Year Shipyard Hull Integrity Warranty"
                ];

            const whatsappMessage = encodeURIComponent(
              `Hello ASMARATY Yachts, I would like to reserve a VIP walkthrough for ${exhibitionTitle} at ${venue}.`
            );

            return (
              <article
                key={eventArticle.id}
                className="group bg-[#0D1522] border-2 border-white/10 hover:border-[#C6A155]/70 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl"
              >
                {/* Visual Media Header with Date Badge Overlay */}
                <div className="relative aspect-[16/9] overflow-hidden bg-[#06090D]">
                  <img
                    src={eventArticle.featuredImage || "/images/news/adibs-2026-abu-dhabi-boat-show.jpg"}
                    alt={eventArticle.featuredImageAlt || exhibitionTitle}
                    className="w-full h-full object-cover object-top filter brightness-[0.88] contrast-[1.1] group-hover:scale-105 transition-transform duration-700 ease-out"
                    style={{
                      objectPosition:
                        eventArticle.bannerPosition === "center"
                          ? "center center"
                          : eventArticle.bannerPosition === "bottom"
                          ? "center bottom"
                          : "center top",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-black/20 to-black/40" />

                  {/* Top Left Date Badge Overlay */}
                  <div className="absolute top-4 left-4 p-3 bg-[#080B10]/95 backdrop-blur-md border border-[#C6A155]/40 shadow-2xl text-left pointer-events-none">
                    <span className="block font-serif text-2xl sm:text-3xl font-light text-white leading-none tracking-tight">
                      {day}
                    </span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-[#DFBA73] font-bold mt-1">
                      {monthYear}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-white/60 font-mono mt-1 border-t border-white/10 pt-1">
                      {locationShort}
                    </span>
                  </div>

                  {/* Top Right Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-[#080B10]/90 backdrop-blur-md border border-[#C6A155]/50 text-[#DFBA73] text-[9px] font-mono uppercase tracking-[0.18em] font-semibold">
                      {badge}
                    </span>
                  </div>
                </div>

                {/* Event Card Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Venue & Dates Strip */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono text-white/70 border-b border-white/10 pb-3">
                      <span className="inline-flex items-center gap-1.5 text-[#DFBA73]">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{venue}</span>
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="inline-flex items-center gap-1.5 text-white/80">
                        <Calendar className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                        <span>{dates}</span>
                      </span>
                    </div>

                    {/* Exhibition Title */}
                    <h3 className="font-serif text-lg sm:text-xl font-normal text-white uppercase tracking-[0.02em] leading-snug">
                      {exhibitionTitle}
                    </h3>

                    {/* CORDIAL INVITATION CALLOUT */}
                    <div className="p-4 bg-[#0E1A2D]/90 border-l-4 border-[#C6A155] space-y-1 shadow-md">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-semibold block">
                        CORDIAL INVITATION
                      </span>
                      <p
                        className="text-xs sm:text-sm text-white/90 font-light italic leading-relaxed saxdor-desc-justified"
                        style={{ textAlign: "justify", textJustify: "inter-word", textAlignLast: "left" }}
                      >
                        ASMARATY Luxury Yachts and Al Shaali Marine cordially invite distinguished collectors, private owners, and marine enthusiasts to visit our waterfront showcase at {venue}.
                      </p>
                    </div>

                    {/* Excerpt / Overview */}
                    <p
                      className="text-xs sm:text-sm text-white/70 font-light leading-relaxed saxdor-desc-justified"
                      style={{ textAlign: "justify", textJustify: "inter-word", textAlignLast: "left" }}
                    >
                      {eventArticle.excerpt}
                    </p>

                    {/* Highlights Checklist */}
                    <div className="space-y-2 pt-2 bg-[#080B10]/50 p-4 border border-white/5">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                        Showcase Highlights
                      </span>
                      {highlights.map((hl, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-white/85 font-light">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONTACT & RESERVATION SECTION */}
                  <div className="pt-5 border-t border-white/10 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C6A155] font-semibold block">
                      RESERVE VIP ACCESS & SEA TRIAL
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/contact?event=${encodeURIComponent(exhibitionTitle)}`}
                        className="saxdor-btn-solid !h-[44px] !px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg rounded-none flex-1 min-w-[140px] max-w-full overflow-hidden justify-center"
                      >
                        <span className="truncate max-w-full">Book VIP Walkthrough</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </Link>

                      <a
                        href={`https://wa.me/971565268126?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="saxdor-btn-outline !h-[44px] !px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer rounded-none text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10 flex-1 min-w-[140px] max-w-full overflow-hidden justify-center"
                      >
                        <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                        <span className="truncate max-w-full">WhatsApp Desk</span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* DEDICATED VIP CONCIERGE & ADVISORY CONTACT BANNER */}
        <div className="p-8 sm:p-12 bg-[#0D1522] border-2 border-[#C6A155]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A155]/5 rounded-bl-full pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C6A155]/20 text-[#DFBA73] text-[10px] font-mono uppercase tracking-[0.24em] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>VIP BOAT SHOW CONCIERGE & ADVISORY DESK</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide">
              Request VIP Sea Trial or Private Berthing Walkthrough
            </h3>

            <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed">
              Connect directly with our luxury yacht advisory desk in the UAE. We arrange confidential one-on-one appointments with Al Shaali Marine naval architects, private boat show passes, and VIP sea trials departing from Abu Dhabi and Dubai.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
                <span className="truncate">Ajman & Dubai, UAE</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
                <a href="tel:+971565268126" className="hover:text-[#DFBA73] transition-colors truncate">
                  +971 56 526 8126
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
                <a href="mailto:info@asmaraty.com" className="hover:text-[#DFBA73] transition-colors truncate">
                  info@asmaraty.com
                </a>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full">
              <Link
                href="/contact"
                className="w-full sm:w-auto saxdor-btn-solid !h-auto min-h-[44px] sm:!h-[48px] !px-4 sm:!px-8 text-[11px] sm:text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-xl rounded-none text-center"
              >
                <span>Open Private Consultation Form</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>

              <a
                href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20request%20a%20VIP%20boat%20show%20pass%20and%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all rounded-none shadow-xl cursor-pointer text-center"
              >
                <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                <span>WhatsApp Advisory Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
