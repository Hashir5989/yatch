/**
 * ASMARATY Luxury Yachts — Universal Button & Link Schema
 * Standardized data definitions, presets, types, and normalizers for complete client CMS button control.
 */

export const BUTTON_TYPES = [
  { id: "internal", label: "Internal Page (e.g. /yachts, /contact)" },
  { id: "external", label: "External Website (https://...)" },
  { id: "anchor", label: "Anchor Scroll (e.g. #fleet, #enquiry-form)" },
  { id: "phone", label: "Phone Call (tel:+971...)" },
  { id: "email", label: "Direct Email (mailto:info@...)" },
];

export const BUTTON_STYLES = [
  { 
    id: "solid-gold", 
    label: "Solid Gold (Primary VIP)", 
    className: "saxdor-btn-solid !h-[48px] px-8 text-xs font-bold uppercase tracking-wider shadow-lg" 
  },
  { 
    id: "outline-gold", 
    label: "Gold Outline (Secondary)", 
    className: "saxdor-btn-outline !h-[48px] px-8 text-xs font-semibold uppercase tracking-wider hover:border-[#C6A155] hover:text-[#DFBA73]" 
  },
  { 
    id: "solid-white", 
    label: "Pure White (Minimal)", 
    className: "inline-flex items-center justify-center bg-white hover:bg-[#F2EFE9] text-[#0A111E] text-xs font-semibold tracking-[0.2em] uppercase px-8 py-3.5 transition-colors shadow-md" 
  },
  { 
    id: "outline-white", 
    label: "White Outline (High Contrast)", 
    className: "inline-flex items-center justify-center border border-white/40 hover:border-white text-white text-xs font-semibold tracking-[0.2em] uppercase px-8 py-3.5 transition-colors" 
  },
  { 
    id: "solid-dark", 
    label: "Navy Dark (Editorial)", 
    className: "inline-flex items-center justify-center bg-[#0B1523] hover:bg-[#162338] text-white text-xs font-medium px-8 py-3.5 transition-all shadow-md" 
  },
  { 
    id: "whatsapp", 
    label: "WhatsApp Emerald (Concierge)", 
    className: "inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md" 
  },
];

export const BUTTON_PAGE_PRESETS = [
  { label: "Home Page", url: "/", type: "internal", target: "_self" },
  { label: "Fleet Catalog", url: "/yachts", type: "internal", target: "_self" },
  { label: "G-100 Superyacht (100 FT)", url: "/yachts/g100", type: "internal", target: "_self" },
  { label: "G77 Luxury Yacht (77 FT)", url: "/yachts/g77", type: "internal", target: "_self" },
  { label: "G-66 Flybridge (66 FT)", url: "/yachts/g66", type: "internal", target: "_self" },
  { label: "G-50 Motor Yacht (50 FT)", url: "/yachts/g50", type: "internal", target: "_self" },
  { label: "About Us", url: "/about", type: "internal", target: "_self" },
  { label: "News & Events", url: "/news", type: "internal", target: "_self" },
  { label: "VIP Concierge & Contact", url: "/contact", type: "internal", target: "_self" },
  { label: "Scroll to Fleet Anchor", url: "#fleet", type: "anchor", target: "_self" },
  { label: "Scroll to Enquiry Form", url: "#enquiry-form", type: "anchor", target: "_self" },
  { label: "WhatsApp Concierge Desk", url: "https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.", type: "external", target: "_blank" },
  { label: "Direct Phone Call (+971 56 526 8126)", url: "tel:+971565268126", type: "phone", target: "_self" },
  { label: "Direct Advisory Email (info@asmaraty.com)", url: "mailto:info@asmaraty.com", type: "email", target: "_self" },
];

export const DEFAULT_BUTTON_CONFIG = {
  label: "Learn More",
  url: "/contact",
  type: "internal",
  target: "_self",
  visible: true,
  style: "solid-gold",
  icon: null,
};

/**
 * Auto-detects link type based on URL format
 */
export function detectLinkType(url) {
  if (!url || typeof url !== "string") return "internal";
  const trimmed = url.trim();
  if (trimmed.startsWith("tel:")) return "phone";
  if (trimmed.startsWith("mailto:")) return "email";
  if (trimmed.startsWith("#")) return "anchor";
  if (trimmed.toLowerCase().includes(".pdf")) return "external";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("//")) return "external";
  return "internal";
}

/**
 * Formats URL href based on designated type
 */
export function formatButtonHref(url, type) {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  const detectedType = type || detectLinkType(trimmed);

  if (detectedType === "phone") {
    return trimmed.startsWith("tel:") ? trimmed : `tel:${trimmed.replace(/\s+/g, "")}`;
  }
  if (detectedType === "email") {
    return trimmed.startsWith("mailto:") ? trimmed : `mailto:${trimmed}`;
  }
  if (detectedType === "internal") {
    if (!trimmed.startsWith("/") && !trimmed.startsWith("#") && !trimmed.startsWith("http")) {
      return `/${trimmed}`;
    }
  }
  return trimmed;
}

/**
 * Normalizes any legacy string, partial object, or ButtonConfig into a complete, validated ButtonConfig
 */
export function normalizeButtonConfig(
  btn,
  fallbackLabel = "Learn More",
  fallbackUrl = "/contact",
  defaultStyle = "solid-gold"
) {
  if (!btn) {
    const url = fallbackUrl || "/contact";
    const type = detectLinkType(url);
    return {
      ...DEFAULT_BUTTON_CONFIG,
      label: fallbackLabel,
      url: url,
      type: type,
      target: type === "external" ? "_blank" : "_self",
      style: defaultStyle,
    };
  }

  // Handle legacy string argument (e.g. primaryButtonText: "Explore Fleet")
  if (typeof btn === "string") {
    const url = fallbackUrl || "/contact";
    const type = detectLinkType(url);
    return {
      ...DEFAULT_BUTTON_CONFIG,
      label: btn || fallbackLabel,
      url: url,
      type: type,
      target: type === "external" ? "_blank" : "_self",
      style: defaultStyle,
    };
  }

  // Handle full or partial object
  const label = btn.label || btn.text || fallbackLabel;
  const rawUrl = btn.url || fallbackUrl || "/contact";
  const isPdf = typeof rawUrl === "string" && rawUrl.toLowerCase().includes(".pdf");
  const type = btn.type || detectLinkType(rawUrl);
  const target = btn.target || (type === "external" || isPdf ? "_blank" : "_self");
  const visible = btn.visible !== undefined ? Boolean(btn.visible) : true;
  const style = btn.style || defaultStyle;

  return {
    label,
    url: rawUrl,
    type,
    target,
    visible,
    style,
    icon: btn.icon || null,
  };
}

