"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Folder, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Anchor,
  Filter,
  CheckCircle2
} from "lucide-react";
import { getAllArticles, syncArticlesFromServer } from "@/lib/cmsStore";

const NEWS_CATEGORIES = [
  { id: "all", label: "ALL NEWS" },
  { id: "boat-shows", label: "BOAT SHOWS", category: "Boat Shows" },
  { id: "fleet-launches", label: "FLEET LAUNCHES", category: "Fleet Launches" },
  { id: "innovations", label: "INNOVATIONS", category: "Innovations" },
  { id: "shipyard-news", label: "SHIPYARD NEWS", category: "Shipyard News" },
];

function formatDateParts(dateStr) {
  if (!dateStr) return { day: "01", monthYear: "NOV 2026" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: "01", monthYear: "NOV 2026" };

  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = d.getFullYear();
  return { day, monthYear: `${month} ${year}` };
}

import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

export default function UniversalNewsListingView() {
  const [articles, setArticles] = useState(() => DEFAULT_ARTICLES.filter((a) => a.status === "published"));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    // Read local cache immediately upon mounting
    setArticles(getAllArticles(true));

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

  // Filter for the main News Articles Grid (Pure news articles + category + search)
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const isPublished = art.status === "published";
      const isNewsArticle = art.articleType !== "event" && !art.eventDetails?.isUpcoming;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        art.title?.toLowerCase().includes(query) ||
        art.excerpt?.toLowerCase().includes(query);

      const activeCat = NEWS_CATEGORIES.find((c) => c.id === selectedCategory);
      const matchesCategory = 
        !activeCat || 
        activeCat.id === "all" || 
        (art.category && art.category.toLowerCase() === activeCat.category?.toLowerCase());

      return isPublished && isNewsArticle && matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. HERO HEADER BANNER
          ------------------------------------------------------------- */}
      <section className="relative min-h-[50vh] lg:min-h-[56vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/news/qibs-2026-asmaraty-g77-bow-ceremony.jpg"
            alt="ASMARATY Maritime News and Dispatches"
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/75 to-[#080B10]/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-24 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#0E1A2D]/85 border border-[#C6A155]/40 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#DFBA73]">
              Maritime Dispatches & Official Reports
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-white uppercase tracking-[0.03em] leading-[1.18] mb-4 max-w-3xl">
            News & Updates
          </h1>

          <p className="text-xs sm:text-sm text-white/75 font-light max-w-2xl mx-auto leading-relaxed mb-6">
            Follow the latest shipyard announcements, inauguration milestones, naval architecture dispatches, and corporate news from ASMARATY Luxury Yachts.
          </p>

          <Link
            href="/events"
            className="w-full sm:w-auto max-w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0E1A2D]/90 border border-[#C6A155]/60 hover:border-[#DFBA73] text-[11px] sm:text-xs font-mono text-[#DFBA73] hover:text-white transition-all shadow-xl text-center"
          >
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-ping shrink-0" />
            <span>Explore Calendar of Events & Boat Shows →</span>
          </Link>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. SEARCH CONTROL STRIP (Category tabs removed per user design)
          ------------------------------------------------------------- */}
      <section className="sticky top-[73px] z-30 bg-[#080B10]/95 backdrop-blur-md border-b border-white/10 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A155]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#DFBA73]">
              All Press & Shipyard Dispatches
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80 flex-shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(6);
              }}
              className="w-full bg-[#0D1522] border border-white/15 focus:border-[#C6A155] text-xs text-white pl-9 pr-4 py-2.5 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. FIRST: ALL NEWS ARTICLES GRID (GULF CRAFT LUXURY LAYOUT)
          ------------------------------------------------------------- */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {/* Section Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-1">
                LATEST PRESS & EXHIBITIONS
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-white font-normal uppercase tracking-wide">
                {selectedCategory === "all"
                  ? "All News Articles"
                  : (NEWS_CATEGORIES.find((c) => c.id === selectedCategory)?.category || "Articles")}
              </h2>
            </div>
            <span className="text-xs font-mono text-white/50">
              Showing {filteredArticles.length} {filteredArticles.length === 1 ? "Article" : "Articles"}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            /* Empty State */
            <div className="py-24 text-center border border-white/10 bg-[#0D1522] p-8 max-w-xl mx-auto">
              <Anchor className="w-12 h-12 text-[#C6A155] mx-auto mb-4 opacity-50" />
              <h3 className="font-serif text-2xl text-white font-normal mb-2">
                No Articles Found
              </h3>
              <p className="text-sm text-white/60 mb-6">
                {selectedCategory !== "all"
                  ? `No published articles currently found in "${NEWS_CATEGORIES.find((c) => c.id === selectedCategory)?.category}".`
                  : "No published news matches your current search criteria."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="saxdor-btn-solid !h-[42px] px-6 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {displayedArticles.map((article) => {
                const { day, monthYear } = formatDateParts(article.publishedAt);
                return (
                  <article
                    key={article.id}
                    className="group bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
                  >
                    <Link href={`/news/${article.slug}`} className="block flex-1 flex flex-col">
                      {/* Top Header Strip: Category Pill (Folder icon like Gulf Craft reference) */}
                      <div className="px-6 py-3.5 border-b border-white/5 bg-[#0A101A] flex items-center justify-between text-xs text-white/70">
                        <div className="flex items-center gap-2">
                          <Folder className="w-3.5 h-3.5 text-[#C6A155]" />
                          <span className="font-mono uppercase tracking-[0.18em] text-[10px] text-[#DFBA73] font-semibold">
                            {article.category || "News"}
                          </span>
                        </div>
                        {article.eventDetails?.enabled && (
                          <span className="text-[9px] uppercase tracking-wider bg-[#C6A155]/20 text-[#DFBA73] px-2 py-0.5 font-semibold">
                            {article.eventDetails.badge || article.eventDetails.exhibition || "Boat Show"}
                          </span>
                        )}
                      </div>

                      {/* Image Frame with Date Badge Overlay */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#06090D]">
                        <img
                          src={article.featuredImage}
                          alt={article.featuredImageAlt || article.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-transparent to-black/30" />

                        {/* Date Typography Overlay (Matching reference screenshot) */}
                        <div className="absolute top-4 left-4 p-2.5 bg-[#080B10]/90 backdrop-blur-md border border-white/15 text-left pointer-events-none">
                          <span className="block font-serif text-2xl sm:text-3xl font-light text-white leading-none tracking-tight">
                            {day}
                          </span>
                          <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-[#DFBA73] font-semibold mt-1">
                            {monthYear}
                          </span>
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h2 className="font-serif text-base sm:text-lg font-normal text-white uppercase tracking-[0.02em] leading-snug line-clamp-2 group-hover:text-[#DFBA73] transition-colors mb-2">
                            {article.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed line-clamp-3">
                            {article.excerpt}
                          </p>
                        </div>

                        {/* Event Callout if applicable */}
                        {article.eventDetails?.enabled && article.eventDetails.venue && (
                          <div className="pt-2 text-[11px] font-mono text-[#C6A155] border-t border-white/5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A155]" />
                            <span className="truncate">{article.eventDetails.venue}</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Bottom Action Footer */}
                    <div className="px-6 sm:px-7 py-4 border-t border-white/5 bg-[#0A101A] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readingTime || "4 min read"}</span>
                      </div>

                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#DFBA73] group-hover:text-white group-hover:translate-x-1 transition-all"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-16">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="saxdor-btn-outline !h-[48px] px-10 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Load More Articles ({filteredArticles.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
