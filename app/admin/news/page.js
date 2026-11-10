"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Newspaper, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  X, 
  Image as ImageIcon,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Globe,
  Sparkles,
  Sliders,
  CalendarDays,
  FileText
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import { 
  getAllArticles, 
  saveArticle, 
  saveArticleAsync,
  deleteArticle,
  deleteArticleAsync,
  togglePublishArticle,
  togglePublishArticleAsync,
  syncArticlesFromServer
} from "@/lib/cmsStore";

const CATEGORIES = [
  "All",
  "Boat Shows",
  "Fleet Launches",
  "Innovations",
  "Shipyard News",
  "Awards & Press"
];

function generateSlug(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminNewsScreen() {
  const [articles, setArticles] = useState(() => getAllArticles(false));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Editor Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState("featured"); // 'featured' or 'gallery'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Gallery item being added/edited
  const [galleryInputUrl, setGalleryInputUrl] = useState("");
  const [galleryInputAlt, setGalleryInputAlt] = useState("");
  const [galleryInputCaption, setGalleryInputCaption] = useState("");

  const loadArticles = () => {
    setArticles(getAllArticles(false));
  };

  useEffect(() => {
    syncArticlesFromServer(false).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setArticles(synced);
      }
    });
    const handleUpdate = () => loadArticles();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setCurrentArticle({
      id: `news-${Date.now()}`,
      title: "",
      slug: "",
      category: "Boat Shows",
      publishedAt: today,
      readingTime: "3 min read",
      status: "published",
      featuredImage: "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
      featuredImageAlt: "",
      excerpt: "",
      content: "",
      eventDetails: {
        enabled: false,
        badge: "OFFICIAL INVITATION",
        exhibition: "",
        venue: "",
        dates: "",
        presentedBy: "AL SHAALI MARINE – UAE",
        highlights: []
      },
      gallery: [],
      cta: {
        enabled: true,
        label: "Book Stand Walkthrough & Consultation",
        url: "/contact",
        target: "_self",
        type: "primary"
      },
      secondaryCta: {
        enabled: true,
        label: "Connect on WhatsApp Concierge",
        url: "https://wa.me/971565268126",
        target: "_blank",
        type: "whatsapp"
      },
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
        canonicalUrl: ""
      },
      relatedArticleIds: []
    });
    setSlugManuallyEdited(false);
    setNewHighlight("");
    setGalleryInputUrl("");
    setGalleryInputAlt("");
    setGalleryInputCaption("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (art) => {
    setCurrentArticle(JSON.parse(JSON.stringify(art)));
    setSlugManuallyEdited(true);
    setNewHighlight("");
    setGalleryInputUrl("");
    setGalleryInputAlt("");
    setGalleryInputCaption("");
    setIsEditorOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      const res = await deleteArticleAsync(id);
      if (res && res.success) {
        loadArticles();
        showToast(`Deleted "${title}"`);
      } else {
        showToast(res?.error || "Failed to delete article", "error");
      }
    }
  };

  const handleTogglePublish = async (art) => {
    const res = await togglePublishArticleAsync(art.id);
    if (res && res.success) {
      loadArticles();
      const statusLabel = res.article?.status === "published" ? "Published live" : "Saved as Draft";
      showToast(`"${art.title}" is now ${statusLabel}`);
    } else {
      showToast(res?.error || "Failed to toggle article status", "error");
    }
  };

  const handleTitleChange = (val) => {
    if (!slugManuallyEdited && currentArticle) {
      setCurrentArticle({
        ...currentArticle,
        title: val,
        slug: generateSlug(val)
      });
    } else if (currentArticle) {
      setCurrentArticle({
        ...currentArticle,
        title: val
      });
    }
  };

  const handleSaveArticleForm = async (e) => {
    e.preventDefault();
    if (!currentArticle.title.trim()) {
      alert("Please provide an article title.");
      return;
    }

    let finalSlug = (currentArticle.slug || "").trim().toLowerCase();
    if (!finalSlug) {
      finalSlug = generateSlug(currentArticle.title);
    }

    // Check slug collision with other articles
    const otherArticles = articles.filter((a) => a.id !== currentArticle.id);
    if (otherArticles.some((a) => a.slug === finalSlug)) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const payload = {
      ...currentArticle,
      slug: finalSlug,
      title: currentArticle.title.trim(),
      excerpt: currentArticle.excerpt.trim(),
      content: currentArticle.content.trim(),
      featuredImageAlt: currentArticle.featuredImageAlt || currentArticle.title.trim(),
      seo: {
        ...currentArticle.seo,
        metaTitle: currentArticle.seo?.metaTitle || currentArticle.title.trim(),
        metaDescription: currentArticle.seo?.metaDescription || currentArticle.excerpt.trim(),
        ogImage: currentArticle.seo?.ogImage || currentArticle.featuredImage,
        canonicalUrl: currentArticle.seo?.canonicalUrl || `https://asmaraty.com/news/${finalSlug}`
      }
    };

    const res = await saveArticleAsync(payload);
    if (res && res.success) {
      loadArticles();
      setIsEditorOpen(false);
      showToast(`Saved article "${payload.title}"`);
    } else {
      showToast(res?.error || "Failed to persist article changes", "error");
    }
  };

  // Direct file upload handler
  const handleDirectFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers = {};
      if (typeof window !== "undefined") {
        try {
          const t = localStorage.getItem("asm_admin_session_token");
          if (t) headers["Authorization"] = `Bearer ${t}`;
        } catch (_) {}
      }

      const res = await fetch("/api/media/upload", {
        method: "POST",
        credentials: "include",
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (mediaPickerTarget === "featured") {
          setCurrentArticle((prev) => ({
            ...prev,
            featuredImage: data.url,
            featuredImageAlt: prev.featuredImageAlt || data.title
          }));
        } else {
          // Add to gallery
          const newImg = {
            id: `gal-${Date.now()}`,
            url: data.url,
            alt: data.title,
            caption: data.title,
            displayOrder: (currentArticle?.gallery?.length || 0) + 1
          };
          setCurrentArticle((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), newImg]
          }));
        }
        showToast("Image uploaded successfully");
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectFromMediaPicker = (url, title) => {
    if (mediaPickerTarget === "featured") {
      setCurrentArticle((prev) => ({
        ...prev,
        featuredImage: url,
        featuredImageAlt: prev.featuredImageAlt || title
      }));
    } else {
      const newImg = {
        id: `gal-${Date.now()}`,
        url,
        alt: title || "ASMARATY yacht gallery",
        caption: title || "",
        displayOrder: (currentArticle?.gallery?.length || 0) + 1
      };
      setCurrentArticle((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), newImg]
      }));
    }
    setMediaPickerOpen(false);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesStatus = statusFilter === "all" || art.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      art.title?.toLowerCase().includes(query) ||
      art.excerpt?.toLowerCase().includes(query) ||
      art.slug?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="News & Updates Studio" 
        subtitle="Manage boat shows, press announcements, international launches, and fleet updates"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for direct uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectFileUpload}
        className="hidden"
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelectImage={handleSelectFromMediaPicker}
      />

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6778]" />
            <input
              type="text"
              placeholder="Search news by headline, excerpt, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D121C] border border-[#1B2433] rounded pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#5A6778] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0D121C] border border-[#1B2433] text-xs text-[#9DAAB8] px-3 py-2.5 rounded focus:outline-none focus:border-[#C5A880]"
            >
              <option value="all">All Statuses ({articles.length})</option>
              <option value="published">Published Only ({articles.filter((a) => a.status === "published").length})</option>
              <option value="draft">Drafts Only ({articles.filter((a) => a.status === "draft").length})</option>
            </select>

            {/* Create New Article Button */}
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] hover:bg-[#D5B890] text-[#080B10] text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add News Article</span>
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-[#0D121C] border border-[#1B2433] rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1B2433] bg-[#0A0E17] text-[10px] uppercase tracking-widest text-[#5A6778]">
                  <th className="py-3.5 px-4 font-semibold">Thumbnail</th>
                  <th className="py-3.5 px-4 font-semibold">Headline & Summary</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151D2A] text-xs">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#5A6778]">
                      No news articles found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((art) => {
                    const isPublished = art.status === "published";
                    return (
                      <tr key={art.id} className="hover:bg-[#121824]/60 transition-colors group">
                        {/* Thumbnail */}
                        <td className="py-4 px-4 w-28">
                          <div className="w-24 h-16 bg-[#080B10] border border-[#1B2433] rounded overflow-hidden relative">
                            {art.featuredImage ? (
                              <img
                                src={art.featuredImage}
                                alt={art.featuredImageAlt || art.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#4A5568]">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Excerpt */}
                        <td className="py-4 px-4 max-w-md">
                          <div className="font-serif text-sm text-white font-medium mb-1 line-clamp-1 group-hover:text-[#DFBA73] transition-colors">
                            {art.title}
                          </div>
                          <p className="text-[11px] text-[#7A8796] line-clamp-2 leading-relaxed">
                            {art.excerpt || art.content?.slice(0, 140)}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-[#5A6778]">
                            <span>/news/{art.slug}</span>
                            {art.eventDetails?.enabled && (
                              <span className="px-1.5 py-0.5 rounded bg-[#C6A155]/20 text-[#DFBA73] text-[9px] font-sans font-semibold">
                                Event Box Active
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151E2C] border border-[#232E42] text-[10px] font-medium text-[#C5A880]">
                            <Tag className="w-3 h-3" />
                            <span>{art.category}</span>
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-[#8A96A6] font-mono text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#5A6778]" />
                            <span>{art.publishedAt}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(art)}
                            title="Click to toggle publish status"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              isPublished
                                ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400"
                                : "bg-amber-950/60 border border-amber-500/40 text-amber-300 hover:border-amber-400"
                            }`}
                          >
                            {isPublished ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-amber-400" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Preview */}
                            <Link
                              href={`/news/${art.slug}`}
                              target="_blank"
                              title="Preview Article on Live Site"
                              className="p-1.5 text-[#7A8796] hover:text-white hover:bg-white/5 rounded transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(art)}
                              title="Edit Article"
                              className="p-1.5 text-[#7A8796] hover:text-[#C5A880] hover:bg-white/5 rounded transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDelete(art.id, art.title)}
                              title="Delete Article"
                              className="p-1.5 text-[#7A8796] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ADD / EDIT ARTICLE MODAL DRAWER
          ========================================================================= */}
      {isEditorOpen && currentArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-fadeIn">
          <div className="bg-[#0B0F17] border-l border-[#1F293A] w-full max-w-4xl h-full flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#1A2333] flex items-center justify-between bg-[#080B10]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#141C2A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    {articles.some((a) => a.id === currentArticle.id) ? "Edit News Article" : "Create New Article"}
                  </h3>
                  <p className="text-xs text-[#7A8796]">
                    Configure editorial story, event highlights, gallery images, and SEO metadata
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-[#7A8796] hover:text-white p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleSaveArticleForm} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {/* Status & Category Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0F1522] border border-[#1E283A] rounded">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                    Publication Status *
                  </label>
                  <select
                    value={currentArticle.status}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, status: e.target.value })}
                    className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="published">Published (Publicly Visible)</option>
                    <option value="draft">Draft (Admin Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                    Category *
                  </label>
                  <select
                    value={currentArticle.category}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                    className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                    Publication Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={currentArticle.publishedAt || ""}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, publishedAt: e.target.value })}
                    className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Title & Slug */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white font-semibold mb-1.5">
                    News Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ASMARATY Showcases the Flagship G77 at Qatar International Boat Show 2026"
                    value={currentArticle.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#0F1522] border border-[#1E283A] text-sm text-white px-4 py-3 rounded focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                    Hero Banner Headline (Optional grand headline for top banner)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ASMARATY UNVEILS THE REVOLUTIONARY G77 AT QATAR INTERNATIONAL BOAT SHOW 2026"
                    value={currentArticle.heroHeadline || ""}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, heroHeadline: e.target.value })}
                    className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-4 py-2.5 rounded focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                      URL Slug * (auto-generated, editable)
                    </label>
                    <div className="flex items-center bg-[#0F1522] border border-[#1E283A] rounded overflow-hidden">
                      <span className="px-3 text-xs text-[#5A6778] bg-[#080B10] border-r border-[#1E283A] py-2.5">
                        /news/
                      </span>
                      <input
                        type="text"
                        required
                        value={currentArticle.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          setCurrentArticle({ ...currentArticle, slug: generateSlug(e.target.value) });
                        }}
                        className="flex-1 bg-transparent text-xs text-white px-3 py-2.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1.5">
                      Estimated Reading Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3 min read"
                      value={currentArticle.readingTime || "3 min read"}
                      onChange={(e) => setCurrentArticle({ ...currentArticle, readingTime: e.target.value })}
                      className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2.5 rounded focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-white font-semibold mb-1.5">
                  Short Description / Excerpt * (Displays on cards and social previews)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Concise 1-2 sentence introduction of the news story..."
                  value={currentArticle.excerpt}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, excerpt: e.target.value })}
                  className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-4 py-3 rounded focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              {/* Featured Image Management */}
              <div className="p-5 bg-[#0F1522] border border-[#1E283A] rounded space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold block">
                    Featured Cover Image *
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget("featured");
                        setMediaPickerOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#172233] hover:bg-[#202E44] text-[#C5A880] text-[11px] font-medium rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Choose from Media Library</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setMediaPickerTarget("featured");
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-[#C5A880] hover:bg-[#D5B890] text-[#080B10] text-[11px] font-bold rounded inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? "Uploading..." : "Upload New File"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1 h-36 bg-[#080B10] border border-[#1E283A] rounded overflow-hidden relative">
                    {currentArticle.featuredImage ? (
                      <img
                        src={currentArticle.featuredImage}
                        alt={currentArticle.featuredImageAlt || "Featured image"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#4A5568]">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                        Image URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={currentArticle.featuredImage}
                        onChange={(e) => setCurrentArticle({ ...currentArticle, featuredImage: e.target.value })}
                        placeholder="/images/news/..."
                        className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                        Image Alt Text (SEO & Accessibility)
                      </label>
                      <input
                        type="text"
                        value={currentArticle.featuredImageAlt || ""}
                        onChange={(e) => setCurrentArticle({ ...currentArticle, featuredImageAlt: e.target.value })}
                        placeholder="Descriptive text for search engines..."
                        className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full News Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider text-white font-semibold">
                    Full Article Content *
                  </label>
                  <span className="text-[11px] text-[#7A8796]">
                    Separate paragraphs with empty lines
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  placeholder="Enter full editorial article text..."
                  value={currentArticle.content}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                  className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-4 py-3 rounded focus:outline-none focus:border-[#C5A880] leading-relaxed resize-y font-mono"
                />
              </div>

              {/* =========================================================================
                  EVENT INFORMATION SECTION (STAND, DATES, HIGHLIGHTS)
                  ========================================================================= */}
              <div className="p-5 bg-[#0F1522] border border-[#1E283A] rounded space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                      Boat Show / Event Specifications Box
                    </h4>
                    <p className="text-[11px] text-[#7A8796]">
                      Display a dedicated event callout card with Stand, Venue, Dates & Highlights
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(currentArticle.eventDetails?.isUpcoming)}
                        onChange={(e) =>
                          setCurrentArticle({
                            ...currentArticle,
                            eventDetails: {
                              ...currentArticle.eventDetails,
                              isUpcoming: e.target.checked
                            }
                          })
                        }
                        className="w-4 h-4 accent-[#C5A880]"
                      />
                      <span className="text-xs text-[#DFBA73] font-semibold">Feature in "Upcoming Events"</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(currentArticle.eventDetails?.enabled)}
                        onChange={(e) =>
                          setCurrentArticle({
                            ...currentArticle,
                            eventDetails: {
                              ...currentArticle.eventDetails,
                              enabled: e.target.checked
                            }
                          })
                        }
                        className="w-4 h-4 accent-[#C5A880]"
                      />
                      <span className="text-xs text-white/80 font-semibold">Enable Event Box</span>
                    </label>
                  </div>
                </div>

                {currentArticle.eventDetails?.enabled && (
                  <div className="pt-4 border-t border-[#1A2436] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.badge || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, badge: e.target.value }
                            })
                          }
                          placeholder="e.g. OFFICIAL INVITATION"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Exhibition Name
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.exhibition || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, exhibition: e.target.value }
                            })
                          }
                          placeholder="e.g. Qatar International Boat Show 2026"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Stand / Location
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.venue || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, venue: e.target.value }
                            })
                          }
                          placeholder="e.g. Stand D06 | Old Doha Port, Qatar"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Dates
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.dates || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, dates: e.target.value }
                            })
                          }
                          placeholder="e.g. 4th – 7th November 2026"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Presented By
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.presentedBy || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, presentedBy: e.target.value }
                            })
                          }
                          placeholder="e.g. AL SHAALI MARINE – UAE"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Vessel on Display / Showcase
                        </label>
                        <input
                          type="text"
                          value={currentArticle.eventDetails?.vesselShowcased || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              eventDetails: { ...currentArticle.eventDetails, vesselShowcased: e.target.value }
                            })
                          }
                          placeholder="e.g. ASMARATY G77"
                          className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    {/* Highlights List */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-2">
                        Key Event Highlights / Bullet Points
                      </label>
                      <div className="space-y-2 mb-3">
                        {(currentArticle.eventDetails?.highlights || []).map((hl, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-[#080B10] border border-[#1A2333] rounded">
                            <span className="text-xs text-white flex-1">{hl}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentArticle.eventDetails.highlights.filter((_, i) => i !== idx);
                                setCurrentArticle({
                                  ...currentArticle,
                                  eventDetails: { ...currentArticle.eventDetails, highlights: updated }
                                });
                              }}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new event highlight..."
                          value={newHighlight}
                          onChange={(e) => setNewHighlight(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (newHighlight.trim()) {
                                const current = currentArticle.eventDetails?.highlights || [];
                                setCurrentArticle({
                                  ...currentArticle,
                                  eventDetails: {
                                    ...currentArticle.eventDetails,
                                    highlights: [...current, newHighlight.trim()]
                                  }
                                });
                                setNewHighlight("");
                              }
                            }
                          }}
                          className="flex-1 bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newHighlight.trim()) {
                              const current = currentArticle.eventDetails?.highlights || [];
                              setCurrentArticle({
                                ...currentArticle,
                                eventDetails: {
                                  ...currentArticle.eventDetails,
                                  highlights: [...current, newHighlight.trim()]
                                }
                              });
                              setNewHighlight("");
                            }
                          }}
                          className="px-4 py-2 bg-[#172233] hover:bg-[#202E44] text-[#C5A880] text-xs font-semibold rounded cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =========================================================================
                  GALLERY IMAGES MANAGEMENT
                  ========================================================================= */}
              <div className="p-5 bg-[#0F1522] border border-[#1E283A] rounded space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                      Article Photo Gallery
                    </h4>
                    <p className="text-[11px] text-[#7A8796]">
                      Manage, replace, reorder, and add high-resolution photo highlights
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget("gallery");
                        setMediaPickerOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#172233] hover:bg-[#202E44] text-[#C5A880] text-[11px] font-medium rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Pick from Media</span>
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setMediaPickerTarget("gallery");
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 bg-[#C5A880] hover:bg-[#D5B890] text-[#080B10] text-[11px] font-bold rounded inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Items List */}
                <div className="space-y-3">
                  {(currentArticle.gallery || []).length === 0 ? (
                    <div className="py-8 text-center text-[#5A6778] text-xs border border-dashed border-[#1E283A] rounded">
                      No gallery images attached. Click "Pick from Media" or "Upload Photo" above.
                    </div>
                  ) : (
                    currentArticle.gallery.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-[#080B10] border border-[#1A2333] rounded"
                      >
                        <div className="w-20 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                          <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <input
                            type="text"
                            placeholder="Image Alt Text..."
                            value={img.alt || ""}
                            onChange={(e) => {
                              const updated = [...currentArticle.gallery];
                              updated[idx].alt = e.target.value;
                              setCurrentArticle({ ...currentArticle, gallery: updated });
                            }}
                            className="bg-[#0F1522] border border-[#1E283A] text-xs text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-[#C5A880]"
                          />
                          <input
                            type="text"
                            placeholder="Caption / Subtitle..."
                            value={img.caption || ""}
                            onChange={(e) => {
                              const updated = [...currentArticle.gallery];
                              updated[idx].caption = e.target.value;
                              setCurrentArticle({ ...currentArticle, gallery: updated });
                            }}
                            className="bg-[#0F1522] border border-[#1E283A] text-xs text-white px-2.5 py-1.5 rounded focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...currentArticle.gallery];
                              const temp = updated[idx - 1];
                              updated[idx - 1] = updated[idx];
                              updated[idx] = temp;
                              setCurrentArticle({ ...currentArticle, gallery: updated });
                            }}
                            className="p-1.5 text-[#5A6778] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentArticle.gallery.length - 1}
                            onClick={() => {
                              const updated = [...currentArticle.gallery];
                              const temp = updated[idx + 1];
                              updated[idx + 1] = updated[idx];
                              updated[idx] = temp;
                              setCurrentArticle({ ...currentArticle, gallery: updated });
                            }}
                            className="p-1.5 text-[#5A6778] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentArticle.gallery.filter((_, i) => i !== idx);
                              setCurrentArticle({ ...currentArticle, gallery: updated });
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* =========================================================================
                  CTA BUTTONS CONFIGURATION (DYNAMIC & EDITABLE LABELS/URLS)
                  ========================================================================= */}
              <div className="p-5 bg-[#0F1522] border border-[#1E283A] rounded space-y-6">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                    Interactive Call-To-Action Buttons
                  </h4>
                  <p className="text-[11px] text-[#7A8796]">
                    Configure button labels, target URLs, and behavior without modifying code
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="p-4 bg-[#080B10] border border-[#1A2333] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#DFBA73] uppercase tracking-wider">
                      Primary CTA Button
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(currentArticle.cta?.enabled)}
                        onChange={(e) =>
                          setCurrentArticle({
                            ...currentArticle,
                            cta: { ...currentArticle.cta, enabled: e.target.checked }
                          })
                        }
                        className="w-4 h-4 accent-[#C5A880]"
                      />
                      <span className="text-xs text-[#7A8796]">Visible</span>
                    </label>
                  </div>

                  {currentArticle.cta?.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={currentArticle.cta?.label || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              cta: { ...currentArticle.cta, label: e.target.value }
                            })
                          }
                          placeholder="e.g. Book Stand Walkthrough"
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={currentArticle.cta?.url || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              cta: { ...currentArticle.cta, url: e.target.value }
                            })
                          }
                          placeholder="e.g. /contact"
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Open Behavior
                        </label>
                        <select
                          value={currentArticle.cta?.target || "_self"}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              cta: { ...currentArticle.cta, target: e.target.value }
                            })
                          }
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Secondary CTA */}
                <div className="p-4 bg-[#080B10] border border-[#1A2333] rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Secondary CTA Button (e.g. WhatsApp / Direct Line)
                    </span>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(currentArticle.secondaryCta?.enabled)}
                        onChange={(e) =>
                          setCurrentArticle({
                            ...currentArticle,
                            secondaryCta: { ...currentArticle.secondaryCta, enabled: e.target.checked }
                          })
                        }
                        className="w-4 h-4 accent-[#C5A880]"
                      />
                      <span className="text-xs text-[#7A8796]">Visible</span>
                    </label>
                  </div>

                  {currentArticle.secondaryCta?.enabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={currentArticle.secondaryCta?.label || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              secondaryCta: { ...currentArticle.secondaryCta, label: e.target.value }
                            })
                          }
                          placeholder="e.g. Connect on WhatsApp"
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Destination URL
                        </label>
                        <input
                          type="text"
                          value={currentArticle.secondaryCta?.url || ""}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              secondaryCta: { ...currentArticle.secondaryCta, url: e.target.value }
                            })
                          }
                          placeholder="https://wa.me/..."
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                          Open Behavior
                        </label>
                        <select
                          value={currentArticle.secondaryCta?.target || "_blank"}
                          onChange={(e) =>
                            setCurrentArticle({
                              ...currentArticle,
                              secondaryCta: { ...currentArticle.secondaryCta, target: e.target.value }
                            })
                          }
                          className="w-full bg-[#0F1522] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="_blank">New Tab (_blank)</option>
                          <option value="_self">Same Tab (_self)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* =========================================================================
                  SEO METADATA MANAGEMENT
                  ========================================================================= */}
              <div className="p-5 bg-[#0F1522] border border-[#1E283A] rounded space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                    SEO & Social Sharing Metadata
                  </h4>
                  <p className="text-[11px] text-[#7A8796]">
                    Configure custom Google search and social card meta tags
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                      Meta Title (Browser tab & search title)
                    </label>
                    <input
                      type="text"
                      value={currentArticle.seo?.metaTitle || ""}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          seo: { ...currentArticle.seo, metaTitle: e.target.value }
                        })
                      }
                      placeholder={currentArticle.title || "Custom SEO Title..."}
                      className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                      Meta Description (Search engine snippet)
                    </label>
                    <textarea
                      rows={2}
                      value={currentArticle.seo?.metaDescription || ""}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          seo: { ...currentArticle.seo, metaDescription: e.target.value }
                        })
                      }
                      placeholder={currentArticle.excerpt || "Custom SEO Description..."}
                      className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#7A8796] font-semibold mb-1">
                      Custom OpenGraph Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={currentArticle.seo?.ogImage || ""}
                      onChange={(e) =>
                        setCurrentArticle({
                          ...currentArticle,
                          seo: { ...currentArticle.seo, ogImage: e.target.value }
                        })
                      }
                      placeholder={currentArticle.featuredImage || "/images/news/..."}
                      className="w-full bg-[#080B10] border border-[#1E283A] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#1E283A] flex items-center justify-between sticky bottom-0 bg-[#0B0F17] py-4">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 bg-[#172233] hover:bg-[#202E44] text-[#828F9E] hover:text-white text-xs font-semibold rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#C5A880] hover:bg-[#D5B890] text-[#080B10] text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-lg cursor-pointer"
                  >
                    Save Article & Update CMS
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

