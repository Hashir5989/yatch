"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function CallToActionSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "THE HORIZON AWAITS",
    heading = "START YOUR JOURNEY NOW",
    description = "Step aboard the ASMARATY collection and experience the next generation of spacious luxury yachting. Our advisors and naval architects welcome private consultations.",
    primaryButtonText = "EXPLORE THE FLEET",
    primaryButtonUrl = "#fleet",
    secondaryButtonText = "",
    secondaryButtonUrl = "/contact",
    guaranteeText = "",
    imageUrl = "/images/asmaraty-four-yachts-journey.jpg",
    videoUrl = ""
  } = data;

  const activeImage = imageUrl && imageUrl.trim() !== ""
    ? imageUrl
    : "/images/asmaraty-four-yachts-journey.jpg";

  return (
    <section 
      id="start-journey"
      className="relative min-h-[580px] sm:min-h-[680px] flex items-center justify-center overflow-hidden bg-[#08101C] text-center border-t border-white/10 group/cta"
    >
      {/* Vintage Graded Yacht Motion Animation Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Layer 1: Living Yacht Cruise Motion Animation (Smooth Continuous Sailing Motion) */}
        <div className="absolute -inset-[6%] w-[112%] h-[112%] animate-yacht-live origin-center">
          <img
            src={activeImage}
            alt="ASMARATY Luxury Yacht cruising at sea"
            className="w-full h-full object-cover object-center transform-gpu"
            style={{
              imageRendering: "-webkit-optimize-contrast",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
            loading="eager"
          />
        </div>

        {/* Layer 2: Vintage Golden Sunlight Glow & Amber Highlight Flare */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 82% 18%, rgba(255, 222, 155, 0.32) 0%, rgba(245, 185, 90, 0.14) 40%, transparent 70%)"
          }}
        />

        {/* Layer 3: Warm Vintage Film Tone & Riviera Maritime Split-Toning */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          style={{
            background: "linear-gradient(135deg, rgba(255, 235, 195, 0.28) 0%, rgba(220, 165, 80, 0.16) 45%, rgba(12, 32, 60, 0.28) 100%)"
          }}
        />

        {/* Layer 4: Animated Water Caustic Shimmer Wave Layer */}
        <div 
          className="absolute inset-0 animate-ocean-caustic opacity-25 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(ellipse 60% 30% at 50% 70%, rgba(245, 210, 140, 0.30) 0%, rgba(30, 90, 160, 0.20) 50%, transparent 100%)",
            backgroundSize: "200% 200%"
          }}
        />

        {/* Layer 5: Dynamic Ocean Wake Ripples Flow */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 animate-ocean-wake pointer-events-none opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none">
            <path
              d="M0,192L60,197.3C120,203,240,213,360,202.7C480,192,600,160,720,165.3C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              fill="url(#oceanGradient)"
            />
            <defs>
              <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(8, 16, 28, 0)" />
                <stop offset="50%" stopColor="rgba(215, 175, 95, 0.10)" />
                <stop offset="100%" stopColor="rgba(8, 16, 28, 0.35)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Layer 6: Atmospheric Sea Mist & Warm Light Drift */}
        <div 
          className="absolute inset-0 animate-ocean-mist pointer-events-none opacity-35"
          style={{
            background: "radial-gradient(circle at 75% 35%, rgba(255, 235, 190, 0.14) 0%, transparent 60%)"
          }}
        />

        {/* Layer 7: Luxury Contrast Vignette for Clean Typography Contrast */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(8, 16, 28, 0.38) 0%, rgba(8, 16, 28, 0.18) 55%, rgba(8, 16, 28, 0.65) 100%)"
          }}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#08101C]/80 via-[#08101C]/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#08101C]/85 via-[#08101C]/30 to-transparent pointer-events-none" />


        {/* Change Photo Trigger in CMS Mode */}
        {isEditable && onOpenMediaPicker && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMediaPicker("imageUrl", activeImage);
            }}
            className="absolute top-6 right-6 z-30 px-3.5 py-2 rounded-full bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-medium flex items-center gap-2 shadow-xl transition-all pointer-events-auto"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Change Background Photo</span>
          </button>
        )}
      </div>

      {/* Floating Transparent Content (No Dark Box Container - Video Fully Visible) */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 py-24 sm:py-32 w-full">
        {eyebrow && (
          <div className="mb-4">
            <InlineEditableText
              as="span"
              value={eyebrow}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
              className="text-xs sm:text-sm font-sans font-semibold uppercase tracking-[0.28em] text-[#F3D389] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_12px_rgba(0,0,0,0.95)]"
              placeholder="EYEBROW..."
            />
          </div>
        )}

        <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight uppercase tracking-[0.04em] mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] [text-shadow:_0_3px_24px_rgba(0,0,0,0.95),_0_1px_4px_rgba(0,0,0,0.9)]">
          <InlineEditableText
            as="span"
            value={heading}
            isEditable={isEditable}
            onChange={(val) => onUpdateField && onUpdateField("heading", val)}
            placeholder="START YOUR JOURNEY NOW..."
            multiline={true}
          />
        </h2>

        {description && (
          <p className="text-sm sm:text-base md:text-lg text-white font-medium max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_14px_rgba(0,0,0,0.95)] saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
            <InlineEditableText
              as="span"
              value={description}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("description", val)}
              placeholder="Enter description..."
              multiline={true}
            />
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-md mx-auto">
          <InlineButtonEditor
            text={primaryButtonText || "VISIT THE FLEET"}
            url={primaryButtonUrl || "#fleet"}
            isEditable={isEditable}
            onSave={(newText, newUrl) => {
              if (onUpdateField) {
                onUpdateField("primaryButtonText", newText);
                onUpdateField("primaryButtonUrl", newUrl);
              }
            }}
            className="saxdor-btn-outline !border-white/90 !text-white hover:!bg-white hover:!text-[#08101C] !bg-black/25 backdrop-blur-md !h-[50px] sm:!h-[54px] !px-8 sm:!px-10 !text-xs !tracking-[0.18em] !font-semibold !shadow-[0_8px_24px_rgba(0,0,0,0.75)] w-full sm:w-auto text-center cursor-pointer"
          />

          {secondaryButtonText && (
            <InlineButtonEditor
              text={secondaryButtonText}
              url={secondaryButtonUrl || "/contact"}
              isEditable={isEditable}
              onSave={(newText, newUrl) => {
                if (onUpdateField) {
                  onUpdateField("secondaryButtonText", newText);
                  onUpdateField("secondaryButtonUrl", newUrl);
                }
              }}
              className="saxdor-btn-outline !h-[50px] sm:!h-[54px] !px-8 sm:!px-10 !text-xs !tracking-[0.18em] !border-white/80 !text-white hover:!bg-white hover:!text-[#08101C] !bg-black/30 backdrop-blur-md !shadow-[0_8px_24px_rgba(0,0,0,0.75)] w-full sm:w-auto text-center"
            />
          )}
        </div>

        {guaranteeText && (
          <div className="mt-8 inline-flex items-center gap-2 text-xs text-white font-mono tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] [text-shadow:_0_2px_10px_rgba(0,0,0,0.95)]">
            <ShieldCheck className="w-4 h-4 text-[#F3D389]" />
            <InlineEditableText
              as="span"
              value={guaranteeText}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("guaranteeText", val)}
              placeholder="Guarantee note..."
            />
          </div>
        )}
      </div>
    </section>
  );
}
