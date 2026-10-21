"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Link2, Check, ExternalLink, X, ChevronRight, Sparkles, Navigation } from "lucide-react";

const emptySubscribe = () => () => {};

export default function InlineButtonEditor({
  text = "Learn More",
  url = "/contact",
  isEditable = false,
  onSave,
  className = "",
  variant = "gold", // "gold" | "outline"
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localText, setLocalText] = useState(null);
  const [localUrl, setLocalUrl] = useState(null);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);

  const buttonText = localText !== null ? localText : (text || "Learn More");
  const buttonUrl = localUrl !== null ? localUrl : (url || "/contact");
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Calculate position dynamically so the modal floats directly ABOVE the button/section
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const modalWidth = Math.min(420, window.innerWidth - 32);

    // Place ABOVE the button by default; if near the top of the viewport (< 190px), place below
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceAbove >= 190 || spaceAbove >= spaceBelow;

    // Center horizontally on the button, clamped within screen margins
    const buttonCenterX = rect.left + rect.width / 2;
    let left = buttonCenterX - modalWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - modalWidth - 16));

    // Arrow caret position relative to the modal
    const arrowLeft = Math.max(24, Math.min(buttonCenterX - left, modalWidth - 24));

    if (placeAbove) {
      // Anchored directly above the button with a 10px margin
      const bottom = Math.max(16, window.innerHeight - rect.top + 10);
      setPosition({
        placeAbove: true,
        left,
        bottom,
        arrowLeft,
        modalWidth,
      });
    } else {
      // Anchored directly below the button with a 10px margin
      const top = Math.max(16, rect.bottom + 10);
      setPosition({
        placeAbove: false,
        left,
        top,
        arrowLeft,
        modalWidth,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLocalText(null);
        setLocalUrl(null);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleApply = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (onSave) {
      onSave(buttonText, buttonUrl);
    }
    setLocalText(null);
    setLocalUrl(null);
    setIsOpen(false);
  };

  const pagePresets = [
    { label: "Home Page", url: "/" },
    { label: "Fleet Catalog", url: "/yachts" },
    { label: "AS 100 Flagship", url: "/yachts/as-100" },
    { label: "Magellan 32 Explorer", url: "/yachts/magellan-32" },
    { label: "About Shipyard", url: "/about" },
    { label: "News & Events", url: "/news" },
    { label: "VIP Concierge", url: "/contact" },
    { label: "Enquiry Form", url: "#enquiry-form" },
  ];

  // When not in edit mode, it behaves as a normal luxury link
  if (!isEditable) {
    return (
      <Link href={url || "/contact"} className={className}>
        <span>{text}</span>
        {Icon && <Icon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />}
      </Link>
    );
  }

  // When in edit mode, clicking opens the user-friendly modal directly above the section/button
  return (
    <>
      <div ref={buttonRef} className="relative inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={`${className} relative group/btnedit rounded-none ring-2 ring-dashed ring-[#C5A880]/70 hover:ring-[#C5A880] transition-all cursor-pointer`}
          title="Click to edit button text and destination URL"
        >
          <span>{buttonText}</span>
          {Icon && <Icon className="w-4 h-4 ml-2" />}

          {/* Floating Edit Badge - Crisp Rectangular Box Tag */}
          <span className="absolute -top-2.5 -right-2.5 bg-[#C6A155] text-[#08101C] text-[9px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg border border-[#08101C] hover:scale-105 transition-transform">
            <Link2 className="w-2.5 h-2.5" />
            <span>Edit URL</span>
          </span>
        </button>
      </div>

      {/* Render Modal via React Portal directly into document.body floating directly ABOVE the section / button */}
      {isOpen && mounted && position && createPortal(
        <div className="fixed inset-0 z-[999998] pointer-events-auto">
          {/* Subtle click-outside backdrop: light tint so the section & page remain 100% visible */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[1.5px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* User-Friendly Floating Modal positioned directly ABOVE the section / button */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              left: `${position.left}px`,
              width: `${position.modalWidth}px`,
              ...(position.placeAbove
                ? { bottom: `${position.bottom}px` }
                : { top: `${position.top}px` }),
            }}
            className="z-[999999] bg-[#0E131C] border border-[#C5A880]/80 rounded-xl p-5 shadow-[0_20px_55px_rgba(0,0,0,0.9)] text-xs text-white max-h-[85vh] flex flex-col animate-fadeIn select-text"
          >
            {/* Pointer Caret / Arrow connecting directly to the button */}
            {position.placeAbove ? (
              <div
                style={{ left: `${position.arrowLeft}px` }}
                className="absolute -bottom-2 -translate-x-1/2 w-4 h-4 bg-[#0E131C] border-b border-r border-[#C5A880]/80 rotate-45"
              />
            ) : (
              <div
                style={{ left: `${position.arrowLeft}px` }}
                className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-[#0E131C] border-t border-l border-[#C5A880]/80 rotate-45"
              />
            )}

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#16202E] border border-[#C5A880]/50 flex items-center justify-center text-[#C5A880]">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase">
                    Edit Button & Link URL
                  </h4>
                  <p className="text-[10px] text-[#8696A8]">
                    Floating directly above this section button
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#8E9AA8] hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Button Label Input */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                  Button Label / Text
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setLocalText(e.target.value)}
                  placeholder="e.g. Explore Fleet, Book Sea Trial"
                  className="w-full px-3 py-2 bg-[#080B10] border border-[#222E42] focus:border-[#C5A880] rounded-none text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApply(e);
                  }}
                />
              </div>

              {/* Destination Link URL Input */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                  Destination Link URL
                </label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                  placeholder="/yachts, /contact or https://..."
                  className="w-full px-3 py-2 bg-[#080B10] border border-[#222E42] focus:border-[#C5A880] rounded-none text-xs text-[#C5A880] font-mono placeholder-gray-600 focus:outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApply(e);
                  }}
                />
              </div>

              {/* Quick 1-Click Page Presets */}
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-[#738294] mb-1.5 font-medium flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5 text-[#C5A880]" />
                  <span>Quick 1-Click Page Presets:</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {pagePresets.map((preset) => {
                    const isSelected = buttonUrl === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setLocalUrl(preset.url)}
                        className={`px-2.5 py-1.5 rounded-none text-[11px] text-left truncate border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#C5A880] text-[#080B10] font-semibold border-[#C5A880]"
                            : "bg-[#131924] text-[#A6B4C4] border-white/5 hover:border-[#C5A880]/40 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        <span
                          className={`text-[9px] font-mono ml-1 ${
                            isSelected ? "text-[#080B10]/80" : "text-[#586678]"
                          }`}
                        >
                          {preset.url}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3.5 mt-3 flex items-center justify-between border-t border-white/10 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLocalText(null);
                  setLocalUrl(null);
                  setIsOpen(false);
                }}
                className="px-3.5 py-2 rounded-none text-[11px] text-[#8E9AA8] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="saxdor-btn-solid !h-[38px] !min-h-[38px] !min-w-0 !px-4 !text-xs !font-bold flex items-center gap-1.5 cursor-pointer rounded-none"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Apply URL</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
