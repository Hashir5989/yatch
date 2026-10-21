"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check, Image as ImageIcon } from "lucide-react";
import { getAllMedia, addMediaItem } from "@/lib/cmsStore";

export default function MediaPickerModal({ isOpen, onClose, onSelectImage, currentImageUrl = "" }) {
  const [mediaList, setMediaList] = useState(() => getAllMedia());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageTitle, setNewImageTitle] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setMediaList(getAllMedia());
    };
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "All Assets" },
    { id: "exterior", label: "Exterior" },
    { id: "interior", label: "Interior" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "shipyard", label: "Shipyard" },
  ];

  const filteredMedia = mediaList.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddCustomImage = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    const newItem = addMediaItem({
      url: newImageUrl.trim(),
      title: newImageTitle.trim() || "Uploaded Yacht Media",
      category: activeCategory === "all" ? "exterior" : activeCategory
    });
    setMediaList(getAllMedia());
    onSelectImage(newItem.url, newItem.title);
    setShowAddForm(false);
    setNewImageUrl("");
    setNewImageTitle("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1E2636] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-medium">
                Select from Media Library
              </h3>
              <p className="text-xs text-[#828F9E]">
                Choose an asset or add an image URL
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
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121822] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          {/* Category Tabs */}
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

          {/* Add Image Toggle Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#1A2230] hover:bg-[#253044] text-[#C5A880] text-xs font-medium border border-[#2B384E] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add by URL</span>
          </button>
        </div>

        {/* Optional Add Image by URL Panel */}
        {showAddForm && (
          <form
            onSubmit={handleAddCustomImage}
            className="p-4 bg-[#141B26] border-b border-[#222C3D] flex flex-wrap gap-3 items-center"
          >
            <input
              type="url"
              required
              placeholder="Paste Image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 min-w-[240px] px-3 py-2 bg-[#0A0D14] border border-[#222B3A] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
            <input
              type="text"
              placeholder="Image title / label"
              value={newImageTitle}
              onChange={(e) => setNewImageTitle(e.target.value)}
              className="w-48 px-3 py-2 bg-[#0A0D14] border border-[#222B3A] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
            <button
              type="submit"
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm tracking-wider"
            >
              Add & Select
            </button>
          </form>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = currentImageUrl === item.url;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectImage(item.url, item.title);
                  onClose();
                }}
                className={`group relative rounded-sm overflow-hidden border cursor-pointer bg-[#0A0E15] transition-all duration-200 flex flex-col ${
                  isSelected
                    ? "border-[#C5A880] ring-2 ring-[#C5A880]"
                    : "border-[#1E2636] hover:border-[#C5A880]/60 hover:shadow-lg"
                }`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="btn-gold text-[10px] px-3 py-1 font-semibold rounded-sm tracking-wider">
                      Select
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C5A880] text-[#080B10] flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/70 text-[#C5A880]">
                    {item.category}
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-[#E0E6EF] font-medium truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[#6E7B8C] truncate mt-0.5">
                    {item.dimensions || "2000 x 1200"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2636] bg-[#0A0E15] flex items-center justify-between text-xs text-[#828F9E]">
          <span>Showing {filteredMedia.length} luxury assets</span>
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
