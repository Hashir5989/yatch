"use client";

import { Calendar } from "lucide-react";

export default function ShipyardTimelineSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const eyebrow = data.eyebrow || "SHIPYARD MILESTONES";
  const heading = data.heading || "Four Decades of Shipbuilding Innovation";
  const description =
    data.description ||
    "From our foundational Ajman boatyard in 1979 to international superyacht debuts, trace the defining milestones of ASMARATY and Al Shaali Marine.";

  const items = Array.isArray(data.timelineItems) ? data.timelineItems : [];
  const displayItems = isEditable ? items : items.filter((item) => item.visible !== false);

  return (
    <section className="bg-[#0A0F17] text-[#E8EAEE] py-20 lg:py-28 relative overflow-hidden border-t border-white/10 font-sans">
      {/* Subtle ambient luxury glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C6A155]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-4 mb-4">
            <span className="w-12 h-[1.5px] bg-[#C6A155]/60" />
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#DFBA73] font-semibold">
              {eyebrow}
            </span>
            <span className="w-12 h-[1.5px] bg-[#C6A155]/60" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-white font-normal tracking-tight leading-tight mb-4">
            {heading}
          </h2>

          {description && (
            <p className="text-[#8E9EAF] text-sm sm:text-base font-light max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Timeline Items Grid / Alternating Vertical Flow */}
        <div className="relative">
          {/* Central Vertical Timeline Spine (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[1px] bg-gradient-to-b from-[#C6A155]/60 via-[#C6A155]/20 to-transparent -translate-x-1/2" />

          <div className="space-y-12 lg:space-y-16">
            {displayItems.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.id || idx}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } ${item.visible === false ? "opacity-60 border border-dashed border-amber-500/40 p-4" : ""}`}
                >
                  {/* Content Column */}
                  <div className={`w-full lg:w-1/2 ${isEven ? "lg:text-right" : "lg:text-left"}`}>
                    <div className="bg-[#0E1624] border border-white/10 hover:border-[#C6A155]/50 transition-all p-6 sm:p-8 rounded-sm shadow-xl relative group">
                      {/* Year / Date Badge */}
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 bg-[#121E32] border border-[#C6A155]/40 text-[#DFBA73] text-xs font-mono font-bold uppercase tracking-widest mb-3 ${
                          isEven ? "lg:ml-auto" : ""
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#C6A155]" />
                        <span>{item.year || "Milestone"}</span>
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl text-white font-normal tracking-tight mb-2">
                        {item.heading}
                      </h3>

                      <p className="text-[#8E9EAF] text-xs sm:text-sm font-light leading-relaxed">
                        {item.description}
                      </p>

                      {item.visible === false && (
                        <span className="inline-block mt-3 text-[10px] uppercase font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 border border-amber-800">
                          Hidden from Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center Node on Spine */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#08101C] border-2 border-[#C6A155] items-center justify-center text-[#DFBA73] shadow-[0_0_15px_rgba(198,161,85,0.4)] z-20">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C6A155]" />
                  </div>

                  {/* Image Column */}
                  <div className="w-full lg:w-1/2">
                    {item.image ? (
                      <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden rounded-sm border border-white/10 bg-[#0E1624] shadow-xl group">
                        <img
                          src={item.image}
                          alt={item.imageAlt || item.heading || "Timeline Image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080B10]/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] rounded-sm border border-dashed border-white/10 bg-[#0E1624]/40 flex items-center justify-center text-xs text-white/40">
                        No Milestone Image Specified
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

