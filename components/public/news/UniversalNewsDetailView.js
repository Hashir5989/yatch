"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Folder, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  X,
  ZoomIn,
  Ship,
  Quote
} from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import { getArticleBySlug, getAllArticles } from "@/lib/cmsStore";
import { DEFAULT_ARTICLES } from "@/lib/data/defaultArticles";

function formatDate(dateStr) {
  if (!dateStr) return "November 2026";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export default function UniversalNewsDetailView({ initialArticle, slug }) {
  const [article, setArticle] = useState(initialArticle);
  const [allArticles, setAllArticles] = useState(() => DEFAULT_ARTICLES.filter((a) => a.status === "published"));
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    // Read local cache immediately upon mounting
    setAllArticles(getAllArticles(true));

    const handleUpdate = () => {
      const fresh = getArticleBySlug(slug, false);
      if (fresh) setArticle(fresh);
      setAllArticles(getAllArticles(true));
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  if (!article) return null;

  // Determine related articles
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.status === "published")
    .slice(0, 3);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const blocks = (article.content || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const heroHeadlineText = article.heroHeadline || article.title;

  const isUpcoming = Boolean(article.eventDetails?.isUpcoming || article.articleType === "event");

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. IMMERSIVE HERO BANNER (MATCHING REFERENCE SCREENSHOT)
          ------------------------------------------------------------- */}
      <section className="relative min-h-[55vh] lg:min-h-[68vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Full-width night marina background */}
        <div className="absolute inset-0 z-0">
          <img
            src={article.featuredImage}
            alt={article.featuredImageAlt || article.title}
            className="w-full h-full object-cover object-top filter brightness-[0.45] contrast-[1.12]"
            style={{
              objectPosition:
                article.bannerPosition === "center"
                  ? "center center"
                  : article.bannerPosition === "bottom"
                  ? "center bottom"
                  : "center top",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-black/35 to-black/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-24 sm:py-32 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-[#0E1A2D]/90 border border-[#C6A155]/50 backdrop-blur-md mb-6 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#DFBA73] font-semibold">
              {article.category || "Boat Shows"} • {formatDate(article.publishedAt)}
            </span>
          </div>

          {/* Grand Centered Headline (Over the hero image, like Gulf Craft QIBS reference) */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-white uppercase tracking-[0.03em] leading-[1.18] max-w-4xl drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] mb-6">
            {heroHeadlineText}
          </h1>

          {/* Reading Time, Stand Location & Date */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/75 bg-[#080B10]/60 backdrop-blur-sm px-5 py-2 border border-white/10">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>{article.readingTime || "6 min read"}</span>
            </span>
            {article.eventDetails?.venue && (
              <>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1.5 text-[#DFBA73]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{article.eventDetails.venue}</span>
                </span>
              </>
            )}
            {article.eventDetails?.dates && (
              <>
                <span className="text-white/30">•</span>
                <span className="inline-flex items-center gap-1.5 text-white/80">
                  <Calendar className="w-3.5 h-3.5 text-[#C6A155]" />
                  <span>{article.eventDetails.dates}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. BREADCRUMBS & SHARE STRIP
          ------------------------------------------------------------- */}
      <div className="border-b border-white/10 bg-[#06090D] py-3.5 sticky top-[73px] z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-mono text-white/50 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <Link href="/news" className="hover:text-white transition-colors">
              News & Updates
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/30" />
            <span className="text-[#DFBA73] truncate max-w-[200px] sm:max-w-xs">
              {article.category || "Article"}
            </span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>{copiedShare ? "Copied!" : "Share"}</span>
            </button>

            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/70 hover:text-white transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C6A155]" />
              <span className="hidden sm:inline">Back to News</span>
            </Link>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          3. EDITORIAL ARTICLE BODY
          ------------------------------------------------------------- */}
      <article className="max-w-4xl mx-auto px-6 sm:px-12 py-16 sm:py-20 space-y-12">
        {/* Lead Excerpt Paragraph */}
        {article.excerpt && (
          <div className="p-5 sm:p-6 bg-[#0D1522] border-l-4 border-[#C6A155] text-xs sm:text-sm md:text-[15px] text-white/90 font-light leading-relaxed">
            {article.excerpt}
          </div>
        )}

        {/* FULL MULTI-SECTION EDITORIAL NARRATIVE */}
        <div className="space-y-6">
          {blocks.map((block, idx) => {
            // Check for Subheading
            if (block.startsWith("### ")) {
              return (
                <div key={idx} className="pt-6 pb-2">
                  <h2 className="font-serif text-lg sm:text-xl text-white font-normal uppercase tracking-wide pb-2 border-b border-[#C6A155]/30">
                    {block.replace(/^###\s*/, "")}
                  </h2>
                </div>
              );
            }

            // Check for Blockquote
            if (block.startsWith("> ")) {
              return (
                <blockquote
                  key={idx}
                  className="my-6 p-5 sm:p-6 bg-[#0E1A2D]/80 border-l-4 border-[#C6A155] text-white/90 font-serif text-sm sm:text-base italic leading-relaxed shadow-xl relative"
                >
                  <Quote className="w-8 h-8 text-[#C6A155]/20 absolute top-4 right-4 pointer-events-none" />
                  <p>{block.replace(/^>\s*/, "").replace(/^"|"$/g, "")}</p>
                </blockquote>
              );
            }

            // Standard Editorial Paragraph
            return (
              <p
                key={idx}
                className={`text-xs sm:text-sm text-white/80 font-light leading-relaxed text-justify ${
                  idx === 0
                    ? "first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-serif first-letter:text-[#C6A155] first-letter:float-left first-letter:mr-3 first-letter:leading-none"
                    : ""
                }`}
                style={{ textJustify: "inter-word" }}
              >
                {block}
              </p>
            );
          })}
        </div>

        {/* PHOTO GALLERY SECTION */}
        {Array.isArray(article.gallery) && article.gallery.length > 0 && (
          <div className="pt-10 border-t border-white/10 space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-1">
                VISUAL DISPATCHES
              </span>
              <h3 className="font-serif text-lg sm:text-xl text-white font-normal uppercase tracking-wide">
                Exhibition & Event Highlights
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {article.gallery.map((img, idx) => (
                <div
                  key={img.id || idx}
                  onClick={() => setLightboxImage(img.url)}
                  className="group relative aspect-[16/10] bg-[#06090D] border border-white/10 hover:border-[#C6A155] overflow-hidden cursor-pointer shadow-2xl transition-all duration-300"
                >
                  <img
                    src={img.url}
                    alt={img.alt || article.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="p-3 bg-[#0E1A2D]/95 border border-[#C6A155] text-[#DFBA73] shadow-xl">
                      <ZoomIn className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Return to News Strip */}
        <div className="pt-12 pb-6 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#DFBA73] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All News & Updates</span>
          </Link>
          <span className="text-[11px] font-mono text-white/40">
            ASMARATY Luxury Yachts • UAE
          </span>
        </div>
      </article>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
