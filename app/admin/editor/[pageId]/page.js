"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Plus, 
  Monitor, 
  Tablet, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink, 
  Sliders,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Info
} from "lucide-react";

import SectionRenderer from "@/components/public/SectionRenderer";
import UniversalAboutView from "@/components/public/about/UniversalAboutView";
import SectionLibraryModal from "@/components/cms/SectionLibraryModal";
import MediaPickerModal from "@/components/cms/MediaPickerModal";
import SectionQuickDrawer from "@/components/public/SectionQuickDrawer";
import { 
  getPageById, 
  getPageDraft, 
  savePageDraft, 
  savePageDraftAsync,
  publishPage,
  getAuthHeaders 
} from "@/lib/cmsStore";
import { SECTION_TEMPLATES } from "@/lib/data/sectionTemplates";
import { DEFAULT_ABOUT_PAGE } from "@/lib/data/defaultPages";

function VisualPageEditorInner() {
  const params = useParams();
  const router = useRouter();
  const pageId = params?.pageId;

  const isAboutRoute = pageId === "page-about";

  // Page & Draft State
  const [pageMeta, setPageMeta] = useState(() => {
    if (!pageId) return null;
    const p = getPageById(pageId);
    if (!p && isAboutRoute) return DEFAULT_ABOUT_PAGE;
    return p;
  });
  const isAboutPage = isAboutRoute || pageMeta?.slug === "/about";
  const [draftSections, setDraftSections] = useState(() => {
    if (!pageId) return [];
    const draft = getPageDraft(pageId);
    if (draft?.sections && draft.sections.length > 0) return draft.sections;
    if (isAboutRoute) return DEFAULT_ABOUT_PAGE.sections;
    const p = getPageById(pageId);
    return p?.sections || [];
  });
  const [selectedSectionId, setSelectedSectionId] = useState(() => {
    if (!pageId) return null;
    const draft = getPageDraft(pageId);
    return draft?.sections?.[0]?.id || (isAboutRoute ? "about-hero" : null);
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(() => {
    if (!pageId) return false;
    const draft = getPageDraft(pageId);
    return draft?.hasUnpublishedChanges || false;
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Viewport Device Switcher
  const [viewportMode, setViewportMode] = useState("desktop"); // desktop, tablet, mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modals & Drawers
  const [isSectionLibraryOpen, setIsSectionLibraryOpen] = useState(false);
  const [mediaPickerConfig, setMediaPickerConfig] = useState({ isOpen: false, sectionId: null, field: null, currentUrl: "" });
  const [activeDrawerSection, setActiveDrawerSection] = useState(null);

  // Sync Latest Page Data From Server on Mount
  useEffect(() => {
    if (!pageId) return;
    let isMounted = true;

    async function loadLatestPage() {
      try {
        const res = await fetch(`/api/pages/${encodeURIComponent(pageId)}?t=${Date.now()}`, {
          cache: "no-store",
          headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.page && isMounted) {
            const serverPage = data.page;

            // Ensure About Us page always has all 5 sections even if server had older 4-section data
            if (pageId === "page-about" || serverPage.slug === "/about") {
              const defaultAboutSecs = DEFAULT_ABOUT_PAGE.sections;
              const existingIds = new Set((serverPage.sections || []).map((s) => s.id));
              const missing = defaultAboutSecs.filter((s) => !existingIds.has(s.id));
              if (missing.length > 0 || (serverPage.sections || []).length < 5) {
                const merged = defaultAboutSecs.map((defSec) => {
                  const existing = (serverPage.sections || []).find((s) => s.id === defSec.id || s.type === defSec.type);
                  return existing ? { ...defSec, ...existing } : defSec;
                });
                serverPage.sections = merged;
              }
              // Upgrade legacy hero image if still pointing to old photo
              if (serverPage.sections?.[0]?.id === "about-hero" && (!serverPage.sections[0].imageUrl || serverPage.sections[0].imageUrl === "/images/g100-burj-al-arab.jpg")) {
                serverPage.sections[0].imageUrl = "/images/about/asmaraty-about-hero-fireworks.jpg";
              }
            }

            // Check if user has an active unpublished local draft
            const draft = getPageDraft(pageId);
            if (!draft || !draft.hasUnpublishedChanges) {
              setPageMeta(serverPage);
              setDraftSections(serverPage.sections || []);
              setSelectedSectionId((prev) => prev || serverPage.sections?.[0]?.id || null);
              setHasUnsavedChanges(false);
            } else {
              setPageMeta(serverPage);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch page from server:", err);
      }

      // Fallback check
      if (isMounted) {
        let localPage = getPageById(pageId);
        if (!localPage && isAboutRoute) {
          localPage = DEFAULT_ABOUT_PAGE;
        }
        if (!localPage) {
          router.push("/admin");
        } else {
          setPageMeta(localPage);
          if (isAboutRoute && (!draftSections || draftSections.length === 0)) {
            setDraftSections(DEFAULT_ABOUT_PAGE.sections);
          }
        }
      }
    }

    loadLatestPage();

    return () => {
      isMounted = false;
    };
  }, [pageId, router]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  /* ==================== DIRECT ON-PAGE EDITING HANDLERS ==================== */

  // Direct Inline Text Field Update (called when user types right into headings, paragraphs, buttons on the UI)
  const handleUpdateSectionField = (sectionId, fieldName, newValue) => {
    setDraftSections((prev) => {
      const exists = prev.some((sec) => sec.id === sectionId || sec.type === sectionId);
      if (!exists) {
        return [...prev, { id: sectionId, [fieldName]: newValue }];
      }
      return prev.map((sec) =>
        sec.id === sectionId || sec.type === sectionId ? { ...sec, [fieldName]: newValue } : sec
      );
    });
    setHasUnsavedChanges(true);
  };

  // Drawer / Options Batch Update
  const handleUpdateSectionBatch = (sectionId, updatedFields) => {
    setDraftSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, ...updatedFields } : sec))
    );
    setHasUnsavedChanges(true);
    if (activeDrawerSection && activeDrawerSection.id === sectionId) {
      setActiveDrawerSection((prev) => ({ ...prev, ...updatedFields }));
    }
  };

  // Move Section Up or Down directly on the UI
  const handleMoveSection = (sectionId, direction) => {
    const index = draftSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draftSections.length) return;
    const updated = [...draftSections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setDraftSections(updated);
    setHasUnsavedChanges(true);
    showToast("Section order updated");
  };

  // Toggle Visibility
  const handleToggleVisibility = (sectionId) => {
    setDraftSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: sec.visible === false ? true : false } : sec
      )
    );
    setHasUnsavedChanges(true);
  };

  // Duplicate Section
  const handleDuplicateSection = (sectionId) => {
    const index = draftSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    const original = draftSections[index];
    const duplicated = {
      ...JSON.parse(JSON.stringify(original)),
      id: `sec-${Date.now()}`,
      name: `${original.name || original.type} (Copy)`,
    };
    const updated = [...draftSections];
    updated.splice(index + 1, 0, duplicated);
    setDraftSections(updated);
    setSelectedSectionId(duplicated.id);
    setHasUnsavedChanges(true);
    showToast("Section duplicated");
  };

  // Delete Section
  const handleDeleteSection = (sectionId) => {
    if (draftSections.length <= 1) {
      alert("A page must have at least one section.");
      return;
    }
    if (confirm("Remove this section from the page?")) {
      const updated = draftSections.filter((s) => s.id !== sectionId);
      setDraftSections(updated);
      if (selectedSectionId === sectionId) {
        setSelectedSectionId(updated[0]?.id || null);
      }
      if (activeDrawerSection?.id === sectionId) {
        setActiveDrawerSection(null);
      }
      setHasUnsavedChanges(true);
      showToast("Section removed");
    }
  };

  // Add Section from Predefined Templates
  const handleAddSectionFromLibrary = (newSectionData) => {
    const updated = [...draftSections, newSectionData];
    setDraftSections(updated);
    setSelectedSectionId(newSectionData.id);
    setHasUnsavedChanges(true);
    showToast(`Added ${newSectionData.name || newSectionData.type} section`);
    // Scroll to new section
    setTimeout(() => {
      const el = document.getElementById(`section-${newSectionData.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Open Media Picker for a specific section
  const openMediaPicker = (sectionId, fieldKey, currentVal = "") => {
    setMediaPickerConfig({
      isOpen: true,
      sectionId,
      field: fieldKey,
      currentUrl: currentVal,
    });
  };

  const handleSelectMedia = (url) => {
    if (mediaPickerConfig.sectionId && mediaPickerConfig.field) {
      handleUpdateSectionField(mediaPickerConfig.sectionId, mediaPickerConfig.field, url);
    }
    setMediaPickerConfig({ isOpen: false, sectionId: null, field: null, currentUrl: "" });
    showToast("Image updated on page");
  };

  /* ==================== WORKFLOW: SAVE & PUBLISH ==================== */

  const handleSaveDraft = async () => {
    if (!pageId || !pageMeta) return;
    try {
      const res = await savePageDraftAsync(pageId, {
        sections: draftSections,
        title: pageMeta.title,
        slug: pageMeta.slug,
      });
      if (res && res.success) {
        setHasUnsavedChanges(true);
        showToast("Draft saved successfully to server & locally");
      } else {
        showToast(res?.error ? `Draft saved locally (Warning: ${res.error})` : "Draft saved locally");
      }
    } catch (err) {
      showToast("Draft saved locally: " + err.message);
    }
  };

  const handlePublish = async () => {
    if (!pageId || !pageMeta || isPublishing) return;
    setIsPublishing(true);
    try {
      await savePageDraftAsync(pageId, {
        sections: draftSections,
        title: pageMeta.title,
        slug: pageMeta.slug,
      });
      const res = await publishPage(pageId);
      if (res && res.success) {
        setHasUnsavedChanges(false);
        const updated = getPageById(pageId);
        if (updated) setPageMeta(updated);
        showToast("Published live to website and synchronized!");
      } else {
        showToast(res?.error || "Error publishing page to server", "error");
      }
    } catch (err) {
      console.error("Error publishing page:", err);
      showToast("Publish failed: " + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!pageMeta) {
    return (
      <div className="h-screen bg-[#070A0F] text-white flex items-center justify-center font-serif text-sm">
        Loading ASMARATY Visual Editor...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#070A0F] text-[#E8EAEE] overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#C5A880] text-[#080B10] px-4 py-2.5 rounded shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==================== TOP NAVIGATION BAR ==================== */}
      <header className="h-14 bg-[#0A0D14] border-b border-[#1E2636] px-4 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Back, Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-1.5 rounded text-[#8E9AA8] hover:text-white hover:bg-white/5 transition-colors"
            title="Back to Pages List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded text-[#8E9AA8] hover:text-[#C5A880] hover:bg-white/5 transition-colors"
            title={isSidebarOpen ? "Hide Structure Panel" : "Show Structure Panel"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-medium text-white truncate max-w-[160px] sm:max-w-[240px]">
                {pageMeta.title}
              </span>
              <span className="text-[10px] font-mono text-[#C5A880] px-1.5 py-0.5 rounded bg-[#162030] hidden md:inline-block">
                {pageMeta.slug}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {hasUnsavedChanges ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/70 text-amber-300 border border-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="hidden sm:inline">Unsaved Edits</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Published</span>
            </span>
          )}
        </div>

        {/* Center: Device Viewport Switcher & Inline Edit Tip */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#828F9E] bg-[#101622] px-3 py-1 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
            <span>Click directly on any text or photo on the page to edit</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-[#121824] p-1 rounded-sm border border-[#1E2736]">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`p-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-colors ${
                viewportMode === "desktop"
                  ? "bg-[#C5A880] text-[#080B10] font-semibold"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
              title="Desktop Viewport (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden md:inline">Desktop</span>
            </button>

            <button
              onClick={() => setViewportMode("tablet")}
              className={`p-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-colors ${
                viewportMode === "tablet"
                  ? "bg-[#C5A880] text-[#080B10] font-semibold"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
              title="Tablet Viewport (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden md:inline">Tablet</span>
            </button>

            <button
              onClick={() => setViewportMode("mobile")}
              className={`p-1.5 rounded-sm text-xs flex items-center gap-1.5 transition-colors ${
                viewportMode === "mobile"
                  ? "bg-[#C5A880] text-[#080B10] font-semibold"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden md:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Insert Section Button */}
          <button
            onClick={() => setIsSectionLibraryOpen(true)}
            className="px-3 py-1.5 rounded-sm bg-[#162030] hover:bg-[#202E42] text-[#E0C7A6] border border-[#2B394E] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="hidden sm:inline">Add Section</span>
          </button>

          {/* View Live Public Site */}
          <Link
            href={pageMeta.slug}
            target="_blank"
            className="p-1.5 rounded text-[#8E9AA8] hover:text-white hover:bg-white/5 text-xs hidden sm:flex items-center gap-1"
            title="View Live Public URL"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all flex items-center gap-1.5 ${
              hasUnsavedChanges
                ? "bg-[#182333] hover:bg-[#223249] text-[#E0C7A6] border-[#C5A880]/50"
                : "bg-[#111722] text-[#6F7D90] border-transparent"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Save Draft</span>
          </button>

          {/* Publish Changes */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn-gold px-4 py-1.5 rounded-sm text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isPublishing ? "animate-spin" : ""}`} />
            <span>{isPublishing ? "Publishing..." : "Publish"}</span>
          </button>
        </div>
      </header>

      {/* ==================== WORKSPACE (SAME UI PAGE CANVAS) ==================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ==================== COLLAPSIBLE LEFT PANEL: PAGE STRUCTURE ==================== */}
        {isSidebarOpen && (
          <aside className="w-64 bg-[#090D14] border-r border-[#1B2230] flex flex-col flex-shrink-0 z-20 animate-slideInLeft">
            <div className="p-3.5 border-b border-[#1B2230] flex items-center justify-between">
              <div>
                <span className="text-xs font-serif font-medium text-white uppercase tracking-wider">
                  Sections ({draftSections.length})
                </span>
                <span className="text-[10px] text-[#697688] block">
                  Click to scroll to section
                </span>
              </div>

              <button
                onClick={() => setIsSectionLibraryOpen(true)}
                className="p-1 rounded bg-[#17212F] hover:bg-[#C5A880] hover:text-[#080B10] text-[#E0C7A6] border border-[#2B394E] transition-colors"
                title="Add Section"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
              {draftSections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                const isHidden = sec.visible === false;
                const tpl = SECTION_TEMPLATES.find((t) => t.type === sec.type);
                const displayName = sec.name || tpl?.name || sec.type.replace(/_/g, " ").toUpperCase();

                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      setSelectedSectionId(sec.id);
                      const el = document.getElementById(`section-${sec.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group rounded-sm p-2.5 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#151D2A] border-[#C5A880] text-white ring-1 ring-[#C5A880]"
                        : "bg-[#0E131C] border-[#1A2230] text-[#8E9AA8] hover:border-white/20 hover:text-white"
                    } ${isHidden ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-[#C5A880]">
                          0{idx + 1}
                        </span>
                        <span className="font-serif text-xs font-medium truncate">
                          {displayName}
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(sec.id, -1);
                          }}
                          disabled={idx === 0}
                          className="p-0.5 hover:text-white"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(sec.id, 1);
                          }}
                          disabled={idx === draftSections.length - 1}
                          className="p-0.5 hover:text-white"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(sec.id);
                          }}
                          className="p-0.5 hover:text-white"
                          title="Toggle Visibility"
                        >
                          {isHidden ? <EyeOff className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add button */}
            <div className="p-3 border-t border-[#1B2230]">
              <button
                onClick={() => setIsSectionLibraryOpen(true)}
                className="w-full py-2 rounded-sm bg-[#131A26] hover:bg-[#1A2434] text-[#C5A880] text-xs font-medium border border-[#243144] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Insert New Section</span>
              </button>
            </div>
          </aside>
        )}

        {/* ==================== MAIN CANVAS: DIRECT SAME-PAGE UI EDITOR ==================== */}
        <main className="flex-1 bg-[#05070B] overflow-y-auto flex flex-col items-center p-4 sm:p-6 relative select-text">
          {/* Device Frame Wrapper */}
          <div
            className={`transition-all duration-300 bg-[#080B10] shadow-2xl relative w-full ${
              viewportMode === "desktop"
                ? "max-w-full"
                : viewportMode === "tablet"
                ? "max-w-[768px] rounded-xl border-[10px] border-[#1A2230] my-4 overflow-hidden"
                : "max-w-[375px] rounded-[36px] border-[12px] border-[#1A2230] my-4 overflow-hidden"
            }`}
          >
            {/* Tablet/Mobile Top Bar simulation */}
            {viewportMode !== "desktop" && (
              <div className="h-6 bg-[#1A2230] flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-white/20"></div>
              </div>
            )}

            {/* Render Actual Sections Directly Editable on the Same UI */}
            {isAboutPage ? (
              <UniversalAboutView
                pageData={{ ...pageMeta, sections: draftSections }}
                isEditable={true}
                onUpdateSectionField={handleUpdateSectionField}
                onOpenMediaPicker={(secId, field, url) => openMediaPicker(secId, field, url)}
                showNavAndFooter={false}
              />
            ) : (
              <div className="divide-y divide-white/5">
                {draftSections.map((section, idx) => (
                  <div key={section.id} className="relative">
                    <SectionRenderer
                      section={section}
                      isSelected={section.id === selectedSectionId}
                      onSelectSection={(id) => setSelectedSectionId(id)}
                      isEditorPreview={false}
                      isEditable={true}
                      onUpdateSectionField={handleUpdateSectionField}
                      onOpenMediaPicker={(field, url) => openMediaPicker(section.id, field, url)}
                      onMoveSection={handleMoveSection}
                      onDuplicateSection={handleDuplicateSection}
                      onDeleteSection={handleDeleteSection}
                      onToggleVisibility={handleToggleVisibility}
                      onOpenQuickDrawer={(sec) => setActiveDrawerSection(sec)}
                      isFirst={idx === 0}
                      isLast={idx === draftSections.length - 1}
                    />

                    {/* Inline Insert Divider Between Sections */}
                    <div className="relative group/divider h-4 -my-2 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="absolute inset-x-0 h-[1px] bg-[#C5A880]/40"></div>
                      <button
                        onClick={() => setIsSectionLibraryOpen(true)}
                        className="relative z-10 px-3 py-1 rounded-full bg-[#080B10] border border-[#C5A880] text-[#C5A880] text-[10px] font-medium flex items-center gap-1 shadow-lg hover:bg-[#C5A880] hover:text-[#080B10] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert Section Here</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================== MODALS & DRAWERS ==================== */}

      {/* Section Library (Insert from 11 templates) */}
      <SectionLibraryModal
        isOpen={isSectionLibraryOpen}
        onClose={() => setIsSectionLibraryOpen(false)}
        onAddSection={handleAddSectionFromLibrary}
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerConfig.isOpen}
        onClose={() => setMediaPickerConfig({ isOpen: false, sectionId: null, field: null, currentUrl: "" })}
        onSelectImage={handleSelectMedia}
        currentImageUrl={mediaPickerConfig.currentUrl}
      />

      {/* Slide-over Quick Drawer for Section Styling & Details */}
      <SectionQuickDrawer
        isOpen={Boolean(activeDrawerSection)}
        onClose={() => setActiveDrawerSection(null)}
        section={activeDrawerSection}
        onUpdateSection={(fields) => handleUpdateSectionBatch(activeDrawerSection.id, fields)}
        onDeleteSection={() => handleDeleteSection(activeDrawerSection.id)}
        onDuplicateSection={() => handleDuplicateSection(activeDrawerSection.id)}
        onMoveSection={(dir) => handleMoveSection(activeDrawerSection.id, dir)}
        isFirst={draftSections.findIndex((s) => s.id === activeDrawerSection?.id) === 0}
        isLast={draftSections.findIndex((s) => s.id === activeDrawerSection?.id) === draftSections.length - 1}
        onOpenMediaPicker={(field, url) => openMediaPicker(activeDrawerSection.id, field, url)}
      />
    </div>
  );
}

export default function VisualPageEditor() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#070A0F] text-white flex items-center justify-center font-serif text-sm">Loading Visual Page Editor...</div>}>
      <VisualPageEditorInner />
    </Suspense>
  );
}
