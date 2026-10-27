"use client";

import { Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function ImageTextSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "OUR VISION",
    heading = "TRANSFORMING THE TOMORROW OF BOATING",
    description = "At ASMARATY, our vision is to set a new standard in yachting, driven by a passion to fulfill boaters' future desires. Our continuing dedication to naval innovation ensures that each vessel is crafted to transform your experience on the water.",
    quote = "",
    imageUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
    imageAlt = "Shipyard craftsmanship",
    buttonText = "OUR CONCEPT",
    buttonUrl = "/about",
    layoutStyle = "video",
    backgroundStyle = "white"
  } = data;

  const isImageRight = layoutStyle !== "image-left";
  const isWhite = backgroundStyle === "white";
  const isVideo = layoutStyle === "video";
  const isSplitTextOnly = layoutStyle === "split_text_only";

  return (
    <section className={`py-20 sm:py-28 relative overflow-hidden ${
      isWhite 
        ? "bg-white text-[#0E2047] border-b border-[#0E2047]/10" 
        : "bg-[#08101C] text-[#E8EEF5] border-t border-b border-white/10"
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        {/* Layout Style: Split Text Only (e.g. Our Expanding Model Range) */}
        {isSplitTextOnly ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                <InlineEditableText
                  as="span"
                  value={eyebrow}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  placeholder="MODELS..."
                />
              </div>
              <h2 className={`font-sans text-3xl sm:text-4xl lg:text-5xl font-light uppercase leading-[1.1] tracking-[0.04em] ${isWhite ? "text-[#0E2047]" : "text-white"}`}>
                <InlineEditableText
                  as="span"
                  value={heading}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="Enter title..."
                  multiline={true}
                />
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 lg:pl-6">
              <p className={`text-base sm:text-lg leading-relaxed font-normal ${isWhite ? "text-[#0E2047]/80" : "text-white/80"}`}>
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
                <div className="pt-2">
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
                    className={isWhite ? "saxdor-btn-navy-outline !h-[52px] !px-8" : "saxdor-btn-solid !h-[52px] !px-8"}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text Column */}
            <div className={`lg:col-span-6 space-y-6 ${isImageRight ? "lg:order-1" : "lg:order-2"}`}>
              <div className="text-xs sm:text-sm font-sans font-medium uppercase tracking-[0.24em] text-[#C6A155]">
                <InlineEditableText
                  as="span"
                  value={eyebrow}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  placeholder="OUR VISION..."
                />
              </div>

              <h2 className={`font-sans text-3xl sm:text-4xl lg:text-5xl font-light leading-[1.1] tracking-[0.04em] uppercase ${isWhite ? "text-[#0E2047]" : "text-white"}`}>
                <InlineEditableText
                  as="span"
                  value={heading}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="Enter section title..."
                  multiline={true}
                />
              </h2>

              <p className={`text-sm sm:text-base md:text-lg leading-relaxed font-normal ${isWhite ? "text-[#0E2047]/80" : "text-white/80"}`}>
                <InlineEditableText
                  as="span"
                  value={description}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("description", val)}
                  placeholder="Enter description..."
                  multiline={true}
                />
              </p>

              {quote && (
                <blockquote className="border-l-2 border-[#C6A155] pl-5 py-1 italic text-sm sm:text-base font-light text-[#C6A155]">
                  <InlineEditableText
                    as="span"
                    value={quote}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("quote", val)}
                    placeholder="Enter quote..."
                    multiline={true}
                  />
                </blockquote>
              )}

              {buttonText && (
                <div className="pt-2">
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
                    className={isWhite ? "saxdor-btn-navy-outline !h-[52px] !px-8" : "saxdor-btn-solid !h-[52px] !px-8"}
                  />
                </div>
              )}
            </div>

            {/* Media / Video Showcase Column */}
            <div className={`lg:col-span-6 relative ${isImageRight ? "lg:order-2" : "lg:order-1"}`}>
              {isVideo ? (
                <div className="relative aspect-video w-full overflow-hidden border border-[#0E2047]/15 group shadow-2xl bg-black">
                  <img
                    src={imageUrl}
                    alt={imageAlt || heading}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Edit Photo Trigger in CMS Mode */}
                  {isEditable && onOpenMediaPicker && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMediaPicker("imageUrl", imageUrl);
                      }}
                      className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Change Poster</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden border border-[#0E2047]/10 group shadow-xl bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={imageAlt || heading}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {isEditable && onOpenMediaPicker && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMediaPicker("imageUrl", imageUrl);
                      }}
                      className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-[#08101C]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Replace Photo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
