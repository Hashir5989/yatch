"use client";

import { Gem, ShieldCheck, Waves, Users, Sparkles, Anchor, Award } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";

const ICON_MAP = {
  Gem: Gem,
  ShieldCheck: ShieldCheck,
  Waves: Waves,
  Users: Users,
  Sparkles: Sparkles,
  Anchor: Anchor,
  Award: Award,
};

export default function ValuesPillarsSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
}) {
  const eyebrow = data.eyebrow || "OUR VALUES";
  const heading = data.heading || "Built on Trust. Driven by Passion.";
  const description =
    data.description ||
    "We are committed to delivering unparalleled quality, innovation, and personalized experiences for every client.";

  const pillars = Array.isArray(data.pillars) && data.pillars.length > 0
    ? data.pillars
    : [
        {
          id: "val-1",
          title: "Craftsmanship",
          desc: "Meticulously crafted yachts for the ultimate experience.",
          icon: "Gem",
        },
        {
          id: "val-2",
          title: "Trust & Integrity",
          desc: "A relationship built on transparency and reliability.",
          icon: "ShieldCheck",
        },
        {
          id: "val-3",
          title: "Innovation",
          desc: "Constantly evolving for a better tomorrow.",
          icon: "Waves",
        },
        {
          id: "val-4",
          title: "Personalised Experiences",
          desc: "Tailored journeys, designed around you.",
          icon: "Users",
        },
      ];

  const displayPillars = isEditable ? pillars : pillars.filter((p) => p.visible !== false);

  const handlePillarUpdate = (idx, key, val) => {
    if (!onUpdateField) return;
    const next = [...pillars];
    next[idx] = { ...next[idx], [key]: val };
    onUpdateField("pillars", next);
  };

  return (
    <section id="values" className="bg-[#FAF8F5] py-20 lg:py-28 text-[#0A121E] font-sans relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-4 mb-4">
            <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
              <InlineEditableText
                as="span"
                value={eyebrow}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                placeholder="OUR VALUES"
              />
            </span>
            <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal tracking-tight">
            <InlineEditableText
              as="span"
              value={heading}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="Built on Trust. Driven by Passion."
            />
          </h2>

          {description && (
            <p className="text-[#556375] text-sm sm:text-base font-light mt-4 max-w-2xl mx-auto leading-relaxed">
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
        </div>

        {/* Values Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD3]">
          {displayPillars.map((card, idx) => {
            const IconComponent = ICON_MAP[card.icon] || Gem;
            return (
              <div
                key={card.id || idx}
                className={`p-6 sm:p-8 flex flex-col items-center text-center group ${
                  card.visible === false ? "opacity-50" : ""
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
                    onChange={(val) => handlePillarUpdate(idx, "title", val)}
                    placeholder="Pillar Title"
                  />
                </h3>
                <p className="text-xs sm:text-sm text-[#697787] font-light leading-relaxed max-w-xs">
                  <InlineEditableText
                    as="span"
                    value={card.desc}
                    isEditable={isEditable}
                    onChange={(val) => handlePillarUpdate(idx, "desc", val)}
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
  );
}
