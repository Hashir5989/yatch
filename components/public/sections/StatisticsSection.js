"use client";

import InlineEditableText from "@/components/cms/InlineEditableText";

export default function StatisticsSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "BY THE NUMBERS",
    heading = "A Legacy of Maritime Leadership",
    description = "Four decades of engineering excellence recognized across the Arabian Gulf.",
    items = [
      { number: "1979", label: "Year Established in UAE", suffix: "" },
      { number: "500+", label: "Vessels Handcrafted", suffix: "" },
      { number: "100", label: "Foot Flagship AS 100", suffix: "FT" },
      { number: "100%", label: "In-House Shipyard", suffix: "" }
    ],
    contentAlignment = "center"
  } = data;

  const isCenter = contentAlignment === "center";

  return (
    <section className="py-24 bg-[#08101C] text-[#E8EAEE] relative border-t border-b border-[#14233A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {(eyebrow || heading) && (
          <div className={`max-w-3xl mb-16 ${isCenter ? "mx-auto text-center" : "text-left"}`}>
            <div className={`inline-flex items-center gap-2 mb-3 ${isCenter ? "justify-center" : ""}`}>
              <span className="w-6 h-[1.5px] bg-[#C6A155]"></span>
              <InlineEditableText
                as="span"
                value={eyebrow}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                className="saxdor-eyebrow text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-bold"
                placeholder="EYEBROW..."
              />
              {isCenter && <span className="w-6 h-[1.5px] bg-[#C6A155]"></span>}
            </div>

            <h2 className="saxdor-title text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight uppercase tracking-[0.06em]">
              <InlineEditableText
                as="span"
                value={heading}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                placeholder="Enter statistics headline..."
                multiline={true}
              />
            </h2>

            <p className="text-sm sm:text-base text-[#8E9EAF] mt-4 font-light">
              <InlineEditableText
                as="span"
                value={description}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("description", val)}
                placeholder="Enter description..."
                multiline={true}
              />
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((stat, idx) => (
            <div
              key={idx}
              className="bg-[#0E2047]/60 p-8 border border-[#182C4B] hover:border-[#C6A155]/60 transition-colors text-center relative group"
            >
              <div className="saxdor-title text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight group-hover:text-[#F5E6D3] transition-colors">
                <InlineEditableText
                  as="span"
                  value={stat.number}
                  isEditable={isEditable}
                  onChange={(newVal) => {
                    if (!onUpdateField) return;
                    const newItems = [...items];
                    newItems[idx] = { ...newItems[idx], number: newVal };
                    onUpdateField("items", newItems);
                  }}
                  placeholder="000"
                />
                {stat.suffix && <span className="text-2xl text-[#C6A155] ml-1 font-sans">{stat.suffix}</span>}
              </div>

              <div className="saxdor-eyebrow text-[11px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mt-4">
                <InlineEditableText
                  as="span"
                  value={stat.label}
                  isEditable={isEditable}
                  onChange={(newVal) => {
                    if (!onUpdateField) return;
                    const newItems = [...items];
                    newItems[idx] = { ...newItems[idx], label: newVal };
                    onUpdateField("items", newItems);
                  }}
                  placeholder="Metric Label"
                />
              </div>
              <div className="w-8 h-[1.5px] bg-[#C6A155]/40 mx-auto mt-4 group-hover:w-16 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
