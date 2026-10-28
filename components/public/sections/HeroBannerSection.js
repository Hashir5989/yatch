"use client";

import { useRef, useEffect } from "react";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

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

  const effectiveVideoUrl = videoUrl || "/videos/gemini_generated_video_3214e3e8.mp4";
  const isCenter = contentAlignment === "center";
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: start autoplay upon first user interaction (touch/scroll/click)
        const onFirstInteraction = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
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
              poster={imageUrl || "/images/live-yacht-journey.jpg"}
              className="w-full h-full object-cover object-center scale-[1.01]"
            >
              <source src={effectiveVideoUrl} type="video/mp4" />
              <source src="/videos/gemini_generated_video_3214e3e8.mp4" type="video/mp4" />
              <source src="/videos/hero-banner.mp4" type="video/mp4" />
              <source src="/videos/live-yacht-journey.mp4" type="video/mp4" />
              <img
                src={imageUrl || "/images/live-yacht-journey.jpg"}
                alt={imageAlt || heading}
                className="w-full h-full object-cover object-center scale-105"
              />
            </video>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={imageAlt || heading}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-[#08101C]/30 to-[#08101C]/45 pointer-events-none"></div>
        <div 
          className="absolute -left-[20vw] -bottom-[30vh] w-[130vw] h-[130vh] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 72%, rgba(6, 16, 34, 0.70) 0%, rgba(6, 16, 34, 0.45) 25%, rgba(6, 16, 34, 0.20) 45%, transparent 70%)"
          }}
        />

        {/* Change Background Media Button when in Edit Mode */}
        {isEditable && onOpenMediaPicker && (
          <div className="absolute top-6 right-6 z-30 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaPicker("videoUrl", effectiveVideoUrl);
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

      {/* Main Saxdor-Style Hero Content */}
      <div className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-32 pb-16 sm:pb-20 flex-1 flex flex-col justify-end ${
        isCenter ? "items-center" : "items-start"
      }`}>
        <div className={`max-w-4xl ${isCenter ? "text-center mx-auto" : "text-left"}`}>
          {/* Accessible Heading for SEO */}
          <h1 className="sr-only">
            {heading || "ASMARATY Luxury Yachts & Boats UAE"}
          </h1>

          {/* Official ASMARATY Metallic Emblem Crest */}
          <div className="mb-8 sm:mb-10 flex justify-center">
            <img
              src="/images/asmaraty-emblem.png"
              alt="ASMARATY"
              className="w-auto h-16 sm:h-20 md:h-24 object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)] transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Saxdor Action Buttons */}
          <div className={`flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto ${isCenter ? "justify-center" : "justify-start"}`}>
            {/* Primary Button: Solid White (Saxdor signature) */}
            <InlineButtonEditor
              text={primaryButtonText}
              url={primaryButtonUrl}
              isEditable={isEditable}
              onSave={(newText, newUrl) => {
                if (onUpdateField) {
                  onUpdateField("primaryButtonText", newText);
                  onUpdateField("primaryButtonUrl", newUrl);
                }
              }}
              className="saxdor-btn-solid w-full sm:w-auto text-center"
              icon={null}
            />

            {/* Secondary Button: Clean Outline */}
            {secondaryButtonText && (
              <InlineButtonEditor
                text={secondaryButtonText}
                url={secondaryButtonUrl}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  if (onUpdateField) {
                    onUpdateField("secondaryButtonText", newText);
                    onUpdateField("secondaryButtonUrl", newUrl);
                  }
                }}
                className="saxdor-btn-outline w-full sm:w-auto text-center"
              />
            )}
          </div>
        </div>
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
