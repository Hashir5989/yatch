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
import { EVENT_SHOWCASES as DEFAULT_EVENTS } from "./data/eventsData.js";

const
  STORAGE_KEYS = {
    PAGES: "asm_cms_pages_v26",
    DRAFTS: "asm_cms_drafts_v16",
    YACHTS: "asm_cms_yachts_v24",
    MEDIA: "asm_cms_media_v8",
    SETTINGS: "asm_cms_settings_v12",
    ARTICLES: "asm_cms_articles_v10",
    EVENTS: "asm_cms_events_v25",
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
      { id: "nav-events", label: "Events", url: "/events", type: "internal", target: "_self", visible: true },
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
      { id: "exp-news", label: "News & Dispatches", url: "/news", type: "internal", target: "_self", visible: true },
      { id: "exp-events", label: "Events & Boat Shows", url: "/events", type: "internal", target: "_self", visible: true },
      { id: "exp-trial", label: "Book Sea Trial", url: "/contact", type: "internal", target: "_self", visible: true },
    ],
    hqHeading: "Headquarters",
    copyrightText: "© 2026 ASMARATY LLC. All rights reserved.",
    tagline: "Official Shipyard & Luxury Naval Architecture UAE"
  },

  // Social Media Channels
  socialLinks: {
    instagram: "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6",
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

export function getAuthHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  if (isBrowser()) {
    try {
      const token = localStorage.getItem("asm_admin_session_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (_) {}
  }
  return headers;
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
      headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      credentials: "include",
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

export async function savePageDraftAsync(pageId, updatedDraft) {
  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  const now = new Date().toISOString();

  drafts[pageId] = {
    ...updatedDraft,
    lastModified: now,
    hasUnpublishedChanges: true,
  };

  safeSet(STORAGE_KEYS.DRAFTS, drafts);

  // Also update page in local pages list
  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  let updatedPage = null;
  if (pageIndex !== -1) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      title: updatedDraft.title || pages[pageIndex].title,
      slug: updatedDraft.slug || pages[pageIndex].slug,
      sections: updatedDraft.sections || pages[pageIndex].sections,
      status: "draft_modified",
      lastModified: now,
    };
    safeSet(STORAGE_KEYS.PAGES, pages);
    updatedPage = pages[pageIndex];
  }

  // Persist draft modification to server database
  if (isBrowser() && updatedPage) {
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updatedPage),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
      return { success: true, page: updatedPage };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return { success: true, page: updatedPage };
}

export function savePageDraft(pageId, updatedDraft) {
  savePageDraftAsync(pageId, updatedDraft).catch(() => {});
}

export async function publishPage(pageId) {
  const draft = getPageDraft(pageId);
  if (!draft) return { success: false, error: "Draft not found" };

  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  const now = new Date().toISOString();

  if (pageIndex === -1) {
    return { success: false, error: "Page not found in catalog" };
  }

  const updatedPage = {
    ...pages[pageIndex],
    title: draft.title || pages[pageIndex].title,
    slug: draft.slug || pages[pageIndex].slug,
    sections: JSON.parse(JSON.stringify(draft.sections)),
    status: "published",
    lastModified: now,
  };

  // 1. Persist published page to server database FIRST and verify success
  if (isBrowser()) {
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updatedPage),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.error || `Server error (${res.status})`;
        console.error("Failed to persist page to server:", errorMsg);
        return { success: false, error: errorMsg };
      }
      if (data.page) {
        Object.assign(updatedPage, data.page);
      }
    } catch (err) {
      console.error("Error persisting page to server:", err);
      return { success: false, error: err.message || "Network connection error" };
    }
  }

  // 2. Only upon confirmed server persistence, commit to localStorage
  pages[pageIndex] = updatedPage;
  safeSet(STORAGE_KEYS.PAGES, pages);

  // 3. Clear draft unpublished flag
  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  drafts[pageId] = {
    ...draft,
    hasUnpublishedChanges: false,
    lastModified: now,
  };
  safeSet(STORAGE_KEYS.DRAFTS, drafts);

  // 4. Dispatch live update event
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { pageId, action: "publish" } }));
  }

  return { success: true, page: updatedPage };
}

export async function createPageAsync({ title, slug, template = "editorial_showcase" }) {
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

  // Persist new page to server database
  if (isBrowser()) {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(newPage),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
      if (data.page) Object.assign(newPage, data.page);
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

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

  return { success: true, page: newPage };
}

export function createPage(args) {
  const normalizedSlug = (args.slug || "").startsWith("/") ? args.slug : `/${args.slug || ""}`;
  const id = `page-${Date.now()}`;
  createPageAsync(args).catch(() => {});
  return { id, title: args.title, slug: normalizedSlug };
}

export async function duplicatePageAsync(pageId) {
  const page = getPageById(pageId);
  if (!page) return { success: false, error: "Page not found" };

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

  if (isBrowser()) {
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(duplicated),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

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

  return { success: true, page: duplicated };
}

export function duplicatePage(pageId) {
  const page = getPageById(pageId);
  if (!page) return null;
  duplicatePageAsync(pageId).catch(() => {});
  return { ...page, id: `page-${Date.now()}`, title: `${page.title} (Copy)` };
}

export async function deletePageAsync(pageId) {
  const pages = getAllPages();
  const pageToDelete = pages.find((p) => p.id === pageId);
  if (pageToDelete && pageToDelete.slug === "/") {
    return { success: false, error: "The Home page cannot be deleted." };
  }

  if (isBrowser()) {
    try {
      const res = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const filtered = pages.filter((p) => p.id !== pageId);
  safeSet(STORAGE_KEYS.PAGES, filtered);

  const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
  delete drafts[pageId];
  safeSet(STORAGE_KEYS.DRAFTS, drafts);

  return { success: true };
}

export function deletePage(pageId) {
  deletePageAsync(pageId).catch(() => {});
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
          localStorage.removeItem("asm_cms_yachts_v21");
          localStorage.removeItem(STORAGE_KEYS.YACHTS);
        } catch (_) { }
      }
      return DEFAULT_YACHTS;
    }
    // Auto-migrate any legacy "three-deck" or "Three-Deck Yacht" to "two-deck" / "Two-Deck Yacht", and G100 tri-deck to Super Yacht
    let needsUpdate = false;
    const cleaned = raw.map((y) => {
      const catLower = (y.category || "").toLowerCase();
      const labelLower = (y.categoryLabel || "").toLowerCase();
      const keyLower = (y.categoryKey || "").toLowerCase();
      if (
        catLower.includes("three-deck") ||
        catLower.includes("three deck") ||
        labelLower.includes("three-deck") ||
        labelLower.includes("three deck") ||
        keyLower === "three-deck" ||
        (y.slug === "g77" && (y.category === "Three-Deck Yacht" || y.decks === "Three Decks"))
      ) {
        needsUpdate = true;
        return {
          ...y,
          category: "Two-Deck Yacht",
          categoryLabel: "Two-Deck Yacht",
          categoryKey: "two-deck",
          decks: y.decks === "Three Decks" ? "Two Decks" : y.decks,
          badge: y.badge === "Three-Deck Masterpiece" ? "Two-Deck Masterpiece" : y.badge,
        };
      }
      if (
        y.slug === "g100" &&
        ((y.decks && y.decks.toLowerCase().includes("tri")) ||
         (y.category && y.category.toLowerCase().includes("tri")))
      ) {
        needsUpdate = true;
        return {
          ...y,
          category: "Super Yacht",
          categoryLabel: "Super Yacht",
          categoryKey: "superyacht",
          decks: "Super Yacht",
        };
      }
      if (y.slug === "g77" && (!y.brochureUrl || y.brochureUrl === "")) {
        needsUpdate = true;
        return {
          ...y,
          brochureUrl: "/documents/asmaraty-g77-brochure.pdf",
          brochureLabel: "Brochure (PDF)",
        };
      }
      return y;
    });
    if (needsUpdate && isBrowser()) {
      safeSet(STORAGE_KEYS.YACHTS, cleaned);
    }
    return [...cleaned].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }
  return DEFAULT_YACHTS;
}

export async function syncYachtsFromServer(publishedOnly = false) {
  if (!isBrowser()) return getAllYachts();
  try {
    const url = publishedOnly ? `/api/yachts?published=true&t=${Date.now()}` : `/api/yachts?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.yachts) && data.yachts.length > 0) {
        const sorted = [...data.yachts].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
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

export async function saveYachtAsync(yachtData) {
  const yachts = getAllYachts();
  const isExisting = yachtData.id && yachts.some((y) => y.id === yachtData.id);
  const url = isExisting ? `/api/yachts/${encodeURIComponent(yachtData.id)}` : "/api/yachts";
  const method = isExisting ? "PUT" : "POST";

  if (isBrowser()) {
    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(yachtData),
      });
      const data = await res.json().catch(() => ({}));
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

      window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { yacht: saved } }));
      return { success: true, yacht: saved };
    } catch (err) {
      console.error("saveYachtAsync network error:", err);
      return { success: false, error: err.message || "Network error persisting yacht" };
    }
  }

  const fallbackSaved = saveYacht(yachtData);
  return { success: true, yacht: fallbackSaved };
}

export function saveYacht(yachtData) {
  saveYachtAsync(yachtData).catch(() => {});
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
  } else {
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
  }

  return savedYacht;
}

export async function togglePublishYachtAsync(yachtId) {
  const yachts = getAllYachts();
  const yacht = yachts.find((y) => y.id === yachtId);
  if (!yacht) return { success: false, error: "Yacht not found" };

  const newStatus = yacht.status === "published" ? "draft" : "published";
  return await saveYachtAsync({ ...yacht, status: newStatus });
}

export function togglePublishYacht(yachtId) {
  const yachts = getAllYachts();
  const yacht = yachts.find((y) => y.id === yachtId);
  if (!yacht) return null;

  const newStatus = yacht.status === "published" ? "draft" : "published";
  return saveYacht({ ...yacht, status: newStatus });
}

export async function reorderYachtsAsync(orderedIds) {
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

  if (isBrowser()) {
    try {
      const res = await fetch("/api/yachts/reorder", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { reordered } }));
  }

  return { success: true, yachts: reordered };
}

export function reorderYachts(orderedIds) {
  reorderYachtsAsync(orderedIds).catch(() => {});
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
  return reordered;
}

export async function duplicateYachtAsync(yachtId) {
  const yachts = getAllYachts();
  const source = yachts.find((y) => y.id === yachtId);
  if (!source) return { success: false, error: "Yacht not found" };

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
    status: "draft",
    featured: false,
    displayOrder: yachts.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await saveYachtAsync(duplicated);
}

export function duplicateYacht(yachtId) {
  const yachts = getAllYachts();
  const source = yachts.find((y) => y.id === yachtId);
  if (!source) return null;

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
    status: "draft",
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
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
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
      headers: getAuthHeaders(),
      credentials: "include",
    }).catch((err) => console.warn("Error deleting yacht on server:", err));
  }

  return true;
}

/* ==================== MEDIA API ==================== */

export function getAllMedia() {
  const stored = safeGet(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
  if (!Array.isArray(stored) || stored.length === 0) {
    safeSet(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
    return Array.isArray(DEFAULT_MEDIA) ? [...DEFAULT_MEDIA] : [];
  }
  return stored;
}

export async function syncMediaFromServer() {
  if (!isBrowser()) return DEFAULT_MEDIA;
  try {
    const res = await fetch("/api/media", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.media) && data.media.length > 0) {
        safeSet(STORAGE_KEYS.MEDIA, data.media);
        return data.media;
      }
    }
  } catch (err) {
    console.warn("Could not sync media from server:", err);
  }
  return getAllMedia();
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
  const list = Array.isArray(media) ? [...media] : [];
  // Avoid duplicate by url
  const filtered = list.filter((m) => m && m.url !== url);
  filtered.unshift(newItem);
  safeSet(STORAGE_KEYS.MEDIA, filtered);

  // Background server sync
  if (isBrowser()) {
    fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
      credentials: "include",
    }).catch((err) => console.warn("Error syncing new media to server:", err));
  }

  return newItem;
}

export function deleteMediaItem(mediaId) {
  const media = getAllMedia();
  const list = Array.isArray(media) ? media : [];
  const filtered = list.filter((m) => m && m.id !== mediaId);
  safeSet(STORAGE_KEYS.MEDIA, filtered);

  if (isBrowser()) {
    fetch(`/api/media?id=${encodeURIComponent(mediaId)}`, {
      method: "DELETE",
      credentials: "include",
    }).catch((err) => console.warn("Error deleting media on server:", err));
  }

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
    socialLinks: {
      ...DEFAULT_SETTINGS.socialLinks,
      ...(stored.socialLinks || {}),
      instagram: (stored.socialLinks?.instagram && stored.socialLinks.instagram.trim() && !stored.socialLinks.instagram.endsWith("/asmaraty"))
        ? stored.socialLinks.instagram
        : "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"
    }
  };
}

export async function saveSiteSettings(newSettings) {
  const current = getSiteSettings();
  const updated = { ...current, ...newSettings };

  // Persist settings to server database FIRST
  if (isBrowser()) {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(updated),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg = data.error || `Server error (${res.status})`;
        console.error("Failed to persist settings to server:", errorMsg);
        throw new Error(errorMsg);
      }
      if (data.settings) {
        Object.assign(updated, data.settings);
      }
    } catch (err) {
      console.error("Error saving settings to server:", err);
      throw err;
    }
  }

  safeSet(STORAGE_KEYS.SETTINGS, updated);
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { settings: updated } }));
  }
  return updated;
}

export async function syncSettingsFromServer() {
  if (!isBrowser()) return getSiteSettings();
  try {
    const res = await fetch(`/api/settings?t=${Date.now()}`, {
      cache: "no-store",
      headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      credentials: "include",
    });
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

export async function saveArticleAsync(articleData) {
  const articles = getAllArticles(false);
  const now = new Date().toISOString();
  const isUpdate = Boolean(articleData.id && articles.some((a) => a.id === articleData.id));
  const url = isUpdate ? `/api/news/${articleData.id}` : "/api/news";
  const method = isUpdate ? "PUT" : "POST";

  let savedArticle = null;

  if (isBrowser()) {
    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(articleData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
      savedArticle = data.article || articleData;
    } catch (err) {
      console.error("saveArticleAsync network error:", err);
      return { success: false, error: err.message || "Network error saving article" };
    }
  } else {
    savedArticle = { ...articleData, id: articleData.id || `news-${Date.now()}` };
  }

  const targetId = savedArticle.id;
  const idx = articles.findIndex((a) => a.id === targetId);
  let updatedList;
  if (idx !== -1) {
    articles[idx] = { ...articles[idx], ...savedArticle, updatedAt: now };
    updatedList = [...articles];
  } else {
    updatedList = [{ ...savedArticle, createdAt: now, updatedAt: now }, ...articles];
  }

  safeSet(STORAGE_KEYS.ARTICLES, updatedList);
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { article: savedArticle } }));
  }
  return { success: true, article: savedArticle };
}

export function saveArticle(articleData) {
  saveArticleAsync(articleData).catch(() => {});
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
  return articleData.id ? articleData : updatedList[0];
}

export async function deleteArticleAsync(id) {
  if (isBrowser()) {
    try {
      const res = await fetch(`/api/news/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      console.error("deleteArticleAsync network error:", err);
      return { success: false, error: err.message || "Network error deleting article" };
    }
  }

  const articles = getAllArticles(false);
  const filtered = articles.filter((a) => a.id !== id);
  safeSet(STORAGE_KEYS.ARTICLES, filtered);

  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { deletedArticleId: id } }));
  }
  return { success: true };
}

export function deleteArticle(id) {
  deleteArticleAsync(id).catch(() => {});
  const articles = getAllArticles(false);
  const filtered = articles.filter((a) => a.id !== id);
  safeSet(STORAGE_KEYS.ARTICLES, filtered);
  return true;
}

export async function togglePublishArticleAsync(id) {
  const articles = getAllArticles(false);
  const article = articles.find((a) => a.id === id);
  if (!article) return { success: false, error: "Article not found" };

  const newStatus = article.status === "published" ? "draft" : "published";
  const updated = { ...article, status: newStatus };
  return await saveArticleAsync(updated);
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
      headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      credentials: "include",
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

/* ==================== EVENT SHOWCASES STORE (SEPARATE FROM NEWS) ==================== */

export function getAllEvents(publishedOnly = false) {
  const events = safeGet(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
  if (!Array.isArray(events) || events.length === 0) {
    safeSet(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
    return publishedOnly ? DEFAULT_EVENTS.filter((e) => e.status === "published") : DEFAULT_EVENTS;
  }

  // Ensure migration if cached events contain non-Qatar showcases or old images
  if (events.some((e) => e.id === "adibs-2026" || e.id === "dibs-2026" || (e.id === "qibs-2026" && !JSON.stringify(e.photos || []).includes("qibs-2026-fireworks-celebration")) || JSON.stringify(e.photos || []).includes("inauguration"))) {
    safeSet(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS);
    return publishedOnly ? DEFAULT_EVENTS.filter((e) => e.status === "published") : DEFAULT_EVENTS;
  }

  if (publishedOnly) {
    return events.filter((e) => e.status === "published");
  }
  return events;
}

export function getEventBySlug(slug, publishedOnly = false) {
  if (!slug) return null;
  const events = getAllEvents(publishedOnly);
  const normalized = slug.toLowerCase().trim();
  return (
    events.find(
      (e) =>
        e.slug.toLowerCase() === normalized ||
        e.id.toLowerCase() === normalized ||
        (Array.isArray(e.aliases) && e.aliases.some((a) => a.toLowerCase() === normalized))
    ) || null
  );
}

export function getEventById(id) {
  if (!id) return null;
  const events = getAllEvents(false);
  return events.find((e) => e.id === id) || null;
}

export async function saveEventAsync(eventData) {
  let savedEvent = null;

  if (isBrowser()) {
    try {
      const isExisting = Boolean(eventData.id);
      const url = isExisting ? `/api/events/${encodeURIComponent(eventData.id)}` : "/api/events";
      const method = isExisting ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.event) {
        savedEvent = data.event;
      } else {
        console.warn("Server saveEvent returned non-success, falling back to local:", data.error);
      }
    } catch (err) {
      console.error("saveEventAsync network error:", err);
    }
  }

  const now = new Date().toISOString();
  if (!savedEvent) {
    savedEvent = {
      ...eventData,
      id: eventData.id || `event-${Date.now()}`,
      createdAt: eventData.createdAt || now,
      updatedAt: now,
      status: eventData.status || "published",
    };
  }

  const events = getAllEvents(false);
  const targetId = savedEvent.id;
  const idx = events.findIndex((e) => e.id === targetId);
  let updatedList;
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...savedEvent, updatedAt: now };
    updatedList = [...events];
  } else {
    updatedList = [{ ...savedEvent, createdAt: now, updatedAt: now }, ...events];
  }

  safeSet(STORAGE_KEYS.EVENTS, updatedList);
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { event: savedEvent } }));
  }
  return { success: true, event: savedEvent };
}

export function saveEvent(eventData) {
  saveEventAsync(eventData).catch(() => {});
  const events = getAllEvents(false);
  const now = new Date().toISOString();
  let updatedList;

  if (eventData.id) {
    const index = events.findIndex((e) => e.id === eventData.id);
    if (index !== -1) {
      events[index] = {
        ...events[index],
        ...eventData,
        updatedAt: now,
      };
      updatedList = [...events];
    } else {
      updatedList = [
        {
          ...eventData,
          createdAt: now,
          updatedAt: now,
        },
        ...events,
      ];
    }
  } else {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      status: eventData.status || "published",
    };
    updatedList = [newEvent, ...events];
  }

  safeSet(STORAGE_KEYS.EVENTS, updatedList);
  return eventData.id ? eventData : updatedList[0];
}

export async function deleteEventAsync(id) {
  if (isBrowser()) {
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
    } catch (err) {
      console.error("deleteEventAsync network error:", err);
      return { success: false, error: err.message || "Network error deleting event" };
    }
  }

  const events = getAllEvents(false);
  const filtered = events.filter((e) => e.id !== id);
  safeSet(STORAGE_KEYS.EVENTS, filtered);

  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { deletedEventId: id } }));
  }
  return { success: true };
}

export function deleteEvent(id) {
  deleteEventAsync(id).catch(() => {});
  const events = getAllEvents(false);
  const filtered = events.filter((e) => e.id !== id);
  safeSet(STORAGE_KEYS.EVENTS, filtered);
  return true;
}

export async function togglePublishEventAsync(id) {
  const events = getAllEvents(false);
  const event = events.find((e) => e.id === id);
  if (!event) return { success: false, error: "Event not found" };

  const newStatus = event.status === "published" ? "draft" : "published";
  const updated = { ...event, status: newStatus };
  return await saveEventAsync(updated);
}

export function togglePublishEvent(id) {
  const events = getAllEvents(false);
  const event = events.find((e) => e.id === id);
  if (!event) return null;

  const newStatus = event.status === "published" ? "draft" : "published";
  const updated = { ...event, status: newStatus };
  saveEvent(updated);
  return updated;
}

export async function syncEventsFromServer(publishedOnly = false) {
  if (!isBrowser()) return getAllEvents(publishedOnly);
  try {
    const url = publishedOnly ? `/api/events?published=true&t=${Date.now()}` : `/api/events?t=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.events) && data.events.length > 0) {
        if (!publishedOnly) {
          safeSet(STORAGE_KEYS.EVENTS, data.events);
        }
        return data.events;
      }
    }
  } catch (err) {
    console.warn("Could not sync events from server:", err);
  }
  return getAllEvents(publishedOnly);
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
  localStorage.removeItem(STORAGE_KEYS.EVENTS);

  window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { reset: true } }));
}
