"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function FeaturedYachtSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "FLAGSHIP SPOTLIGHT",
    heading = "ASMARATY G-100 Super Yacht",
    yachtSlug = "g100",
    description = "Discover the ASMARATY G-100, a super yacht designed to bring together refined luxury, spacious living and sophisticated marine engineering. With three expansive decks, elegant interiors and generous outdoor entertaining areas, the G-100 creates an exceptional setting for life on the water.",
    imageUrl = "/images/yachts/g100.jpg",
    imageAlt = "ASMARATY Flagship G-100 Super Yacht",
    keySpecs = [
      { label: "Length Overall (LOA)", value: "100 ft / 30.48 m" },
      { label: "Maximum Beam", value: "22.91 ft / 6.98 m" },
      { label: "Twin MTU Engines", value: "2 × 1,600 hp" },
      { label: "Accommodation", value: "5+2 (12+5 Berths)" }
    ],
    buttonText = "Explore Specifications",
    buttonUrl = "/yachts/g100"
  } = data;

  const features = [
    "Spacious Three-Deck Design: Generous indoor & outdoor living with panoramic sea views",
    "Refined Interior Living: Sunlit main salon, formal dining area & elegant lounges",
    "Private Accommodation: Owner's cabin, forward VIP, 2 guest cabins & separate crew",
    "Elevated Flybridge Experience: Social gatherings, sunbeds, bar & optional hot tub",
    "Advanced Marine Systems: Twin 1,600 hp MTU engines, ZF gearbox & 24-ton AC chiller"
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#08101C] relative overflow-hidden border-t border-b border-[#14233A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Showcase */}
          <div className="lg:col-span-7 relative">
            <div className="relative overflow-hidden border border-[#1A2E4C] shadow-2xl group">
              <img
                src={imageUrl}
                alt={imageAlt || heading}
                className="w-full h-[450px] sm:h-[550px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08101C] via-transparent to-transparent opacity-80"></div>
              
              {/* Replace Image in Edit Mode */}
              {isEditable && onOpenMediaPicker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMediaPicker("imageUrl", imageUrl);
                  }}
                  className="absolute top-6 right-6 z-30 px-3.5 py-1.5 bg-[#0E2047]/90 backdrop-blur-md text-[#C6A155] border border-[#C6A155]/60 hover:bg-[#C6A155] hover:text-[#08101C] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </button>
              )}

              {/* Floating Flagship Badge */}
              <div className="absolute top-6 left-6 bg-[#0E2047]/90 backdrop-blur-md px-3.5 py-1.5 border border-[#C6A155]/50">
                <span className="saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#C6A155] font-bold">
                  ASMARATY Flagship
                </span>
              </div>

              {/* Floating Bottom Specs Pill */}
              <div className="absolute bottom-6 left-6 right-6 bg-[#0E2047]/95 backdrop-blur-md p-4 sm:p-6 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {keySpecs.map((spec, idx) => (
                  <div key={idx}>
                    <div className="saxdor-eyebrow text-[9px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold">
                      {spec.label}
                    </div>
                    <div className="saxdor-title text-base sm:text-lg text-white font-light mt-1">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Highlights */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-6 h-[1.5px] bg-[#C6A155]"></span>
                <InlineEditableText
                  as="span"
                  value={eyebrow}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  className="saxdor-eyebrow text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-bold"
                  placeholder="EYEBROW..."
                />
              </div>

              <h2 className="saxdor-title text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight uppercase tracking-[0.06em]">
                <InlineEditableText
                  as="span"
                  value={heading}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="Enter featured title..."
                  multiline={true}
                />
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#8E9EAF] leading-relaxed font-light">
              <InlineEditableText
                as="span"
                value={description}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("description", val)}
                placeholder="Enter description..."
                multiline={true}
              />
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3 pt-2">
              {features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-[#C6A155] mt-2 flex-shrink-0"></span>
                  <span className="text-xs sm:text-sm text-[#C8D3E0] font-light">
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
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

              <InlineButtonEditor
                text={data.secondaryButtonText || "REQUEST SPECIFICATIONS"}
                url={data.secondaryButtonUrl || "/contact"}
                isEditable={isEditable}
                onSave={(newText, newUrl) => {
                  if (onUpdateField) {
                    onUpdateField("secondaryButtonText", newText);
                    onUpdateField("secondaryButtonUrl", newUrl);
                  }
                }}
                className="saxdor-btn-outline w-full sm:w-auto text-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
