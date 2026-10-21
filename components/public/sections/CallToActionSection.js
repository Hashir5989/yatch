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
    description = "Step aboard and experience the next generation of luxury yachting. Our advisors and naval architects welcome private consultations.",
    primaryButtonText = "VISIT THE FLEET",
    primaryButtonUrl = "/yachts",
    secondaryButtonText = "",
    secondaryButtonUrl = "/contact",
    guaranteeText = "",
    imageUrl = "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80",
    layoutStyle = "cinematic-full"
  } = data;

  if (layoutStyle === "cinematic-full") {
    return (
      <section className="relative min-h-[540px] sm:min-h-[620px] flex items-center justify-center overflow-hidden bg-[#08101C] text-center border-t border-white/10 group/cta">
        {/* Full Bleed Ocean Visual with Gradient Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt={heading}
            className="w-full h-full object-cover scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-[#08101C]/55"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-transparent to-[#08101C]/40"></div>

          {/* Change Photo Trigger in CMS Mode */}
          {isEditable && onOpenMediaPicker && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaPicker("imageUrl", imageUrl);
              }}
              className="absolute top-6 right-6 z-30 px-3.5 py-2 rounded-full bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Background Photo</span>
            </button>
          )}
        </div>

        {/* Centered Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 py-24 sm:py-32">
          {eyebrow && (
            <div className="mb-4">
              <InlineEditableText
                as="span"
                value={eyebrow}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]"
                placeholder="EYEBROW..."
              />
            </div>
          )}

          <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight uppercase tracking-[0.03em] mb-6">
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
            <p className="text-sm sm:text-base md:text-lg text-white/80 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
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

          <div className="flex flex-wrap items-center justify-center gap-4">
            <InlineButtonEditor
              text={primaryButtonText || "VISIT THE FLEET"}
              url={primaryButtonUrl || "/yachts"}
              isEditable={isEditable}
              onSave={(newText, newUrl) => {
                if (onUpdateField) {
                  onUpdateField("primaryButtonText", newText);
                  onUpdateField("primaryButtonUrl", newUrl);
                }
              }}
              className="saxdor-btn-solid !h-[54px] !px-10 !text-xs"
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
                className="saxdor-btn-outline !h-[54px] !px-10 !text-xs"
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 bg-[#08101C] relative overflow-hidden text-[#E8EEF5] border-t border-white/10">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 text-center relative z-10">
        <div className="mb-4">
          <InlineEditableText
            as="span"
            value={eyebrow || "EXPERIENCE LUXURY ON THE WATER"}
            isEditable={isEditable}
            onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
            className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]"
            placeholder="EYEBROW..."
          />
        </div>

        <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl font-light text-white leading-tight uppercase tracking-[0.04em] mb-6">
          <InlineEditableText
            as="span"
            value={heading || "BEGIN YOUR BESPOKE YACHT JOURNEY"}
            isEditable={isEditable}
            onChange={(val) => onUpdateField && onUpdateField("heading", val)}
            placeholder="Enter CTA headline..."
            multiline={true}
          />
        </h2>

        <p className="text-sm sm:text-base md:text-lg text-white/80 font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
          <InlineEditableText
            as="span"
            value={description || "Our naval architects and shipyard advisory team welcome private consultations at our UAE shipyard or via our Dubai VIP marina lounge. Experience our flagship models firsthand on the water."}
            isEditable={isEditable}
            onChange={(val) => onUpdateField && onUpdateField("description", val)}
            placeholder="Enter CTA description..."
            multiline={true}
          />
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <InlineButtonEditor
            text={primaryButtonText || "Book a Private Sea Trial"}
            url={primaryButtonUrl || "/contact"}
            isEditable={isEditable}
            onSave={(newText, newUrl) => {
              if (onUpdateField) {
                onUpdateField("primaryButtonText", newText);
                onUpdateField("primaryButtonUrl", newUrl);
              }
            }}
            className="saxdor-btn-solid !h-[52px] !px-8"
          />

          {secondaryButtonText && (
            <InlineButtonEditor
              text={secondaryButtonText || "Download Fleet Catalog"}
              url={secondaryButtonUrl || "/yachts"}
              isEditable={isEditable}
              onSave={(newText, newUrl) => {
                if (onUpdateField) {
                  onUpdateField("secondaryButtonText", newText);
                  onUpdateField("secondaryButtonUrl", newUrl);
                }
              }}
              className="saxdor-btn-outline !h-[52px] !px-8"
            />
          )}
        </div>

        {guaranteeText && (
          <div className="inline-flex items-center gap-2 text-xs text-white/60 font-mono tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-[#C6A155]" />
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
