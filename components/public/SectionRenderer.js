"use client";

import HeroBannerSection from "./sections/HeroBannerSection";
import ImageTextSection from "./sections/ImageTextSection";
import FullWidthImageSection from "./sections/FullWidthImageSection";
import YachtCollectionSection from "./sections/YachtCollectionSection";
import FeaturedYachtSection from "./sections/FeaturedYachtSection";
import ImageGallerySection from "./sections/ImageGallerySection";
import VideoBannerSection from "./sections/VideoBannerSection";
import RichTextSection from "./sections/RichTextSection";
import StatisticsSection from "./sections/StatisticsSection";
import CallToActionSection from "./sections/CallToActionSection";
import EnquirySection from "./sections/EnquirySection";
import { 
  EyeOff, 
  Eye, 
  Edit3, 
  ChevronUp, 
  ChevronDown, 
  Copy, 
  Trash2, 
  Sliders, 
  Plus 
} from "lucide-react";

export default function SectionRenderer({
  section,
  isSelected = false,
  onSelectSection = null,
  isEditorPreview = false,
  isEditable = false,
  onUpdateSectionField = null,
  onOpenMediaPicker = null,
  onMoveSection = null,
  onDuplicateSection = null,
  onDeleteSection = null,
  onToggleVisibility = null,
  onOpenQuickDrawer = null,
  isFirst = false,
  isLast = false,
}) {
  if (!section) return null;

  // On public visitor site, hidden sections are omitted
  if (section.visible === false && !isEditorPreview && !isEditable) {
    return null;
  }

  const handleFieldUpdate = (fieldName, newValue) => {
    if (onUpdateSectionField) {
      onUpdateSectionField(section.id, fieldName, newValue);
    }
  };

  const renderComponent = () => {
    const commonProps = {
      data: section,
      isEditable: isEditable || isEditorPreview,
      onUpdateField: handleFieldUpdate,
      onOpenMediaPicker: onOpenMediaPicker,
    };

    switch (section.type) {
      case "hero_banner":
        return <HeroBannerSection {...commonProps} />;
      case "image_text":
        return <ImageTextSection {...commonProps} />;
      case "full_width_image":
        return <FullWidthImageSection {...commonProps} />;
      case "yacht_collection":
        return <YachtCollectionSection {...commonProps} />;
      case "featured_yacht":
        return <FeaturedYachtSection {...commonProps} />;
      case "image_gallery":
        return <ImageGallerySection {...commonProps} />;
      case "video_banner":
        return <VideoBannerSection {...commonProps} />;
      case "rich_text":
        return <RichTextSection {...commonProps} />;
      case "statistics":
        return <StatisticsSection {...commonProps} />;
      case "call_to_action":
        return <CallToActionSection {...commonProps} />;
      case "enquiry_section":
        return <EnquirySection {...commonProps} />;
      default:
        return (
          <div className="py-12 px-6 bg-[#121722] text-center text-xs text-[#8A96A6] border border-dashed border-white/10">
            Unknown section type: {section.type}
          </div>
        );
    }
  };

  const isControlsVisible = isEditable || isEditorPreview;

  return (
    <div
      id={`section-${section.id}`}
      onClick={(e) => {
        if (onSelectSection) {
          onSelectSection(section.id);
        }
      }}
      className={`relative transition-all duration-300 group/section ${
        isControlsVisible ? "hover:ring-1 hover:ring-[#C5A880]/50" : ""
      } ${
        isSelected
          ? "ring-2 ring-[#C5A880] ring-offset-2 ring-offset-[#080B10] shadow-[0_0_35px_rgba(197,168,128,0.25)]"
          : ""
      } ${
        section.visible === false && isControlsVisible
          ? "opacity-50 grayscale-[40%]"
          : ""
      }`}
    >
      {/* On-Page Floating Toolbar (Visible on Hover or when Selected in Visual Edit Mode) */}
      {isControlsVisible && (
        <div
          className={`absolute top-4 left-4 z-40 flex items-center gap-1.5 p-1 rounded-none bg-[#080B10]/95 backdrop-blur-md border border-[#C5A880]/40 shadow-2xl transition-opacity duration-200 ${
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover/section:opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Section Type Label */}
          <div className="px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#C5A880] flex items-center gap-1.5 border-r border-white/10">
            <span className="w-1.5 h-1.5 rounded-none bg-[#C5A880]"></span>
            <span>{section.name || section.type.replace(/_/g, " ")}</span>
          </div>

          {/* Move Up */}
          {onMoveSection && (
            <button
              onClick={() => onMoveSection(section.id, -1)}
              disabled={isFirst}
              className={`p-1 rounded-none text-[#8E9AA8] hover:text-white hover:bg-white/10 ${
                isFirst ? "opacity-25 cursor-not-allowed" : ""
              }`}
              title="Move Section Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Down */}
          {onMoveSection && (
            <button
              onClick={() => onMoveSection(section.id, 1)}
              disabled={isLast}
              className={`p-1 rounded-none text-[#8E9AA8] hover:text-white hover:bg-white/10 ${
                isLast ? "opacity-25 cursor-not-allowed" : ""
              }`}
              title="Move Section Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Drawer / Options */}
          {onOpenQuickDrawer && (
            <button
              onClick={() => onOpenQuickDrawer(section)}
              className="px-2.5 py-1 rounded-none bg-[#162030] hover:bg-[#C5A880] hover:text-[#080B10] text-[#E0C7A6] font-medium flex items-center gap-1.5 transition-colors border border-white/10"
              title="Open Section Editor to change texts, photos, and button URLs"
            >
              <Sliders className="w-3 h-3 text-[#C5A880]" />
              <span className="text-[10px]">Edit Content & Links</span>
            </button>
          )}

          {/* Duplicate */}
          {onDuplicateSection && (
            <button
              onClick={() => onDuplicateSection(section.id)}
              className="p-1 rounded-none text-[#8E9AA8] hover:text-white hover:bg-white/10"
              title="Duplicate Section"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Visibility */}
          {onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(section.id)}
              className="p-1 rounded-none text-[#8E9AA8] hover:text-white hover:bg-white/10"
              title={section.visible === false ? "Show Section" : "Hide Section"}
            >
              {section.visible === false ? (
                <EyeOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Delete */}
          {onDeleteSection && (
            <button
              onClick={() => onDeleteSection(section.id)}
              className="p-1 rounded-none text-[#8E9AA8] hover:text-red-400 hover:bg-red-950/30"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Render the actual section component */}
      {renderComponent()}
    </div>
  );
}
