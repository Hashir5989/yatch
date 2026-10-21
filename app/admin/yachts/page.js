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
  EyeOff
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import { 
  getAllYachts, 
  saveYacht, 
  deleteYacht 
} from "@/lib/cmsStore";

export default function YachtManagementScreen() {
  const [yachts, setYachts] = useState(() => getAllYachts());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Edit / Create Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentYacht, setCurrentYacht] = useState(null);

  // Media Picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState("mainImage");

  const loadYachts = () => {
    setYachts(getAllYachts());
  };

  useEffect(() => {
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
      series: "Custom Series",
      description: "",
      mainImage: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=2000&q=80",
      gallery: [],
      featured: false,
      status: "published",
      specs: {
        lengthOverall: "75 ft (22.8m)",
        beam: "18.5 ft (5.6m)",
        draft: "3.8 ft (1.15m)",
        engines: "Twin CAT 1200 HP",
        maxSpeed: "30 Knots",
        cruisingSpeed: "24 Knots",
        staterooms: "3 En-suites",
        guests: "6 Guests",
        crew: "2 Crew",
        hullMaterial: "Vacuum-Infused Composite",
      },
      highlights: [
        "Custom handcrafted Italian leather appointments",
        "Zero-speed gyroscopic stabilizer",
        "Hydraulic swim platform"
      ]
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (yacht) => {
    setCurrentYacht(JSON.parse(JSON.stringify(yacht)));
    setIsEditorOpen(true);
  };

  const handleDelete = (id, name) => {
    if (confirm(`Delete "${name}" from the yacht catalog?`)) {
      deleteYacht(id);
      loadYachts();
      showToast(`Deleted ${name}`);
    }
  };

  const handleSaveYacht = (e) => {
    e.preventDefault();
    if (!currentYacht.name.trim()) return;

    let slug = currentYacht.slug.trim();
    if (!slug) {
      slug = currentYacht.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    saveYacht({
      ...currentYacht,
      slug,
    });

    setIsEditorOpen(false);
    loadYachts();
    showToast(`Saved "${currentYacht.name}"`);
  };

  const filteredYachts = yachts.filter((y) => {
    const matchesCat = activeCategory === "all" || y.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesQuery = !searchQuery || 
      y.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      y.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Yacht Models & Fleet" 
        subtitle="Manage vessel specifications, imagery, status, and public catalog records"
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
              Yacht Catalog ({yachts.length})
            </h1>
            <p className="text-xs text-[#828F9E] mt-1">
              Add or edit vessel models. All changes immediately reflect on the public fleet pages.
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
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Add Yacht Model</span>
            </button>
          </div>
        </div>

        {/* Yacht Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYachts.map((yacht) => (
            <div
              key={yacht.id}
              className="bg-[#0A0D15] rounded-sm border border-[#1A2230] overflow-hidden hover:border-[#C5A880]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Badges */}
                <div className="relative h-48 overflow-hidden bg-black">
                  <img
                    src={yacht.mainImage}
                    alt={yacht.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-[#080B10]/85 backdrop-blur-md text-[#E0C7A6] border border-[#C5A880]/30 rounded-sm">
                      {yacht.category}
                    </span>
                    {yacht.featured && (
                      <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#C5A880] text-[#080B10] rounded-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Flagship</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {yacht.status === "published" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 font-serif text-xs text-[#E8EAEE]">
                    {yacht.specs?.lengthOverall}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-serif text-xl font-medium text-white group-hover:text-[#F5E6D3] transition-colors">
                    {yacht.name}
                  </h3>
                  <p className="text-[11px] text-[#C5A880] uppercase tracking-wider mt-0.5 mb-3 font-sans">
                    {yacht.tagline || yacht.series}
                  </p>
                  <p className="text-xs text-[#7E8B9C] line-clamp-2 leading-relaxed font-light mb-4">
                    {yacht.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/5 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#5E6B7C] block uppercase">Speed</span>
                      <span className="text-white font-medium">{yacht.specs?.maxSpeed || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E6B7C] block uppercase">Cabins</span>
                      <span className="text-white font-medium">{yacht.specs?.staterooms?.split(" ")[0] || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5E6B7C] block uppercase">Guests</span>
                      <span className="text-white font-medium">{yacht.specs?.guests?.split(" ")[0] || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(yacht)}
                  className="flex-1 py-2 px-3 rounded-sm bg-[#162030] hover:bg-[#C5A880] hover:text-[#080B10] text-[#D1D9E4] text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Model</span>
                </button>

                <Link
                  href={`/yachts/${yacht.slug}`}
                  target="_blank"
                  className="p-2 rounded-sm text-[#8E9AA8] hover:text-white hover:bg-white/5 transition-colors"
                  title="View Public Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDelete(yacht.id, yacht.name)}
                  className="p-2 rounded-sm text-[#8E9AA8] hover:text-red-400 hover:bg-red-950/20 transition-colors"
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
                    {currentYacht.name ? `Edit ${currentYacht.name}` : "Create Yacht Model"}
                  </h3>
                  <p className="text-xs text-[#828F9E]">
                    Configure naval specifications, imagery, and marketing copy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-[#8E9AA8] hover:text-white p-1.5 rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveYacht} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Yacht Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AS 100 Superyacht"
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
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="as-100"
                    value={currentYacht.slug}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm font-mono text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Category Series
                  </label>
                  <select
                    value={currentYacht.category}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="Superyacht">Superyacht</option>
                    <option value="Explorer">Explorer</option>
                    <option value="Flybridge">Flybridge</option>
                    <option value="Sports Cruiser">Sports Cruiser</option>
                    <option value="Island Explorer">Island Explorer</option>
                    <option value="Offshore">Offshore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Featured Flagship
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="featured-check"
                      checked={currentYacht.featured || false}
                      onChange={(e) => setCurrentYacht({ ...currentYacht, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#C5A880]"
                    />
                    <label htmlFor="featured-check" className="text-white text-xs">
                      Mark as Flagship Showcase
                    </label>
                  </div>
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
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Tagline / Essence
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Pinnacle of Arabian Gulf Naval Architecture"
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
                  placeholder="Describe the vessel's architecture, sea trial performance, and craftsmanship..."
                  value={currentYacht.description || ""}
                  onChange={(e) => setCurrentYacht({ ...currentYacht, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
                />
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                  Main Showcase Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={currentYacht.mainImage}
                    onChange={(e) => setCurrentYacht({ ...currentYacht, mainImage: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaTargetField("mainImage");
                      setMediaPickerOpen(true);
                    }}
                    className="px-3 py-2 rounded-sm bg-[#1A2230] hover:bg-[#C5A880] hover:text-[#080B10] text-[#C5A880] text-xs font-medium border border-[#2A374C] flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Browse Media</span>
                  </button>
                </div>
              </div>

              {/* Technical Specs Grid */}
              <div className="p-4 bg-[#0A0D14] border border-[#1C2534] rounded-sm space-y-4">
                <span className="text-xs font-serif text-[#C5A880] uppercase tracking-wider font-medium block">
                  Technical Specifications
                </span>

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
                      placeholder="100 ft (30.5m)"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Beam</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.beam || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, beam: e.target.value },
                        })
                      }
                      placeholder="22.8 ft (6.95m)"
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
                      placeholder="4.8 ft (1.46m)"
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
                      placeholder="28 Knots"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Cruising Speed</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.cruisingSpeed || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, cruisingSpeed: e.target.value },
                        })
                      }
                      placeholder="22 Knots"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Staterooms</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.staterooms || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, staterooms: e.target.value },
                        })
                      }
                      placeholder="5 Luxury En-suites"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Guests Sleeping</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.guests || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, guests: e.target.value },
                        })
                      }
                      placeholder="10 Guests"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7E8B9C] mb-1">Crew Cabins</label>
                    <input
                      type="text"
                      value={currentYacht.specs?.crew || ""}
                      onChange={(e) =>
                        setCurrentYacht({
                          ...currentYacht,
                          specs: { ...currentYacht.specs, crew: e.target.value },
                        })
                      }
                      placeholder="4 Crew in 2 Cabins"
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
                      placeholder="Twin CAT C32 1900 HP"
                      className="w-full px-2.5 py-1.5 bg-[#101622] border border-[#1E2838] rounded-sm text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#1E2636]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider"
                >
                  Save Yacht Record
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
