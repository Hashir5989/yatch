"use client";

import Link from "next/link";
import { 
  Edit3, 
  Sparkles, 
  Save, 
  Plus, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sliders,
  CheckCircle2,
  Check
} from "lucide-react";

export default function InlineEditorBar({
  isEditMode,
  onToggleEditMode,
  pageTitle,
  pageSlug,
  pageId,
  hasUnsavedChanges,
  onSaveDraft,
  onPublish,
  onResetDraft,
  onOpenAddSection,
}) {
  return (
    <>
      {/* Floating Bottom Live Editor Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl bg-[#0B0F17]/95 backdrop-blur-xl border border-[#C5A880]/40 rounded-full px-5 py-3 shadow-[0_15px_50px_rgba(0,0,0,0.85)] flex items-center justify-between gap-4 text-xs select-none animate-slideUp">
        {/* Left: Mode Toggle & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleEditMode}
            className={`px-3.5 py-1.5 rounded-none flex items-center gap-2 font-medium text-xs transition-all uppercase tracking-wider ${
              isEditMode
                ? "bg-[#C5A880] text-[#080B10] shadow-[0_0_20px_rgba(197,168,128,0.4)] font-bold"
                : "bg-[#141B26] text-[#A6B4C4] hover:text-white border border-white/10"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-none ${
                isEditMode ? "bg-[#080B10] animate-pulse" : "bg-[#4E5A6C]"
              }`}
            ></span>
            <span>{isEditMode ? "Visual Editing Active" : "Enable Live Edit"}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[#7F8D9F] border-l border-white/10 pl-3">
            <span className="font-serif text-white font-medium">{pageTitle}</span>
            <span className="text-[10px] font-mono text-[#C5A880] px-1.5 py-0.5 rounded-none bg-[#131A26]">
              {pageSlug}
            </span>
          </div>
        </div>

        {/* Center/Right: Action Buttons when Edit Mode is Active */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isEditMode ? (
            <>
              {/* Add Section */}
              <button
                onClick={onOpenAddSection}
                className="px-3 py-1.5 rounded-none bg-[#141C28] hover:bg-[#1E293B] text-[#E0C7A6] border border-[#2B394E] flex items-center gap-1.5 font-medium transition-colors"
                title="Insert predefined section into this page"
              >
                <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="hidden sm:inline">Add Section</span>
              </button>

              {/* Save Draft */}
              <button
                onClick={onSaveDraft}
                className={`px-3 py-1.5 rounded-none text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  hasUnsavedChanges
                    ? "bg-[#182333] hover:bg-[#223249] text-[#E0C7A6] border-[#C5A880]/50"
                    : "bg-[#101520] text-[#69778A] border-transparent"
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Save Draft</span>
              </button>

              {/* Publish to Live Site */}
              <button
                onClick={onPublish}
                className="saxdor-btn-solid !h-[34px] !min-h-[34px] !min-w-0 !px-4 rounded-none !text-xs font-bold tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </>
          ) : (
            <div className="text-[11px] text-[#7E8B9C] hidden md:flex items-center gap-2">
              <span>Click to edit text, swap images & reorder sections live</span>
            </div>
          )}

          {/* Link to Full 3-Panel Studio */}
          <Link
            href={`/admin/editor/${pageId}`}
            className="p-1.5 rounded-none text-[#8E9AA8] hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            title="Open Three-Panel Studio"
          >
            <Sliders className="w-4 h-4 text-[#C5A880]" />
          </Link>
        </div>
      </div>
    </>
  );
}
