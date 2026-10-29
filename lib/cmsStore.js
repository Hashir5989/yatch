import { DEFAULT_PAGES } from "./data/defaultPages";
import { DEFAULT_YACHTS } from "./data/defaultYachts";
import { DEFAULT_MEDIA } from "./data/defaultMedia";

const
  STORAGE_KEYS = {
    PAGES: "asm_cms_pages_v20",
    DRAFTS: "asm_cms_drafts_v16",
    YACHTS: "asm_cms_yachts_v12",
    MEDIA: "asm_cms_media_v8",
    SETTINGS: "asm_cms_settings_v9",
  };

export const DEFAULT_SETTINGS = {
  siteTitle: "ASMARATY | Luxury Yachts & Boats UAE",
  announcementText: "Discover the ASMARATY Luxury Fleet — The Signature of the Sea",
  announcementEnabled: true,
  contactEmail: "info@asmaraty.fake",
  contactPhone: "+971 56 526 8126",
  shipyardAddress: "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates",
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

export async function syncPagesFromServer() {
  if (!isBrowser()) return getAllPages();
  try {
    const res = await fetch("/api/pages");
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
        safeSet(STORAGE_KEYS.PAGES, data.pages);
        return data.pages;
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

    // Persist published page to server database / pages.json
    if (isBrowser()) {
      fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pages[pageIndex]),
      }).catch((err) => console.warn("Error persisting page to server:", err));
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
        const sorted = data.yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
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
  return safeGet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSiteSettings(newSettings) {
  const current = getSiteSettings();
  const updated = { ...current, ...newSettings };
  safeSet(STORAGE_KEYS.SETTINGS, updated);

  // Persist settings to server database
  if (isBrowser()) {
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn("Error saving settings to server:", err));
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
