"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Anchor, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Check, 
  X, 
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUpDown
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import { 
  getAllYachts, 
  saveYacht, 
  deleteYacht,
  reorderYachts,
  togglePublishYacht,
  syncYachtsFromServer
} from "@/lib/cmsStore";

export default function YachtManagementScreen() {
  const [yachts, setYachts] = useState(() => getAllYachts());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Edit / Create Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentYacht, setCurrentYacht] = useState(null);
  const [newHighlight, setNewHighlight] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Media Picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState("mainImage");

  const loadYachts = () => {
    setYachts(getAllYachts());
  };

  useEffect(() => {
    syncYachtsFromServer().then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachts(synced);
      }
    });
    const handleUpdate = () => loadYachts();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setCurrentYacht({
      id: `yacht-${Date.now()}`,
      name: "",
      slug: "",
      category: "Superyacht",
      tagline: "",
      series: "G-Series",
      description: "",
      mainImage: "/images/yachts/g100.jpg",
      gallery: [],
      featured: false,
      status: "published",
      displayOrder: yachts.length + 1,
      specs: {
        lengthOverall: "",
        hullMaterial: "Vacuum-Infused Composite",
      },
      highlights: [
        "Contemporary aesthetic with generous living spaces",
        "Refined interior and exterior deck integration"
      ]
    });
    setNewHighlight("");
    setNewGalleryUrl("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (yacht) => {
    setCurrentYacht(JSON.parse(JSON.stringify(yacht)));
    setNewHighlight("");
    setNewGalleryUrl("");
    setIsEditorOpen(true);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}" from the yacht catalog? This action will remove it from the authoritative content source.`)) {
      deleteYacht(id);
      loadYachts();
      showToast(`Deleted "${name}"`);
    }
  };

  const handleTogglePublish = (yacht) => {
    const updated = togglePublishYacht(yacht.id);
    if (updated) {
      loadYachts();
      const statusLabel = updated.status === "published" ? "Published live" : "Unpublished (Draft)";
      showToast(`"${yacht.name}" is now ${statusLabel}`);
    }
  };

  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const reorderedList = [...yachts];
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[index - 1];
    reorderedList[index - 1] = temp;

    const orderedIds = reorderedList.map((y) => y.id);
    const updated = reorderYachts(orderedIds);
    setYachts(updated);
    showToast(`Moved "${temp.name}" up (Order #${index})`);
  };

  const handleMoveDown = (index) => {
    if (index >= yachts.length - 1) return;
    const reorderedList = [...yachts];
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[index + 1];
    reorderedList[index + 1] = temp;

    const orderedIds = reorderedList.map((y) => y.id);
    const updated = reorderYachts(orderedIds);
    setYachts(updated);
    showToast(`Moved "${temp.name}" down (Order #${index + 2})`);
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim() || !currentYacht) return;
    const currentHighlights = currentYacht.highlights || [];
    setCurrentYacht({
      ...currentYacht,
      highlights: [...currentHighlights, newHighlight.trim()]
    });
    setNewHighlight("");
  };

  const handleRemoveHighlight = (idxToRemove) => {
    if (!currentYacht) return;
    const currentHighlights = currentYacht.highlights || [];
    setCurrentYacht({
      ...currentYacht,
      highlights: currentHighlights.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim() || !currentYacht) return;
    const currentGallery = currentYacht.gallery || [];
    setCurrentYacht({
      ...currentYacht,
      gallery: [...currentGallery, newGalleryUrl.trim()]
    });
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (idxToRemove) => {
    if (!currentYacht) return;
    const currentGallery = currentYacht.gallery || [];
    setCurrentYacht({
      ...currentYacht,
      gallery: currentGallery.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleSaveYacht = (e) => {
    e.preventDefault();
    if (!currentYacht.name.trim()) return;

    let slug = (currentYacht.slug || "").trim();
    if (!slug) {
      slug = currentYacht.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const order = parseInt(currentYacht.displayOrder, 10);
    const displayOrder = isNaN(order) ? (yachts.length + 1) : order;

    saveYacht({
      ...currentYacht,
      slug,
      displayOrder,
    });

    setIsEditorOpen(false);
    loadYachts();
    showToast(`Saved "${currentYacht.name}" to database`);
  };

  const filteredYachts = yachts.filter((y) => {
    const matchesCat = activeCategory === "all" || y.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesQuery = !searchQuery || 
      y.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (y.description && y.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Yacht Models & Fleet" 
        subtitle="Authoritative model management: add, edit, reorder, publish, or remove vessels"
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
            <h1 className="font-serif text-2xl font-light text-white tracking-wide flex items-center gap-3">
              <span>Authoritative Fleet Collection</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-[#0E1A2D] text-[#C6A155] border border-[#C6A155]/30 rounded">
                {yachts.length} {yachts.length === 1 ? "Model" : "Models"}
              </span>
            </h1>
            <p className="text-xs text-[#828F9E] mt-1">
              Changes persist in real time and automatically reflect on the public Home page collection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 bg-[#0E141E] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Add Yacht Button */}
            <button
              onClick={handleOpenCreate}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Yacht Model</span>
            </button>
          </div>
        </div>

        {/* Yacht Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredYachts.map((yacht, idx) => (
            <div
              key={yacht.id}
              className={`bg-[#0A0D15] rounded-sm border overflow-hidden transition-all flex flex-col justify-between group ${
                yacht.status === "published"
                  ? "border-[#1A2230] hover:border-[#C5A880]/60"
                  : "border-amber-900/30 opacity-75"
              }`}
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-56 overflow-hidden bg-black">
                  <img
                    src={yacht.mainImage}
                    alt={yacht.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-transparent"></div>

                  {/* Top Left: Order & Series */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#080B10]/90 text-[#C6A155] border border-[#C6A155]/40 rounded-sm">
                      #{idx + 1}
                    </span>
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-[#080B10]/85 backdrop-blur-md text-[#E0C7A6] border border-white/10 rounded-sm">
                      {yacht.category}
                    </span>
                    {yacht.featured && (
                      <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#C5A880] text-[#080B10] rounded-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>

                  {/* Top Right: One-Click Publish / Unpublish Toggle */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(yacht)}
                      className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                        yacht.status === "published"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-600 hover:bg-emerald-900"
                          : "bg-amber-950/90 text-amber-300 border border-amber-600 hover:bg-amber-900"
                      }`}
                      title="Click to toggle publication"
                    >
                      {yacht.status === "published" ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          <span>Draft (Hidden)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Bottom: Length */}
                  <div className="absolute bottom-3 left-3 font-mono text-xs text-[#E8EAEE] bg-black/60 px-2 py-0.5 rounded">
                    {yacht.specs?.lengthOverall || yacht.length || "Length: Pending"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl font-normal text-white group-hover:text-[#DFBA73] transition-colors">
                        {yacht.name}
                      </h3>
                      {yacht.tagline && (
                        <p className="text-[11px] text-[#C5A880] uppercase tracking-wider mt-0.5 font-sans">
                          {yacht.tagline}
                        </p>
                      )}
                    </div>

                    {/* Order Adjustment Controls */}
                    <div className="flex items-center gap-1 bg-[#0E1522] border border-white/10 rounded p-1">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className={`p-1 rounded transition-colors ${
                          idx === 0 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-[#C6A155] hover:bg-white/5 cursor-pointer"
                        }`}
                        title="Move Up in Display Order"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-white/50 px-1">
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === yachts.length - 1}
                        className={`p-1 rounded transition-colors ${
                          idx === yachts.length - 1 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-[#C6A155] hover:bg-white/5 cursor-pointer"
                        }`}
                        title="Move Down in Display Order"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#8E9EAF] line-clamp-2 leading-relaxed font-light">
                    {yacht.description || "No description provided."}
                  </p>

                  {/* Highlights list */}
                  {yacht.highlights && yacht.highlights.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <ul className="space-y-1 text-[11px] text-white/70">
                        {yacht.highlights.slice(0, 2).map((h, hIdx) => (
                          <li key={hIdx} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3 h-3 text-[#C6A155] flex-shrink-0" />
                            <span className="truncate">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(yacht)}
                  className="flex-1 py-2 px-3 rounded-sm bg-[#162030] hover:bg-[#C5A880] hover:text-[#080B10] text-[#D1D9E4] text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Model</span>
                </button>

                <Link
                  href="/#fleet"
                  className="py-2 px-3 rounded-sm text-[#8E9AA8] hover:text-white bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium flex items-center gap-1.5"
                  title="View on Home Page"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Home View</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(yacht.id, yacht.name)}
                  className="p-2 rounded-sm text-[#8E9AA8] hover:text-red-400 hover:bg-red-950/20 transition-colors cursor-pointer"
                  title="Delete Model"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== CREATE / EDIT YACHT DRAWER MODAL ==================== */}
      {isEditorOpen && currentYacht && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#1E2636] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    {currentYacht.name ? `Edit Model: ${currentYacht.name}` : "Create New Yacht Model"}
                  </h3>
                  <p className="text-xs text-[#828F9E]">
                    Configure verified naval specifications, display order, imagery, and copywriting
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-[#8E9AA8] hover:text-white p-1.5 rounded hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveYacht} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Yacht Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. G100 or AS 77"
                    value={currentYacht.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setCurrentYacht({ ...currentYacht, name, slug: currentYacht.slug || slug });
                    }}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Display Order (Position)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentYacht.displayOrder ?? 1}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm font-mono text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="g100"
                    value={currentYacht.slug}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs font-mono text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Category / Series
                  </label>
                  <select
                    value={currentYacht.category || "Superyacht"}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="Superyacht">Superyacht</option>
                    <option value="Flybridge">Flybridge</option>
                    <option value="Cruiser">Cruiser</option>
                    <option value="Explorer">Explorer</option>
                    <option value="Offshore">Offshore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Publication Status
                  </label>
                  <select
                    value={currentYacht.status || "published"}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="published">Published (Visible on Home)</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Tagline / Essence
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Flagship of the G-Series"
                  value={currentYacht.tagline || ""}
                  onChange={(e) => setCurrentYacht({ ...currentYacht, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Full Editorial Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the vessel's architecture, living spaces, and luxury appointments..."
                  value={currentYacht.description || ""}
                  onChange={(e) => setCurrentYacht({ ...currentYacht, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Main Showcase Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={currentYacht.mainImage || ""}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, mainImage: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTargetField("mainImage");
                      setMediaPickerOpen(true);
                    }}
                    className="px-3 py-2 rounded-sm bg-[#1A2230] hover:bg-[#C5A880] hover:text-[#080B10] text-[#C5A880] text-xs font-medium border border-[#2A374C] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Media</span>
                  </button>
                </div>
              </div>

              {/* Verified Specifications Grid */}
              <div className="p-4 bg-[#0A0D14] border border-[#1C2534] rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif text-[#C5A880] uppercase tracking-wider font-medium">
                    Verified Specifications
                  </span>
                  <span className="text-[10px] text-[#8E9AA8] italic">
                    Optional — only enter verified client information; leave blank if unavailable
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">LOA / Length</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.lengthOverall || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, lengthOverall: e.target.value },
                        })
                      }
                      placeholder="e.g. 100 ft"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Hull Material</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.hullMaterial || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, hullMaterial: e.target.value },
                        })
                      }
                      placeholder="e.g. Vacuum-Infused Composite"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Beam (Width)</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.beam || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, beam: e.target.value },
                        })
                      }
                      placeholder="Leave blank if unverified"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Draft</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.draft || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, draft: e.target.value },
                        })
                      }
                      placeholder="Leave blank if unverified"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Engines</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.engines || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, engines: e.target.value },
                        })
                      }
                      placeholder="Leave blank if unverified"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Max Speed</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.maxSpeed || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, maxSpeed: e.target.value },
                        })
                      }
                      placeholder="Leave blank if unverified"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Highlights Manager */}
              <div className="p-4 bg-[#0A0D14] border border-[#1C2534] rounded-sm space-y-3">
                <span className="text-xs font-serif text-[#C5A880] uppercase tracking-wider font-medium block">
                  Model Highlights & Key Features
                </span>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add verified highlight..."
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHighlight();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-3 py-1.5 rounded-sm bg-[#162030] hover:bg-[#C5A880] hover:text-[#080B10] text-[#D1D9E4] text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {(currentYacht.highlights || []).map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center justify-between p-2 bg-[#101622] border border-white/5 rounded text-xs text-white/80">
                      <span>{hl}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(hIdx)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Remove highlight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2636]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider cursor-pointer"
                >
                  Save Model Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectImage={(url) => {
          if (currentYacht) {
            setCurrentYacht({ ...currentYacht, mainImage: url });
          }
        }}
        currentImageUrl={currentYacht?.mainImage || ""}
      />
    </div>
  );
}
