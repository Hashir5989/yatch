"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Images, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  X, 
  ZoomIn, 
  Check, 
  Upload, 
  Link2, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileImage
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import { 
  getAllMedia, 
  addMediaItem, 
  deleteMediaItem 
} from "@/lib/cmsStore";

export default function MediaManagerScreen() {
  const [media, setMedia] = useState(() => getAllMedia());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectMedia = (item) => {
    if (!item || !item.url) return;
    setSelectedId(item.id);

    // 1. Copy URL directly to clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url).catch(() => {});
    }

    // 2. Broadcast selection via localStorage for instant cross-tab sync with open editors
    try {
      localStorage.setItem(
        "asm_selected_media",
        JSON.stringify({
          url: item.url,
          title: item.title || "Selected Media Asset",
          alt: item.alt || item.title || "ASMARATY yacht",
          item,
          timestamp: Date.now(),
        })
      );
      window.dispatchEvent(
        new CustomEvent("asm-media-selected", { detail: { url: item.url, item } })
      );
    } catch (_) {}

    // 3. If opened via window.open from an editor, send postMessage
    if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: "ASM_MEDIA_SELECTED", url: item.url, item }, "*");
      } catch (_) {}
    }

    showToast(`✓ Selected "${item.title || "Image"}"! Auto-applied to editor.`);
  };

  // Inline Add Panel State (No popup modal!)
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "url"

  // Browse Local File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [localTitle, setLocalTitle] = useState("");
  const [localAlt, setLocalAlt] = useState("");
  const [localCategory, setLocalCategory] = useState("exterior");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Direct URL State
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("exterior");

  // File Inputs
  const topFileInputRef = useRef(null);
  const panelFileInputRef = useRef(null);

  // Lightbox Preview
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const loadMedia = () => {
    const all = getAllMedia();
    setMedia(Array.isArray(all) ? all : []);
  };

  useEffect(() => {
    const handleUpdate = () => loadMedia();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper when user selects a local file
  const onFileChosen = (file) => {
    if (!file) return;
    setUploadError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);

    // Auto-generate clean title from file name
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setLocalTitle(cleanName);
    setLocalAlt(`ASMARATY luxury yacht - ${cleanName}`);
  };

  // Quick Browse from top action bar
  const handleTopFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileChosen(file);
    setActiveTab("browse");
    setShowAddPanel(true);
    e.target.value = "";
  };

  // File chosen inside inline panel
  const handlePanelFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileChosen(file);
    e.target.value = "";
  };

  // Upload Local File to Server API
  const handleUploadLocalFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please select a local image file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", localTitle.trim() || selectedFile.name);
      formData.append("alt", localAlt.trim() || localTitle.trim() || "ASMARATY yacht");
      formData.append("category", localCategory);
      formData.append("folder", "uploads");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      const uploadedUrl = data.url || data.item?.url;
      const uploadedTitle = localTitle.trim() || data.title || "Uploaded Yacht Media";
      const uploadedAlt = localAlt.trim() || uploadedTitle;

      // Add to CMS media store
      addMediaItem({
        url: uploadedUrl,
        title: uploadedTitle,
        alt: uploadedAlt,
        category: localCategory,
      });

      resetLocalForm();
      setShowAddPanel(false);
      loadMedia();
      showToast(`Uploaded "${uploadedTitle}" successfully to Media Manager!`);
    } catch (err) {
      console.error("Local file upload error:", err);
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Add Image via Direct URL
  const handleAddUrlMedia = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    addMediaItem({
      url: newUrl.trim(),
      title: newTitle.trim() || "ASMARATY Yacht Photo",
      alt: newAlt.trim() || newTitle.trim() || "Luxury yacht",
      category: newCategory,
    });

    setNewUrl("");
    setNewTitle("");
    setNewAlt("");
    setShowAddPanel(false);
    loadMedia();
    showToast("Added new media asset to gallery!");
  };

  const resetLocalForm = () => {
    setSelectedFile(null);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setLocalTitle("");
    setLocalAlt("");
    setLocalCategory("exterior");
    setUploadError(null);
  };

  const handleDelete = (id, title) => {
    if (confirm(`Remove "${title}" from the media gallery?`)) {
      deleteMediaItem(id);
      loadMedia();
      showToast("Media deleted successfully");
    }
  };

  const handleCopyUrl = (url, id) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedId(id || url);
    showToast("Image URL copied to clipboard!");
    setTimeout(() => {
      setCopiedId(null);
    }, 2200);
  };

  const categories = [
    { id: "all", label: "All Media" },
    { id: "exterior", label: "Exterior" },
    { id: "interior", label: "Interior" },
    { id: "lifestyle", label: "Lifestyle" },
    { id: "shipyard", label: "Shipyard" },
    { id: "event", label: "Events & Boat Shows" },
  ];

  const filteredMedia = (Array.isArray(media) ? media : []).filter((item) => {
    if (!item || !item.url) return false;
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.alt && item.alt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Media Manager" 
        subtitle="Authoritative Media Asset Studio & Comprehensive Grid Gallery"
      />

      {/* Hidden file input for 1-click top bar browse */}
      <input
        ref={topFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={handleTopFileSelected}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">
                Media Grid Gallery
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#182333] border border-[#2B3B52] text-[#DFBA73] font-mono">
                {filteredMedia.length} Assets
              </span>
            </div>
            <p className="text-xs text-[#828F9E] mt-1">
              Authoritative visual assets for ASMARATY fleet catalogues, event coverage, and editorial dossiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search assets or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 bg-[#0E141E] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Primary Action 1: Browse Local Files */}
            <button
              onClick={() => topFileInputRef.current?.click()}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider cursor-pointer shadow-lg hover:brightness-110 transition-all"
              title="Browse image directly from your local computer"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Local</span>
            </button>

            {/* Primary Action 2: Add by URL */}
            <button
              onClick={() => {
                setActiveTab("url");
                setShowAddPanel(true);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-sm bg-[#111824] hover:bg-[#182232] text-[#DFBA73] border border-[#C5A880]/40 inline-flex items-center gap-2 tracking-wider cursor-pointer transition-all"
              title="Add image via remote URL"
            >
              <Link2 className="w-4 h-4" />
              <span>Add by URL</span>
            </button>

            {/* Toggle Inline Add Panel */}
            <button
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="px-3 py-2 text-xs font-medium rounded-sm bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 inline-flex items-center gap-1.5 cursor-pointer transition-all"
              title={showAddPanel ? "Collapse Add Media Panel" : "Expand Add Media Panel"}
            >
              <Plus className={`w-4 h-4 transition-transform ${showAddPanel ? "rotate-45" : ""}`} />
              <span>{showAddPanel ? "Close Form" : "New Asset"}</span>
            </button>
          </div>
        </div>

        {/* ==================== INLINE ADD / BROWSE PANEL (NO MODAL POPUP) ==================== */}
        {showAddPanel && (
          <div className="mb-8 bg-[#0B0F16] border border-[#C5A880]/40 rounded-lg p-5 sm:p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1A2332] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-white font-medium">
                    Add Media to Gallery
                  </h3>
                  <p className="text-[11px] text-[#828F9E]">
                    Browse a local file from disk or link a high-resolution web image
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-[#070A0F] border border-[#1A2332] rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("browse")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "browse"
                        ? "bg-[#C5A880] text-black font-semibold shadow"
                        : "text-[#8E9AA8] hover:text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse Local</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("url")}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "url"
                        ? "bg-[#C5A880] text-black font-semibold shadow"
                        : "text-[#8E9AA8] hover:text-white"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowAddPanel(false);
                    resetLocalForm();
                  }}
                  className="p-1.5 text-white/60 hover:text-white rounded hover:bg-white/5 cursor-pointer ml-2"
                  title="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Tab 1: Browse Local File */}
            {activeTab === "browse" && (
              <form onSubmit={handleUploadLocalFile} className="space-y-4">
                <input
                  ref={panelFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={handlePanelFileSelected}
                />

                {!selectedFile ? (
                  <div
                    onClick={() => panelFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#243346] hover:border-[#C5A880] rounded-lg p-8 text-center cursor-pointer bg-[#0E1520]/60 hover:bg-[#121B29] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#17202D] text-[#C5A880] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-white font-medium">
                      Click to Browse Local Computer
                    </p>
                    <p className="text-xs text-[#7A8796] mt-1">
                      Supports high-resolution JPEG, PNG, WEBP, AVIF up to 25MB
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-[#0E1520] border border-[#222E40] rounded-lg flex flex-col md:flex-row items-center gap-5">
                    {localPreviewUrl && (
                      <div className="w-36 h-24 rounded overflow-hidden bg-black flex-shrink-0 border border-white/10 relative">
                        <img
                          src={localPreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={resetLocalForm}
                          className="text-[11px] text-red-400 hover:text-red-300 hover:underline cursor-pointer"
                        >
                          Change File
                        </button>
                      </div>
                      <p className="text-[10px] text-[#7A8796] font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "image"}
                      </p>
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] mb-1 font-mono">
                        Media Title *
                      </label>
                      <input
                        type="text"
                        value={localTitle}
                        onChange={(e) => setLocalTitle(e.target.value)}
                        placeholder="e.g. ASMARATY G77 Qatar Fireworks"
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] mb-1 font-mono">
                        Category *
                      </label>
                      <select
                        value={localCategory}
                        onChange={(e) => setLocalCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880] cursor-pointer"
                      >
                        <option value="exterior">Exterior</option>
                        <option value="interior">Interior</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="shipyard">Shipyard</option>
                        <option value="event">Events & Boat Shows</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] mb-1 font-mono">
                        Alt Description
                      </label>
                      <input
                        type="text"
                        value={localAlt}
                        onChange={(e) => setLocalAlt(e.target.value)}
                        placeholder="Accessibility description"
                        className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2332]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPanel(false);
                        resetLocalForm();
                      }}
                      className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="btn-gold px-5 py-2 text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading & Processing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Upload & Add to Gallery</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Tab 2: Direct URL */}
            {activeTab === "url" && (
              <form onSubmit={handleAddUrlMedia} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] font-mono">
                      Image URL *
                    </label>
                    <input
                      type="text"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="/images/yachts/g100/1.jpg or https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] font-mono">
                      Media Title
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. ASMARATY G100 Stern View"
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] font-mono">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880] cursor-pointer"
                    >
                      <option value="exterior">Exterior</option>
                      <option value="interior">Interior</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="shipyard">Shipyard</option>
                      <option value="event">Events & Boat Shows</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#C5A880] font-mono">
                      Alt Description
                    </label>
                    <input
                      type="text"
                      value={newAlt}
                      onChange={(e) => setNewAlt(e.target.value)}
                      placeholder="Accessibility description"
                      className="w-full px-3 py-2 bg-[#080B10] border border-[#1E2736] rounded text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>

                {newUrl.trim() && (
                  <div className="p-3 bg-[#080B10] border border-[#1E2736] rounded flex items-center gap-3">
                    <div className="w-16 h-12 rounded overflow-hidden bg-black border border-white/10 flex-shrink-0">
                      <img
                        src={newUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <p className="text-xs text-[#8E9AA8] truncate font-mono">
                      {newUrl}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1A2332]">
                  <button
                    type="button"
                    onClick={() => setShowAddPanel(false)}
                    className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold px-5 py-2 text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save to Media Gallery</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-sm uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#C5A880] text-[#080B10] font-bold shadow-md"
                  : "bg-[#0E141D] text-[#8E9AA8] hover:text-white border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ==================== MEDIA GRID GALLERY ==================== */}
        {filteredMedia.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#1E2736] rounded-lg bg-[#0A0E15]">
            <FileImage className="w-12 h-12 text-[#5E6A7A] mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-lg text-white mb-1">No Media Assets Found</h3>
            <p className="text-xs text-[#828F9E] max-w-sm mx-auto mb-5">
              {searchQuery
                ? `No results match your search "${searchQuery}". Try a different keyword.`
                : "No media items available in this category yet."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setShowAddPanel(true);
              }}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Media Now</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMedia.map((item) => {
              const isCopied = copiedId === item.id || copiedId === item.url;
              const isSelected = selectedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectMedia(item)}
                  className={`group bg-[#0A0D15] rounded-lg border transition-all overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-[#C5A880]/10 cursor-pointer ${
                    isSelected
                      ? "border-[#C5A880] ring-2 ring-[#C5A880]"
                      : "border-[#1A2230] hover:border-[#C5A880]/80"
                  }`}
                  title="Click to automatically select this image"
                >
                  <div>
                    {/* Image Container with Hover Controls */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={item.url}
                        alt={item.title || "ASMARATY yacht"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Hover Overlay with Instant Select */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-3">
                        <span className="btn-gold px-3.5 py-1.5 text-xs font-bold rounded shadow-xl inline-flex items-center gap-1.5 animate-fadeIn">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Click to Select Image</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLightboxUrl(item.url);
                            }}
                            className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer shadow-lg"
                            title="Zoom High-Res View"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(item.url, item.id);
                            }}
                            className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer shadow-lg"
                            title="Copy Direct URL"
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <span className="absolute top-2 left-2 text-[9px] uppercase px-2 py-0.5 rounded bg-black/85 text-[#DFBA73] font-mono tracking-wider border border-white/10 font-bold">
                        {item.category || "exterior"}
                      </span>

                      {isSelected && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow">
                          ✓ Selected
                        </span>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div className="p-4 space-y-2">
                      <h4
                        className="text-xs font-semibold text-white truncate"
                        title={item.title}
                      >
                        {item.title || "Untitled Media Asset"}
                      </h4>
                      <p
                        className="text-[11px] text-[#7A8796] truncate"
                        title={item.alt}
                      >
                        {item.alt || item.title || "ASMARATY Yacht"}
                      </p>

                      {/* URL Box */}
                      <div className="bg-[#06080C] border border-[#161D27] rounded px-2 py-1 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#8E9AA8] truncate select-all">
                          {item.url}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#556375] pt-1 font-mono">
                        <span>{item.dimensions || "2000 x 1200"}</span>
                        <span>{item.uploadedAt || "Ready"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 border-t border-[#161D27] flex items-center justify-between bg-[#080B10]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectMedia(item);
                      }}
                      className="btn-gold !py-1 !px-2.5 text-xs font-semibold rounded inline-flex items-center gap-1 cursor-pointer shadow"
                      title="Select and apply this image"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Select</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.url, item.id);
                        }}
                        className={`text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                          isCopied ? "text-emerald-400 font-bold" : "text-[#DFBA73] hover:text-white"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>URL</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id, item.title);
                        }}
                        className="text-[#6A7888] hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Delete asset from gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== LIGHTBOX FULLSCREEN PREVIEW ==================== */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl max-h-[92vh] flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
              title="Close Fullscreen View"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="High Resolution Preview"
              className="max-w-full max-h-[82vh] object-contain rounded shadow-2xl border border-white/15"
            />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-[#8E9AA8] font-mono truncate max-w-md">
                {lightboxUrl}
              </span>
              <button
                onClick={() => handleCopyUrl(lightboxUrl)}
                className="btn-gold px-3 py-1 text-xs font-semibold rounded inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
