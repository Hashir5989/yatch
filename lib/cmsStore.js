import { DEFAULT_PAGES } from "./data/defaultPages";
import { DEFAULT_YACHTS } from "./data/defaultYachts";
import { DEFAULT_MEDIA } from "./data/defaultMedia";

const STORAGE_KEYS = {
  PAGES: "asm_cms_pages_v5",
  DRAFTS: "asm_cms_drafts_v5",
  YACHTS: "asm_cms_yachts_v5",
  MEDIA: "asm_cms_media_v5",
  SETTINGS: "asm_cms_settings_v5",
};

export const DEFAULT_SETTINGS = {
  siteTitle: "ASMARATY | Luxury Yachts & Boats UAE",
  announcementText: "Dubai International Boat Show 2026: Discover the Flagship AS 100 Tri-Deck",
  announcementEnabled: true,
  contactEmail: "info@asmaraty.fake",
  contactPhone: "+971 1234567890",
  shipyardAddress: "ASMARATY Shipyard, Maritime Industrial Zone, UAE",
  socialLinks: {
    instagram: "https://instagram.com/asmaraty",
    youtube: "https://youtube.com/asmaraty",
    linkedin: "https://linkedin.com/company/asmaraty"
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

export function getAllPages() {
  return safeGet(STORAGE_KEYS.PAGES, DEFAULT_PAGES);
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

export function publishPage(pageId) {
  const draft = getPageDraft(pageId);
  if (!draft) return false;
  
  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  const now = new Date().toISOString();
  
  if (pageIndex !== -1) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      title: draft.title || pages[pageIndex].title,
      slug: draft.slug || pages[pageIndex].slug,
      sections: JSON.parse(JSON.stringify(draft.sections)),
      status: "published",
      lastModified: now,
    };
    safeSet(STORAGE_KEYS.PAGES, pages);
    
    // Clear draft unpublished flag
    const drafts = safeGet(STORAGE_KEYS.DRAFTS, {});
    drafts[pageId] = {
      ...draft,
      hasUnpublishedChanges: false,
      lastModified: now,
    };
    safeSet(STORAGE_KEYS.DRAFTS, drafts);
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
    initialSections = JSON.parse(JSON.stringify(DEFAULT_PAGES[0].sections.slice(0, 4)));
  } else if (template === "fleet_catalog") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_PAGES[1].sections));
  } else if (template === "heritage_craft") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_PAGES[2].sections));
  } else if (template === "vip_concierge") {
    initialSections = JSON.parse(JSON.stringify(DEFAULT_PAGES[4].sections));
  } else {
    // Blank template with hero
    initialSections = [JSON.parse(JSON.stringify(DEFAULT_PAGES[0].sections[0]))];
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
  return true;
}

/* ==================== YACHTS API ==================== */

export function getAllYachts() {
  return safeGet(STORAGE_KEYS.YACHTS, DEFAULT_YACHTS);
}

export function getYachtById(id) {
  const yachts = getAllYachts();
  return yachts.find((y) => y.id === id) || null;
}

export function getYachtBySlug(slug) {
  const yachts = getAllYachts();
  return yachts.find((y) => y.slug === slug) || null;
}

export function saveYacht(yachtData) {
  const yachts = getAllYachts();
  const now = new Date().toISOString();
  
  if (yachtData.id) {
    const idx = yachts.findIndex((y) => y.id === yachtData.id);
    if (idx !== -1) {
      yachts[idx] = { ...yachts[idx], ...yachtData, updatedAt: now };
      safeSet(STORAGE_KEYS.YACHTS, yachts);
      return yachts[idx];
    }
  }
  
  // New yacht
  const newYacht = {
    ...yachtData,
    id: yachtData.id || `yacht-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  yachts.unshift(newYacht);
  safeSet(STORAGE_KEYS.YACHTS, yachts);
  return newYacht;
}

export function deleteYacht(yachtId) {
  const yachts = getAllYachts();
  const filtered = yachts.filter((y) => y.id !== yachtId);
  safeSet(STORAGE_KEYS.YACHTS, filtered);
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
  return safeGet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSiteSettings(newSettings) {
  const current = getSiteSettings();
  const updated = { ...current, ...newSettings };
  safeSet(STORAGE_KEYS.SETTINGS, updated);
  return updated;
}

/* ==================== RESET ALL DEMO DATA ==================== */

export function resetAllDemoData() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.PAGES);
  localStorage.removeItem(STORAGE_KEYS.DRAFTS);
  localStorage.removeItem(STORAGE_KEYS.YACHTS);
  localStorage.removeItem(STORAGE_KEYS.MEDIA);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  
  window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { reset: true } }));
}
