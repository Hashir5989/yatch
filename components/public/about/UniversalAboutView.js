"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Gem,
  Waves,
  Users,
  Sparkles,
  Anchor,
  Award,
  Image as ImageIcon
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";
import { formatButtonHref } from "@/lib/data/buttonSchema";

const ICON_MAP = {
  Gem: Gem,
  ShieldCheck: ShieldCheck,
  Waves: Waves,
  Users: Users,
  Sparkles: Sparkles,
  Anchor: Anchor,
  Award: Award,
};

export default function UniversalAboutView({
  pageData,
  isEditable = false,
  onUpdateSectionField = null,
  onOpenMediaPicker = null,
  showNavAndFooter = true,
}) {
  // Extract individual sections from CMS with fallback defaults
  const heroSection = pageData?.sections?.find((s) => s.id === "about-hero" || s.type === "hero_banner") || {};
  const storySection = pageData?.sections?.find((s) => s.id === "about-story" || s.type === "image_text") || {};
  const statsSection = pageData?.sections?.find((s) => s.id === "about-stats" || s.type === "statistics") || {};
  const valuesSection = pageData?.sections?.find((s) => s.id === "about-values" || s.type === "values_pillars") || {};
  const ctaSection = pageData?.sections?.find((s) => s.id === "about-cta" || s.type === "call_to_action") || {};

  const updateField = (sectionId, fieldName, value) => {
    if (onUpdateSectionField) {
      onUpdateSectionField(sectionId, fieldName, value);
    }
  };

  // Helper for updating individual stat item
  const updateStatItem = (index, key, val) => {
    const currentItems = Array.isArray(statsSection?.items) && statsSection.items.length > 0
      ? statsSection.items
      : [
        { number: "1979", label: "Heritage" },
        { number: "UAE", label: "Home Waters" },
        { number: "Excellence", label: "Our Standard" },
      ];
    const next = [...currentItems];
    next[index] = { ...next[index], [key]: val };
    updateField("about-stats", "items", next);
  };

  // Helper for updating individual pillar card
  const updatePillarCard = (index, key, val) => {
    const currentPillars = Array.isArray(valuesSection?.pillars) && valuesSection.pillars.length > 0
      ? valuesSection.pillars
      : [
        { id: "val-1", title: "Craftsmanship", desc: "Meticulously crafted yachts for the ultimate experience.", icon: "Gem" },
        { id: "val-2", title: "Trust & Integrity", desc: "A relationship built on transparency and reliability.", icon: "ShieldCheck" },
        { id: "val-3", title: "Innovation", desc: "Constantly evolving for a better tomorrow.", icon: "Waves" },
        { id: "val-4", title: "Personalised Experiences", desc: "Tailored journeys, designed around you.", icon: "Users" }
      ];
    const next = [...currentPillars];
    next[index] = { ...next[index], [key]: val };
    updateField("about-values", "pillars", next);
  };

  const statItems = (Array.isArray(statsSection?.items) && statsSection.items.length > 0)
    ? statsSection.items
    : [
      { number: "1979", label: "Heritage" },
      { number: "UAE", label: "Home Waters" },
      { number: "Excellence", label: "Our Standard" },
    ];

  const pillarCards = (Array.isArray(valuesSection?.pillars) && valuesSection.pillars.length > 0)
    ? valuesSection.pillars
    : [
      { id: "val-1", title: "Craftsmanship", desc: "Meticulously crafted yachts for the ultimate experience.", icon: "Gem" },
      { id: "val-2", title: "Trust & Integrity", desc: "A relationship built on transparency and reliability.", icon: "ShieldCheck" },
      { id: "val-3", title: "Innovation", desc: "Constantly evolving for a better tomorrow.", icon: "Waves" },
      { id: "val-4", title: "Personalised Experiences", desc: "Tailored journeys, designed around you.", icon: "Users" }
    ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0A121E] selection:bg-[#C6A155] selection:text-black font-sans">
      {/* Public Navigation */}
      {showNavAndFooter && (
        <PublicNavbar currentPageId={pageData?.id || "page-about"} />
      )}

      <main className="flex-1">
        {/* =========================================================
            SECTION 1: HERO — A Legacy of Excellence on the Water
           ========================================================= */}
        {heroSection?.visible !== false && (
          <section
            id={heroSection?.id || "about-hero"}
            className="relative min-h-[78vh] sm:min-h-[84vh] flex items-center overflow-hidden bg-[#070D18] group/about-hero"
          >
            {/* Background ASMARATY Flagship Yacht */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={heroSection?.imageUrl || "/images/about/asmaraty-about-hero-fireworks.jpg"}
                alt={heroSection?.imageAlt || "ASMARATY Fireworks Celebration Experience"}
                className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.04]"
              />
              {/* Ambient luxury gradients for typographic clarity */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/90 via-[#070D18]/55 to-transparent sm:via-[#070D18]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/60 via-transparent to-black/30" />
            </div>

            {/* Replace Hero Photo Trigger in CMS Mode */}
            {isEditable && onOpenMediaPicker && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMediaPicker(
                    heroSection?.id || "about-hero",
                    "imageUrl",
                    heroSection?.imageUrl || "/images/about/asmaraty-about-hero-fireworks.jpg"
                  );
                }}
                className="absolute top-6 right-6 z-30 px-3.5 py-2 rounded-full bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-medium flex items-center gap-2 shadow-xl transition-all pointer-events-auto"
                title="Replace Hero Photo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Hero Photo</span>
              </button>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-28 sm:py-36">
              <div className="max-w-2xl">
                {/* Eyebrow with gold horizontal accent line */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-semibold">
                    <InlineEditableText
                      as="span"
                      value={heroSection?.eyebrow || "ABOUT US"}
                      isEditable={isEditable}
                      onChange={(val) => updateField(heroSection?.id || "about-hero", "eyebrow", val)}
                      placeholder="ABOUT US"
                    />
                  </span>
                  <span className="w-16 h-[1.5px] bg-[#C6A155]/80" />
                </div>

                {/* Semantic Luxury H1 */}
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] text-white font-normal leading-[1.12] tracking-tight">
                  <InlineEditableText
                    as="span"
                    value={heroSection?.heading || "A Legacy of\nExcellence on the Water"}
                    isEditable={isEditable}
                    onChange={(val) => updateField(heroSection?.id || "about-hero", "heading", val)}
                    placeholder="A Legacy of Excellence on the Water"
                    multiline={true}
                  />
                </h1>

                {/* Lead Narrative */}
                <p className="text-base sm:text-lg text-[#D0D9E4] font-light leading-relaxed mt-6 mb-8 max-w-xl">
                  <InlineEditableText
                    as="span"
                    value={
                      heroSection?.subheading ||
                      "At ASMARATY, we believe in more than just luxury — we believe in creating unforgettable journeys."
                    }
                    isEditable={isEditable}
                    onChange={(val) => updateField(heroSection?.id || "about-hero", "subheading", val)}
                    placeholder="Enter hero lead description..."
                    multiline={true}
                  />
                </p>

                {/* Gold decorative bar */}
                <div className="w-20 h-[2px] bg-[#C6A155]" />
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 2: OUR STORY — Crafting Exceptional Yachting Experiences
           ========================================================= */}
        {storySection?.visible !== false && (
          <section id={storySection?.id || "about-story"} data-section="story" className="bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                {/* Left Column: Narrative & Action */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                      <InlineEditableText
                        as="span"
                        value={storySection?.eyebrow || "OUR STORY"}
                        isEditable={isEditable}
                        onChange={(val) => updateField(storySection?.id || "about-story", "eyebrow", val)}
                        placeholder="OUR STORY"
                      />
                    </span>
                    <span className="w-14 h-[1.5px] bg-[#A68037]/60" />
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal leading-[1.18] tracking-tight">
                    <InlineEditableText
                      as="span"
                      value={storySection?.heading || "Crafting Exceptional\nYachting Experiences"}
                      isEditable={isEditable}
                      onChange={(val) => updateField(storySection?.id || "about-story", "heading", val)}
                      placeholder="Crafting Exceptional Yachting Experiences"
                      multiline={true}
                    />
                  </h2>

                  <p className="text-[#556375] text-base sm:text-[17px] font-light leading-relaxed">
                    <InlineEditableText
                      as="span"
                      value={
                        storySection?.description ||
                        "Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels that set new standards in luxury and performance."
                      }
                      isEditable={isEditable}
                      onChange={(val) => updateField(storySection?.id || "about-story", "description", val)}
                      placeholder="Enter brand story description..."
                      multiline={true}
                    />
                  </p>

                  {(storySection?.primaryButton?.visible !== false && storySection?.buttonVisible !== false) && (
                    <div className="pt-2">
                      {isEditable ? (
                        <InlineButtonEditor
                          config={storySection?.primaryButton || {
                            label: storySection?.buttonText || "Discover Our Journey",
                            url: storySection?.buttonUrl || "/contact",
                            type: "internal",
                            target: "_self",
                            visible: true,
                            style: "solid-dark"
                          }}
                          text={storySection?.primaryButton?.label || storySection?.buttonText || "Discover Our Journey"}
                          url={storySection?.primaryButton?.url || storySection?.buttonUrl || "/contact"}
                          isEditable={true}
                          onSave={(newText, newUrl, updatedConfig) => {
                            updateField(storySection?.id || "about-story", "primaryButton", {
                              ...updatedConfig,
                              label: newText,
                              url: newUrl
                            });
                            updateField(storySection?.id || "about-story", "buttonText", newText);
                            updateField(storySection?.id || "about-story", "buttonUrl", newUrl);
                          }}
                          className="inline-flex items-center gap-3 bg-[#0B1523] hover:bg-[#162338] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all shadow-md group"
                        />
                      ) : (
                        <Link
                          href={formatButtonHref(
                            storySection?.primaryButton?.url || storySection?.buttonUrl || "/contact",
                            storySection?.primaryButton?.type || "internal"
                          )}
                          target={storySection?.primaryButton?.target || "_self"}
                          rel={storySection?.primaryButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                          className="inline-flex items-center gap-3 bg-[#0B1523] hover:bg-[#162338] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-xl group"
                        >
                          <span>
                            {storySection?.primaryButton?.label || storySection?.buttonText || "Discover Our Journey"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-[#C6A155] group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Meaningful Fleet & Craftsmanship Visual */}
                <div className="lg:col-span-6 relative group">
                  {/* Soft warm champagne backdrop shape */}
                  <div className="absolute -inset-6 bg-[#EFE9DD] rounded-full blur-2xl opacity-70 pointer-events-none" />

                  <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-[#E8E2D5] bg-[#EFECE5]">
                    <img
                      src={storySection?.imageUrl || "/images/asmaraty-four-yachts-journey.jpg"}
                      alt={storySection?.imageAlt || "ASMARATY Fleet Formation Cruising Arabian Gulf"}
                      className="w-full h-[320px] sm:h-[400px] lg:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Change Photo Trigger in CMS Mode */}
                    {isEditable && onOpenMediaPicker && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMediaPicker(
                            storySection?.id || "about-story",
                            "imageUrl",
                            storySection?.imageUrl || "/images/asmaraty-four-yachts-journey.jpg"
                          );
                        }}
                        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-[#0B1523]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/50 hover:bg-[#C6A155] hover:text-[#0B1523] text-xs font-medium flex items-center gap-2 shadow-lg transition-all"
                        title="Replace Story Photo"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Change Photo</span>
                      </button>
                    )}

                    {/* Floating Heritage Badge */}
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-[#0B1523]/85 backdrop-blur-md border border-[#C6A155]/30 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#FAF8F5] font-semibold">
                        <InlineEditableText
                          as="span"
                          value={storySection?.badgeText || "UAE Naval Heritage • Since 1979"}
                          isEditable={isEditable}
                          onChange={(val) => updateField(storySection?.id || "about-story", "badgeText", val)}
                          placeholder="UAE Naval Heritage • Since 1979"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 3: KEY METRICS BAR: 1979 | UAE | Excellence
           ========================================================= */}
        {statsSection?.visible !== false && (
          <section id={statsSection?.id || "about-stats"} className="bg-[#EFECE5] border-y border-[#E2DDD2] py-12 sm:py-16">
            <div className="max-w-5xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6D0C3] text-center">
                {statItems.map((stat, idx) => (
                  <div key={idx} className="py-6 md:py-2 md:px-8">
                    <div className="font-serif text-4xl sm:text-5xl font-normal text-[#0A121E] tracking-tight">
                      <InlineEditableText
                        as="span"
                        value={stat.number}
                        isEditable={isEditable}
                        onChange={(val) => updateStatItem(idx, "number", val)}
                        placeholder="1979"
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-[#667484] font-light mt-2 tracking-wide uppercase">
                      <InlineEditableText
                        as="span"
                        value={stat.label}
                        isEditable={isEditable}
                        onChange={(val) => updateStatItem(idx, "label", val)}
                        placeholder="Heritage"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 4: OUR VALUES — Built on Trust. Driven by Passion.
           ========================================================= */}
        {valuesSection?.visible !== false && (
          <section id={valuesSection?.id || "about-values"} data-section="values" className="bg-[#FAF8F5] py-20 lg:py-28">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
              {/* Centered Section Header with Flanking Lines */}
              <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-4 mb-4">
                  <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                    <InlineEditableText
                      as="span"
                      value={valuesSection?.eyebrow || "OUR VALUES"}
                      isEditable={isEditable}
                      onChange={(val) => updateField(valuesSection?.id || "about-values", "eyebrow", val)}
                      placeholder="OUR VALUES"
                    />
                  </span>
                  <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal tracking-tight">
                  <InlineEditableText
                    as="span"
                    value={valuesSection?.heading || "Built on Trust. Driven by Passion."}
                    isEditable={isEditable}
                    onChange={(val) => updateField(valuesSection?.id || "about-values", "heading", val)}
                    placeholder="Built on Trust. Driven by Passion."
                  />
                </h2>

                <p className="text-[#556375] text-sm sm:text-base font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                  <InlineEditableText
                    as="span"
                    value={
                      valuesSection?.description ||
                      "We are committed to delivering unparalleled quality, innovation, and personalized experiences for every client."
                    }
                    isEditable={isEditable}
                    onChange={(val) => updateField(valuesSection?.id || "about-values", "description", val)}
                    placeholder="Enter values description..."
                    multiline={true}
                  />
                </p>
              </div>

              {/* 4 Values Pillars with Subtle Thin Vertical Dividers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD3]">
                {pillarCards
                  .filter((p) => p.visible !== false || isEditable)
                  .map((card, idx) => {
                    const IconComponent =
                      (typeof card.icon === "string" ? ICON_MAP[card.icon] : card.icon) || Gem;
                    return (
                      <div
                        key={card.id || idx}
                        className={`p-6 sm:p-8 flex flex-col items-center text-center group ${card.visible === false ? "opacity-50" : ""
                          }`}
                      >
                        <div className="w-14 h-14 rounded-full bg-[#EFECE5] flex items-center justify-center mb-5 text-[#C6A155] group-hover:bg-[#0B1523] group-hover:text-[#C6A155] transition-all duration-300 shadow-sm">
                          <IconComponent className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <h3 className="font-serif text-xl sm:text-[22px] font-normal text-[#0A121E] mb-2 tracking-tight">
                          <InlineEditableText
                            as="span"
                            value={card.title}
                            isEditable={isEditable}
                            onChange={(val) => updatePillarCard(idx, "title", val)}
                            placeholder="Pillar Title"
                          />
                        </h3>
                        <p className="text-xs sm:text-sm text-[#697787] font-light leading-relaxed max-w-xs">
                          <InlineEditableText
                            as="span"
                            value={card.desc}
                            isEditable={isEditable}
                            onChange={(val) => updatePillarCard(idx, "desc", val)}
                            placeholder="Pillar Description"
                            multiline={true}
                          />
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 5: FINAL CTA — Your Journey Begins Here
           ========================================================= */}
        {ctaSection?.visible !== false && (
          <section id={ctaSection?.id || "about-cta"} className="relative min-h-[68vh] sm:min-h-[72vh] lg:min-h-[76vh] flex items-center overflow-hidden bg-[#070D18] group/about-cta">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={ctaSection?.imageUrl || "/images/a77-journey-bg.jpg"}
                alt={ctaSection?.imageAlt || "ASMARATY Superyacht Cruising Open Ocean"}
                className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.08]"
              />
              {/* Left dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/80 via-transparent to-transparent" />
            </div>

            {/* Change Photo Trigger in CMS Mode */}
            {isEditable && onOpenMediaPicker && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMediaPicker(
                    ctaSection?.id || "about-cta",
                    "imageUrl",
                    ctaSection?.imageUrl || "/images/a77-journey-bg.jpg"
                  );
                }}
                className="absolute top-6 right-6 z-30 px-3.5 py-2 rounded-full bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-medium flex items-center gap-2 shadow-xl transition-all pointer-events-auto"
                title="Replace CTA Photo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Background Photo</span>
              </button>
            )}

            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-28 sm:py-36">
              <div className="max-w-xl space-y-4">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                  <InlineEditableText
                    as="span"
                    value={ctaSection?.heading || "Your Journey Begins Here"}
                    isEditable={isEditable}
                    onChange={(val) => updateField(ctaSection?.id || "about-cta", "heading", val)}
                    placeholder="Your Journey Begins Here"
                  />
                </h2>

                <p className="text-[#D0D9E4] text-base sm:text-lg font-light leading-relaxed pb-4">
                  <InlineEditableText
                    as="span"
                    value={
                      ctaSection?.description ||
                      "Explore our exclusive yacht collection and experience the ASMARATY difference."
                    }
                    isEditable={isEditable}
                    onChange={(val) => updateField(ctaSection?.id || "about-cta", "description", val)}
                    placeholder="Enter call to action description..."
                    multiline={true}
                  />
                </p>

                {(ctaSection?.primaryButton?.visible !== false && ctaSection?.primaryButtonVisible !== false) && (
                  <div>
                    {isEditable ? (
                      <InlineButtonEditor
                        config={ctaSection?.primaryButton || {
                          label: ctaSection?.primaryButtonText || "Explore Our Collection",
                          url: ctaSection?.primaryButtonUrl || "/yachts",
                          type: "internal",
                          target: "_self",
                          visible: true,
                          style: "solid-gold"
                        }}
                        text={ctaSection?.primaryButton?.label || ctaSection?.primaryButtonText || "Explore Our Collection"}
                        url={ctaSection?.primaryButton?.url || ctaSection?.primaryButtonUrl || "/yachts"}
                        isEditable={true}
                        onSave={(newText, newUrl, updatedConfig) => {
                          updateField(ctaSection?.id || "about-cta", "primaryButton", {
                            ...updatedConfig,
                            label: newText,
                            url: newUrl
                          });
                          updateField(ctaSection?.id || "about-cta", "primaryButtonText", newText);
                          updateField(ctaSection?.id || "about-cta", "primaryButtonUrl", newUrl);
                        }}
                        className="inline-flex items-center gap-3 bg-[#E5B869] hover:bg-[#D9AA58] text-[#0A111E] text-sm font-semibold px-8 py-4 rounded-full transition-all shadow-xl group"
                      />
                    ) : (
                      <Link
                        href={formatButtonHref(
                          ctaSection?.primaryButton?.url || ctaSection?.primaryButtonUrl || "/yachts",
                          ctaSection?.primaryButton?.type || "internal"
                        )}
                        target={ctaSection?.primaryButton?.target || "_self"}
                        rel={ctaSection?.primaryButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-3 bg-[#E5B869] hover:bg-[#D9AA58] text-[#0A111E] text-sm font-semibold px-8 py-4 rounded-full transition-all shadow-xl hover:shadow-2xl group"
                      >
                        <span>
                          {ctaSection?.primaryButton?.label || ctaSection?.primaryButtonText || "Explore Our Collection"}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Public Footer */}
      {showNavAndFooter && <PublicFooter />}
    </div>
  );
}
