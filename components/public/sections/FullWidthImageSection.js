"use client";

import { ArrowRight, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function FullWidthImageSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "SEAMLESS HORIZONS",
    heading = "Bespoke Freedom on the Open Water",
    description = "Designed for owners who measure time by nautical miles charted.",
    imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
    imageAlt = "Panoramic ocean sunset",
    overlayOpacity = 45,
    buttonText = "Schedule Private Sea Trial",
    buttonUrl = "/contact",
    contentAlignment = "center"
  } = data;

  const isCenter = contentAlignment === "center";

  return (
    <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt={imageAlt || heading}
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-[#080B10]"
          style={{ opacity: (overlayOpacity || 45) / 100 }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-[#080B10]"></div>

        {/* Change Image in Edit Mode */}
        {isEditable && onOpenMediaPicker && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMediaPicker("imageUrl", imageUrl);
            }}
            className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[#080B10]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/50 hover:bg-[#C5A880] hover:text-[#080B10] text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Change Photo</span>
          </button>
        )}
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-20">
        <div className={`${isCenter ? "text-center" : "text-left"}`}>
          <div className="saxdor-eyebrow text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-bold mb-4">
            <InlineEditableText
              as="span"
              value={eyebrow}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
              placeholder="EYEBROW..."
            />
          </div>

          <h2 className="saxdor-title text-3xl sm:text-5xl md:text-6xl font-light text-white leading-tight uppercase tracking-[0.06em] mb-6">
            <InlineEditableText
              as="span"
              value={heading}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="Enter headline..."
              multiline={true}
            />
          </h2>

          <p className="text-base sm:text-lg text-[#C8D3E0] font-light max-w-2xl mb-8 mx-auto leading-relaxed">
            <InlineEditableText
              as="span"
              value={description}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("description", val)}
              placeholder="Enter description..."
              multiline={true}
            />
          </p>

          {buttonText && (
            <div>
              <InlineButtonEditor
                text={buttonText}
                url={buttonUrl}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  if (onUpdateField) {
                    onUpdateField("buttonText", newText);
                    onUpdateField("buttonUrl", newUrl);
                  }
                }}
                className="saxdor-btn-solid inline-flex items-center gap-2 w-full sm:w-auto text-center"
                icon={ArrowRight}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
