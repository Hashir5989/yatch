"use client";

import { useState, useEffect } from "react";
import { 
  Images, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Edit2, 
  CheckCircle2, 
  X, 
  ZoomIn, 
  Check, 
  ExternalLink 
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import { 
  getAllMedia, 
  addMediaItem, 
  deleteMediaItem 
} from "@/lib/cmsStore";

export default function MediaLibraryScreen() {
  const [media, setMedia] = useState(() => getAllMedia());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Add Media Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("exterior");

  // Edit / Details Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const loadMedia = () => {
    setMedia(getAllMedia());
  };

  useEffect(() => {
    const handleUpdate = () => loadMedia();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddMedia = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    addMediaItem({
      url: newUrl.trim(),
      title: newTitle.trim() || "ASMARATY Yacht Photo",
      alt: newAlt.trim() || newTitle.trim() || "Luxury yacht",
      category: newCategory,
    });

    setIsAddModalOpen(false);
    setNewUrl("");
    setNewTitle("");
    setNewAlt("");
    loadMedia();
    showToast("Added new media asset");
  };

  const handleDelete = (id, title) => {
    if (confirm(`Remove "${title}" from the media library?`)) {
      deleteMediaItem(id);
      loadMedia();
      showToast("Media deleted");
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard?.writeText(url);
    showToast("Image URL copied to clipboard");
  };

  const categories = [
    { id: "all", label: "All Media" },
    { id: "exterior", label: "Exterior" },
    { id: "interior", label: "Interior" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "shipyard", label: "Shipyard" },
  ];

  const filteredMedia = media.filter((item) => {
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Media Asset Library" 
        subtitle="Manage photography, editorial assets, and yacht imagery for CMS sections"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl font-light text-white tracking-wide">
              Media Assets ({filteredMedia.length})
            </h1>
            <p className="text-xs text-[#828F9E] mt-1">
              Curated luxury yacht photography used across website pages and fleet specifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 bg-[#0E141E] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Add Media Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image URL</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-[#C5A880] text-[#080B10] font-semibold"
                  : "bg-[#0E141D] text-[#8E9AA8] hover:text-white border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-[#0A0D15] rounded-sm border border-[#1A2230] hover:border-[#C5A880]/60 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setLightboxUrl(item.url)}
                      className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors"
                      title="Zoom Preview"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="absolute top-2 left-2 text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/80 text-[#C5A880] font-medium tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5">
                  <h4 className="text-xs text-white font-medium truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-[#697688] truncate mt-1" title={item.alt}>
                    Alt: {item.alt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#556375] mt-2 pt-2 border-t border-white/5">
                    <span>{item.dimensions || "2000 x 1200"}</span>
                    <span>{item.uploadedAt}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-[#18202D] flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(item.url)}
                  className="text-[11px] text-[#8E9AA8] hover:text-[#C5A880] flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy URL</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="text-[#8E9AA8] hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-colors"
                  title="Delete media item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== ADD IMAGE MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2636] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg text-white font-medium">
                  Add Image by URL
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8E9AA8] hover:text-white p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Image Direct URL (https://...) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Image Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AS 100 Upper Deck Jacuzzi"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Alt Text Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heated glass-edge spa pool on flybridge"
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="exterior">Exterior</option>
                  <option value="interior">Interior</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="shipyard">Shipyard</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2636]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider"
                >
                  Save to Media Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== LIGHTBOX MODAL ==================== */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-sm border border-white/10"
          />
        </div>
      )}
    </div>
  );
}
