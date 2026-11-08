"use client";

import { useRef, useEffect } from "react";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import UniversalButton from "@/components/public/UniversalButton";

export default function HeroBannerSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "ASMARATY • EST. 1979",
    heading = "BESPOKE NAVAL MASTERPIECES",
    subheading = "Pioneering luxury composite yacht manufacturing in the United Arab Emirates.",
    imageUrl = "/images/yachts/g100.jpg",
    imageAlt = "ASMARATY Yacht",
    videoUrl,
    primaryButtonText = "Explore Fleet",
    primaryButtonUrl = "/yachts",
    secondaryButtonText = "Private Commission",
    secondaryButtonUrl = "/contact",
    stats = [
      { value: "100 FT", label: "Flagship AS 100" },
      { value: "45+ YRS", label: "Shipyard Heritage" },
      { value: "35 KTS", label: "Max Speed" },
      { value: "100%", label: "Custom Bespoke" }
    ],
    contentAlignment = "center"
  } = data;

  const isHomeHero = data.id === "home-hero";
  const effectiveVideoUrl = isHomeHero
    ? (videoUrl && videoUrl !== "/videos/asmaraty-whatsapp-banner.mp4" ? videoUrl : "/videos/banner-home.mp4")
    : (videoUrl && videoUrl.trim() !== "" ? videoUrl : null);

  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !effectiveVideoUrl) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: start autoplay upon first user interaction (touch/scroll/click)
        const onFirstInteraction = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => { });
          }
          window.removeEventListener("click", onFirstInteraction);
          window.removeEventListener("touchstart", onFirstInteraction);
          window.removeEventListener("scroll", onFirstInteraction);
        };
        window.addEventListener("click", onFirstInteraction, { once: true, passive: true });
        window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });
        window.addEventListener("scroll", onFirstInteraction, { once: true, passive: true });
      });
    }
  }, [effectiveVideoUrl]);

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#080B10] group/hero">
      {/* Background Media: Live Video or Photo with Dark Vignette Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {effectiveVideoUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <video
              ref={videoRef}
              key={effectiveVideoUrl}
              src={effectiveVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={imageUrl || "/images/asmaraty-hero-banner-poster.jpg"}
              className="w-full h-full object-cover object-center"
            >
              <source src="/videos/banner-home.mp4" type="video/mp4" />
              <source src="/videos/asmaraty-hero-banner.mp4" type="video/mp4" />
              <source src={effectiveVideoUrl} type="video/mp4" />
              <img
                src={imageUrl || "/images/asmaraty-hero-banner-poster.jpg"}
                alt={imageAlt || heading}
                className="w-full h-full object-cover object-center scale-105"
              />
            </video>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={imageUrl || "/images/about/asmaraty-about-hero-fireworks.jpg"}
              alt={imageAlt || heading}
              className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.04] transition-transform duration-1000 ease-out"
            />
            {/* Ambient luxury gradients for typographic clarity on non-video heroes */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/65 to-transparent sm:via-[#070D18]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/90 via-transparent to-black/40" />
          </div>
        )}
        {/* Crystal-clear bright daylight video with subtle bottom edge transition */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#08101C] to-transparent pointer-events-none opacity-80" />

        {/* Change Background Media Button when in Edit Mode */}
        {isEditable && onOpenMediaPicker && (
          <div className="absolute top-6 right-6 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaPicker("videoUrl", effectiveVideoUrl || "");
              }}
              className="px-3.5 py-2 rounded-full bg-[#080B10]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/50 hover:bg-[#C5A880] hover:text-[#080B10] text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
              title="Replace Hero Background Video"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Video</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaPicker("imageUrl", imageUrl);
              }}
              className="px-3.5 py-2 rounded-full bg-[#080B10]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/50 hover:bg-[#C5A880] hover:text-[#080B10] text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
              title="Replace Hero Fallback Photo"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-32 pb-16 sm:pb-24 flex-1 flex flex-col justify-end pointer-events-none">
        {isHomeHero ? (
          <div className="max-w-4xl text-center mx-auto">
            {/* Accessible Heading for Home SEO */}
            <h1 className="sr-only">
              ASMARATY Yachts | Luxury Yacht Collection in UAE
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl pointer-events-auto">
            {/* Eyebrow with gold accent line */}
            {eyebrow && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-semibold">
                  <InlineEditableText
                    as="span"
                    value={eyebrow}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                    placeholder="ABOUT US"
                  />
                </span>
                <span className="w-16 h-[1.5px] bg-[#C6A155]/80" />
              </div>
            )}

            {/* Semantic Luxury H1 */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] text-white font-normal leading-[1.12] tracking-tight">
              <InlineEditableText
                as="span"
                value={heading}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                placeholder="Hero Heading"
                multiline={true}
              />
            </h1>

            {/* Lead Narrative / Subheading */}
            {subheading && (
              <p className="text-base sm:text-lg text-[#D0D9E4] font-light leading-relaxed mt-6 mb-8 max-w-xl">
                <InlineEditableText
                  as="span"
                  value={subheading}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("subheading", val)}
                  placeholder="Hero Subheading or Description"
                  multiline={true}
                />
              </p>
            )}

            {/* Buttons Row with UniversalButton */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <UniversalButton
                config={data.primaryButton}
                fallbackLabel={primaryButtonText || "Discover Our Journey"}
                fallbackUrl={primaryButtonUrl || "#story"}
                fallbackStyle="solid-gold"
                isEditable={isEditable}
                onSave={(updatedBtn) => {
                  if (onUpdateField) {
                    onUpdateField("primaryButton", updatedBtn);
                    onUpdateField("primaryButtonText", updatedBtn.label);
                    onUpdateField("primaryButtonUrl", updatedBtn.url);
                  }
                }}
              />
              <UniversalButton
                config={data.secondaryButton}
                fallbackLabel={secondaryButtonText || "Explore Fleet"}
                fallbackUrl={secondaryButtonUrl || "/yachts"}
                fallbackStyle="outline-white"
                isEditable={isEditable}
                onSave={(updatedBtn) => {
                  if (onUpdateField) {
                    onUpdateField("secondaryButton", updatedBtn);
                    onUpdateField("secondaryButtonText", updatedBtn.label);
                    onUpdateField("secondaryButtonUrl", updatedBtn.url);
                  }
                }}
              />
            </div>

            {/* Gold decorative bar */}
            <div className="w-20 h-[2px] bg-[#C6A155] mt-8" />
          </div>
        )}
      </div>

      {/* Optional Stats Bar (omitted on clean Saxdor hero) */}
      {data.showStatsBar && stats && stats.length > 0 && (
        <div className="relative z-10 border-t border-white/10 bg-[#0A0E15]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, idx) => (
                <div key={idx} className="pt-2 md:pt-0">
                  <div className="saxdor-title text-2xl sm:text-3xl font-light text-white tracking-wider">
                    <InlineEditableText
                      as="span"
                      value={stat.value}
                      isEditable={isEditable}
                      onChange={(newVal) => {
                        if (!onUpdateField) return;
                        const newStats = [...stats];
                        newStats[idx] = { ...newStats[idx], value: newVal };
                        onUpdateField("stats", newStats);
                      }}
                      placeholder="Value"
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-luxury text-[#C6A155] mt-1 font-sans font-semibold">
                    <InlineEditableText
                      as="span"
                      value={stat.label}
                      isEditable={isEditable}
                      onChange={(newVal) => {
                        if (!onUpdateField) return;
                        const newStats = [...stats];
                        newStats[idx] = { ...newStats[idx], label: newVal };
                        onUpdateField("stats", newStats);
                      }}
                      placeholder="Label"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
