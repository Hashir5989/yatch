"use client";

import { useState } from "react";
import { 
  X, 
  Plus, 
  Sparkles, 
  Layout, 
  Maximize2, 
  Grid, 
  Award, 
  Images, 
  PlayCircle, 
  FileText, 
  TrendingUp, 
  Compass, 
  Mail,
  Search
} from "lucide-react";
import { SECTION_TEMPLATES } from "@/lib/data/sectionTemplates";

const ICON_MAP = {
  Sparkles,
  Layout,
  Maximize2,
  Grid,
  Award,
  Images,
  PlayCircle,
  FileText,
  TrendingUp,
  Compass,
  Mail,
};

export default function SectionLibraryModal({ isOpen, onClose, onAddSection }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Sections (11)" },
    { id: "Hero & Headers", label: "Hero & Headers" },
    { id: "Showcase & Media", label: "Showcase & Media" },
    { id: "Content & Editorial", label: "Content & Editorial" },
    { id: "Interactive & Forms", label: "Interactive & Forms" },
  ];

  const filteredTemplates = SECTION_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === "all" || tpl.category === activeCategory;
    const matchesQuery = !searchQuery || 
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1E2636] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-medium">
                Insert Predefined Section
              </h3>
              <p className="text-xs text-[#828F9E]">
                Select a reusable section to insert into your page layout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E9AA8] hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#1E2636] bg-[#0A0E15] flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B788A]" />
            <input
              type="text"
              placeholder="Search section library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121822] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-sm transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-[#C5A880] text-[#080B10] font-medium"
                    : "text-[#8E9AA8] hover:text-white hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => {
            const Icon = ICON_MAP[tpl.icon] || Layout;
            return (
              <div
                key={tpl.type}
                className="group bg-[#0A0E15] rounded-sm border border-[#1E2636] hover:border-[#C5A880]/60 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-xl"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-black/60">
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E15] via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#080B10]/85 backdrop-blur-md border border-white/10 text-[10px] text-[#C5A880] font-medium">
                      <Icon className="w-3 h-3" />
                      <span>{tpl.category}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h4 className="font-serif text-lg text-white font-medium group-hover:text-[#F5E6D3] transition-colors">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-[#828F9E] mt-2 leading-relaxed font-light">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      const newSectionData = tpl.createDefaultData();
                      onAddSection(newSectionData);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-sm bg-[#161E2C] hover:bg-[#C5A880] hover:text-[#080B10] text-[#D1D9E4] text-xs font-semibold tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Section</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2636] bg-[#0A0E15] flex items-center justify-between text-xs text-[#828F9E]">
          <span>Choose from 11 pre-engineered ASMARATY luxury section archetypes</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm border border-[#2B3548] text-[#D1D9E4] hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
