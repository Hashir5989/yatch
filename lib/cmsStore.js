import { 
  DEFAULT_PAGES, 
  DEFAULT_HOME_PAGE, 
  DEFAULT_YACHTS_PAGE, 
  DEFAULT_ABOUT_PAGE, 
  DEFAULT_CONTACT_PAGE 
} from "./data/defaultPages.js";
import { DEFAULT_YACHTS } from "./data/defaultYachts.js";
import { DEFAULT_MEDIA } from "./data/defaultMedia.js";
import { DEFAULT_ARTICLES } from "./data/defaultArticles.js";

const
  STORAGE_KEYS = {
    PAGES: "asm_cms_pages_v25",
    DRAFTS: "asm_cms_drafts_v16",
    YACHTS: "asm_cms_yachts_v20",
    MEDIA: "asm_cms_media_v8",
    SETTINGS: "asm_cms_settings_v10",
    ARTICLES: "asm_cms_articles_v7",
  };

export const DEFAULT_SETTINGS = {
  // General & Meta
  siteTitle: "ASMARATY | Luxury Yachts & Boats UAE",
  announcementText: "Discover the ASMARATY Luxury Fleet — The Signature of the Sea",
  announcementEnabled: true,

  // Company & Headquarters
  companyName: "AL SHAALI MARINE",
  shipyardAddress: "RASHIDIA 1, AJMAN, United Arab Emirates",
  contactPhone: "+971 56 526 8126",
  contactEmail: "info@asmaraty.com",
  whatsappNumber: "+971 56 526 8126",
  operatingHours: "Saturday – Thursday: 08:00 – 17:00 GST\nFriday: Closed (Weekly Leave)",
  googleMapsUrl: "https://maps.google.com/?q=Al+Shaali+Marine+Ajman+UAE",

  // Desktop & Mobile Header
  header: {
    menuLabel: "Menu",
    ctaButton: {
      label: "Contact Us",
      url: "/contact",
      type: "internal",
      target: "_self",
      visible: true,
      style: "solid-gold"
    }
  },

  // Slide-Out Navigation Drawer
  drawer: {
    fleetHeading: "The Fleet Collection",
    fleetViewAllText: "View All",
    fleetViewAllUrl: "/yachts",
    navHeading: "Shipyard & Company",
    navLinks: [
      { id: "nav-fleet", label: "Fleet", url: "/yachts", type: "internal", target: "_self", visible: true },
      { id: "nav-about", label: "About Us", url: "/about", type: "internal", target: "_self", visible: true },
      { id: "nav-news", label: "News", url: "/news", type: "internal", target: "_self", visible: true },
      { id: "nav-contact", label: "Contact Us", url: "/contact", type: "internal", target: "_self", visible: true },
    ],
    ctaText: "Experience bespoke nautical engineering",
    ctaButton: {
      label: "Book Sea Trial",
      url: "/contact",
      type: "internal",
      target: "_self",
      visible: true,
      style: "solid-gold"
    }
  },

  // Global Footer
  footer: {
    brandEyebrow: "Yachts • United Arab Emirates",
    brandDescription: "Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels where architectural clarity meets endurance at sea.",
    trustBadge1: "Certified Yachts",
    trustBadge2: "45+ Years Heritage",
    fleetHeading: "The Fleet",
    experienceHeading: "Experience",
    experienceLinks: [
      { id: "exp-collections", label: "All Collections", url: "/yachts", type: "internal", target: "_self", visible: true },
      { id: "exp-about", label: "About Us", url: "/about", type: "internal", target: "_self", visible: true },
      { id: "exp-news", label: "News & Boat Shows", url: "/news", type: "internal", target: "_self", visible: true },
      { id: "exp-trial", label: "Book Sea Trial", url: "/contact", type: "internal", target: "_self", visible: true },
    ],
    hqHeading: "Headquarters",
    copyrightText: "© 2026 ASMARATY LLC. All rights reserved.",
    tagline: "Official Shipyard & Luxury Naval Architecture UAE"
  },

  // Social Media Channels
  socialLinks: {
    instagram: "",
    youtube: "",
    linkedin: "",
    whatsapp: "https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet."
  }
};

// Safe localStorage access
const isBrowser = () => typeof window !== "undefined";

function safeGet(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading localStorage key:", key, err);
    return fallback;
  }
}

function safeSet(key, value) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { key } }));
  } catch (err) {
    console.error("Error setting localStorage key:", key, err);
  }
}

/* ==================== PAGES API ==================== */

function sanitizePagesList(pagesList) {
  if (!Array.isArray(pagesList)) return pagesList;
  const EXCLUDED_IDS = ["page-yachts", "page-news", "page-contact"];
  const EXCLUDED_SLUGS = ["/yachts", "/news", "/contact"];

  return pagesList
    .filter((p) => p && !EXCLUDED_IDS.includes(p.id) && !EXCLUDED_SLUGS.includes(p.slug))
    .map((page) => {
    if (!page || !Array.isArray(page.sections)) return page;
    return {
      ...page,
      sections: page.sections.map((s) => {
        if (!s || !Array.isArray(s.interiorSlides)) return s;
        return {
          ...s,
          interiorSlides: s.interiorSlides.filter(
            (slide) =>
              slide &&
              slide.id !== "interior-g50-flybridge-helm" &&
              !(typeof slide.image === "string" && slide.image.includes("g50-flybridge-helm"))
          ),
        };
      }),
    };
  });
}

export function getAllPages() {
  const pages = safeGet(STORAGE_KEYS.PAGES, DEFAULT_PAGES);
  return sanitizePagesList(pages);
}

export async function syncPagesFromServer() {
  if (!isBrowser()) return getAllPages();
  try {
    const res = await fetch(`/api/pages?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
        const sanitized = sanitizePagesList(data.pages);
        safeSet(STORAGE_KEYS.PAGES, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn("Could not sync pages from server:", err);
  }
  return getAllPages();
}

export function getPageById(id) {
  const pages = getAllPages();
  return pages.find((p) => p.id === id) || null;
}

export function getPageBySlug(slug) {
  const pages = getAllPages();
  // Normalize slug
  const normalized = slug === "" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;
  return pages.find((p) => p.slug === normalized) || null;
}

export function getPageDraft(pageId) {
  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  if (drafts[pageId]) {
    return drafts[pageId];
  }
  // If no draft exists, draft is cloned from published page
  const page = getPageById(pageId);
  if (!page) return null;
  return {
    sections: JSON.parse(JSON.stringify(page.sections || [])),
    title: page.title,
    slug: page.slug,
    lastModified: page.lastModified,
    hasUnpublishedChanges: false,
  };
}

export function savePageDraft(pageId, updatedDraft) {
  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  const now = new Date().toISOString();

  drafts[pageId] = {
    ...updatedDraft,
    lastModified: now,
    hasUnpublishedChanges: true,
  };

  safeSet(STORAGE_KEYS.DRAFTS, drafts);

  // Also mark page status as modified in pages list if published
  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  if (pageIndex !== -1) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      status: "draft_modified",
      lastModified: now,
    };
    safeSet(STORAGE_KEYS.PAGES, pages);
  }
}

export async function publishPage(pageId) {
  const draft = getPageDraft(pageId);
  if (!draft) return false;

  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  const now = new Date().toISOString();

  if (pageIndex !== -1) {
    const updatedPage = {
      ...pages[pageIndex],
      title: draft.title || pages[pageIndex].title,
      slug: draft.slug || pages[pageIndex].slug,
      sections: JSON.parse(JSON.stringify(draft.sections)),
      status: "published",
      lastModified: now,
    };
    pages[pageIndex] = updatedPage;
    safeSet(STORAGE_KEYS.PAGES, pages);

    // Clear draft unpublished flag
    const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
    drafts[pageId] = {
      ...draft,
      hasUnpublishedChanges: false,
      lastModified: now,
    };
    safeSet(STORAGE_KEYS.DRAFTS, drafts);

    // Persist published page to server database / pages.json
    if (isBrowser()) {
      try {
        const res = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPage),
        });
        if (!res.ok) {
          console.error("Failed to persist page to server:", res.status);
        }
      } catch (err) {
        console.error("Error persisting page to server:", err);
      }
    }
    return true;
  }
  return false;
}

export function createPage({ title, slug, template = "editorial_showcase" }) {
  const pages = getAllPages();
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const id = `page-${Date.now()}`;
  const now = new Date().toISOString();

  // Choose initial sections based on template
  let initialSections = [];
  if (template === "editorial_showcase") {
    initialSections = JSON.parse(JSON.stringify((DEFAULT_HOME_PAGE.sections || []).slice(0, 4)));
  } else if (template === "fleet_catalog") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_YACHTS_PAGE.sections || []));
  } else if (template === "heritage_craft") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_ABOUT_PAGE.sections || []));
  } else if (template === "vip_concierge") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_CONTACT_PAGE.sections || []));
  } else {
    // Blank template with hero
    initialSections = [JSON.parse(JSON.stringify((DEFAULT_HOME_PAGE.sections || [])[0]))];
  }

  const newPage = {
    id,
    title,
    slug: normalizedSlug,
    template,
    status: "published",
    lastModified: now,
    sections: initialSections,
  };

  pages.push(newPage);
  safeSet(STORAGE_KEYS.PAGES, pages);

  // Initialize draft
  savePageDraft(id, {
    sections: initialSections,
    title,
    slug: normalizedSlug,
    lastModified: now,
    hasUnpublishedChanges: false,
  });

  // Persist new page to server database
  if (isBrowser()) {
    fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPage),
    }).catch((err) => console.warn("Error creating page on server:", err));
  }

  return newPage;
}

export function duplicatePage(pageId) {
  const page = getPageById(pageId);
  if (!page) return null;

  const pages = getAllPages();
  const id = `page-${Date.now()}`;
  const now = new Date().toISOString();

  const duplicated = {
    ...JSON.parse(JSON.stringify(page)),
    id,
    title: `${page.title} (Copy)`,
    slug: `${page.slug}-copy`,
    status: "draft_modified",
    lastModified: now,
  };

  pages.push(duplicated);
  safeSet(STORAGE_KEYS.PAGES, pages);

  // Create draft
  savePageDraft(id, {
    sections: duplicated.sections,
    title: duplicated.title,
    slug: duplicated.slug,
    lastModified: now,
    hasUnpublishedChanges: true,
  });

  if (isBrowser()) {
    fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicated),
    }).catch((err) => console.warn("Error duplicating page on server:", err));
  }

  return duplicated;
}

export function deletePage(pageId) {
  const pages = getAllPages();
  // Prevent deleting home page
  const pageToDelete = pages.find((p) => p.id === pageId);
  if (pageToDelete && pageToDelete.slug === "/") {
    alert("The Home page cannot be deleted as it is the root of the website.");
    return false;
  }

  const filtered = pages.filter((p) => p.id !== pageId);
  safeSet(STORAGE_KEYS.PAGES, filtered);

  // Remove draft
  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  delete drafts[pageId];
  safeSet(STORAGE_KEYS.DRAFTS, drafts);

  // Persist deletion to server database
  if (isBrowser()) {
    fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Error deleting page on server:", err));
  }
  return true;
}

/* ==================== YACHTS API ==================== */

export function getAllYachts() {
  const raw = safeGet(STORAGE_KEYS.YACHTS, DEFAULT_YACHTS);
  if (Array.isArray(raw)) {
    // Check if raw array contains obsolete keys/slugs
    const hasObsolete = raw.some((y) => y.slug === "as-77" || y.slug === "g55" || y.id === "yacht-as-77");
    if (hasObsolete) {
      if (isBrowser()) {
        try {
          localStorage.removeItem("asm_cms_yachts_v7");
          localStorage.removeItem(STORAGE_KEYS.YACHTS);
        } catch (_) { }
      }
      return DEFAULT_YACHTS;
    }
    return [...raw].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }
  return DEFAULT_YACHTS;
}

export async function syncYachtsFromServer(publishedOnly = false) {
  if (!isBrowser()) return getAllYachts();
  try {
    const url = publishedOnly ? "/api/yachts?published=true" : "/api/yachts";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.yachts) && data.yachts.length > 0) {
        const merged = data.yachts.map((y) => {
          const baseline = DEFAULT_YACHTS.find((d) => d.slug === y.slug || d.id === y.id) || {};
          return {
            ...baseline,
            ...y,
            specsSnapshot: {
              ...(baseline.specsSnapshot || {}),
              ...(y.specsSnapshot || y.specs || {}),
            },
            comparisonMatrix: {
              ...(baseline.comparisonMatrix || baseline.specsSnapshot || {}),
              ...(y.comparisonMatrix || y.specsSnapshot || y.specs || {}),
            },
          };
        });
        const sorted = merged.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        safeSet(STORAGE_KEYS.YACHTS, sorted);
        return sorted;
      }
    }
  } catch (err) {
    console.warn("Could not sync yachts from server:", err);
  }
  return getAllYachts();
}

export function getYachtById(id) {
  const yachts = getAllYachts();
  return yachts.find((y) => y.id === id) || null;
}

export function getYachtBySlug(slug) {
  const yachts = getAllYachts();
  const direct = yachts.find((y) => y.slug === slug);
  if (direct) return direct;
  if (slug === "g55") return yachts.find((y) => y.slug === "g50") || null;
  if (slug === "as-77") return yachts.find((y) => y.slug === "g77") || null;
  return null;
}

export function saveYacht(yachtData) {
  const yachts = getAllYachts();
  const now = new Date().toISOString();
  let savedYacht = null;
  const isExisting = yachtData.id && yachts.some((y) => y.id === yachtData.id);

  if (isExisting) {
    const idx = yachts.findIndex((y) => y.id === yachtData.id);
    yachts[idx] = { ...yachts[idx], ...yachtData, updatedAt: now };
    yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    safeSet(STORAGE_KEYS.YACHTS, yachts);
    savedYacht = yachts[idx];

    // Asynchronously sync to server
    if (isBrowser()) {
      fetch(`/api/yachts/${encodeURIComponent(yachtData.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(savedYacht),
      }).catch((err) => console.warn("Error persisting yacht to server:", err));
    }
  } else {
    // New yacht
    const newYacht = {
      ...yachtData,
      id: yachtData.id || `yacht-${Date.now()}`,
      displayOrder: yachtData.displayOrder ?? yachts.length + 1,
      createdAt: now,
      updatedAt: now,
      status: yachtData.status || "published",
    };
    yachts.push(newYacht);
    yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    safeSet(STORAGE_KEYS.YACHTS, yachts);
    savedYacht = newYacht;

    // Asynchronously sync to server
    if (isBrowser()) {
      fetch("/api/yachts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newYacht),
      }).catch((err) => console.warn("Error creating yacht on server:", err));
    }
  }

  return savedYacht;
}

export function togglePublishYacht(yachtId) {
  const yachts = getAllYachts();
  const yacht = yachts.find((y) => y.id === yachtId);
  if (!yacht) return null;

  const newStatus = yacht.status === "published" ? "draft" : "published";
  return saveYacht({ ...yacht, status: newStatus });
}

export function reorderYachts(orderedIds) {
  const yachts = getAllYachts();
  const yachtMap = new Map(yachts.map((y) => [y.id, y]));

  const reordered = [];
  orderedIds.forEach((id, index) => {
    const y = yachtMap.get(id);
    if (y) {
      y.displayOrder = index + 1;
      reordered.push(y);
      yachtMap.delete(id);
    }
  });

  yachtMap.forEach((y) => {
    y.displayOrder = reordered.length + 1;
    reordered.push(y);
  });

  safeSet(STORAGE_KEYS.YACHTS, reordered);

  // Sync to server API
  if (isBrowser()) {
    fetch("/api/yachts/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderedIds }),
    }).catch((err) => console.warn("Error persisting yacht order to server:", err));
  }

  return reordered;
}

export async function saveYachtAsync(yachtData) {
  const yachts = getAllYachts();
  const isExisting = yachtData.id && yachts.some((y) => y.id === yachtData.id);
  const url = isExisting ? `/api/yachts/${encodeURIComponent(yachtData.id)}` : "/api/yachts";
  const method = isExisting ? "PUT" : "POST";

  if (isBrowser()) {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(yachtData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }

      const saved = data.yacht || yachtData;
      const now = new Date().toISOString();
      const updatedList = getAllYachts();
      const idx = updatedList.findIndex((y) => y.id === saved.id);
      if (idx !== -1) {
        updatedList[idx] = { ...updatedList[idx], ...saved, updatedAt: now };
      } else {
        updatedList.push({ ...saved, updatedAt: now });
      }
      updatedList.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      safeSet(STORAGE_KEYS.YACHTS, updatedList);

      return { success: true, yacht: saved };
    } catch (err) {
      console.error("saveYachtAsync network error:", err);
      return { success: false, error: err.message || "Network error persisting yacht" };
    }
  }

  const fallbackSaved = saveYacht(yachtData);
  return { success: true, yacht: fallbackSaved };
}

export function duplicateYacht(yachtId) {
  const yachts = getAllYachts();
  const source = yachts.find((y) => y.id === yachtId);
  if (!source) return null;

  // Generate unique slug
  let baseSlug = source.slug ? `${source.slug}-copy` : "yacht-copy";
  let candidateSlug = baseSlug;
  let counter = 1;
  while (yachts.some((y) => y.slug?.toLowerCase() === candidateSlug.toLowerCase())) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  const newId = `yacht-${Date.now()}`;
  const duplicated = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    name: `${source.name || source.modelNumber} (Copy)`,
    fullName: source.fullName ? `${source.fullName} (Copy)` : `${source.name || source.modelNumber} (Copy)`,
    modelNumber: source.modelNumber ? `${source.modelNumber}-C` : "NEW",
    slug: candidateSlug,
    status: "draft", // Always draft for safety
    featured: false,
    displayOrder: yachts.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveYacht(duplicated);
}

export async function deleteYachtAsync(yachtId) {
  if (isBrowser()) {
    try {
      const res = await fetch(`/api/yachts/${encodeURIComponent(yachtId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      console.error("deleteYachtAsync network error:", err);
      return { success: false, error: err.message || "Network error deleting yacht" };
    }
  }

  deleteYacht(yachtId);
  return { success: true };
}

export function deleteYacht(yachtId) {
  const yachts = getAllYachts();
  const filtered = yachts.filter((y) => y.id !== yachtId);
  filtered.forEach((y, idx) => {
    y.displayOrder = idx + 1;
  });
  safeSet(STORAGE_KEYS.YACHTS, filtered);

  if (isBrowser()) {
    fetch(`/api/yachts/${encodeURIComponent(yachtId)}`, {
      method: "DELETE",
      credentials: "include",
    }).catch((err) => console.warn("Error deleting yacht on server:", err));
  }

  return true;
}

/* ==================== MEDIA API ==================== */

export function getAllMedia() {
  return safeGet(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
}

export function addMediaItem({ title, url, alt, category = "exterior" }) {
  const media = getAllMedia();
  const newItem = {
    id: `media-${Date.now()}`,
    title: title || "New Yacht Image",
    url,
    alt: alt || title || "ASMARATY luxury yacht",
    category,
    uploadedAt: new Date().toISOString().split("T")[0],
    dimensions: "2000 x 1200",
  };
  media.unshift(newItem);
  safeSet(STORAGE_KEYS.MEDIA, media);
  return newItem;
}

export function deleteMediaItem(mediaId) {
  const media = getAllMedia();
  const filtered = media.filter((m) => m.id !== mediaId);
  safeSet(STORAGE_KEYS.MEDIA, filtered);
  return true;
}

/* ==================== SETTINGS API ==================== */

export function getSiteSettings() {
  const stored = safeGet(STORAGE_KEYS.SETTINGS, null);
  if (!stored) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    header: {
      ...DEFAULT_SETTINGS.header,
      ...(stored.header || {}),
      ctaButton: { ...DEFAULT_SETTINGS.header.ctaButton, ...(stored.header?.ctaButton || {}) }
    },
    drawer: { 
      ...DEFAULT_SETTINGS.drawer, 
      ...(stored.drawer || {}),
      navLinks: Array.isArray(stored.drawer?.navLinks)
        ? stored.drawer.navLinks 
        : DEFAULT_SETTINGS.drawer.navLinks,
      ctaButton: { ...DEFAULT_SETTINGS.drawer.ctaButton, ...(stored.drawer?.ctaButton || {}) }
    },
    footer: {
      ...DEFAULT_SETTINGS.footer,
      ...(stored.footer || {}),
      experienceLinks: Array.isArray(stored.footer?.experienceLinks)
        ? stored.footer.experienceLinks
        : DEFAULT_SETTINGS.footer.experienceLinks
    },
    socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...(stored.socialLinks || {}) }
  };
}

export async function saveSiteSettings(newSettings) {
  const current = getSiteSettings();
  const updated = { ...current, ...newSettings };
  safeSet(STORAGE_KEYS.SETTINGS, updated);

  // Persist settings to server database
  if (isBrowser()) {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn("Error saving settings to server:", err);
    }
  }
  return updated;
}

export async function syncSettingsFromServer() {
  if (!isBrowser()) return getSiteSettings();
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        safeSet(STORAGE_KEYS.SETTINGS, data.settings);
        return data.settings;
      }
    }
  } catch (err) {
    console.warn("Could not sync settings from server:", err);
  }
  return getSiteSettings();
}

/* ==================== NEWS ARTICLES API ==================== */

export function getAllArticles(publishedOnly = false) {
  const articles = safeGet(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
  let list = Array.isArray(articles) && articles.length > 0 ? articles : DEFAULT_ARTICLES;

  // Ensure default events exist if missing from cached localStorage
  const hasEvent = list.some((a) => a.articleType === "event" || a.eventDetails?.isUpcoming);
  if (!hasEvent) {
    list = DEFAULT_ARTICLES;
    safeSet(STORAGE_KEYS.ARTICLES, DEFAULT_ARTICLES);
  }

  const sorted = [...list].sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
  return publishedOnly ? sorted.filter((a) => a.status === "published") : sorted;
}

export function getArticleBySlug(slug, publishedOnly = false) {
  const articles = getAllArticles(publishedOnly);
  return articles.find((a) => a.slug === slug) || null;
}

export function getArticleById(id) {
  const articles = getAllArticles(false);
  return articles.find((a) => a.id === id) || null;
}

export function saveArticle(articleData) {
  const articles = getAllArticles(false);
  const now = new Date().toISOString();
  let updatedList;

  if (articleData.id) {
    const index = articles.findIndex((a) => a.id === articleData.id);
    if (index !== -1) {
      articles[index] = {
        ...articles[index],
        ...articleData,
        updatedAt: now,
      };
      updatedList = [...articles];
    } else {
      updatedList = [
        {
          ...articleData,
          createdAt: now,
          updatedAt: now,
        },
        ...articles,
      ];
    }
  } else {
    const newArticle = {
      ...articleData,
      id: `news-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      status: articleData.status || "published",
    };
    updatedList = [newArticle, ...articles];
  }

  safeSet(STORAGE_KEYS.ARTICLES, updatedList);

  // Sync to server database in background
  if (isBrowser()) {
    const target = articleData.id
      ? articleData
      : updatedList[0];

    const isUpdate = Boolean(articleData.id && articles.some((a) => a.id === articleData.id));
    const url = isUpdate ? `/api/news/${target.id}` : "/api/news";
    const method = isUpdate ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    }).catch((err) => console.warn("Error syncing article to server:", err));
  }

  return articleData.id ? articleData : updatedList[0];
}

export function deleteArticle(id) {
  const articles = getAllArticles(false);
  const filtered = articles.filter((a) => a.id !== id);
  safeSet(STORAGE_KEYS.ARTICLES, filtered);

  if (isBrowser()) {
    fetch(`/api/news/${id}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Error deleting article on server:", err));
  }

  return true;
}

export function togglePublishArticle(id) {
  const articles = getAllArticles(false);
  const article = articles.find((a) => a.id === id);
  if (!article) return null;

  const newStatus = article.status === "published" ? "draft" : "published";
  const updated = { ...article, status: newStatus };
  saveArticle(updated);
  return updated;
}

export async function syncArticlesFromServer(publishedOnly = false) {
  if (!isBrowser()) return getAllArticles(publishedOnly);
  try {
    const url = publishedOnly ? `/api/news?published=true&t=${Date.now()}` : `/api/news?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        if (!publishedOnly) {
          safeSet(STORAGE_KEYS.ARTICLES, data.articles);
        }
        return data.articles;
      }
    }
  } catch (err) {
    console.warn("Could not sync articles from server:", err);
  }
  return getAllArticles(publishedOnly);
}

/* ==================== RESET ALL DEMO DATA ==================== */

export function resetAllDemoData() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.PAGES);
  localStorage.removeItem(STORAGE_KEYS.DRAFTS);
  localStorage.removeItem(STORAGE_KEYS.YACHTS);
  localStorage.removeItem(STORAGE_KEYS.MEDIA);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.ARTICLES);

  window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { reset: true } }));
}
