"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";
import { DEFAULT_PAGES } from "@/lib/data/defaultPages";

export default function AboutPage() {
  const [page, setPage] = useState(() => {
    return DEFAULT_PAGES.find((p) => p.slug === "/about") || null;
  });

  useEffect(() => {
    // Read local cache after hydration
    const local = getPageBySlug("/about");
    if (local) {
      queueMicrotask(() => setPage(local));
    }

    // Dynamic sync from server database API so admin changes reflect immediately
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/about");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/about");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Extract CMS sections with defaults matching the reference design
  const heroSection = page?.sections?.find((s) => s.id === "about-hero" || s.type === "hero_banner") || {};
  const storySection = page?.sections?.find((s) => s.id === "about-story" || s.type === "image_text") || {};
  const statsSection = page?.sections?.find((s) => s.id === "about-stats" || s.type === "statistics") || {};
  const valuesSection = page?.sections?.find((s) => s.id === "about-values" || s.type === "rich_text") || {};
  const ctaSection = page?.sections?.find((s) => s.id === "about-cta" || s.type === "call_to_action") || {};

  // 1. Hero Content
  const heroEyebrow = heroSection.eyebrow || "ABOUT US";
  const heroHeading = heroSection.heading || "A Legacy of Excellence on the Water";
  const heroSubheading = heroSection.subheading || "At ASMARATY, we believe in more than just luxury — we believe in creating unforgettable journeys.";
  const heroImage = heroSection.imageUrl || "/images/g100-burj-al-arab.jpg";

  // 2. Story Content
  const storyEyebrow = storySection.eyebrow || "OUR STORY";
  const storyHeading = storySection.heading || "Crafting Exceptional Yachting Experiences";
  const storyDescription = storySection.description || "Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels that set new standards in luxury and performance.";
  const storyButtonText = storySection.buttonText || "Discover Our Journey";
  const storyButtonUrl = storySection.buttonUrl || "/yachts";
  const storyImage = storySection.imageUrl || "/images/about/deck-crop.jpg";

  // 3. Stats Content
  const statsItems = Array.isArray(statsSection.items) && statsSection.items.length > 0
    ? statsSection.items
    : [
        { number: "1979", label: "Heritage" },
        { number: "UAE", label: "Home Waters" },
        { number: "Excellence", label: "Our Standard" }
      ];

  // 4. Values Content
  const valuesEyebrow = valuesSection.eyebrow || "OUR VALUES";
  const valuesHeading = valuesSection.heading || "Built on Trust. Driven by Passion.";
  const valuesSubheading = valuesSection.content || valuesSection.description || "We are committed to delivering unparalleled quality, innovation, and personalized experiences for every client.";

  const valuesCards = [
    {
      title: "Craftsmanship",
      desc: "Meticulously crafted yachts for the ultimate experience.",
      icon: (
        <svg className="w-8 h-8 text-[#C6A155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M11 3 8 9l4 12 4-12-3-6" />
          <path d="M2 9h20" />
        </svg>
      )
    },
    {
      title: "Trust & Integrity",
      desc: "A relationship built on transparency and reliability.",
      icon: (
        <svg className="w-8 h-8 text-[#C6A155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    },
    {
      title: "Innovation",
      desc: "Constantly evolving for a better tomorrow.",
      icon: (
        <svg className="w-8 h-8 text-[#C6A155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12c1.5-2 3.5-3 5.5-3s4 1 5.5 3 3.5 3 5.5 3 4-1 5.5-3" />
          <path d="M2 7c1.5-2 3.5-3 5.5-3s4 1 5.5 3 3.5 3 5.5 3 4-1 5.5-3" />
          <path d="M2 17c1.5-2 3.5-3 5.5-3s4 1 5.5 3 3.5 3 5.5 3 4-1 5.5-3" />
        </svg>
      )
    },
    {
      title: "Personalised Experiences",
      desc: "Tailored journeys, designed around you.",
      icon: (
        <svg className="w-8 h-8 text-[#C6A155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="4" />
          <path d="M10 15H8a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />
          <circle cx="17" cy="11" r="3" />
          <path d="M22 21a5 5 0 0 0-5-5h-1" />
        </svg>
      )
    }
  ];

  // 5. CTA Content
  const ctaHeading = ctaSection.heading || "Your Journey Begins Here";
  const ctaDescription = ctaSection.description || "Explore our exclusive yacht collection and experience the ASMARATY difference.";
  const ctaButtonText = ctaSection.primaryButtonText || "Explore Our Collection";
  const ctaButtonUrl = ctaSection.primaryButtonUrl || "/yachts";
  const ctaImage = ctaSection.imageUrl || "/images/yachts/g100-sunset.jpg";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] selection:bg-[#C6A155] selection:text-black">
      {/* Retain public header navigation */}
      <PublicNavbar currentPageId={page?.id || "page-about"} />

      <main className="flex-1">
        {/* =========================================================
            1. HERO SECTION: A Legacy of Excellence on the Water
           ========================================================= */}
        <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden bg-[#070D18]">
          {/* Background Yacht Cruising Image */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={heroImage}
              alt="ASMARATY Luxury Yacht"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.82] contrast-[1.08]"
            />
            {/* Left-to-right dark contrast gradient for crisp typography */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/70 to-[#070D18]/30 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/80 via-transparent to-black/30" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-28 sm:py-36">
            <div className="max-w-2xl">
              {/* Eyebrow with gold horizontal line */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-semibold">
                  {heroEyebrow}
                </span>
                <span className="w-16 h-[1.5px] bg-[#C6A155]/70" />
              </div>

              {/* Serif Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] text-white font-normal leading-[1.14] tracking-tight">
                {heroHeading}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-[#C8D1DC] font-light leading-relaxed mt-6 mb-8 max-w-xl">
                {heroSubheading}
              </p>

              {/* Gold underline accent */}
              <div className="w-20 h-[2px] bg-[#C6A155]" />
            </div>
          </div>
        </section>

        {/* =========================================================
            2. OUR STORY: Crafting Exceptional Yachting Experiences
           ========================================================= */}
        <section className="bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                    {storyEyebrow}
                  </span>
                  <span className="w-14 h-[1.5px] bg-[#A68037]/60" />
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal leading-[1.18] tracking-tight">
                  {storyHeading}
                </h2>

                <p className="text-[#556375] text-base sm:text-lg font-light leading-relaxed">
                  {storyDescription}
                </p>

                <div className="pt-2">
                  <Link
                    href={storyButtonUrl}
                    className="inline-flex items-center gap-3 bg-[#0B1523] hover:bg-[#162338] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-xl group"
                  >
                    <span>{storyButtonText}</span>
                    <ArrowRight className="w-4 h-4 text-[#C6A155] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Rounded Deck Image */}
              <div className="lg:col-span-6 relative">
                {/* Soft warm backdrop shape */}
                <div className="absolute -inset-6 bg-[#EFE9DD] rounded-full blur-2xl opacity-70 pointer-events-none" />

                <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-[#E8E2D5] bg-[#EFECE5]">
                  <img
                    src={storyImage}
                    alt={storyHeading}
                    className="w-full h-[320px] sm:h-[400px] lg:h-[440px] object-cover object-center hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. KEY METRICS BAR: 1979 | UAE | Excellence
           ========================================================= */}
        <section className="bg-[#EFECE5] border-y border-[#E2DDD2] py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6D0C3] text-center">
              {statsItems.map((stat, idx) => (
                <div key={idx} className="py-6 md:py-2 md:px-8">
                  <div className="font-serif text-4xl sm:text-5xl font-normal text-[#0A121E] tracking-tight">
                    {stat.number || stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#667484] font-light mt-2 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            4. OUR VALUES: Built on Trust. Driven by Passion.
           ========================================================= */}
        <section className="bg-[#FAF8F5] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            {/* Centered Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-4 mb-4">
                <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                  {valuesEyebrow}
                </span>
                <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal tracking-tight">
                {valuesHeading}
              </h2>

              <p className="text-[#556375] text-sm sm:text-base font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                {valuesSubheading}
              </p>
            </div>

            {/* 4 Value Cards with Thin Dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD3]">
              {valuesCards.map((card, idx) => (
                <div key={idx} className="p-6 sm:p-8 flex flex-col items-center text-center group">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {card.icon}
                  </div>
                  <h3 className="font-serif text-xl sm:text-[22px] font-normal text-[#0A121E] mb-2 tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#697787] font-light leading-relaxed max-w-xs">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            5. BOTTOM CTA: Your Journey Begins Here
           ========================================================= */}
        <section className="relative min-h-[50vh] sm:min-h-[55vh] flex items-center overflow-hidden bg-[#070D18]">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={ctaImage}
              alt="ASMARATY Sunset Cruise"
              className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.08]"
            />
            {/* Left dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-20 sm:py-24">
            <div className="max-w-xl space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                {ctaHeading}
              </h2>

              <p className="text-[#C8D1DC] text-base sm:text-lg font-light leading-relaxed pb-4">
                {ctaDescription}
              </p>

              <div>
                <Link
                  href={ctaButtonUrl}
                  className="inline-flex items-center gap-3 bg-[#E5B869] hover:bg-[#D9AA58] text-[#0A111E] text-sm font-semibold px-8 py-4 rounded-full transition-all shadow-xl hover:shadow-2xl group"
                >
                  <span>{ctaButtonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Retain public footer navigation */}
      <PublicFooter />
    </div>
  );
}
