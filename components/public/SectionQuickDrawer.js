"use client";

import { useState } from "react";
import { 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Sliders,
  Link2,
  Plus,
  Users,
  Award,
  Calendar
} from "lucide-react";

export default function SectionQuickDrawer({
  isOpen,
  onClose,
  section,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSection,
  isFirst,
  isLast,
  onOpenMediaPicker,
}) {
  if (!isOpen || !section) return null;

  const pagePresets = [
    { label: "Home", url: "/" },
    { label: "Fleet", url: "/yachts" },
    { label: "AS 100", url: "/yachts/as-100" },
    { label: "About", url: "/about" },
    { label: "News", url: "/news" },
    { label: "Contact", url: "/contact" },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0C1017] border-l border-[#1F2737] shadow-2xl flex flex-col animate-slideInRight text-xs text-[#E8EAEE] select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#1C2433] bg-[#090D14] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#162030] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-medium text-white uppercase tracking-wider">
              {section.name || section.type.replace(/_/g, " ")}
            </h3>
            <p className="text-[10px] text-[#7A8798]">
              Edit text, buttons, links, and styling
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-[#8E9AA8] hover:text-white p-1 rounded hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar: Move & Actions */}
      <div className="p-3 bg-[#0A0E15] border-b border-[#1C2433] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-[#687588]">Reorder:</span>
          <button
            onClick={() => onMoveSection(-1)}
            disabled={isFirst}
            className={`p-1.5 rounded bg-[#131A26] border border-[#232F42] ${
              isFirst ? "opacity-30 cursor-not-allowed" : "hover:text-[#C5A880]"
            }`}
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveSection(1)}
            disabled={isLast}
            className={`p-1.5 rounded bg-[#131A26] border border-[#232F42] ${
              isLast ? "opacity-30 cursor-not-allowed" : "hover:text-[#C5A880]"
            }`}
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateSection({ visible: section.visible === false ? true : false })
            }
            className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 border ${
              section.visible !== false
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                : "bg-red-950/60 text-red-300 border-red-800"
            }`}
          >
            {section.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{section.visible !== false ? "Visible" : "Hidden"}</span>
          </button>

          <button
            onClick={onDuplicateSection}
            className="p-1.5 rounded bg-[#131A26] hover:bg-white/10 text-[#8E9AA8] hover:text-white border border-[#232F42]"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDeleteSection}
            className="p-1.5 rounded bg-[#131A26] hover:bg-red-950/30 text-[#8E9AA8] hover:text-red-400 border border-[#232F42]"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawer Form Fields */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 select-text">
        {/* Eyebrow */}
        {section.eyebrow !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Eyebrow Badge
            </label>
            <input
              type="text"
              value={section.eyebrow || ""}
              onChange={(e) => onUpdateSection({ eyebrow: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        )}

        {/* Heading */}
        {section.heading !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Headline Title
            </label>
            <textarea
              rows={2}
              value={section.heading || ""}
              onChange={(e) => onUpdateSection({ heading: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
            />
          </div>
        )}

        {/* Subheading / Description */}
        {section.subheading !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Subheading
            </label>
            <textarea
              rows={3}
              value={section.subheading || ""}
              onChange={(e) => onUpdateSection({ subheading: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
            />
          </div>
        )}

        {/* Description */}
        {section.description !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Editorial Description
            </label>
            <textarea
              rows={4}
              value={section.description || ""}
              onChange={(e) => onUpdateSection({ description: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
            />
          </div>
        )}

        {/* Image field */}
        {section.imageUrl !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Background / Feature Image
            </label>
            <div className="space-y-2">
              {section.imageUrl && (
                <div className="relative aspect-video rounded-sm overflow-hidden border border-[#222E42]">
                  <img src={section.imageUrl} alt="Thumb" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={section.imageUrl || ""}
                  onChange={(e) => onUpdateSection({ imageUrl: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker("imageUrl", section.imageUrl)}
                  className="px-2.5 py-1.5 rounded-sm bg-[#1A2230] hover:bg-[#C5A880] hover:text-[#080B10] text-[#C5A880] border border-[#2A374C] font-medium text-[11px] flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose Media</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Button & URL Editor */}
        {(section.primaryButtonText !== undefined || section.buttonText !== undefined) && (
          <div className="p-4 bg-[#0A0E15] border border-[#C5A880]/30 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[#C5A880]">
              <Link2 className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Primary Button & Destination Link
              </span>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">
                Button Label:
              </label>
              <input
                type="text"
                value={section.primaryButtonText || section.buttonText || ""}
                onChange={(e) => {
                  if (section.primaryButtonText !== undefined) {
                    onUpdateSection({ primaryButtonText: e.target.value });
                  } else {
                    onUpdateSection({ buttonText: e.target.value });
                  }
                }}
                placeholder="e.g. Explore Fleet, Book Sea Trial"
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">
                Destination Link URL:
              </label>
              <input
                type="text"
                value={section.primaryButtonUrl || section.buttonUrl || ""}
                onChange={(e) => {
                  if (section.primaryButtonUrl !== undefined) {
                    onUpdateSection({ primaryButtonUrl: e.target.value });
                  } else {
                    onUpdateSection({ buttonUrl: e.target.value });
                  }
                }}
                placeholder="e.g. /yachts or /contact"
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-[#C5A880] font-mono focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Quick 1-Click Page Presets */}
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-[#5D6B7D] mb-1.5 font-medium">
                Quick Select Page Target:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {pagePresets.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      if (section.primaryButtonUrl !== undefined) {
                        onUpdateSection({ primaryButtonUrl: preset.url });
                      } else {
                        onUpdateSection({ buttonUrl: preset.url });
                      }
                    }}
                    className={`px-2 py-1 rounded text-[10px] text-center truncate border transition-all ${
                      (section.primaryButtonUrl || section.buttonUrl) === preset.url
                        ? "bg-[#C5A880] text-[#080B10] font-semibold border-[#C5A880]"
                        : "bg-[#111722] text-[#8E9CAE] border-white/5 hover:border-[#C5A880]/40 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Button & URL Editor */}
        {section.secondaryButtonText !== undefined && (
          <div className="p-4 bg-[#0A0E15] border border-white/10 rounded-sm space-y-3">
            <div className="flex items-center gap-2 text-[#A7B3C2]">
              <Link2 className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Secondary Button & Destination Link
              </span>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">
                Button Label:
              </label>
              <input
                type="text"
                value={section.secondaryButtonText || ""}
                onChange={(e) => onUpdateSection({ secondaryButtonText: e.target.value })}
                placeholder="e.g. Private Commission, Download Catalog"
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">
                Destination Link URL:
              </label>
              <input
                type="text"
                value={section.secondaryButtonUrl || ""}
                onChange={(e) => onUpdateSection({ secondaryButtonUrl: e.target.value })}
                placeholder="e.g. /contact"
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-[#C5A880] font-mono focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-3 gap-1">
              {pagePresets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => onUpdateSection({ secondaryButtonUrl: preset.url })}
                  className={`px-2 py-1 rounded text-[10px] text-center truncate border transition-all ${
                    section.secondaryButtonUrl === preset.url
                      ? "bg-[#C5A880] text-[#080B10] font-semibold border-[#C5A880]"
                      : "bg-[#111722] text-[#8E9CAE] border-white/5 hover:border-[#C5A880]/40 hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Layout Orientation */}
        {section.layoutStyle !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Layout Variation
            </label>
            <select
              value={section.layoutStyle}
              onChange={(e) => onUpdateSection({ layoutStyle: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2838] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
            >
              <option value="image-left">Image Left / Content Right</option>
              <option value="image-right">Image Right / Content Left</option>
              <option value="fullscreen">Fullscreen Hero</option>
              <option value="split">Split 50 / 50</option>
              <option value="grid-3">3-Column Grid</option>
            </select>
          </div>
        )}

        {/* Content Alignment */}
        {section.contentAlignment !== undefined && (
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8A96A6] mb-1 font-semibold">
              Text Alignment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["left", "center"].map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdateSection({ contentAlignment: align })}
                  className={`py-1.5 text-xs capitalize rounded-sm border transition-all ${
                    section.contentAlignment === align
                      ? "bg-[#C5A880] text-[#080B10] font-semibold border-[#C5A880]"
                      : "bg-[#090D14] text-[#8E9AA8] border-[#1E2838]"
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero Banner Stats Bar Toggle & Metrics */}
        {section.type === "hero_banner" && (
          <div className="p-4 bg-[#0A0E15] border border-white/10 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-white font-semibold">
                  Live Key Metrics Bar
                </span>
                <span className="text-[9px] text-[#7E8B9C]">
                  Show horizontal 4-metric statistics ticker under hero
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdateSection({ showStatsBar: !section.showStatsBar })
                }
                className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                  section.showStatsBar
                    ? "bg-[#C5A880] text-[#080B10] border-[#C5A880]"
                    : "bg-[#162030] text-[#8E9AA8] border-[#253245]"
                }`}
              >
                {section.showStatsBar ? "Enabled" : "Disabled"}
              </button>
            </div>

            {section.showStatsBar && section.stats && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="block text-[9px] uppercase tracking-wider text-[#C5A880] font-semibold">
                  Metric Counters:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {section.stats.map((stat, idx) => (
                    <div key={idx} className="bg-[#090D14] p-2 border border-[#1E2838] rounded-sm space-y-1">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const updatedStats = [...section.stats];
                          updatedStats[idx] = { ...updatedStats[idx], value: e.target.value };
                          onUpdateSection({ stats: updatedStats });
                        }}
                        placeholder="Value (e.g. 100 FT)"
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-[11px] text-white rounded-xs"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const updatedStats = [...section.stats];
                          updatedStats[idx] = { ...updatedStats[idx], label: e.target.value };
                          onUpdateSection({ stats: updatedStats });
                        }}
                        placeholder="Label"
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-[10px] text-[#8E9AA8] rounded-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* =========================================================
            TIMELINE MILESTONES REPEATER (FOR TIMELINE SECTIONS)
           ========================================================= */}
        {section.type === "timeline" && (
          <div className="p-4 bg-[#0A0E15] border border-white/10 rounded space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A880]">
                Shipyard Milestones ({section.timelineItems?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray(section.timelineItems) ? [...section.timelineItems] : [];
                  current.push({
                    id: "tl-" + Date.now(),
                    year: "2026",
                    heading: "New Shipyard Milestone",
                    description: "Describe this milestone in ASMARATY naval heritage...",
                    image: "/images/asmaraty-shipyard-facility.jpg",
                    imageAlt: "Shipyard milestone",
                    visible: true
                  });
                  onUpdateSection({ timelineItems: current });
                }}
                className="px-2.5 py-1 text-[10px] font-semibold bg-[#C5A880]/20 text-[#DFBA73] border border-[#C5A880]/40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {(section.timelineItems || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-[#080B10] border border-white/10 rounded-sm space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#C5A880]">#{idx + 1} • {item.year || "Year"}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const items = [...section.timelineItems];
                          const temp = items[idx];
                          items[idx] = items[idx - 1];
                          items[idx - 1] = temp;
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === section.timelineItems.length - 1}
                        onClick={() => {
                          const items = [...section.timelineItems];
                          const temp = items[idx];
                          items[idx] = items[idx + 1];
                          items[idx + 1] = temp;
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...section.timelineItems];
                          items[idx] = { ...items[idx], visible: items[idx].visible === false ? true : false };
                          onUpdateSection({ timelineItems: items });
                        }}
                        className={`p-1 cursor-pointer ${item.visible !== false ? "text-emerald-400" : "text-white/30"}`}
                        title={item.visible !== false ? "Visible" : "Hidden"}
                      >
                        {item.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const items = [...section.timelineItems];
                          items.splice(idx, 1);
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Year / Era</label>
                      <input
                        type="text"
                        value={item.year || ""}
                        onChange={(e) => {
                          const items = [...section.timelineItems];
                          items[idx] = { ...items[idx], year: e.target.value };
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Milestone Heading</label>
                      <input
                        type="text"
                        value={item.heading || ""}
                        onChange={(e) => {
                          const items = [...section.timelineItems];
                          items[idx] = { ...items[idx], heading: e.target.value };
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={item.description || ""}
                      onChange={(e) => {
                        const items = [...section.timelineItems];
                        items[idx] = { ...items[idx], description: e.target.value };
                        onUpdateSection({ timelineItems: items });
                      }}
                      className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Milestone Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.image || ""}
                        onChange={(e) => {
                          const items = [...section.timelineItems];
                          items[idx] = { ...items[idx], image: e.target.value };
                          onUpdateSection({ timelineItems: items });
                        }}
                        className="flex-1 px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker(`timelineItems[${idx}].image`, item.image)}
                        className="px-2 py-1 bg-[#1A2230] text-[#C5A880] text-[10px] border border-[#2A374C] flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Media</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            LEADERSHIP TEAM REPEATER (FOR LEADERSHIP SECTIONS)
           ========================================================= */}
        {section.type === "leadership_team" && (
          <div className="p-4 bg-[#0A0E15] border border-white/10 rounded space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A880]">
                Executive Members ({section.members?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray(section.members) ? [...section.members] : [];
                  current.push({
                    id: "exec-" + Date.now(),
                    name: "Executive Name",
                    role: "Designation / Role",
                    bio: "Professional biography and naval architecture background...",
                    photo: "/images/asmaraty-shipyard-facility.jpg",
                    photoAlt: "Executive photograph",
                    visible: true
                  });
                  onUpdateSection({ members: current });
                }}
                className="px-2.5 py-1 text-[10px] font-semibold bg-[#C5A880]/20 text-[#DFBA73] border border-[#C5A880]/40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-3">
              {(section.members || []).map((m, idx) => (
                <div key={m.id || idx} className="p-3 bg-[#080B10] border border-white/10 rounded-sm space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#C5A880]">#{idx + 1} • {m.name || "Member"}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const members = [...section.members];
                          const temp = members[idx];
                          members[idx] = members[idx - 1];
                          members[idx - 1] = temp;
                          onUpdateSection({ members });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === section.members.length - 1}
                        onClick={() => {
                          const members = [...section.members];
                          const temp = members[idx];
                          members[idx] = members[idx + 1];
                          members[idx + 1] = temp;
                          onUpdateSection({ members });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const members = [...section.members];
                          members[idx] = { ...members[idx], visible: members[idx].visible === false ? true : false };
                          onUpdateSection({ members });
                        }}
                        className={`p-1 cursor-pointer ${m.visible !== false ? "text-emerald-400" : "text-white/30"}`}
                      >
                        {m.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const members = [...section.members];
                          members.splice(idx, 1);
                          onUpdateSection({ members });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={m.name || ""}
                        onChange={(e) => {
                          const members = [...section.members];
                          members[idx] = { ...members[idx], name: e.target.value };
                          onUpdateSection({ members });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Role / Designation</label>
                      <input
                        type="text"
                        value={m.role || ""}
                        onChange={(e) => {
                          const members = [...section.members];
                          members[idx] = { ...members[idx], role: e.target.value };
                          onUpdateSection({ members });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Biography</label>
                    <textarea
                      rows={2}
                      value={m.bio || ""}
                      onChange={(e) => {
                        const members = [...section.members];
                        members[idx] = { ...members[idx], bio: e.target.value };
                        onUpdateSection({ members });
                      }}
                      className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Photograph URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={m.photo || ""}
                        onChange={(e) => {
                          const members = [...section.members];
                          members[idx] = { ...members[idx], photo: e.target.value };
                          onUpdateSection({ members });
                        }}
                        className="flex-1 px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenMediaPicker(`members[${idx}].photo`, m.photo)}
                        className="px-2 py-1 bg-[#1A2230] text-[#C5A880] text-[10px] border border-[#2A374C] flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>Media</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VALUES PILLARS REPEATER (FOR VALUES SECTIONS)
           ========================================================= */}
        {section.type === "values_pillars" && (
          <div className="p-4 bg-[#0A0E15] border border-white/10 rounded space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A880]">
                Values Pillars ({section.pillars?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  const current = Array.isArray(section.pillars) ? [...section.pillars] : [];
                  current.push({
                    id: "val-" + Date.now(),
                    title: "New Value Pillar",
                    desc: "Describe this core standard or brand value...",
                    icon: "Gem",
                    visible: true
                  });
                  onUpdateSection({ pillars: current });
                }}
                className="px-2.5 py-1 text-[10px] font-semibold bg-[#C5A880]/20 text-[#DFBA73] border border-[#C5A880]/40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Pillar</span>
              </button>
            </div>

            <div className="space-y-3">
              {(section.pillars || []).map((p, idx) => (
                <div key={p.id || idx} className="p-3 bg-[#080B10] border border-white/10 rounded-sm space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#C5A880]">#{idx + 1} • {p.title || "Pillar"}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const pillars = [...section.pillars];
                          const temp = pillars[idx];
                          pillars[idx] = pillars[idx - 1];
                          pillars[idx - 1] = temp;
                          onUpdateSection({ pillars });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === section.pillars.length - 1}
                        onClick={() => {
                          const pillars = [...section.pillars];
                          const temp = pillars[idx];
                          pillars[idx] = pillars[idx + 1];
                          pillars[idx + 1] = temp;
                          onUpdateSection({ pillars });
                        }}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pillars = [...section.pillars];
                          pillars[idx] = { ...pillars[idx], visible: pillars[idx].visible === false ? true : false };
                          onUpdateSection({ pillars });
                        }}
                        className={`p-1 cursor-pointer ${p.visible !== false ? "text-emerald-400" : "text-white/30"}`}
                      >
                        {p.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const pillars = [...section.pillars];
                          pillars.splice(idx, 1);
                          onUpdateSection({ pillars });
                        }}
                        className="p-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Title</label>
                      <input
                        type="text"
                        value={p.title || ""}
                        onChange={(e) => {
                          const pillars = [...section.pillars];
                          pillars[idx] = { ...pillars[idx], title: e.target.value };
                          onUpdateSection({ pillars });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Icon</label>
                      <select
                        value={p.icon || "Gem"}
                        onChange={(e) => {
                          const pillars = [...section.pillars];
                          pillars[idx] = { ...pillars[idx], icon: e.target.value };
                          onUpdateSection({ pillars });
                        }}
                        className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs"
                      >
                        <option value="Gem">Gem (Craft)</option>
                        <option value="ShieldCheck">Shield (Trust)</option>
                        <option value="Waves">Waves (Innovation)</option>
                        <option value="Users">Users (Personal)</option>
                        <option value="Sparkles">Sparkles (Luxury)</option>
                        <option value="Anchor">Anchor (Heritage)</option>
                        <option value="Award">Award (Excellence)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-0.5">Description</label>
                    <textarea
                      rows={2}
                      value={p.desc || ""}
                      onChange={(e) => {
                        const pillars = [...section.pillars];
                        pillars[idx] = { ...pillars[idx], desc: e.target.value };
                        onUpdateSection({ pillars });
                      }}
                      className="w-full px-2 py-1 bg-[#121822] border border-[#232F42] text-xs text-white rounded-xs resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-[#1C2433] bg-[#090D14] flex items-center justify-between">
        <span className="text-[11px] text-[#697688]">Live preview updated</span>
        <button
          onClick={onClose}
          className="saxdor-btn-solid !h-[38px] !min-h-[38px] !min-w-0 px-6 text-xs font-bold rounded-none cursor-pointer"
        >
          Done Editing
        </button>
      </div>
    </div>
  );
}
