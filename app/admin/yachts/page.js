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
  AlertTriangle,
  Check,
  X,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  FileText,
  Copy,
  Info,
  Sliders,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import {
  getAllYachts,
  saveYacht,
  saveYachtAsync,
  deleteYacht,
  deleteYachtAsync,
  duplicateYacht,
  duplicateYachtAsync,
  reorderYachts,
  reorderYachtsAsync,
  togglePublishYacht,
  togglePublishYachtAsync,
  syncYachtsFromServer
} from "@/lib/cmsStore";

export default function YachtManagementScreen() {
  const [yachts, setYachts] = useState(() => getAllYachts());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general | specs | media | commercial | narrative | seo
  const [currentYacht, setCurrentYacht] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Highlighting & Media Sub-inputs
  const [newHighlight, setNewHighlight] = useState("");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryAlt, setNewGalleryAlt] = useState("");

  // Media Picker
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState("heroImage"); // heroImage | gallery | floorplan

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, yacht: null });

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

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // OPEN CREATE MODAL
  // -------------------------------------------------------------
  const handleOpenCreate = () => {
    const timestamp = Date.now();
    setCurrentYacht({
      id: `yacht-${timestamp}`,
      name: "",
      fullName: "",
      modelNumber: "",
      slug: "",
      category: "Superyacht",
      categoryKey: "superyacht",
      categoryLabel: "Superyacht",
      series: "G-Series",
      decks: "Super Yacht",
      badge: "Luxury Vessel",
      tagline: "",
      summaryLine: "",
      description: "",
      length: "",
      mainImage: "/images/yachts/g100/0.jpg",
      heroImage: "/images/yachts/g100/0.jpg",
      primaryImage: "/images/yachts/g100/0.jpg",
      gallery: [],
      brochureUrl: "",
      brochureLabel: "Download Brochure (PDF)",
      floorplanUrl: "",
      featured: false,
      status: "draft",
      displayOrder: yachts.length + 1,
      specsSnapshot: {
        loa: "",
        lwl: "",
        beam: "",
        draft: "",
        power: "",
        cabins: "",
        berths: "",
        displacement: "",
        fuel: "",
        water: "",
        hull: "Hand-Laid Composite",
      },
      comparisonMatrix: {
        loa: "",
        lwl: "",
        beam: "",
        draft: "",
        displacement: "",
        power: "",
        cabins: "",
        berths: "",
        fuel: "",
        water: "",
        hull: "Hand-Laid Composite",
      },
      specs: {
        lengthOverall: "",
        hullConstruction: "Vacuum-Infused Honeycomb Composite",
      },
      highlights: [
        "Hand-laid honeycomb composite hull and superstructure",
        "Generous panoramic owner stateroom and formal dining salon"
      ],
      keyMetrics: [
        { label: "Length Overall (LOA)", main: "", sub: "" },
        { label: "Maximum Beam", main: "", sub: "" },
        { label: "Propulsion Power", main: "", sub: "" },
        { label: "Accommodations", main: "", sub: "" },
        { label: "Displacement", main: "", sub: "" },
        { label: "Fuel Capacity", main: "", sub: "" }
      ],
      narrative: {
        eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
        headline: "",
        paragraphs: [
          "Engineered with marine architectural mastery, this vessel represents the pinnacle of modern luxury yacht building in the UAE."
        ],
        cards: []
      },
      deckPlans: [],
      seo: {
        title: "",
        description: "",
        ogImage: ""
      }
    });

    setValidationError(null);
    setActiveTab("general");
    setNewHighlight("");
    setNewGalleryUrl("");
    setNewGalleryAlt("");
    setIsEditorOpen(true);
  };

  // -------------------------------------------------------------
  // OPEN EDIT MODAL
  // -------------------------------------------------------------
  const handleOpenEdit = (yacht) => {
    // Deep clone to ensure editing does not mutate until explicitly saved
    const cloned = JSON.parse(JSON.stringify(yacht));

    // Ensure nested structures are gracefully pre-filled
    cloned.specsSnapshot = cloned.specsSnapshot || {};
    cloned.comparisonMatrix = cloned.comparisonMatrix || {};
    cloned.specs = cloned.specs || {};
    cloned.highlights = cloned.highlights || [];
    cloned.gallery = cloned.gallery || [];
    cloned.keyMetrics = cloned.keyMetrics || [];
    cloned.narrative = cloned.narrative || {
      eyebrow: "AT A GLANCE • ARCHITECTURAL NARRATIVE",
      headline: "",
      paragraphs: [],
      cards: []
    };
    cloned.deckPlans = cloned.deckPlans || [];
    cloned.seo = cloned.seo || {};

    if (!cloned.categoryKey && cloned.category) {
      const catLower = cloned.category.toLowerCase();
      if (catLower.includes("luxury motor yacht")) cloned.categoryKey = "luxury-motor-yacht";
      else if (catLower.includes("two-deck") || catLower.includes("two deck") || catLower.includes("three-deck") || catLower.includes("three deck")) cloned.categoryKey = "two-deck";
      else if (catLower.includes("flybridge")) cloned.categoryKey = "flybridge";
      else if (catLower.includes("motor yacht") || catLower.includes("motor-yacht")) cloned.categoryKey = "motor-yacht";
      else if (catLower.includes("cruiser")) cloned.categoryKey = "cruiser";
      else if (catLower.includes("offshore")) cloned.categoryKey = "offshore";
      else cloned.categoryKey = "superyacht";
    }

    setCurrentYacht(cloned);
    setValidationError(null);
    setActiveTab("general");
    setNewHighlight("");
    setNewGalleryUrl("");
    setNewGalleryAlt("");
    setIsEditorOpen(true);
  };

  // -------------------------------------------------------------
  // DUPLICATE YACHT
  // -------------------------------------------------------------
  const handleDuplicate = async (yacht) => {
    const res = await duplicateYachtAsync(yacht.id);
    if (res && res.success) {
      loadYachts();
      showToast(`Duplicated "${yacht.name}". New draft created as "${res.yacht?.name}".`);
    } else {
      showToast(res?.error || "Failed to duplicate yacht model.", "error");
    }
  };

  // -------------------------------------------------------------
  // DELETE ACTIONS
  // -------------------------------------------------------------
  const handleOpenDelete = (yacht) => {
    setDeleteModal({ isOpen: true, yacht });
  };

  const handleConfirmDelete = async () => {
    const yacht = deleteModal.yacht;
    if (!yacht) return;

    const res = await deleteYachtAsync(yacht.id);
    if (res.success) {
      loadYachts();
      showToast(`Permanently deleted "${yacht.name || yacht.modelNumber}" from database.`);
    } else {
      showToast(res.error || "Failed to delete yacht.", "error");
    }
    setDeleteModal({ isOpen: false, yacht: null });
  };

  // -------------------------------------------------------------
  // TOGGLE PUBLISH / UNPUBLISH
  // -------------------------------------------------------------
  const handleTogglePublish = async (yacht) => {
    const res = await togglePublishYachtAsync(yacht.id);
    if (res && res.success) {
      loadYachts();
      const statusLabel = res.yacht?.status === "published" ? "Published live" : "Unpublished (Draft)";
      showToast(`"${yacht.name}" is now ${statusLabel}`);
    } else {
      showToast(res?.error || "Failed to toggle yacht status", "error");
    }
  };

  // -------------------------------------------------------------
  // REORDERING
  // -------------------------------------------------------------
  const handleMoveUp = async (index) => {
    if (index <= 0) return;
    const reorderedList = [...yachts];
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[index - 1];
    reorderedList[index - 1] = temp;

    const orderedIds = reorderedList.map((y) => y.id);
    setYachts(reorderedList);
    showToast(`Moved "${temp.name || temp.modelNumber}" up (Order #${index})`);
    await reorderYachtsAsync(orderedIds);
  };

  const handleMoveDown = async (index) => {
    if (index >= yachts.length - 1) return;
    const reorderedList = [...yachts];
    const temp = reorderedList[index];
    reorderedList[index] = reorderedList[index + 1];
    reorderedList[index + 1] = temp;

    const orderedIds = reorderedList.map((y) => y.id);
    setYachts(reorderedList);
    showToast(`Moved "${temp.name || temp.modelNumber}" down (Order #${index + 2})`);
    await reorderYachtsAsync(orderedIds);
  };

  // -------------------------------------------------------------
  // GALLERY MANAGEMENT
  // -------------------------------------------------------------
  const handleAddGalleryImage = (urlToAdd) => {
    const url = (urlToAdd || newGalleryUrl || "").trim();
    if (!url || !currentYacht) return;

    const currentGallery = currentYacht.gallery || [];
    // Support string URLs or object gallery items
    setCurrentYacht({
      ...currentYacht,
      gallery: [...currentGallery, url]
    });
    setNewGalleryUrl("");
    setNewGalleryAlt("");
  };

  const handleRemoveGalleryImage = (idxToRemove) => {
    if (!currentYacht) return;
    const currentGallery = currentYacht.gallery || [];
    setCurrentYacht({
      ...currentYacht,
      gallery: currentGallery.filter((_, idx) => idx !== idxToRemove)
    });
  };

  const handleMoveGalleryImage = (idx, direction) => {
    if (!currentYacht) return;
    const currentGallery = [...(currentYacht.gallery || [])];
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentGallery.length) return;

    const temp = currentGallery[idx];
    currentGallery[idx] = currentGallery[targetIdx];
    currentGallery[targetIdx] = temp;

    setCurrentYacht({
      ...currentYacht,
      gallery: currentGallery
    });
  };

  // -------------------------------------------------------------
  // HIGHLIGHTS MANAGEMENT
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // SPECS SNAPSHOT & COMPARISON MATRIX SYNC
  // -------------------------------------------------------------
  const handleUpdateSpec = (key, value) => {
    if (!currentYacht) return;
    const updatedSnapshot = {
      ...(currentYacht.specsSnapshot || {}),
      [key]: value
    };
    const updatedMatrix = {
      ...(currentYacht.comparisonMatrix || {}),
      [key]: value
    };

    // Also update length shorthand if loa changed
    let updatedLength = currentYacht.length;
    if (key === "loa") {
      updatedLength = value;
    }

    setCurrentYacht({
      ...currentYacht,
      length: updatedLength,
      specsSnapshot: updatedSnapshot,
      comparisonMatrix: updatedMatrix
    });
  };

  // -------------------------------------------------------------
  // SAVE YACHT (DRAFT OR PUBLISH)
  // -------------------------------------------------------------
  const handleSaveYacht = async (statusOverride = null) => {
    if (!currentYacht) return;

    // Client-side validation
    const name = (currentYacht.name || "").trim();
    if (!name) {
      setValidationError("Yacht model name is required.");
      setActiveTab("general");
      return;
    }

    let slug = (currentYacht.slug || "").trim().toLowerCase();
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setValidationError("URL Slug must contain only lowercase letters, numbers, and hyphens (e.g. g100 or g77).");
      setActiveTab("general");
      return;
    }

    setIsSaving(true);
    setValidationError(null);

    const order = parseInt(currentYacht.displayOrder, 10);
    const displayOrder = isNaN(order) ? (yachts.length + 1) : order;
    const targetStatus = statusOverride || currentYacht.status || "published";

    // Ensure hero image synchronization
    const primaryImg = currentYacht.heroImage || currentYacht.mainImage || "/images/yachts/g100/0.jpg";

    const payload = {
      ...currentYacht,
      name,
      fullName: currentYacht.fullName || name,
      modelNumber: currentYacht.modelNumber || name.replace(/[^A-Za-z0-9]/g, ""),
      slug,
      status: targetStatus,
      displayOrder,
      heroImage: primaryImg,
      mainImage: primaryImg,
      primaryImage: primaryImg,
    };

    const res = await saveYachtAsync(payload);
    setIsSaving(false);

    if (!res.success) {
      setValidationError(res.error || "Failed to persist yacht changes.");
      showToast(res.error || "Save failed. Please check form fields.", "error");
      return;
    }

    // Success
    setIsEditorOpen(false);
    loadYachts();
    const actionLabel = targetStatus === "published" ? "Published Live" : "Saved as Draft";
    showToast(`"${payload.name}" successfully ${actionLabel}!`);
  };

  // -------------------------------------------------------------
  // FILTERING
  // -------------------------------------------------------------
  const filteredYachts = yachts.filter((y) => {
    const key = (y.categoryKey || "").toLowerCase();
    const catVal = (y.category || y.categoryLabel || "").toLowerCase();
    const matchesCat = activeCategory === "all" ||
      (activeCategory === "luxury-motor-yacht"
        ? (key === "luxury-motor-yacht" || catVal.includes("luxury motor yacht"))
        : activeCategory === "motor-yacht"
          ? ((key === "motor-yacht" && key !== "luxury-motor-yacht") || (catVal.includes("motor yacht") && !catVal.includes("luxury motor yacht")))
          : (key === activeCategory.toLowerCase() ||
            catVal === activeCategory.toLowerCase() ||
            catVal.replace(/[^a-z0-9]+/g, "-") === activeCategory.toLowerCase() ||
            key.includes(activeCategory.toLowerCase())));

    const matchesStatus = activeStatusFilter === "all" ||
      (activeStatusFilter === "published" && y.status === "published") ||
      (activeStatusFilter === "draft" && y.status === "draft");

    const query = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery ||
      y.name?.toLowerCase().includes(query) ||
      y.modelNumber?.toLowerCase().includes(query) ||
      y.slug?.toLowerCase().includes(query) ||
      (y.description && y.description.toLowerCase().includes(query));

    return matchesCat && matchesStatus && matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F] text-[#E8EEF5]">
      <CmsHeader
        title="Yacht Models & Fleet"
        subtitle="Authoritative vessel management: add, edit, reorder, publish, or configure naval assets"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-8 z-50 px-5 py-3 rounded shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn border ${toastMessage.type === "error"
            ? "bg-red-950/95 text-red-200 border-red-500/50"
            : "bg-[#0E1B2D] text-[#DFBA73] border-[#C6A155]/60"
          }`}>
          {toastMessage.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white tracking-wide">
                Fleet Catalog & Vessel Registry
              </h1>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-[#0E1A2D] text-[#C6A155] border border-[#C6A155]/40 rounded">
                {yachts.length} {yachts.length === 1 ? "Model" : "Models"}
              </span>
            </div>
            <p className="text-xs text-[#828F9E] mt-1 max-w-2xl leading-relaxed">
              Manage complete vessel dossiers, naval specifications, brochure downloads, multi-deck cutaways, and photography. Changes immediately persist to the authoritative database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search fleet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 bg-[#0E141E] border border-[#1E2736] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={activeStatusFilter}
              onChange={(e) => setActiveStatusFilter(e.target.value)}
              className="bg-[#0E141E] border border-[#1E2736] rounded px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-[#C5A880] cursor-pointer"
            >
              <option value="all">All Statuses ({yachts.length})</option>
              <option value="published">Published ({yachts.filter(y => y.status === "published").length})</option>
              <option value="draft">Drafts ({yachts.filter(y => y.status === "draft").length})</option>
            </select>

            {/* In-Line Visual Editor Button */}
            <Link
              href="/admin/yachts/editor"
              className="px-4 py-2 text-xs font-semibold rounded bg-[#0E1F35] hover:bg-[#152B4A] text-[#DFBA73] border border-[#C6A155]/60 hover:border-[#DFBA73] transition-all inline-flex items-center gap-2 tracking-wider font-sans shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C6A155]" />
              <span>In-Line Visual Editor</span>
            </Link>

            {/* Add Yacht Button */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 text-xs font-semibold rounded bg-[#C6A155] hover:bg-[#DFBA73] text-[#080B10] transition-colors inline-flex items-center gap-2 tracking-wider cursor-pointer font-sans shadow-lg shadow-[#C6A155]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Yacht Model</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-white/5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#828F9E] mr-2">
            Categories:
          </span>
          {[
            { id: "all", label: "All Fleet" },
            { id: "superyacht", label: "Superyachts" },
            { id: "two-deck", label: "Two-Deck" },
            { id: "flybridge", label: "Flybridge" },
            { id: "motor-yacht", label: "Motor Yachts" },
            { id: "luxury-motor-yacht", label: "Luxury Motor Yachts" },
          ].map((cat) => {
            const count = cat.id === "all"
              ? yachts.length
              : yachts.filter(y => {
                const key = (y.categoryKey || "").toLowerCase();
                const catVal = (y.category || y.categoryLabel || "").toLowerCase();
                if (cat.id === "luxury-motor-yacht") {
                  return key === "luxury-motor-yacht" || catVal.includes("luxury motor yacht");
                }
                if (cat.id === "motor-yacht") {
                  return (key === "motor-yacht" && key !== "luxury-motor-yacht") ||
                    (catVal.includes("motor yacht") && !catVal.includes("luxury motor yacht"));
                }
                return key.includes(cat.id) || catVal.includes(cat.id);
              }).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${activeCategory === cat.id
                    ? "bg-[#C6A155] text-[#080B10] font-bold"
                    : "bg-[#0E1624] text-white/70 hover:text-white border border-white/10"
                  }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Fleet Cards Grid */}
        {filteredYachts.length === 0 ? (
          <div className="bg-[#0B1017] border border-white/10 rounded-sm p-16 text-center">
            <Anchor className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-white font-normal mb-1">No Yacht Models Found</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto mb-6">
              No vessels matched your current filter criteria. You can clear your filters or register a new yacht model.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
                setActiveStatusFilter("all");
              }}
              className="px-4 py-2 text-xs bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredYachts.map((yacht, idx) => {
              const heroImg = yacht.heroImage || yacht.mainImage || "/images/yachts/g100/0.jpg";
              const specs = yacht.specsSnapshot || {};

              return (
                <div
                  key={yacht.id}
                  className={`bg-[#0A0E17] rounded border overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl ${yacht.status === "published"
                      ? "border-[#1D2738] hover:border-[#C6A155]/60"
                      : "border-amber-900/40 bg-[#0B0F18]/90 opacity-80"
                    }`}
                >
                  <div>
                    {/* Photo & Badges */}
                    <div className="relative h-60 overflow-hidden bg-black/60">
                      <img
                        src={heroImg}
                        alt={yacht.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.9]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent pointer-events-none" />

                      {/* Top Left: Order & Category */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#080B10]/95 text-[#C6A155] border border-[#C6A155]/40 rounded-sm">
                          #{yacht.displayOrder || idx + 1}
                        </span>
                        <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium bg-[#080B10]/85 backdrop-blur-md text-[#E0C7A6] border border-white/10 rounded-sm">
                          {yacht.categoryLabel || yacht.category}
                        </span>
                        {yacht.featured && (
                          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold bg-[#C6A155] text-[#080B10] rounded-sm flex items-center gap-1 shadow">
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
                          className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-lg ${yacht.status === "published"
                              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-600/70 hover:bg-emerald-900"
                              : "bg-amber-950/90 text-amber-300 border border-amber-600/70 hover:bg-amber-900"
                            }`}
                          title="Click to toggle publication status"
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

                      {/* Bottom Info Ribbon */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                        <span className="font-mono text-white/90 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
                          {specs.loa || yacht.length || "LOA: Pending"}
                        </span>
                        <span className="font-mono text-[11px] text-[#DFBA73] bg-[#0E1A2D]/85 backdrop-blur-md px-2 py-1 rounded border border-[#C6A155]/30">
                          /yachts/{yacht.slug}
                        </span>
                      </div>
                    </div>

                    {/* Vessel Editorial Information */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-mono text-[#C6A155] uppercase tracking-wider font-semibold mb-1">
                            {yacht.modelNumber} • {yacht.decks || "Custom Decks"}
                          </div>
                          <h3 className="font-serif text-2xl font-normal text-white group-hover:text-[#DFBA73] transition-colors leading-snug">
                            {yacht.name}
                          </h3>
                          {yacht.tagline && (
                            <p className="text-xs text-[#C6A155] italic font-serif mt-1">
                              “{yacht.tagline}”
                            </p>
                          )}
                        </div>

                        {/* Order Controls */}
                        <div className="flex items-center gap-1 bg-[#0E1522] border border-white/10 rounded p-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className={`p-1 rounded transition-colors ${idx === 0 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-[#C6A155] hover:bg-white/5 cursor-pointer"
                              }`}
                            title="Move Up in Display Order"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-mono text-[#DFBA73] px-1 font-bold">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === yachts.length - 1}
                            className={`p-1 rounded transition-colors ${idx === yachts.length - 1 ? "text-white/20 cursor-not-allowed" : "text-white/70 hover:text-[#C6A155] hover:bg-white/5 cursor-pointer"
                              }`}
                            title="Move Down in Display Order"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#8E9EAF] line-clamp-2 leading-relaxed font-light">
                        {yacht.description || "No editorial description entered yet."}
                      </p>

                      {/* Snapshot Specs Pill Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-[#080B10]/80 border border-white/5 rounded text-[11px]">
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Beam</span>
                          <span className="text-white/90 font-mono font-medium truncate block">{specs.beam || "—"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Draft</span>
                          <span className="text-white/90 font-mono font-medium truncate block">{specs.draft || "—"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Power</span>
                          <span className="text-white/90 font-mono font-medium truncate block">{specs.power?.split('(')[0] || "—"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Cabins</span>
                          <span className="text-white/90 font-mono font-medium truncate block">{specs.cabins || "—"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Displacement</span>
                          <span className="text-white/90 font-mono font-medium truncate block">{specs.displacement || "—"}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[9px] uppercase tracking-wider">Brochure</span>
                          <span className="text-[#DFBA73] font-mono text-[10px] truncate block">
                            {yacht.brochureUrl ? "PDF Linked" : "Request Mode"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-0 flex flex-wrap items-center gap-2 border-t border-white/5 mt-4">
                    {/* Visual In-Line WYSIWYG Editor */}
                    <Link
                      href={`/admin/yachts/editor?slug=${yacht.slug}`}
                      className="py-2 px-3 rounded bg-[#0E1F35] hover:bg-[#C6A155] hover:text-[#080B10] text-[#DFBA73] border border-[#C6A155]/40 text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                      title="Visual in-line editor like home page"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Visual Edit</span>
                    </Link>

                    {/* Edit Model Dossier Form */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(yacht)}
                      className="flex-1 py-2 px-3 rounded bg-[#162030] hover:bg-[#C6A155] hover:text-[#080B10] text-[#D1D9E4] text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Vessel</span>
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(yacht)}
                      className="py-2 px-3 rounded text-[#8E9AA8] hover:text-[#DFBA73] bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      title="Duplicate this yacht model"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Duplicate</span>
                    </button>

                    {/* Preview / View Live */}
                    <Link
                      href={`/yachts/${yacht.slug}`}
                      target="_blank"
                      className="py-2 px-3 rounded text-[#8E9AA8] hover:text-white bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium flex items-center gap-1.5"
                      title="Preview public route in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Preview</span>
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(yacht)}
                      className="p-2 rounded text-[#8E9AA8] hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete vessel record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =============================================================
          RICH MULTI-TAB YACHT EDITOR MODAL
         ============================================================= */}
      {isEditorOpen && currentYacht && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#0D121B] border border-[#222E42] rounded-lg w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0A0E17]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#131B2A] border border-[#C6A155]/40 flex items-center justify-center text-[#C6A155] shadow">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-white font-medium">
                      {currentYacht.name ? `Edit Vessel: ${currentYacht.name}` : "Register New Yacht Model"}
                    </h3>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${currentYacht.status === "published"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        : "bg-amber-950 text-amber-300 border border-amber-700"
                      }`}>
                      {currentYacht.status === "published" ? "Published Live" : "Draft"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#828F9E] flex items-center gap-2 mt-0.5">
                    <span>Public Slug:</span>
                    <code className="text-[#DFBA73] font-mono">/yachts/{currentYacht.slug || "slug"}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentYacht.slug && (
                  <Link
                    href={`/yachts/${currentYacht.slug}`}
                    target="_blank"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview URL</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-[#8E9AA8] hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Notification Banner */}
            {validationError && (
              <div className="bg-red-950/90 border-b border-red-700/60 p-3 px-6 text-xs text-red-200 flex items-center gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Editor Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-[#1E293B] bg-[#0A0D15] px-4 scrollbar-none">
              {[
                { id: "general", label: "Overview & Identity", icon: Info },
                { id: "specs", label: "Specifications & Matrix", icon: Sliders },
                { id: "media", label: "Media & Galleries", icon: ImageIcon },
                { id: "commercial", label: "Commercial & Brochure", icon: FileText },
                { id: "narrative", label: "Narrative & Metrics", icon: BookOpen },
                { id: "seo", label: "SEO & Metadata", icon: Compass },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-4 text-xs font-medium whitespace-nowrap border-b-2 transition-all cursor-pointer ${isActive
                        ? "border-[#C6A155] text-[#DFBA73] bg-[#0E1624]"
                        : "border-transparent text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body: Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-[#0D121B]">

              {/* =========================================================
                  TAB 1: OVERVIEW & IDENTITY
                 ========================================================= */}
              {activeTab === "general" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Yacht Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ASMARATY G100 Super Yacht"
                        value={currentYacht.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slugAuto = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                          setCurrentYacht({
                            ...currentYacht,
                            name,
                            fullName: currentYacht.fullName || name,
                            slug: currentYacht.slug || slugAuto,
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-sm text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Model Number */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Model Code / Insignia
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. G100 or G77"
                        value={currentYacht.modelNumber || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, modelNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-sm font-mono text-[#DFBA73] focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Full Commercial Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Full Commercial Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ASMARATY G100 Super Yacht"
                        value={currentYacht.fullName || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* URL Slug */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Unique URL Slug *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="g100"
                        value={currentYacht.slug || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, slug: e.target.value.toLowerCase().trim() })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-[#DFBA73] focus:outline-none focus:border-[#C6A155]"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">
                        Accessible at /yachts/{currentYacht.slug || "slug"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Category Key */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Vessel Category
                      </label>
                      <select
                        value={
                          currentYacht.categoryKey === "luxury-motor-yacht" || currentYacht.category === "Luxury Motor Yacht"
                            ? "luxury-motor-yacht"
                            : currentYacht.categoryKey || "superyacht"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const labels = {
                            superyacht: "Superyacht",
                            "two-deck": "Two-Deck Yacht",
                            flybridge: "Flybridge Cruiser",
                            "motor-yacht": "Motor Yacht",
                            "luxury-motor-yacht": "Luxury Motor Yacht",
                            cruiser: "Express Cruiser",
                            offshore: "Offshore Explorer"
                          };
                          setCurrentYacht({
                            ...currentYacht,
                            categoryKey: val,
                            categoryLabel: labels[val] || val,
                            category: labels[val] || val
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      >
                        <option value="superyacht">Superyacht</option>
                        <option value="two-deck">Two-Deck Yacht</option>
                        <option value="flybridge">Flybridge Cruiser</option>
                        <option value="motor-yacht">Motor Yacht</option>
                        <option value="luxury-motor-yacht">Luxury Motor Yacht</option>
                        <option value="cruiser">Express Cruiser</option>
                        <option value="offshore">Offshore Explorer</option>
                      </select>
                    </div>

                    {/* Series */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Series / Class
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. G-Series Super Yacht Flagship"
                        value={currentYacht.series || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, series: e.target.value })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Decks */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Deck Architecture
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Super Yacht or Two Decks"
                        value={currentYacht.decks || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, decks: e.target.value })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Badge */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Editorial Badge
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Official Flagship Model or Two-Deck Masterpiece"
                        value={currentYacht.badge || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, badge: e.target.value })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Display Order */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Display Order Position
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={currentYacht.displayOrder ?? 1}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, displayOrder: parseInt(e.target.value, 10) || 1 })}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-[#DFBA73] focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                      Tagline / Brand Essence
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Signature of the Sea — Where Master Craftsmanship Meets Arabian Gulf Grandeur."
                      value={currentYacht.tagline || ""}
                      onChange={(e) => setCurrentYacht({ ...currentYacht, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  {/* Summary Line */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                      Short Summary Line
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flagship Superyacht • 30.48 Metres • GRP Composite"
                      value={currentYacht.summaryLine || ""}
                      onChange={(e) => setCurrentYacht({ ...currentYacht, summaryLine: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  {/* Full Description */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                      Full Editorial Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the vessel's architecture, living spaces, and luxury appointments..."
                      value={currentYacht.description || ""}
                      onChange={(e) => setCurrentYacht({ ...currentYacht, description: e.target.value })}
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155] leading-relaxed resize-none"
                    />
                  </div>

                  {/* Publishing and Featured Toggles */}
                  <div className="p-4 bg-[#080B10] border border-white/10 rounded flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      {/* Publication Status */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Publication Status
                        </label>
                        <select
                          value={currentYacht.status || "published"}
                          onChange={(e) => setCurrentYacht({ ...currentYacht, status: e.target.value })}
                          className="px-3 py-1.5 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                        >
                          <option value="published">Published (Visible on Public Site)</option>
                          <option value="draft">Draft (Restricted / Hidden)</option>
                        </select>
                      </div>

                      {/* Featured Toggle */}
                      <div className="pt-3">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(currentYacht.featured)}
                            onChange={(e) => setCurrentYacht({ ...currentYacht, featured: e.target.checked })}
                            className="rounded border-white/20 text-[#C6A155] focus:ring-0 w-4 h-4"
                          />
                          <span className="text-xs text-white font-medium flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#C6A155] fill-current" />
                            <span>Mark as Featured Flagship</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="text-[11px] text-white/50 italic">
                      Draft models are automatically excluded from the public fleet catalog and comparison table.
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 2: SPECIFICATIONS & MATRIX
                 ========================================================= */}
              {activeTab === "specs" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 bg-[#0E1B2D]/50 border border-[#C6A155]/30 rounded">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#C6A155] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#E8EEF5] leading-relaxed">
                        Specifications entered below automatically synchronize across the <strong>Yacht Catalog Card Snapshots</strong>, the <strong>11-Dimension Fleet Comparison Matrix</strong>, and the <strong>Dossier Detail Pages</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* LOA */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Length Overall (LOA) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 100 FT (30.48 M)"
                        value={currentYacht.specsSnapshot?.loa || ""}
                        onChange={(e) => handleUpdateSpec("loa", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* LWL */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Waterline Length (LWL)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 85 FT (25.91 M)"
                        value={currentYacht.specsSnapshot?.lwl || ""}
                        onChange={(e) => handleUpdateSpec("lwl", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Beam */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Maximum Beam (Width) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 22.91 FT (6.98 M)"
                        value={currentYacht.specsSnapshot?.beam || ""}
                        onChange={(e) => handleUpdateSpec("beam", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Draft */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Draft at Full Load *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7.5 FT (2.29 M)"
                        value={currentYacht.specsSnapshot?.draft || ""}
                        onChange={(e) => handleUpdateSpec("draft", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Displacement */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Displacement *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 95 Tons"
                        value={currentYacht.specsSnapshot?.displacement || ""}
                        onChange={(e) => handleUpdateSpec("displacement", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Power */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Propulsion Power *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3,200 HP (2 × 1,600 HP MTU)"
                        value={currentYacht.specsSnapshot?.power || ""}
                        onChange={(e) => handleUpdateSpec("power", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Cabins */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Staterooms / Cabins *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5 + 2 Staterooms"
                        value={currentYacht.specsSnapshot?.cabins || ""}
                        onChange={(e) => handleUpdateSpec("cabins", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Berths */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Berths / Guest Capacity *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 12 + 5 Berths (17 Pax)"
                        value={currentYacht.specsSnapshot?.berths || ""}
                        onChange={(e) => handleUpdateSpec("berths", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Fuel */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Fuel Capacity *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2,900 Gal (10,970 L)"
                        value={currentYacht.specsSnapshot?.fuel || ""}
                        onChange={(e) => handleUpdateSpec("fuel", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Fresh Water */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Fresh Water Capacity *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 670 Gal (2,536 L)"
                        value={currentYacht.specsSnapshot?.water || ""}
                        onChange={(e) => handleUpdateSpec("water", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    {/* Hull Material */}
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Hull Construction Material *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hand-Laid Honeycomb Composite"
                        value={currentYacht.specsSnapshot?.hull || ""}
                        onChange={(e) => handleUpdateSpec("hull", e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2838] rounded text-xs font-mono text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 3: MEDIA & GALLERIES
                 ========================================================= */}
              {activeTab === "media" && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Hero Showcase Image */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Primary Hero / Cover Image
                    </span>

                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Thumbnail Preview */}
                      <div className="w-36 h-24 bg-black/60 rounded border border-white/10 overflow-hidden flex-shrink-0">
                        <img
                          src={currentYacht.heroImage || currentYacht.mainImage || "/images/yachts/g100/0.jpg"}
                          alt="Hero preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="/images/yachts/g100/0.jpg"
                            value={currentYacht.heroImage || currentYacht.mainImage || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrentYacht({
                                ...currentYacht,
                                heroImage: val,
                                mainImage: val,
                                primaryImage: val
                              });
                            }}
                            className="flex-1 px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                          />
                          <a
                            href="/admin/media"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded bg-[#162030] hover:bg-[#C6A155] hover:text-[#080B10] text-[#C6A155] text-xs font-medium border border-[#2A374C] flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                            title="Open Media Manager grid gallery in a new tab"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Media Manager ↗</span>
                          </a>
                        </div>
                        <p className="text-[10px] text-white/50">
                          Main photographic cover rendered in the fleet catalog, cards, and hero displays.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Complete Gallery Management */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold">
                        Complete Vessel Photo Gallery ({currentYacht.gallery?.length || 0} Images)
                      </span>
                      <span className="text-[10px] text-white/40">
                        Drag or reorder images using the arrow buttons
                      </span>
                    </div>

                    {/* Add Gallery Image Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add gallery image URL (e.g. /images/yachts/g100/1.jpg or https://...)"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddGalleryImage();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                      <a
                        href="/admin/media"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded bg-[#162030] hover:bg-[#C6A155] hover:text-[#080B10] text-[#C6A155] text-xs font-medium border border-[#2A374C] flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                        title="Open Media Manager grid gallery"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Media Manager ↗</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleAddGalleryImage()}
                        className="px-4 py-2 rounded bg-[#C6A155] hover:bg-[#DFBA73] text-[#080B10] text-xs font-semibold cursor-pointer"
                      >
                        Add Image
                      </button>
                    </div>

                    {/* Gallery Thumbnails List */}
                    {(!currentYacht.gallery || currentYacht.gallery.length === 0) ? (
                      <p className="text-xs text-white/40 italic py-4 text-center">
                        No gallery images added yet. Add image URLs above or browse the media library.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                        {currentYacht.gallery.map((imgSrc, gIdx) => {
                          const url = typeof imgSrc === "string" ? imgSrc : imgSrc.src || imgSrc.url;
                          return (
                            <div key={gIdx} className="bg-[#0E1522] border border-white/10 rounded overflow-hidden group flex flex-col justify-between">
                              <div className="relative aspect-video bg-black/80 overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Gallery ${gIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-white">
                                  #{gIdx + 1}
                                </span>
                              </div>
                              <div className="p-1.5 bg-[#080B10] flex items-center justify-between gap-1 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveGalleryImage(gIdx, "left")}
                                    disabled={gIdx === 0}
                                    className={`p-1 rounded text-white/60 hover:text-white ${gIdx === 0 ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}`}
                                    title="Move earlier"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveGalleryImage(gIdx, "right")}
                                    disabled={gIdx === currentYacht.gallery.length - 1}
                                    className={`p-1 rounded text-white/60 hover:text-white ${gIdx === currentYacht.gallery.length - 1 ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}`}
                                    title="Move later"
                                  >
                                    ▶
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(gIdx)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 4: COMMERCIAL & BROCHURE
                 ========================================================= */}
              {activeTab === "commercial" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Brochure PDF Configuration */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Official Brochure & Dossier Document
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Brochure PDF URL
                        </label>
                        <input
                          type="text"
                          placeholder="/documents/asmaraty-g100-brochure.pdf"
                          value={currentYacht.brochureUrl || ""}
                          onChange={(e) => setCurrentYacht({ ...currentYacht, brochureUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                        />
                        <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-white/50 leading-relaxed">
                          <Info className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Request Brochure Behavior:</strong> If left empty or null, the catalog and comparison matrix will automatically render a <em>"Request Brochure"</em> CTA that redirects to the client enquiry form.
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Brochure Button Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Download G100 Dossier or Brochure (PDF, 25.7 MB)"
                          value={currentYacht.brochureLabel || ""}
                          onChange={(e) => setCurrentYacht({ ...currentYacht, brochureLabel: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Floorplan / General Arrangement (GA) Cutaway URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://... or /images/yachts/g100/floorplan.jpg"
                        value={currentYacht.floorplanUrl || ""}
                        onChange={(e) => setCurrentYacht({ ...currentYacht, floorplanUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>

                  {/* Highlights Manager */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Vessel Key Highlights & Distinctions
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add verified highlight (e.g. Spacious Two-Deck Design with panoramic salon)..."
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddHighlight();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-4 py-2 rounded bg-[#C6A155] hover:bg-[#DFBA73] text-[#080B10] text-xs font-semibold cursor-pointer"
                      >
                        Add Highlight
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {(currentYacht.highlights || []).map((hl, hIdx) => (
                        <div key={hIdx} className="flex items-center justify-between p-2.5 bg-[#0E1522] border border-white/5 rounded text-xs text-white/90">
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#C6A155] flex-shrink-0" />
                            <span>{hl}</span>
                          </div>
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
                </div>
              )}

              {/* =========================================================
                  TAB 5: NARRATIVE & METRICS
                 ========================================================= */}
              {activeTab === "narrative" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Narrative Essay */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Architectural Narrative Essay
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Narrative Eyebrow
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AT A GLANCE • ARCHITECTURAL NARRATIVE"
                          value={currentYacht.narrative?.eyebrow || ""}
                          onChange={(e) => setCurrentYacht({
                            ...currentYacht,
                            narrative: { ...(currentYacht.narrative || {}), eyebrow: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Narrative Headline
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Crafted for Unrivaled Luxury on the Water"
                          value={currentYacht.narrative?.headline || ""}
                          onChange={(e) => setCurrentYacht({
                            ...currentYacht,
                            narrative: { ...(currentYacht.narrative || {}), headline: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        Essay Paragraphs (One paragraph per double newline)
                      </label>
                      <textarea
                        rows={6}
                        placeholder="Enter narrative paragraphs separated by empty lines..."
                        value={(currentYacht.narrative?.paragraphs || []).join("\n\n")}
                        onChange={(e) => {
                          const paragraphs = e.target.value.split(/\n\n+/).filter(Boolean);
                          setCurrentYacht({
                            ...currentYacht,
                            narrative: { ...(currentYacht.narrative || {}), paragraphs }
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155] leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  {/* 6 Key Metrics Cards */}
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Key Fleet Metric Cards (Top Bar)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[0, 1, 2, 3, 4, 5].map((cardIdx) => {
                        const metric = (currentYacht.keyMetrics && currentYacht.keyMetrics[cardIdx]) || {
                          label: `Metric ${cardIdx + 1}`,
                          main: "",
                          sub: ""
                        };

                        return (
                          <div key={cardIdx} className="p-3 bg-[#0E1522] border border-white/5 rounded space-y-2">
                            <div>
                              <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-0.5">
                                Card #{cardIdx + 1} Label
                              </label>
                              <input
                                type="text"
                                value={metric.label || ""}
                                onChange={(e) => {
                                  const updatedMetrics = [...(currentYacht.keyMetrics || [])];
                                  updatedMetrics[cardIdx] = { ...metric, label: e.target.value };
                                  setCurrentYacht({ ...currentYacht, keyMetrics: updatedMetrics });
                                }}
                                className="w-full px-2 py-1 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-0.5">
                                  Main Value
                                </label>
                                <input
                                  type="text"
                                  value={metric.main || ""}
                                  placeholder="100 FT"
                                  onChange={(e) => {
                                    const updatedMetrics = [...(currentYacht.keyMetrics || [])];
                                    updatedMetrics[cardIdx] = { ...metric, main: e.target.value };
                                    setCurrentYacht({ ...currentYacht, keyMetrics: updatedMetrics });
                                  }}
                                  className="w-full px-2 py-1 bg-[#080B10] border border-[#1E2838] rounded text-xs text-[#DFBA73] font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-wider text-white/50 mb-0.5">
                                  Sub-detail
                                </label>
                                <input
                                  type="text"
                                  value={metric.sub || ""}
                                  placeholder="30.48 M"
                                  onChange={(e) => {
                                    const updatedMetrics = [...(currentYacht.keyMetrics || [])];
                                    updatedMetrics[cardIdx] = { ...metric, sub: e.target.value };
                                    setCurrentYacht({ ...currentYacht, keyMetrics: updatedMetrics });
                                  }}
                                  className="w-full px-2 py-1 bg-[#080B10] border border-[#1E2838] rounded text-xs text-white/70"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  TAB 6: SEO & METADATA
                 ========================================================= */}
              {activeTab === "seo" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 bg-[#080B10] border border-white/10 rounded space-y-4">
                    <span className="text-xs font-serif text-[#C6A155] uppercase tracking-wider font-semibold block">
                      Search Engine Optimization & Social Sharing
                    </span>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${currentYacht.name} | ASMARATY Luxury Yachts UAE`}
                        value={currentYacht.seo?.title || ""}
                        onChange={(e) => setCurrentYacht({
                          ...currentYacht,
                          seo: { ...(currentYacht.seo || {}), title: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Comprehensive specifications, photo gallery, and luxury architectural layout..."
                        value={currentYacht.seo?.description || ""}
                        onChange={(e) => setCurrentYacht({
                          ...currentYacht,
                          seo: { ...(currentYacht.seo || {}), description: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                        OpenGraph Share Image URL
                      </label>
                      <input
                        type="text"
                        placeholder={currentYacht.heroImage || "/images/yachts/g100/0.jpg"}
                        value={currentYacht.seo?.ogImage || ""}
                        onChange={(e) => setCurrentYacht({
                          ...currentYacht,
                          seo: { ...(currentYacht.seo || {}), ogImage: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#0E1522] border border-[#1E2838] rounded text-xs text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 px-6 border-t border-[#1E293B] bg-[#0A0D15] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-[#8E9AA8] flex items-center gap-2">
                <span>Model ID:</span>
                <code className="text-white/60 font-mono">{currentYacht.id}</code>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveYacht("draft")}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold rounded bg-[#162030] hover:bg-[#202C40] text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveYacht("published")}
                  disabled={isSaving}
                  className="px-6 py-2 text-xs font-semibold rounded bg-[#C6A155] hover:bg-[#DFBA73] text-[#080B10] transition-colors cursor-pointer shadow-lg shadow-[#C6A155]/20 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <span>Persisting...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Publish Vessel Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =============================================================
          DELETE CONFIRMATION MODAL WITH PUBLISHED WARNING
         ============================================================= */}
      {deleteModal.isOpen && deleteModal.yacht && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E131A] border border-red-900/60 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-950 border border-red-700/60 flex items-center justify-center text-red-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-white font-medium">
                  Confirm Permanent Vessel Deletion
                </h3>
                <p className="text-xs text-[#8E9AA8]">
                  Are you sure you wish to delete <strong className="text-white">"{deleteModal.yacht.name}"</strong>?
                </p>
              </div>
            </div>

            {/* Critical Published Warning */}
            {deleteModal.yacht.status === "published" && (
              <div className="p-3.5 bg-red-950/40 border border-red-600/40 rounded text-xs text-red-200 space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-red-300">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Critical: This Yacht is Currently Published Live</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-200/80">
                  Deleting this yacht will immediately take down the public route <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">/yachts/{deleteModal.yacht.slug}</code> which may result in broken links for prospective buyers, marketing materials, and search engines.
                </p>
              </div>
            )}

            <p className="text-xs text-[#8E9AA8] leading-relaxed">
              This action cannot be undone and will remove the record from the authoritative database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, yacht: null })}
                className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer shadow-lg shadow-red-600/20"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectImage={(url) => {
          if (!currentYacht) return;
          if (mediaTargetField === "heroImage") {
            setCurrentYacht({
              ...currentYacht,
              heroImage: url,
              mainImage: url,
              primaryImage: url
            });
          } else if (mediaTargetField === "gallery") {
            handleAddGalleryImage(url);
          }
        }}
        currentImageUrl={currentYacht?.heroImage || currentYacht?.mainImage || ""}
      />
    </div>
  );
}
