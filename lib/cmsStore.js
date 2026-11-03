import { DEFAULT_PAGES } from "./data/defaultPages";
import { DEFAULT_YACHTS } from "./data/defaultYachts";
import { DEFAULT_MEDIA } from "./data/defaultMedia";

export const DEFAULT_SETTINGS = {
  siteTitle: "ASMARATY | Luxury Yachts & Boats UAE",
  announcementText: "Discover the ASMARATY Luxury Fleet — The Signature of the Sea",
  announcementEnabled: true,
  contactEmail: "info@asmaraty.com",
  contactPhone: "+971 56 526 8126",
  whatsappNumber: "+971 56 526 8126",
  shipyardAddress: "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates",
  socialLinks: {
    instagram: "https://instagram.com/asmaraty",
    youtube: "https://youtube.com/asmaraty",
    linkedin: "https://linkedin.com/company/asmaraty"
  }
};

const isBrowser = () => typeof window !== "undefined";

// Purge any legacy localStorage keys so browser always loads authoritative data from DB
if (isBrowser()) {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("asm_cms_")) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (_) { }
}

// In-memory runtime state (never stale in localStorage, synced directly with database)
let memoryPages = null;
let memoryDrafts = {};
let memoryYachts = null;
let memoryMedia = null;
let memorySettings = null;

function notifyChange(type) {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("asm-cms-change", { detail: { type } }));
  }
}

/* ==================== PAGES API (DATABASE DRIVEN) ==================== */

function sanitizePagesList(pagesList) {
  if (!Array.isArray(pagesList)) return pagesList;
  return pagesList.map((page) => {
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
  if (memoryPages) {
    return sanitizePagesList(memoryPages);
  }
  return sanitizePagesList(DEFAULT_PAGES);
}

export async function syncPagesFromServer() {
  if (!isBrowser()) return getAllPages();
  try {
    const res = await fetch("/api/pages", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.pages) && data.pages.length > 0) {
        memoryPages = sanitizePagesList(data.pages);
        notifyChange("pages");
        return memoryPages;
      }
    }
  } catch (err) {
    console.warn("Could not sync pages from server database:", err);
  }
  return getAllPages();
}

export function getPageById(id) {
  const pages = getAllPages();
  return pages.find((p) => p.id === id) || null;
}

export function getPageBySlug(slug) {
  const pages = getAllPages();
  const normalized = slug === "" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;
  return pages.find((p) => p.slug === normalized) || null;
}

export function getPageDraft(pageId) {
  if (memoryDrafts[pageId]) {
    return memoryDrafts[pageId];
  }
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
  const now = new Date().toISOString();
  memoryDrafts[pageId] = {
    ...updatedDraft,
    lastModified: now,
    hasUnpublishedChanges: true,
  };

  const pages = getAllPages();
  const pageIndex = pages.findIndex((p) => p.id === pageId);
  if (pageIndex !== -1) {
    pages[pageIndex] = {
      ...pages[pageIndex],
      status: "draft_modified",
      lastModified: now,
    };
    memoryPages = [...pages];
  }
  notifyChange("drafts");
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
    memoryPages = [...pages];

    if (memoryDrafts[pageId]) {
      memoryDrafts[pageId] = {
        ...draft,
        hasUnpublishedChanges: false,
        lastModified: now,
      };
    }

    if (isBrowser()) {
      try {
        await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPage),
        });
      } catch (err) {
        console.warn("Error persisting page to database:", err);
      }
      notifyChange("pages");
    }
    return true;
  }
  return false;
}

export async function createPage({ title, slug, template = "editorial_showcase" }) {
  const pages = getAllPages();
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const id = `page-${Date.now()}`;
  const now = new Date().toISOString();

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
  memoryPages = [...pages];

  savePageDraft(id, {
    sections: initialSections,
    title,
    slug: normalizedSlug,
    lastModified: now,
    hasUnpublishedChanges: false,
  });

  if (isBrowser()) {
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });
    } catch (err) {
      console.warn("Error creating page in database:", err);
    }
    notifyChange("pages");
  }

  return newPage;
}

export async function duplicatePage(pageId) {
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
  memoryPages = [...pages];

  savePageDraft(id, {
    sections: duplicated.sections,
    title: duplicated.title,
    slug: duplicated.slug,
    lastModified: now,
    hasUnpublishedChanges: true,
  });

  if (isBrowser()) {
    try {
      await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated),
      });
    } catch (err) {
      console.warn("Error duplicating page in database:", err);
    }
    notifyChange("pages");
  }

  return duplicated;
}

export async function deletePage(pageId) {
  const pages = getAllPages();
  const pageToDelete = pages.find((p) => p.id === pageId);
  if (pageToDelete && pageToDelete.slug === "/") {
    alert("The Home page cannot be deleted as it is the root of the website.");
    return false;
  }

  const filtered = pages.filter((p) => p.id !== pageId);
  memoryPages = filtered;
  delete memoryDrafts[pageId];

  if (isBrowser()) {
    try {
      await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Error deleting page from database:", err);
    }
    notifyChange("pages");
  }
  return true;
}

/* ==================== YACHTS API (DATABASE DRIVEN) ==================== */

export function getAllYachts() {
  if (memoryYachts && Array.isArray(memoryYachts) && memoryYachts.length > 0) {
    return [...memoryYachts].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }
  return DEFAULT_YACHTS;
}

export async function syncYachtsFromServer(publishedOnly = false) {
  if (!isBrowser()) return getAllYachts();
  try {
    const url = publishedOnly ? "/api/yachts?published=true" : "/api/yachts";
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.yachts) && data.yachts.length > 0) {
        const sorted = data.yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        memoryYachts = sorted;
        notifyChange("yachts");
        return sorted;
      }
    }
  } catch (err) {
    console.warn("Could not sync yachts from server database:", err);
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

export async function saveYacht(yachtData) {
  const yachts = getAllYachts();
  const now = new Date().toISOString();
  let savedYacht = null;
  const isExisting = yachtData.id && yachts.some((y) => y.id === yachtData.id);

  if (isExisting) {
    const idx = yachts.findIndex((y) => y.id === yachtData.id);
    yachts[idx] = { ...yachts[idx], ...yachtData, updatedAt: now };
    yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    memoryYachts = [...yachts];
    savedYacht = yachts[idx];

    if (isBrowser()) {
      try {
        await fetch(`/api/yachts/${encodeURIComponent(yachtData.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(savedYacht),
        });
      } catch (err) {
        console.warn("Error persisting yacht to database:", err);
      }
      notifyChange("yachts");
    }
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
    memoryYachts = [...yachts];
    savedYacht = newYacht;

    if (isBrowser()) {
      try {
        await fetch("/api/yachts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(newYacht),
        });
      } catch (err) {
        console.warn("Error creating yacht in database:", err);
      }
      notifyChange("yachts");
    }
  }

  return savedYacht;
}

export async function togglePublishYacht(yachtId) {
  const yachts = getAllYachts();
  const yacht = yachts.find((y) => y.id === yachtId);
  if (!yacht) return null;

  const newStatus = yacht.status === "published" ? "draft" : "published";
  return saveYacht({ ...yacht, status: newStatus });
}

export async function reorderYachts(orderedIds) {
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

  memoryYachts = reordered;

  if (isBrowser()) {
    try {
      await fetch("/api/yachts/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.warn("Error persisting yacht order to database:", err);
    }
    notifyChange("yachts");
  }

  return reordered;
}

export async function deleteYacht(yachtId) {
  const yachts = getAllYachts();
  const filtered = yachts.filter((y) => y.id !== yachtId);
  filtered.forEach((y, idx) => {
    y.displayOrder = idx + 1;
  });
  memoryYachts = filtered;

  if (isBrowser()) {
    try {
      await fetch(`/api/yachts/${encodeURIComponent(yachtId)}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Error deleting yacht from database:", err);
    }
    notifyChange("yachts");
  }

  return true;
}

/* ==================== MEDIA API ==================== */

export function getAllMedia() {
  if (memoryMedia) return memoryMedia;
  return DEFAULT_MEDIA;
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
  memoryMedia = [...media];
  notifyChange("media");
  return newItem;
}

export function deleteMediaItem(mediaId) {
  const media = getAllMedia();
  memoryMedia = media.filter((m) => m.id !== mediaId);
  notifyChange("media");
  return true;
}

/* ==================== SETTINGS API (DATABASE DRIVEN) ==================== */

export function getSiteSettings() {
  if (memorySettings) return memorySettings;
  return DEFAULT_SETTINGS;
}

export async function saveSiteSettings(newSettings) {
  const current = getSiteSettings();
  const updated = { ...current, ...newSettings };
  memorySettings = updated;

  if (isBrowser()) {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn("Error saving settings to database:", err);
    }
    notifyChange("settings");
  }
  return updated;
}

export async function syncSettingsFromServer() {
  if (!isBrowser()) return getSiteSettings();
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        memorySettings = data.settings;
        notifyChange("settings");
        return data.settings;
      }
    }
  } catch (err) {
    console.warn("Could not sync settings from server database:", err);
  }
  return getSiteSettings();
}

/* ==================== RESET DEMO DATA ==================== */

export function resetAllDemoData() {
  memoryPages = null;
  memoryDrafts = {};
  memoryYachts = null;
  memoryMedia = null;
  memorySettings = null;

  if (isBrowser()) {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("asm_cms_")) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) { }
  }

  notifyChange("reset");
}
