"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Edit3, Save, X, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import UniversalYachtDetailView from "@/components/public/yacht-details/UniversalYachtDetailView";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import { getYachtShowcaseData, mergeYachtWithShowcase } from "@/lib/data/yachtShowcaseData";
import { getYachtBySlug, syncYachtsFromServer, saveYachtAsync } from "@/lib/cmsStore";

export default function YachtDetailPageClient({ initialSlug }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSlug = initialSlug || params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [cmsYacht, setCmsYacht] = useState(() => (slug ? getYachtBySlug(slug) : null));

  // Client In-Line Editing State
  const editParam = searchParams?.get("edit");
  const [isInlineEditing, setIsInlineEditing] = useState(editParam === "true" || editParam === "1");
  const [workingData, setWorkingData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Media Picker Config
  const [mediaPickerConfig, setMediaPickerConfig] = useState({
    isOpen: false,
    fieldKey: null,
    currentUrl: "",
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    // Initial fetch from server API
    syncYachtsFromServer().then(() => {
      if (slug) {
        const found = getYachtBySlug(slug);
        setCmsYacht(found);
      }
    });

    if (slug) {
      setCmsYacht(getYachtBySlug(slug));
    }

    // Reactive listener for live updates when saved in /admin/yachts
    const handleUpdate = () => {
      if (slug) {
        setCmsYacht(getYachtBySlug(slug));
      }
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  // Retrieve base static showcase details (cutaways, original imagery)
  const staticShowcase = getYachtShowcaseData(slug);

  // If no CMS record and no showcase found: 404 Not Found
  if (!cmsYacht && !staticShowcase) {
    return (
      <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] flex flex-col justify-between">
        <PublicNavbar />
        <div className="py-40 text-center space-y-4 px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C8A870] block">
            404 • VESSEL NOT FOUND
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-light">
            Yacht Model Not Found
          </h1>
          <p className="text-sm text-[#828F9E] max-w-md mx-auto leading-relaxed">
            The requested vessel dossier could not be located in the shipyard catalog or has not yet been registered.
          </p>
          <div className="pt-4">
            <Link
              href="/yachts"
              className="saxdor-btn-solid !h-[48px] px-8 text-xs inline-flex items-center justify-center rounded-none tracking-wider"
            >
              Return to Fleet Catalog
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Authoritative merged yacht dataset
  const baseData = mergeYachtWithShowcase(cmsYacht, staticShowcase);
  const displayData = workingData || baseData;

  // In-line update handler for any vessel property
  const handleUpdateField = (field, value) => {
    setWorkingData((prev) => {
      const current = prev || baseData;
      return {
        ...current,
        [field]: value,
      };
    });
    setHasChanges(true);
  };

  // Media Picker handlers for in-line photo replacements
  const handleOpenMediaPicker = (fieldKey, currentUrl = "") => {
    setMediaPickerConfig({
      isOpen: true,
      fieldKey,
      currentUrl: currentUrl || "",
    });
  };

  const handleSelectMedia = (urlOrItem) => {
    if (!mediaPickerConfig.fieldKey) {
      setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" });
      return;
    }

    const url = typeof urlOrItem === "string" ? urlOrItem : (urlOrItem?.url || urlOrItem?.src || "");
    if (!url) return;

    const key = mediaPickerConfig.fieldKey;
    const current = workingData || baseData;

    if (key === "insigniaSrc") {
      handleUpdateField("insigniaSrc", url);
    } else if (key.startsWith("heroImages[")) {
      const match = key.match(/\[(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const images = [...(current.heroImages || [])];
        if (images[idx]) {
          images[idx] = { ...images[idx], src: url };
          handleUpdateField("heroImages", images);
        }
      }
    } else if (key.startsWith("deckPlan_")) {
      const deckId = key.replace("deckPlan_", "");
      const decks = (current.deckPlans || []).map((d) =>
        d.id === deckId ? { ...d, image3D: url } : d
      );
      handleUpdateField("deckPlans", decks);
    } else if (key.startsWith("gallery_")) {
      const photoId = key.replace("gallery_", "");
      const gallery = (current.gallery || []).map((g) =>
        g.id === photoId ? { ...g, src: url } : g
      );
      handleUpdateField("gallery", gallery);
    }

    setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" });
    showToast("Visual updated on page");
  };

  // Save changes directly to database & local store
  const handleSaveChanges = async () => {
    setIsSaving(true);
    const payload = {
      ...(workingData || baseData),
      updatedAt: new Date().toISOString(),
    };

    const res = await saveYachtAsync(payload);
    setIsSaving(false);

    if (res.success) {
      setCmsYacht(payload);
      setWorkingData(payload);
      setHasChanges(false);
      showToast(`✓ "${payload.fullName || payload.name}" published and saved live!`);
    } else {
      showToast(res.error || "Failed to persist changes");
    }
  };

  // Draft Handling:
  // If the vessel is explicitly marked as draft and user is not in editor mode
  if (displayData.status === "draft" && !isInlineEditing) {
    const modelTitle = `${displayData.fullName || displayData.name} (Draft)`;
    const modelDesc =
      "This vessel dossier is currently in private draft preparation and has not yet been published to the live public catalog.";

    return (
      <>
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <UnderConstructionView
          pageTitle={modelTitle}
          pageSlug={`/yachts/${slug || ""}`}
          description={modelDesc}
          customBadge="DRAFT VESSEL"
          yacht={displayData}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080B10]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 bg-[#0C121D] border border-[#C8A870] text-[#DFBA73] text-xs font-mono shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#C8A870]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Toolbar When In-Line Editing is Active */}
      {isInlineEditing && (
        <div className="sticky top-0 z-50 bg-[#070A0F]/95 backdrop-blur-md border-b border-[#C8A870]/40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#C8A870] animate-pulse"></span>
            <span className="text-xs uppercase tracking-luxury text-[#E5C392] font-semibold">
              Client Direct In-Line Editor
            </span>
            <span className="text-xs text-white/50 font-mono hidden sm:inline">
              • {displayData.fullName || displayData.name}
            </span>
            {hasChanges && (
              <span className="px-2 py-0.5 bg-[#C8A870]/20 text-[#DFBA73] border border-[#C8A870]/40 text-[10px] font-mono rounded">
                Unsaved edits
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-4 py-2 bg-[#C8A870] hover:bg-[#DFBA73] text-[#080B10] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (hasChanges && !confirm("Discard unsaved in-line edits?")) return;
                setWorkingData(null);
                setHasChanges(false);
                setIsInlineEditing(false);
              }}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Editor</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Yacht Detail View */}
      <UniversalYachtDetailView
        data={displayData}
        isEditable={isInlineEditing}
        onUpdateField={handleUpdateField}
        onOpenMediaPicker={handleOpenMediaPicker}
      />

      {/* Media Picker Modal for Visual Replacements */}
      <MediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        onClose={() => setMediaPickerConfig({ isOpen: false, fieldKey: null, currentUrl: "" })}
        onSelect={handleSelectMedia}
        onSelectImage={handleSelectMedia}
        onSelectMedia={handleSelectMedia}
        currentUrl={mediaPickerConfig.currentUrl}
      />
    </div>
  );
}
