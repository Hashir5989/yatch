"use client";

import { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  Upload,
  Link2,
  FolderUp,
  Image as ImageIcon,
  Loader2,
  AlertCircle
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

  // Add Media Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("browse"); // "browse" | "url"

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

  // Top Action hidden file input
  const topFileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  // Lightbox Modal
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
    setActiveModalTab("browse");
    setIsAddModalOpen(true);
    e.target.value = "";
  };

  // File chosen inside modal
  const handleModalFileSelected = (e) => {
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

      setIsAddModalOpen(false);
      resetLocalForm();
      loadMedia();
      showToast(`Uploaded "${uploadedTitle}" successfully!`);
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

    setIsAddModalOpen(false);
    setNewUrl("");
    setNewTitle("");
    setNewAlt("");
    loadMedia();
    showToast("Added new media asset from URL");
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl font-light text-white tracking-wide">
              Media Assets ({filteredMedia.length})
            </h1>
            <p className="text-xs text-[#828F9E] mt-1">
              Upload local photography or link remote URLs for use across fleet dossiers and editorial articles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7A]" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 sm:w-56 bg-[#0E141E] border border-[#1E2736] rounded-sm pl-9 pr-4 py-2 text-xs text-white placeholder-[#5A6577] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            {/* Primary Action 1: Browse Local Files */}
            <button
              onClick={() => topFileInputRef.current?.click()}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2 tracking-wider cursor-pointer shadow-lg hover:brightness-110 transition-all"
              title="Browse and upload an image from your computer"
            >
              <Upload className="w-4 h-4" />
              <span>Browse Local</span>
            </button>

            {/* Primary Action 2: Add by URL or Open Modal */}
            <button
              onClick={() => {
                setActiveModalTab("url");
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-sm bg-[#111824] hover:bg-[#182232] text-[#DFBA73] border border-[#C5A880]/40 inline-flex items-center gap-2 tracking-wider cursor-pointer transition-all"
              title="Add image via remote URL"
            >
              <Link2 className="w-4 h-4" />
              <span>Add by URL</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-xs px-4 py-2 rounded-sm uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#C5A880] text-[#080B10] font-semibold shadow-md"
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
              className="group bg-[#0A0D15] rounded-sm border border-[#1A2230] hover:border-[#C5A880]/60 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setLightboxUrl(item.url)}
                      className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer"
                      title="Zoom Preview"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="w-8 h-8 rounded-full bg-[#080B10]/90 text-white flex items-center justify-center hover:bg-[#C5A880] hover:text-black transition-colors cursor-pointer"
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
                  <div className="flex items-center justify-between text-[10px] text-[#556375] mt-2 pt-2 border-t border-white/5 font-mono">
                    <span className="truncate max-w-[120px]">{item.url.startsWith("/") ? item.url : "Remote"}</span>
                    <span>{item.uploadedAt || "Live"}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-[#18202D] flex items-center justify-between bg-[#080C12]">
                <button
                  onClick={() => handleCopyUrl(item.url)}
                  className="text-[11px] text-[#8E9AA8] hover:text-[#C5A880] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy URL</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="text-[#8E9AA8] hover:text-red-400 p-1 rounded hover:bg-red-950/20 transition-colors cursor-pointer"
                  title="Delete media item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== ADD / BROWSE MEDIA MODAL ==================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0E131A] border border-[#222B3A] rounded-lg w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E2636] flex items-center justify-between bg-[#0A0E15]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#17202D] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    Add Media to Library
                  </h3>
                  <p className="text-[11px] text-[#828F9E]">
                    Browse a file from your computer or provide a direct web URL
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetLocalForm();
                }}
                className="text-[#8E9AA8] hover:text-white p-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs: Browse Local vs Direct URL */}
            <div className="flex border-b border-[#1E2636] bg-[#080B10]">
              <button
                type="button"
                onClick={() => setActiveModalTab("browse")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === "browse"
                    ? "border-[#C5A880] text-[#C5A880] bg-[#121924]"
                    : "border-transparent text-[#8E9AA8] hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Browse Local File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("url")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeModalTab === "url"
                    ? "border-[#C5A880] text-[#C5A880] bg-[#121924]"
                    : "border-transparent text-[#8E9AA8] hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Direct Image URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-sm text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* TAB 1: BROWSE LOCAL FILE */}
              {activeModalTab === "browse" && (
                <form onSubmit={handleUploadLocalFile} className="space-y-4 text-xs">
                  <input
                    ref={modalFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className="hidden"
                    onChange={handleModalFileSelected}
                  />

                  {/* Dropzone / File Picker Area */}
                  {!selectedFile ? (
                    <div
                      onClick={() => modalFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#243044] hover:border-[#C5A880] rounded-sm p-8 text-center bg-[#090D14]/70 hover:bg-[#0E1522] transition-all cursor-pointer group space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#141C28] border border-[#2B3950] flex items-center justify-center text-[#C5A880] mx-auto group-hover:scale-110 transition-transform">
                        <FolderUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold uppercase tracking-wider">
                          Click to browse image from your computer
                        </p>
                        <p className="text-[11px] text-[#7E8B9C] mt-1">
                          Supports JPEG, PNG, WEBP, AVIF, and GIF (Max 15MB)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-gold px-5 py-2 text-xs font-semibold rounded-sm inline-flex items-center gap-2"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Files</span>
                      </button>
                    </div>
                  ) : (
                    /* Preview Card */
                    <div className="bg-[#090D14] border border-[#1E2736] p-4 rounded-sm space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 bg-black rounded-sm overflow-hidden flex-shrink-0 border border-white/10">
                          {localPreviewUrl && (
                            <img
                              src={localPreviewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate text-xs" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-[#828F9E] font-mono mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "image"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => modalFileInputRef.current?.click()}
                          className="px-3 py-1.5 text-xs text-[#C5A880] hover:text-white border border-[#C5A880]/40 rounded-sm hover:bg-[#C5A880]/10 transition-colors"
                        >
                          Change File
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Metadata Fields (Title, Alt, Category) */}
                  {selectedFile && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Media Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ASMARATY G100 Upper Deck Salon"
                          value={localTitle}
                          onChange={(e) => setLocalTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Alt Text Description
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Master suite panoramic windows and king bed"
                          value={localAlt}
                          onChange={(e) => setLocalAlt(e.target.value)}
                          className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                          Category
                        </label>
                        <select
                          value={localCategory}
                          onChange={(e) => setLocalCategory(e.target.value)}
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
                          onClick={() => {
                            setIsAddModalOpen(false);
                            resetLocalForm();
                          }}
                          className="px-4 py-2 text-xs text-[#8E9AA8] hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading to Server...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload & Save Asset</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 2: DIRECT IMAGE URL */}
              {activeModalTab === "url" && (
                <form onSubmit={handleAddUrlMedia} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                      Image Direct URL (https://... or /images/...) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/... or /images/yachts/..."
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  {/* URL Live Preview */}
                  {newUrl.trim() && (
                    <div className="bg-[#090D14] border border-[#1E2736] p-3 rounded-sm flex items-center gap-3">
                      <div className="w-16 h-12 bg-black rounded-sm overflow-hidden flex-shrink-0 border border-white/10">
                        <img
                          src={newUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                      <p className="text-[11px] text-[#828F9E] truncate">
                        Live preview loaded from URL
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                      Image Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ASMARATY G100 Flybridge Jacuzzi"
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
                      placeholder="e.g. Heated glass-edge spa pool on flybridge terrace"
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
                      className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Media Library</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== LIGHTBOX MODAL ==================== */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 cursor-pointer"
            aria-label="Close Preview"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxUrl}
            alt="Enlarged"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-sm border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
