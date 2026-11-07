"use client";

export default function LeadershipTeamSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const eyebrow = data.eyebrow || "LEADERSHIP & ATELIER";
  const heading = data.heading || "The Naval Architects & Master Shipbuilders";
  const description =
    data.description ||
    "Meet the executive directors, naval architects, and composite engineers guiding ASMARATY's four-decade pursuit of oceanic perfection.";

  const members = Array.isArray(data.members) ? data.members : [];
  const displayMembers = isEditable ? members : members.filter((m) => m.visible !== false);

  return (
    <section className="bg-[#080D15] text-[#E8EAEE] py-20 lg:py-28 relative overflow-hidden border-t border-white/10 font-sans">
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

        {/* Executive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {displayMembers.map((member, idx) => (
            <div
              key={member.id || idx}
              className={`bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all rounded-sm overflow-hidden flex flex-col justify-between shadow-2xl group ${
                member.visible === false ? "opacity-60 border-amber-500/50" : ""
              }`}
            >
              <div>
                {/* Member Photograph */}
                <div className="relative aspect-[4/3] bg-black/50 overflow-hidden">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.photoAlt || member.name || "Executive"}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                      No Photo Provided
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-[#0D1522]/30 to-transparent" />
                </div>

                {/* Member Details */}
                <div className="p-6 sm:p-8 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#DFBA73] font-semibold block">
                    {member.role || "Executive"}
                  </span>

                  <h3 className="font-serif text-2xl text-white font-normal tracking-tight">
                    {member.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#8E9EAF] font-light leading-relaxed pt-1">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Bottom Decorative Trim / Visibility Flag */}
              <div className="px-6 sm:px-8 py-3 bg-[#0A101A] border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-white/50">
                <span className="tracking-widest uppercase text-[#C6A155]">ASMARATY LEADERSHIP</span>
                {member.visible === false && (
                  <span className="text-amber-400 font-semibold uppercase">Hidden</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

