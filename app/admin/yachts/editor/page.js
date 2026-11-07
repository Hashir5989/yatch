"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Anchor,
  Layers,
  Compass,
  Sliders,
  Check
} from "lucide-react";

import UniversalYachtDetailView from "@/components/public/yacht-details/UniversalYachtDetailView";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import AdminAuthGuard from "@/components/cms/AdminAuthGuard";
import { getAllYachts, syncYachtsFromServer, saveYachtAsync } from "@/lib/cmsStore";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";
import { getYachtShowcaseData, mergeYachtWithShowcase } from "@/lib/data/yachtShowcaseData";

function VisualYachtEditorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const querySlug = searchParams?.get("slug") || "g100";

  // Available Yachts
  const [yachtsList, setYachtsList] = useState(() => getAllYachts());
  const [selectedSlug, setSelectedSlug] = useState(querySlug);
  const [viewportMode, setViewportMode] = useState("desktop"); // desktop, tablet, mobile
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Active Yacht In-Memory State
  const [activeYachtData, setActiveYachtData] = useState(null);

  // Media Picker Config
  const [mediaPickerConfig, setMediaPickerConfig] = useState({
    isOpen: false,
    fieldKey: null,
    currentUrl: ""
  });

  const showToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync yachts from server on mount
  useEffect(() => {
    syncYachtsFromServer().then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachtsList(synced);
      }
    });

    const handleUpdate = () => {
      setYachtsList(getAllYachts());
    };
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Update active yacht data when selectedSlug or yachtsList changes
  useEffect(() => {
    const all = yachtsList.length > 0 ? yachtsList : DEFAULT_YACHTS;
    const cmsYacht = all.find((y) => y.slug === selectedSlug) || all[0] || DEFAULT_YACHTS[0];
    const staticShowcase = getYachtShowcaseData(selectedSlug) || getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cmsYacht, staticShowcase);
    setActiveYachtData(merged);
    setHasUnsavedChanges(false);
  }, [selectedSlug, yachtsList]);

  // Handle switching model from dropdown
  const handleModelChange = (newSlug) => {
    setSelectedSlug(newSlug);
    router.replace(`/admin/yachts/editor?slug=${newSlug}`);
  };

  // Field Update Handler
  const handleUpdateField = (field, value) => {
    setActiveYachtData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (field === "keyMetrics") {
        updated.keyMetrics = value;
        const loaMetric = value.find(
          (m) =>
            m.label?.toLowerCase().includes("length") ||
            m.label?.toLowerCase().includes("loa")
        );
        if (loaMetric && loaMetric.main) {
          updated.length = loaMetric.main;
          updated.specsSnapshot = {
            ...(updated.specsSnapshot || {}),
            loa: loaMetric.main,
          };
        }
      }
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  // Save changes (draft or published)
  const handlePersistYacht = async (targetStatus = null) => {
    if (!activeYachtData) return;
    setIsSaving(true);

    const status = targetStatus || activeYachtData.status || "published";
    const payload = {
      ...activeYachtData,
      status,
      updatedAt: new Date().toISOString()
    };

    const res = await saveYachtAsync(payload);
    setIsSaving(false);

    if (res.success) {
      setHasUnsavedChanges(false);
      showToast(
        `"${payload.name || payload.modelNumber}" ${status === "published" ? "published live" : "saved as draft"}!`
      );
    } else {
      showToast(res.error || "Failed to persist yacht changes", "error");
    }
  };

  // Media Picker handlers
  const handleOpenMediaPicker = (fieldKey, currentUrl = "") => {
    setMediaPickerConfig({
      isOpen: true,
      fieldKey,
      currentUrl: currentUrl || ""
    });
  };

  const handleSelectMedia = (url) => {
    if (!mediaPickerConfig.fieldKey || !activeYachtData) {
      setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" });
      return;
    }

    const key = mediaPickerConfig.fieldKey;

    if (key === "insigniaSrc") {
      handleUpdateField("insigniaSrc", url);
    } else if (key.startsWith("heroImages[")) {
      const match = key.match(/\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const images = [...(activeYachtData.heroImages || [])];
        if (images[idx]) {
          images[idx] = { ...images[idx], src: url };
          handleUpdateField("heroImages", images);
        }
      }
    } else if (key.startsWith("deckPlan_")) {
      const deckId = key.replace("deckPlan_", "");
      const decks = (activeYachtData.deckPlans || []).map((d) =>
        d.id === deckId ? { ...d, image3D: url } : d
      );
      handleUpdateField("deckPlans", decks);
    } else if (key.startsWith("gallery_")) {
      const photoId = key.replace("gallery_", "");
      const gallery = (activeYachtData.gallery || []).map((g) =>
        g.id === photoId ? { ...g, src: url } : g
      );
      handleUpdateField("gallery", gallery);
    }

    setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" });
    showToast("Visual updated on page");
  };

  const allAvailableYachts = yachtsList.length > 0 ? yachtsList : DEFAULT_YACHTS;

  return (
    <div className="min-h-screen bg-[#06080D] text-[#E8EAEE] flex flex-col">
      {/* Top Authoritative Bar */}
      <header className="h-16 bg-[#080B10] border-b border-[#C6A155]/40 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-50 shadow-2xl backdrop-blur-md">
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/yachts"
            className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Back to Vessel Registry"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6A155] font-bold">
                VISUAL YACHT DOSSIER EDITOR
              </span>
              {hasUnsavedChanges ? (
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-600/60 animate-pulse">
                  Unsaved Changes
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-600/60">
                  Synced Live
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#828F9E] hidden sm:block">
              In-line WYSIWYG editing for technical specifications, narrative, and media
            </p>
          </div>
        </div>

        {/* Center: Model Selector Dropdown & Viewport Switchers */}
        <div className="flex items-center gap-3">
          {/* Yacht Model Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#A7B3C2] font-semibold hidden md:inline-block">
              Model:
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => handleModelChange(e.target.value)}
              className="px-3 py-1.5 bg-[#0E1522] border border-[#C6A155] text-[#DFBA73] font-serif text-sm font-semibold rounded-none focus:outline-none focus:ring-2 focus:ring-[#C6A155] cursor-pointer shadow-lg"
            >
              {allAvailableYachts.map((y) => (
                <option key={y.slug} value={y.slug} className="bg-[#080B10] text-white">
                  {y.name || y.fullName} ({y.length || y.specs?.lengthOverall || "Bespoke"})
                </option>
              ))}
            </select>
          </div>

          {/* Viewport Devices Switcher */}
          <div className="hidden lg:flex items-center bg-[#0D1420] border border-white/10 rounded p-1">
            <button
              type="button"
              onClick={() => setViewportMode("desktop")}
              className={`p-1.5 rounded transition-all ${
                viewportMode === "desktop"
                  ? "bg-[#C6A155] text-[#080B10] shadow"
                  : "text-white/60 hover:text-white"
              }`}
              title="Desktop 100% Viewport"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("tablet")}
              className={`p-1.5 rounded transition-all ${
                viewportMode === "tablet"
                  ? "bg-[#C6A155] text-[#080B10] shadow"
                  : "text-white/60 hover:text-white"
              }`}
              title="Tablet 768px Viewport"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode("mobile")}
              className={`p-1.5 rounded transition-all ${
                viewportMode === "mobile"
                  ? "bg-[#C6A155] text-[#080B10] shadow"
                  : "text-white/60 hover:text-white"
              }`}
              title="Mobile 375px Viewport"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions (Save Draft, Publish Live, View Public) */}
        <div className="flex items-center gap-2">
          <Link
            href={`/yachts/${selectedSlug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white rounded transition-colors"
            title="Open public page in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live</span>
          </Link>

          <button
            type="button"
            onClick={() => handlePersistYacht("draft")}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#162030] hover:bg-[#1E2B40] text-[#D1D9E4] border border-white/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handlePersistYacht("published")}
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-[#C6A155] hover:bg-[#DFBA73] text-[#080B10] transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-[#C6A155]/20"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isSaving ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-8 z-50 px-5 py-3 rounded shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn border ${
            toastMessage.type === "error"
              ? "bg-red-950/95 text-red-200 border-red-500/50"
              : "bg-[#0E1B2D] text-[#DFBA73] border-[#C6A155]/60"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#C6A155] flex-shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Responsive Canvas */}
      <main className="flex-1 bg-[#04060A] py-6 sm:py-10 px-2 sm:px-6 flex justify-center overflow-x-auto">
        <div
          className={`w-full transition-all duration-300 shadow-2xl border border-white/10 overflow-hidden bg-[#080B10] ${
            viewportMode === "desktop"
              ? "max-w-full"
              : viewportMode === "tablet"
              ? "max-w-[768px]"
              : "max-w-[375px]"
          }`}
        >
          {activeYachtData && (
            <UniversalYachtDetailView
              data={activeYachtData}
              isEditable={true}
              showNavAndFooter={true}
              onUpdateField={handleUpdateField}
              onOpenMediaPicker={handleOpenMediaPicker}
            />
          )}
        </div>
      </main>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        onClose={() =>
          setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" })
        }
        onSelectMedia={handleSelectMedia}
        currentUrl={mediaPickerConfig.currentUrl}
      />
    </div>
  );
}

export default function VisualYachtEditorPage() {
  return (
    <AdminAuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#080B10] flex items-center justify-center text-white text-xs">
            Loading Visual Yacht Editor...
          </div>
        }
      >
        <VisualYachtEditorInner />
      </Suspense>
    </AdminAuthGuard>
  );
}

