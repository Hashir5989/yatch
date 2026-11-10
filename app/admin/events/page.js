"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  CalendarDays, 
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
  MapPin,
  Ship,
  Camera,
  Layers,
  Award
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import { 
  getAllEvents, 
  saveEvent, 
  saveEventAsync,
  deleteEvent,
  deleteEventAsync,
  togglePublishEvent,
  togglePublishEventAsync,
  syncEventsFromServer
} from "@/lib/cmsStore";

const EVENT_CATEGORIES = [
  "All",
  "Boat Show",
  "Exhibition",
  "VIP Showcase",
  "Private Preview",
  "Regatta & Cruising"
];

const PHOTO_TAG_PRESETS = [
  "FIREWORKS",
  "EVENING SHOWCASE",
  "EXHIBITION",
  "CEREMONY",
  "CRAFTSMANSHIP",
  "SUPERYACHT",
  "BOAT SHOW",
  "WATERFRONT",
  "SHIPYARD",
  "VIP DEBUT"
];

function generateSlug(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminEventsScreen() {
  const [events, setEvents] = useState(() => getAllEvents(false));
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);

  // Editor Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState("featured"); // 'featured' or 'gallery'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Gallery item being added/edited
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [photoInputTitle, setPhotoInputTitle] = useState("");
  const [photoInputAlt, setPhotoInputAlt] = useState("");
  const [photoInputTag, setPhotoInputTag] = useState("FIREWORKS");

  const loadEvents = () => {
    setEvents(getAllEvents(false));
  };

  useEffect(() => {
    syncEventsFromServer(false).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setEvents(synced);
      }
    });
    const handleUpdate = () => loadEvents();
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Create new blank event
  const handleCreateNew = () => {
    const newEv = {
      id: `event-${Date.now()}`,
      slug: "",
      aliases: [],
      title: "",
      subtitle: "",
      heroHeadline: "",
      category: "Boat Show",
      badge: "EXHIBITION SHOWCASE",
      dateBadge: { day: "01 — 05", monthYear: "NOV 2026", locationShort: "WATERFRONT" },
      dates: "",
      venue: "",
      vessel: "",
      presentedBy: "AL SHAALI MARINE – UAE",
      status: "published",
      featuredImage: "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg",
      featuredImageAlt: "",
      excerpt: "",
      description: "",
      warrantyCallout: "",
      highlights: [],
      pressDispatchSlug: "",
      photos: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"
      },
      displayOrder: events.length + 1
    };
    setCurrentEvent(newEv);
    setSlugManuallyEdited(false);
    setIsEditorOpen(true);
  };

  // Open existing event for editing
  const handleEdit = (ev) => {
    setCurrentEvent(JSON.parse(JSON.stringify(ev)));
    setSlugManuallyEdited(true);
    setIsEditorOpen(true);
  };

  // Toggle publish status directly
  const handleToggleStatus = async (ev) => {
    const updated = await togglePublishEventAsync(ev.id);
    if (updated && updated.success) {
      showToast(`Event marked as ${updated.event?.status || "updated"}`);
      loadEvents();
    } else {
      showToast("Updated event status");
      loadEvents();
    }
  };

  // Delete event with confirmation
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      const res = await deleteEventAsync(id);
      if (res && res.success) {
        showToast("Event showcase deleted successfully.");
        loadEvents();
      } else {
        showToast(res?.error || "Error deleting event");
      }
    }
  };

  // Save event changes from editor
  const handleSaveEvent = async () => {
    if (!currentEvent.title || !currentEvent.title.trim()) {
      alert("Please provide an Event Title.");
      return;
    }

    setIsSaving(true);
    let finalSlug = currentEvent.slug?.trim();
    if (!finalSlug) {
      finalSlug = generateSlug(currentEvent.title);
    }

    const payload = {
      ...currentEvent,
      title: currentEvent.title.trim(),
      slug: finalSlug,
      featuredImageAlt: currentEvent.featuredImageAlt || currentEvent.title,
      seo: {
        ...currentEvent.seo,
        metaTitle: currentEvent.seo?.metaTitle || `${currentEvent.title} | ASMARATY Luxury Yachts`,
        metaDescription: currentEvent.seo?.metaDescription || currentEvent.excerpt,
        ogImage: currentEvent.seo?.ogImage || currentEvent.featuredImage
      }
    };

    const res = await saveEventAsync(payload);
    setIsSaving(false);

    if (res && res.success) {
      showToast("Event showcase saved and synced to database.");
      setIsEditorOpen(false);
      setCurrentEvent(null);
      loadEvents();
    } else {
      showToast(res?.error || "Failed to save event");
    }
  };

  // Media Picker callbacks
  const handleMediaSelected = (mediaItem) => {
    const url = mediaItem.url || mediaItem.src;
    if (mediaPickerTarget === "featured") {
      setCurrentEvent((prev) => ({
        ...prev,
        featuredImage: url,
        seo: { ...prev.seo, ogImage: url }
      }));
    } else if (mediaPickerTarget === "gallery") {
      setPhotoInputUrl(url);
      if (!photoInputAlt) {
        setPhotoInputAlt(mediaItem.title || mediaItem.caption || "Event photograph");
      }
    }
    setMediaPickerOpen(false);
  };

  // Direct file upload to /api/media
  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("category", "events");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (data.success && data.item) {
        const url = data.item.url;
        if (mediaPickerTarget === "featured") {
          setCurrentEvent((prev) => ({
            ...prev,
            featuredImage: url,
            seo: { ...prev.seo, ogImage: url }
          }));
        } else if (mediaPickerTarget === "gallery") {
          setPhotoInputUrl(url);
          if (!photoInputAlt) {
            setPhotoInputAlt(file.name.replace(/\.[^/.]+$/, ""));
          }
        }
        showToast("Image uploaded successfully.");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Direct upload error:", err);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Add highlight to current event
  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setCurrentEvent((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlight.trim()]
    }));
    setNewHighlight("");
  };

  const handleRemoveHighlight = (idx) => {
    setCurrentEvent((prev) => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, i) => i !== idx)
    }));
  };

  // Gallery photo management
  const handleAddPhoto = () => {
    if (!photoInputUrl.trim()) {
      alert("Please provide a photo URL or choose an image.");
      return;
    }

    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: photoInputUrl.trim(),
      title: photoInputTitle.trim() || "Waterfront Exhibition Photo",
      alt: photoInputAlt.trim() || currentEvent.title || "Event photo",
      tag: photoInputTag || "FIREWORKS"
    };

    setCurrentEvent((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), newPhoto]
    }));

    setPhotoInputUrl("");
    setPhotoInputTitle("");
    setPhotoInputAlt("");
    setPhotoInputTag("FIREWORKS");
  };

  const handleRemovePhoto = (id) => {
    setCurrentEvent((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== id)
    }));
  };

  const handleMovePhoto = (index, direction) => {
    const list = [...(currentEvent.photos || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setCurrentEvent((prev) => ({ ...prev, photos: list }));
  };

  // Filtered event list
  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      (ev.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.venue || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.vessel || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.slug || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || ev.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || ev.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Overview metric stats
  const totalCount = events.length;
  const publishedCount = events.filter((e) => e.status === "published").length;
  const upcomingCount = events.filter((e) => (e.badge || "").includes("UPCOMING") || (e.dates || "").includes("2026") || (e.dates || "").includes("2027")).length;
  const totalPhotosCount = events.reduce((acc, curr) => acc + (curr.photos?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E8EAEE] flex flex-col">
      <CmsHeader
        title="Events & Exhibitions"
        subtitle="Manage international boat shows, regional premieres, fireworks showcases, and waterfront exhibition photo archives."
      />

      <div className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8">
        {/* Metric Badges Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0D1522] border border-white/10 p-5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#C6A155]">Total Events</span>
            <div className="font-serif text-3xl text-white font-medium">{totalCount}</div>
            <span className="text-[11px] text-white/50">Curated Showcases</span>
          </div>
          <div className="bg-[#0D1522] border border-white/10 p-5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#25D366]">Published</span>
            <div className="font-serif text-3xl text-[#25D366] font-medium">{publishedCount}</div>
            <span className="text-[11px] text-white/50">Live on /events</span>
          </div>
          <div className="bg-[#0D1522] border border-white/10 p-5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#DFBA73]">Upcoming</span>
            <div className="font-serif text-3xl text-[#DFBA73] font-medium">{upcomingCount}</div>
            <span className="text-[11px] text-white/50">Scheduled Calendar</span>
          </div>
          <div className="bg-[#0D1522] border border-white/10 p-5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#C6A155]">Curated Photos</span>
            <div className="font-serif text-3xl text-white font-medium">{totalPhotosCount}</div>
            <span className="text-[11px] text-white/50">High-Res Records</span>
          </div>
        </div>

        {/* Action Bar: Search, Category, Status & Create */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0D1522] p-4 border border-white/10">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, venue, vessel, or slug..."
                className="w-full pl-10 pr-4 py-2 bg-[#080B10] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C6A155]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-[#080B10] border border-white/15 text-xs text-white/80 focus:outline-none focus:border-[#C6A155]"
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-[#080B10] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "all" ? "bg-[#C6A155] text-black font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "published" ? "bg-[#C6A155] text-black font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === "draft" ? "bg-[#C6A155] text-black font-bold" : "text-white/60 hover:text-white"
                }`}
              >
                Drafts
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events"
              target="_blank"
              className="saxdor-btn-outline !h-[38px] px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer text-white/80 border-white/20 hover:text-white hover:border-white"
            >
              <span>Live Events Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleCreateNew}
              className="saxdor-btn-solid !h-[38px] px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>New Event Showcase</span>
            </button>
          </div>
        </div>

        {/* Events Grid Listing */}
        {filteredEvents.length === 0 ? (
          <div className="bg-[#0D1522] border border-white/10 p-12 text-center space-y-4">
            <CalendarDays className="w-12 h-12 text-[#C6A155]/40 mx-auto" />
            <h3 className="font-serif text-lg text-white font-medium">No Event Showcases Found</h3>
            <p className="text-xs text-white/60 max-w-md mx-auto">
              No events matched your current search filters. Click below to create your first event showcase.
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="saxdor-btn-solid !h-[38px] px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Showcase</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const isPub = ev.status === "published";
              return (
                <div
                  key={ev.id}
                  className="bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all flex flex-col justify-between overflow-hidden group shadow-xl"
                >
                  {/* Top Image Preview */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/60">
                    <img
                      src={ev.featuredImage || "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"}
                      alt={ev.featuredImageAlt || ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-transparent to-black/40" />

                    {/* Date Badge Overlay */}
                    {ev.dateBadge && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/85 backdrop-blur-md border border-white/20 text-left pointer-events-none">
                        <span className="block font-serif text-xs font-bold text-white leading-none">
                          {ev.dateBadge.day}
                        </span>
                        <span className="block font-mono text-[8px] uppercase tracking-wider text-[#DFBA73]">
                          {ev.dateBadge.monthYear}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                        isPub ? "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/40" : "bg-white/10 text-white/60 border-white/20"
                      }`}>
                        {isPub ? "Published" : "Draft"}
                      </span>
                    </div>

                    {/* Photos Count Badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono">
                        <Camera className="w-3 h-3 text-[#C6A155]" />
                        <span>{ev.photos?.length || 0} Photos</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#DFBA73] truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{ev.venue || "Waterfront Berth"}</span>
                      </div>

                      <h3 className="font-serif text-base text-white font-medium leading-snug line-clamp-2">
                        {ev.title}
                      </h3>

                      {ev.vessel && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-white/70 font-light truncate">
                          <Ship className="w-3 h-3 text-[#C6A155] shrink-0" />
                          <span className="truncate">{ev.vessel}</span>
                        </div>
                      )}

                      <p className="text-xs text-white/60 line-clamp-2 font-light leading-relaxed">
                        {ev.excerpt || "No overview provided."}
                      </p>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(ev)}
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                          title={isPub ? "Unpublish event (set to draft)" : "Publish event"}
                        >
                          {isPub ? <Eye className="w-3.5 h-3.5 text-[#25D366]" /> : <EyeOff className="w-3.5 h-3.5 text-white/50" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(ev)}
                          className="p-1.5 bg-white/5 hover:bg-[#C6A155] border border-white/10 text-white/80 hover:text-black transition-all cursor-pointer"
                          title="Edit event details & photos"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/events/${ev.slug}`}
                          target="_blank"
                          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
                          title="Open live public event page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id, ev.title)}
                        className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Delete event showcase"
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

      {/* ==============================================================
          FULL EVENT SHOWCASE EDITOR MODAL / DRAWER
          ============================================================== */}
      {isEditorOpen && currentEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-[#0D1522] border border-white/15 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#080B10]">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-[#C6A155]" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] block">
                    EVENT & EXHIBITION BUILDER
                  </span>
                  <h3 className="font-serif text-lg text-white font-medium">
                    {currentEvent.title ? currentEvent.title : "New Event Showcase"}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
                aria-label="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 text-xs">
              {/* SECTION 1: ESSENTIAL DETAILS */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-bold block border-b border-white/10 pb-1">
                  1. BASIC INFORMATION & STATUS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Event Title *</label>
                    <input
                      type="text"
                      value={currentEvent.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentEvent((prev) => ({
                          ...prev,
                          title: val,
                          slug: slugManuallyEdited ? prev.slug : generateSlug(val)
                        }));
                      }}
                      placeholder="e.g. Qatar International Boat Show 2026"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Subtitle / Exhibition Theme</label>
                    <input
                      type="text"
                      value={currentEvent.subtitle || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g. Regional Debut of ASMARATY G77 Luxury Yacht"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">URL Slug</label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2 bg-[#05070A] border border-r-0 border-white/15 text-white/40 font-mono text-[11px]">
                        /events/
                      </span>
                      <input
                        type="text"
                        value={currentEvent.slug || ""}
                        onChange={(e) => {
                          setSlugManuallyEdited(true);
                          setCurrentEvent((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                        }}
                        placeholder="qatar-international-boat-show-2026"
                        className="flex-1 px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155] font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Event Category</label>
                    <select
                      value={currentEvent.category || "Boat Show"}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    >
                      {EVENT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Ribbon Badge</label>
                    <input
                      type="text"
                      value={currentEvent.badge || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. REGIONAL DEBUT, FEATURED UPCOMING"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Status</label>
                    <select
                      value={currentEvent.status || "published"}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    >
                      <option value="published">Published (Visible to visitors)</option>
                      <option value="draft">Draft (Hidden from public)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Display Order</label>
                    <input
                      type="number"
                      value={currentEvent.displayOrder ?? 1}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHEDULE, LOCATION & YACHT DETAILS */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-bold block border-b border-white/10 pb-1">
                  2. SCHEDULE, VENUE & VESSEL SPECIFICATION
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Dates String</label>
                    <input
                      type="text"
                      value={currentEvent.dates || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, dates: e.target.value }))}
                      placeholder="e.g. 4th – 7th November 2026"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Venue & Stand Berth</label>
                    <input
                      type="text"
                      value={currentEvent.venue || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, venue: e.target.value }))}
                      placeholder="e.g. Stand D06 | Old Doha Port, Doha, Qatar"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Showcased Yacht / Fleet</label>
                    <input
                      type="text"
                      value={currentEvent.vessel || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, vessel: e.target.value }))}
                      placeholder="e.g. ASMARATY G77 Luxury Yacht (77 FT)"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Presented By</label>
                    <input
                      type="text"
                      value={currentEvent.presentedBy || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, presentedBy: e.target.value }))}
                      placeholder="e.g. AL SHAALI MARINE – UAE"
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  {/* Date Badge Mini Widget */}
                  <div className="sm:col-span-2 grid grid-cols-3 gap-3 bg-[#080B10] p-3 border border-white/10">
                    <div className="space-y-1">
                      <label className="text-white/60 font-mono text-[10px]">Date Badge: Day Numbers</label>
                      <input
                        type="text"
                        value={currentEvent.dateBadge?.day || ""}
                        onChange={(e) => setCurrentEvent((prev) => ({
                          ...prev,
                          dateBadge: { ...prev.dateBadge, day: e.target.value }
                        }))}
                        placeholder="04 — 07"
                        className="w-full px-2.5 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/60 font-mono text-[10px]">Date Badge: Month & Year</label>
                      <input
                        type="text"
                        value={currentEvent.dateBadge?.monthYear || ""}
                        onChange={(e) => setCurrentEvent((prev) => ({
                          ...prev,
                          dateBadge: { ...prev.dateBadge, monthYear: e.target.value }
                        }))}
                        placeholder="NOV 2026"
                        className="w-full px-2.5 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/60 font-mono text-[10px]">Date Badge: Location Short</label>
                      <input
                        type="text"
                        value={currentEvent.dateBadge?.locationShort || ""}
                        onChange={(e) => setCurrentEvent((prev) => ({
                          ...prev,
                          dateBadge: { ...prev.dateBadge, locationShort: e.target.value }
                        }))}
                        placeholder="OLD DOHA PORT"
                        className="w-full px-2.5 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: FEATURED HERO BANNER IMAGE (FIREWORKS / SHOWCASE) */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-bold block border-b border-white/10 pb-1">
                  3. FEATURED EVENT BANNER (SEPARATE FROM NEWS)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="aspect-[16/10] bg-black/50 border border-white/15 overflow-hidden relative group">
                    <img
                      src={currentEvent.featuredImage || "/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <div className="space-y-1">
                      <label className="text-white/80 font-mono text-[11px]">Featured Image URL (Fireworks / Boat Show View)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentEvent.featuredImage || ""}
                          onChange={(e) => setCurrentEvent((prev) => ({ ...prev, featuredImage: e.target.value }))}
                          placeholder="/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"
                          className="flex-1 px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget("featured");
                            setMediaPickerOpen(true);
                          }}
                          className="saxdor-btn-outline !h-[38px] px-3 text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer text-[#C6A155] border-[#C6A155]/40"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Media Library</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/80 font-mono text-[11px]">Image Alt Description</label>
                      <input
                        type="text"
                        value={currentEvent.featuredImageAlt || ""}
                        onChange={(e) => setCurrentEvent((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
                        placeholder="e.g. Monumental fireworks celebration over Old Doha Port and ASMARATY G77"
                        className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: EDITORIAL NARRATIVE & HIGHLIGHTS */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-bold block border-b border-white/10 pb-1">
                  4. OVERVIEW, NARRATIVE & HIGHLIGHTS
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Executive Excerpt</label>
                    <textarea
                      rows={2}
                      value={currentEvent.excerpt || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Brief 1-2 sentence executive summary of the boat show or exhibition..."
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Full Exhibition Narrative (Multi-paragraph)</label>
                    <textarea
                      rows={7}
                      value={currentEvent.description || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed retrospective and coverage of the event. Separate paragraphs with blank lines."
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155] font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/80 font-mono text-[11px]">Warranty / Shipyard Callout Text</label>
                    <textarea
                      rows={3}
                      value={currentEvent.warrantyCallout || ""}
                      onChange={(e) => setCurrentEvent((prev) => ({ ...prev, warrantyCallout: e.target.value }))}
                      placeholder="e.g. Announcement of the landmark 25-Year Shipyard Hull Integrity Warranty..."
                      className="w-full px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                    />
                  </div>

                  {/* Dynamic Highlights List */}
                  <div className="space-y-2 pt-2">
                    <label className="text-white/80 font-mono text-[11px]">Event Key Highlights</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddHighlight();
                          }
                        }}
                        placeholder="Add a key achievement or appointment..."
                        className="flex-1 px-3 py-2 bg-[#080B10] border border-white/15 text-white focus:outline-none focus:border-[#C6A155]"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="saxdor-btn-solid !h-[38px] px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {Array.isArray(currentEvent.highlights) && currentEvent.highlights.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {currentEvent.highlights.map((hl, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-[#080B10] border border-white/10">
                            <span className="text-white/90 text-xs font-light">{hl}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(idx)}
                              className="text-white/40 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                              title="Remove highlight"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: EVENT PHOTO GALLERY (COMPLETELY SEPARATE FROM NEWS) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#DFBA73] font-bold block">
                      5. OFFICIAL PHOTOGRAPHIC RECORD (SEPARATE EVENT GALLERY)
                    </span>
                    <span className="text-[10px] text-white/50">
                      Curate fireworks, evening illuminations, stand ceremonies, and yacht exhibitions.
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#C6A155]">
                    {currentEvent.photos?.length || 0} Photographs
                  </span>
                </div>

                {/* Photo Add Input Box */}
                <div className="bg-[#080B10] p-4 border border-white/15 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-white/70 font-mono text-[10px]">Photo Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={photoInputUrl}
                          onChange={(e) => setPhotoInputUrl(e.target.value)}
                          placeholder="/images/news/qibs-2026-asmaraty-g77-fireworks-main.jpg"
                          className="flex-1 px-3 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMediaPickerTarget("gallery");
                            setMediaPickerOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-[#C6A155] text-white hover:text-black border border-white/20 transition-all text-xs font-mono cursor-pointer"
                        >
                          Pick
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/70 font-mono text-[10px]">Photo Category Tag</label>
                      <select
                        value={photoInputTag}
                        onChange={(e) => setPhotoInputTag(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs"
                      >
                        {PHOTO_TAG_PRESETS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/70 font-mono text-[10px]">Photo Title</label>
                      <input
                        type="text"
                        value={photoInputTitle}
                        onChange={(e) => setPhotoInputTitle(e.target.value)}
                        placeholder="e.g. Waterfront Fireworks Display"
                        className="w-full px-3 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-white/70 font-mono text-[10px]">Photo Alt Text</label>
                      <input
                        type="text"
                        value={photoInputAlt}
                        onChange={(e) => setPhotoInputAlt(e.target.value)}
                        placeholder="e.g. Spectacular fireworks celebration over the marina"
                        className="w-full px-3 py-1.5 bg-[#05070A] border border-white/15 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="saxdor-btn-solid !h-[34px] px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photograph to Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Existing Gallery Photos List */}
                {Array.isArray(currentEvent.photos) && currentEvent.photos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentEvent.photos.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="flex items-center gap-3 p-3 bg-[#080B10] border border-white/10 group"
                      >
                        <div className="w-16 h-12 bg-black/60 border border-white/15 shrink-0 overflow-hidden">
                          <img
                            src={p.url}
                            alt={p.alt || p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono text-[#C6A155] uppercase tracking-wider block">
                            {p.tag || "FIREWORKS"}
                          </span>
                          <h4 className="text-xs text-white font-medium truncate">{p.title}</h4>
                          <span className="text-[10px] text-white/40 truncate block">{p.url}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, 1)}
                            disabled={idx === currentEvent.photos.length - 1}
                            className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(p.id)}
                            className="p-1 text-white/40 hover:text-rose-400 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#080B10] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                  className="saxdor-btn-solid !h-[40px] px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? "Saving Event..." : "Save Event Showcase"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input for Direct Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectUpload}
        className="hidden"
      />

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelectMedia={handleMediaSelected}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#C6A155] text-black px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 border border-black/20 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

