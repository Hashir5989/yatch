"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Link2, 
  Check, 
  ExternalLink, 
  X, 
  ChevronRight, 
  Sparkles, 
  Navigation,
  Eye,
  EyeOff,
  Palette,
  Globe,
  Phone,
  Mail,
  Anchor,
  Sliders
} from "lucide-react";
import { 
  BUTTON_TYPES, 
  BUTTON_STYLES, 
  BUTTON_PAGE_PRESETS, 
  detectLinkType,
  normalizeButtonConfig,
  formatButtonHref
} from "@/lib/data/buttonSchema";

const emptySubscribe = () => () => {};

export default function InlineButtonEditor({
  config = null,
  text = "Learn More",
  url = "/contact",
  isEditable = false,
  onSave,
  className = "",
  variant = "gold",
  icon: Icon = null,
  children,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Derive initial config
  const initialConfig = normalizeButtonConfig(
    config || { label: text, url },
    text,
    url,
    variant === "outline" ? "outline-gold" : "solid-gold"
  );

  // Form State
  const [label, setLabel] = useState(initialConfig.label);
  const [href, setHref] = useState(initialConfig.url);
  const [type, setType] = useState(initialConfig.type);
  const [target, setTarget] = useState(initialConfig.target);
  const [visible, setVisible] = useState(initialConfig.visible);
  const [style, setStyle] = useState(initialConfig.style);

  // Sync state whenever config prop changes
  useEffect(() => {
    const fresh = normalizeButtonConfig(
      config || { label: text, url },
      text,
      url,
      variant === "outline" ? "outline-gold" : "solid-gold"
    );
    setLabel(fresh.label);
    setHref(fresh.url);
    setType(fresh.type);
    setTarget(fresh.target);
    setVisible(fresh.visible);
    setStyle(fresh.style);
  }, [config, text, url, variant]);

  // Position modal floating relative to the button
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const modalWidth = Math.min(460, window.innerWidth - 32);

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceAbove >= 280 || spaceAbove >= spaceBelow;

    const buttonCenterX = rect.left + rect.width / 2;
    let left = buttonCenterX - modalWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - modalWidth - 16));
    const arrowLeft = Math.max(24, Math.min(buttonCenterX - left, modalWidth - 24));

    if (placeAbove) {
      const bottom = Math.max(16, window.innerHeight - rect.top + 10);
      setPosition({ placeAbove: true, left, bottom, arrowLeft, modalWidth });
    } else {
      const top = Math.max(16, rect.bottom + 10);
      setPosition({ placeAbove: false, left, top, arrowLeft, modalWidth });
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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleApply = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    const updatedConfig = {
      label: label.trim() || "Learn More",
      url: href.trim() || "/contact",
      type,
      target,
      visible,
      style,
    };

    if (onSave) {
      // Passes (label, url, fullConfig) to maintain 100% backward compatibility
      onSave(updatedConfig.label, updatedConfig.url, updatedConfig);
    }
    setIsOpen(false);
  };

  const handleSelectPreset = (preset) => {
    setLabel((prev) => (prev ? prev : preset.label));
    setHref(preset.url);
    setType(preset.type || detectLinkType(preset.url));
    setTarget(preset.target || (preset.type === "external" ? "_blank" : "_self"));
  };

  // If not in editor mode, render as standard link
  if (!isEditable) {
    if (!visible) return null;
    const finalHref = formatButtonHref(href, type);
    const resolvedTarget = target || (type === "external" ? "_blank" : "_self");
    const rel = resolvedTarget === "_blank" ? "noopener noreferrer" : undefined;

    return (
      <Link href={finalHref} target={resolvedTarget} rel={rel} className={className}>
        <span>{children || label}</span>
        {Icon && <Icon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />}
      </Link>
    );
  }

  // Active style preview styling
  const activeStyleObj = BUTTON_STYLES.find((s) => s.id === style) || BUTTON_STYLES[0];

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
          className={`${className} relative group/btnedit rounded-none ring-2 ring-dashed ${
            visible 
              ? "ring-[#C5A880]/70 hover:ring-[#C5A880]" 
              : "ring-rose-500/70 hover:ring-rose-500 opacity-60 line-through"
          } transition-all cursor-pointer`}
          title="Click to manage button text, link URL, type, target, and visibility"
        >
          <span>{children || label}</span>
          {Icon && <Icon className="w-4 h-4 ml-2" />}

          {/* Floating Edit Badge */}
          <span className={`absolute -top-2.5 -right-2.5 text-[#08101C] text-[9px] px-2 py-0.5 rounded-none font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg border border-[#08101C] hover:scale-105 transition-transform ${
            visible ? "bg-[#C6A155]" : "bg-rose-500 text-white"
          }`}>
            {visible ? <Link2 className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span>{visible ? "Edit Button" : "Hidden"}</span>
          </span>
        </button>
      </div>

      {/* Render Floating Modal via Portal */}
      {isOpen && mounted && position && createPortal(
        <div className="fixed inset-0 z-[999998] pointer-events-auto">
          {/* Subtle click-outside backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Floating Editor Modal */}
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
            className="z-[999999] bg-[#0A0E17] border border-[#C5A880] rounded-lg p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-xs text-white max-h-[85vh] flex flex-col animate-fadeIn select-text"
          >
            {/* Pointer Arrow */}
            {position.placeAbove ? (
              <div
                style={{ left: `${position.arrowLeft}px` }}
                className="absolute -bottom-2 -translate-x-1/2 w-4 h-4 bg-[#0A0E17] border-b border-r border-[#C5A880] rotate-45"
              />
            ) : (
              <div
                style={{ left: `${position.arrowLeft}px` }}
                className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-[#0A0E17] border-t border-l border-[#C5A880] rotate-45"
              />
            )}

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-[#16202E] border border-[#C5A880]/60 flex items-center justify-center text-[#C5A880]">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-white tracking-wider uppercase">
                    Manage Button & Action Link
                  </h4>
                  <p className="text-[10px] text-[#8696A8]">
                    Configure text, destination, target window, and visibility
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

            {/* Modal Scrollable Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Field 1: Visibility Switch */}
              <div className="p-3 bg-[#0F1624] border border-[#1E2838] rounded flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-semibold text-white">Button Visibility</span>
                  <span className="text-[10px] text-[#7A8798]">
                    {visible ? "Visible on public website" : "Hidden from public website"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                    visible 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                >
                  {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  <span>{visible ? "Enabled" : "Disabled"}</span>
                </button>
              </div>

              {/* Field 2: Button Label */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                  1. Button Label (Visible Text) *
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. EXPLORE THE COLLECTION, BOOK SEA TRIAL"
                  className="w-full px-3 py-2 bg-[#06090F] border border-[#222E42] focus:border-[#C5A880] rounded text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Field 3: Destination URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                  2. Destination Link URL *
                </label>
                <input
                  type="text"
                  value={href}
                  onChange={(e) => {
                    const val = e.target.value;
                    setHref(val);
                    setType(detectLinkType(val));
                  }}
                  placeholder="/yachts, /contact, #fleet, or https://..."
                  className="w-full px-3 py-2 bg-[#06090F] border border-[#222E42] focus:border-[#C5A880] rounded text-xs text-[#C5A880] font-mono placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Field 4: Button Type & Target in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                    3. Link Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setType(newType);
                      if (newType === "external") setTarget("_blank");
                      if (newType === "internal" || newType === "anchor") setTarget("_self");
                    }}
                    className="w-full px-2.5 py-1.5 bg-[#06090F] border border-[#222E42] text-xs text-white rounded focus:outline-none focus:border-[#C5A880]"
                  >
                    {BUTTON_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label.split("(")[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                    4. Open In
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#06090F] border border-[#222E42] text-xs text-white rounded focus:outline-none focus:border-[#C5A880]"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
              </div>

              {/* Field 5: Button Style Variant */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#A4B2C2] mb-1 font-semibold">
                  5. Luxury Style Variant
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#06090F] border border-[#222E42] text-xs text-white rounded focus:outline-none focus:border-[#C5A880]"
                >
                  {BUTTON_STYLES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Live Button Preview Card */}
              <div className="p-3 bg-[#06090F] border border-white/10 rounded space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-[#738294] font-medium block">
                  Live Preview:
                </span>
                <div className="flex items-center justify-center p-4 bg-[#08101C] border border-white/5 min-h-[64px]">
                  {visible ? (
                    <span className={`${activeStyleObj.className} pointer-events-none scale-90`}>
                      <span>{label || "Learn More"}</span>
                      {Icon && <Icon className="w-4 h-4 ml-2" />}
                      {type === "external" && <ExternalLink className="w-3.5 h-3.5 ml-1.5" />}
                    </span>
                  ) : (
                    <span className="text-xs text-rose-400 font-mono italic">
                      [Button is currently disabled & hidden from public site]
                    </span>
                  )}
                </div>
              </div>

              {/* Quick 1-Click Page Presets */}
              <div>
                <span className="block text-[9px] uppercase tracking-wider text-[#738294] mb-1.5 font-medium flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5 text-[#C5A880]" />
                  <span>Quick 1-Click Presets:</span>
                </span>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {BUTTON_PAGE_PRESETS.map((preset) => {
                    const isSelected = href === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`text-left px-2.5 py-1.5 rounded text-[10px] border transition-all truncate flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#C5A880] text-[#081010] font-semibold border-[#C5A880]"
                            : "bg-[#0F1624] text-[#A4B2C2] border-[#1E2838] hover:border-[#C5A880]/50 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs text-[#8E9AA8] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="saxdor-btn-solid !h-[36px] px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Button Settings</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
