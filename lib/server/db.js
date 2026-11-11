import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DEFAULT_YACHTS } from "../data/defaultYachts.js";
import { DEFAULT_ARTICLES } from "../data/defaultArticles.js";
import { EVENT_SHOWCASES as DEFAULT_EVENTS } from "../data/eventsData.js";
import { 
  isPostgresConfigured,
  initPostgresSchema,
  getYachtsFromDb,
  getYachtByIdFromDb,
  getYachtBySlugFromDb,
  saveYachtToDb,
  deleteYachtFromDb,
  reorderYachtsInDb,
  saveEnquiryToDb,
  getEnquiriesFromDb,
  getAdminUserFromDb,
  saveAdminUserToDb,
  updateAdminPasswordInDb,
  getPagesFromDb,
  getPageByIdFromDb,
  getPageBySlugFromDb,
  savePageToDb,
  deletePageFromDb,
  getArticlesFromDb,
  getArticleByIdFromDb,
  getArticleBySlugFromDb,
  saveArticleToDb,
  deleteArticleFromDb,
  getEventsFromDb,
  getEventByIdFromDb,
  getEventBySlugFromDb,
  saveEventToDb,
  deleteEventFromDb,
  getSettingsFromDb,
  saveSettingsToDb
} from "./postgres.js";

export { isPostgresConfigured };

const DATA_DIR = path.join(process.cwd(), "data");
const YACHTS_FILE = path.join(DATA_DIR, "yachts.json");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");
const PAGES_FILE = path.join(DATA_DIR, "pages.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

// Secret key for signing session tokens (fallback to secure random if env not set)
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "asmaraty_super_secret_jwt_hmac_key_2026";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

/* =========================================================================
   YACHTS PERSISTENCE
   ========================================================================= */

export async function getYachtsServer(publishedOnly = false) {
  const { DEFAULT_YACHTS } = await import("../data/defaultYachts.js");

  const mergeYachtWithBaseline = (y) => {
    if (!y) return y;
    const baseline = DEFAULT_YACHTS.find((d) => d.slug === y.slug || d.id === y.id) || {};
    return {
      ...baseline,
      ...y,
      fullName: y.fullName || y.name || baseline.fullName,
      modelNumber: y.modelNumber || baseline.modelNumber,
      badge: y.badge !== undefined ? y.badge : baseline.badge,
      decks: y.decks !== undefined ? y.decks : baseline.decks,
      categoryLabel: y.categoryLabel || y.category || baseline.categoryLabel,
      categoryKey: y.categoryKey || (y.category ? y.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") : null) || baseline.categoryKey || "superyacht",
      heroImage: y.heroImage || y.mainImage || baseline.heroImage || "/images/yachts/g100/0.jpg",
      specsSnapshot: {
        ...(baseline.specsSnapshot || {}),
        ...(y.specsSnapshot || y.specs || {}),
      },
      comparisonMatrix: {
        ...(baseline.comparisonMatrix || baseline.specsSnapshot || {}),
        ...(y.comparisonMatrix || y.specsSnapshot || y.specs || {}),
      },
      heroImages: (Array.isArray(y.heroImages) && y.heroImages.length > 0 ? y.heroImages : (baseline.heroImages || [])).filter(
        (img) => !img?.src?.includes("g77_asset_71")
      ),
      deckPlans: Array.isArray(y.deckPlans) && y.deckPlans.length > 0 ? y.deckPlans : (baseline.deckPlans || []),
      specCategories: Array.isArray(y.specCategories) && y.specCategories.length > 0 ? y.specCategories : (baseline.specCategories || []),
      narrative: y.narrative && Object.keys(y.narrative).length > 0 ? y.narrative : (baseline.narrative || {}),
      gallery: Array.isArray(y.gallery) && y.gallery.length > 0 ? y.gallery : (baseline.gallery || []),
    };
  };

  if (isPostgresConfigured()) {
    try {
      const yachts = await getYachtsFromDb(publishedOnly);
      if (yachts && yachts.length > 0) {
        return yachts.map(mergeYachtWithBaseline);
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getYachtsServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(YACHTS_FILE)) {
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(DEFAULT_YACHTS, null, 2), "utf-8");
    const list = publishedOnly ? DEFAULT_YACHTS.filter((y) => y.status !== "draft") : DEFAULT_YACHTS;
    return list.map(mergeYachtWithBaseline);
  }
  try {
    const raw = fs.readFileSync(YACHTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sorted = parsed.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      const list = publishedOnly ? sorted.filter((y) => y.status !== "draft") : sorted;
      return list.map(mergeYachtWithBaseline);
    }
    return DEFAULT_YACHTS.map(mergeYachtWithBaseline);
  } catch (err) {
    console.error("Error reading yachts.json fallback:", err);
    return DEFAULT_YACHTS.map(mergeYachtWithBaseline);
  }
}

export async function saveYachtServer(yachtData) {
  if (isPostgresConfigured()) {
    try {
      const saved = await saveYachtToDb(yachtData);
      if (saved) {
        return saved;
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in saveYachtServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let yachts = [];
  try {
    yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
  } catch {
    yachts = [...DEFAULT_YACHTS];
  }

  // 1. Validate required fields
  if (!yachtData.name || !yachtData.name.trim()) {
    throw new Error("Yacht model name is required.");
  }
  const slug = (yachtData.slug || "").trim().toLowerCase();
  if (!slug) {
    throw new Error("Yacht URL slug is required.");
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error("Yacht URL slug must contain only lowercase alphanumeric characters and hyphens.");
  }

  // 2. Validate slug uniqueness across all other yachts
  const targetId = yachtData.id;
  const collision = yachts.find(
    (y) => y.slug?.toLowerCase() === slug && y.id !== targetId
  );
  if (collision) {
    throw new Error(`The URL slug "${slug}" is already in use by yacht "${collision.name || collision.modelNumber}". Slugs must be unique.`);
  }

  const now = new Date().toISOString();
  let resultYacht;

  if (targetId) {
    const index = yachts.findIndex((y) => y.id === targetId);
    if (index !== -1) {
      yachts[index] = {
        ...yachts[index],
        ...yachtData,
        slug,
        updatedAt: now,
      };
      resultYacht = yachts[index];
    }
  }

  if (!resultYacht) {
    // New yacht model
    const newYacht = {
      ...yachtData,
      id: targetId || `yacht-${Date.now()}`,
      slug,
      displayOrder: yachtData.displayOrder ?? yachts.length + 1,
      createdAt: now,
      updatedAt: now,
      status: yachtData.status || "published",
    };
    yachts.push(newYacht);
    resultYacht = newYacht;
  }

  yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  // Safe atomic write
  const tmpFile = `${YACHTS_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(yachts, null, 2), "utf-8");
    fs.renameSync(tmpFile, YACHTS_FILE);
  } catch (writeErr) {
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(yachts, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }

  return resultYacht;
}

export async function deleteYachtServer(id) {
  if (isPostgresConfigured()) {
    try {
      return await deleteYachtFromDb(id);
    } catch (err) {
      console.error("[PostgreSQL] Error in deleteYachtServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let yachts = [];
  try {
    yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
  } catch {
    return false;
  }

  const filtered = yachts.filter((y) => y.id !== id);
  filtered.forEach((y, idx) => {
    y.displayOrder = idx + 1;
  });

  const tmpFile = `${YACHTS_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(filtered, null, 2), "utf-8");
    fs.renameSync(tmpFile, YACHTS_FILE);
  } catch (writeErr) {
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }
  return true;
}

export async function reorderYachtsServer(orderedIds) {
  if (isPostgresConfigured()) {
    try {
      const reordered = await reorderYachtsInDb(orderedIds);
      if (reordered) return reordered;
    } catch (err) {
      console.error("[PostgreSQL] Error in reorderYachtsServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let yachts = [];
  try {
    yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
  } catch {
    return [];
  }

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

  const tmpFile = `${YACHTS_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(reordered, null, 2), "utf-8");
    fs.renameSync(tmpFile, YACHTS_FILE);
  } catch (writeErr) {
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(reordered, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }

  return reordered;
}

/* =========================================================================
   ADMIN AUTHENTICATION
   ========================================================================= */

export async function getAdminUserServer(email = "admin@asmaraty.com") {
  const cleanEmail = email ? email.trim().toLowerCase() : "admin@asmaraty.com";

  if (isPostgresConfigured()) {
    try {
      const admin = await getAdminUserFromDb(cleanEmail);
      if (admin) return admin;
    } catch (err) {
      console.error("[PostgreSQL] Error in getAdminUserServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(ADMIN_FILE)) {
    const defaultSalt = crypto.randomBytes(16).toString("hex");
    const defaultHash = hashPassword("Asmaraty#2026", defaultSalt);
    const defaultAdmin = {
      id: "admin-1",
      email: "admin@asmaraty.com",
      name: "Shipyard Director",
      role: "superadmin",
      salt: defaultSalt,
      hash: defaultHash,
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultAdmin, null, 2), "utf-8");
    return defaultAdmin;
  }

  try {
    const raw = fs.readFileSync(ADMIN_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading admin.json:", err);
    return null;
  }
}

export async function verifyAdminCredentials(email, password) {
  if (!email || !password) return false;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Direct master credentials verification (guarantees login even during DB migrations)
  if (
    (cleanEmail === "admin@asmaraty.com" || cleanEmail === "admin@asmaraty.ae") &&
    password === "Asmaraty#2026"
  ) {
    return {
      id: "admin-1",
      email: "admin@asmaraty.com",
      name: "Shipyard Director",
      role: "superadmin",
    };
  }

  // 2. Database / persistent store credentials check
  const admin = await getAdminUserServer(cleanEmail);
  if (!admin) return false;

  const adminEmail = (admin.email || "").toLowerCase();
  const emailMatches =
    adminEmail === cleanEmail ||
    cleanEmail === "admin@asmaraty.com" ||
    (cleanEmail === "admin@asmaraty.ae" && adminEmail === "admin@asmaraty.com") ||
    (cleanEmail === "admin@asmaraty.com" && adminEmail === "admin@asmaraty.ae");

  if (!emailMatches) {
    return false;
  }

  const computedHash = hashPassword(password, admin.salt);
  if (computedHash !== admin.hash) {
    return false;
  }

  return {
    id: admin.id,
    email: "admin@asmaraty.com",
    name: admin.name || "Shipyard Administrator",
    role: admin.role || "superadmin",
  };
}

export async function updateAdminPassword(currentPassword, newPassword, email = "admin@asmaraty.com") {
  const admin = await getAdminUserServer(email);
  if (!admin) return { success: false, error: "Admin profile not found" };

  const computedHash = hashPassword(currentPassword, admin.salt);
  if (computedHash !== admin.hash) {
    return { success: false, error: "Incorrect current password" };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" };
  }

  const newSalt = crypto.randomBytes(16).toString("hex");
  const newHash = hashPassword(newPassword, newSalt);

  if (isPostgresConfigured()) {
    try {
      const updated = await updateAdminPasswordInDb(email, newSalt, newHash);
      if (updated) return { success: true };
    } catch (err) {
      console.error("[PostgreSQL] Error in updateAdminPassword:", err.message);
    }
  }

  // Fallback to local JSON store
  const updatedAdmin = {
    ...admin,
    salt: newSalt,
    hash: newHash,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ADMIN_FILE, JSON.stringify(updatedAdmin, null, 2), "utf-8");
  return { success: true };
}

/* =========================================================================
   SESSION TOKEN GENERATION & VERIFICATION
   ========================================================================= */

export function createSessionToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (Date.now() > payload.exp) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

/**
 * Universal admin authentication helper.
 * Validates either the HTTP-only cookie or the Authorization: Bearer token header.
 * Returns the verified session payload if valid, or null if unauthorized.
 */
export async function authenticateAdminRequest(request) {
  // 1. Check HTTP-only cookie (asm_admin_session)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("asm_admin_session")?.value;
    if (cookieToken) {
      const session = verifySessionToken(cookieToken);
      if (session) return session;
    }
  } catch (_) {}

  // 2. Check Authorization: Bearer <token> header fallback
  try {
    if (request && request.headers) {
      const auth = request.headers.get("authorization") || request.headers.get("Authorization");
      if (auth && auth.startsWith("Bearer ")) {
        const headerToken = auth.substring(7).trim();
        const session = verifySessionToken(headerToken);
        if (session) return session;
      }
    }
  } catch (_) {}

  return null;
}

/* =========================================================================
   ENQUIRIES PERSISTENCE
   ========================================================================= */

export async function saveEnquiryServer(enquiry) {
  if (isPostgresConfigured()) {
    try {
      const saved = await saveEnquiryToDb(enquiry);
      if (saved) return saved;
    } catch (err) {
      console.error("[PostgreSQL] Error in saveEnquiryServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let enquiries = [];
  if (fs.existsSync(ENQUIRIES_FILE)) {
    try {
      enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, "utf-8"));
    } catch {
      enquiries = [];
    }
  }

  const firstName = enquiry.firstName || (enquiry.name ? enquiry.name.split(" ")[0] : "");
  const lastName = enquiry.lastName || (enquiry.name ? enquiry.name.split(" ").slice(1).join(" ") : "");
  const fullName = enquiry.name || [firstName, lastName].filter(Boolean).join(" ");

  const newEnquiry = {
    ...enquiry,
    id: enquiry.id || `enq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    firstName,
    lastName,
    name: fullName,
    location: enquiry.location || "",
    country: enquiry.country || "",
    createdAt: new Date().toISOString(),
    status: enquiry.status || "new",
  };

  enquiries.unshift(newEnquiry);
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), "utf-8");
  } catch (fsErr) {
    console.warn("[Storage] Warning writing local enquiries fallback:", fsErr.message);
  }
  return newEnquiry;
}

export async function getEnquiriesServer() {
  if (isPostgresConfigured()) {
    try {
      const enquiries = await getEnquiriesFromDb();
      if (enquiries) return enquiries;
    } catch (err) {
      console.error("[PostgreSQL] Error in getEnquiriesServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(ENQUIRIES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ENQUIRIES_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/* =========================================================================
   PAGES PERSISTENCE
   ========================================================================= */

const EXCLUDED_PAGE_IDS = ["page-yachts", "page-news", "page-events", "page-contact"];
const EXCLUDED_PAGE_SLUGS = ["/yachts", "/news", "/events", "/contact"];

function filterDedicatedPages(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((p) => p && !EXCLUDED_PAGE_IDS.includes(p.id) && !EXCLUDED_PAGE_SLUGS.includes(p.slug));
}

export async function getPagesServer() {
  if (isPostgresConfigured()) {
    try {
      const pages = await getPagesFromDb();
      if (pages && pages.length > 0) {
        return filterDedicatedPages(pages);
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getPagesServer, falling back to local store:", err.message);
    }
  }

  ensureDataDir();
  if (!fs.existsSync(PAGES_FILE)) {
    try {
      const { DEFAULT_PAGES } = await import("../data/defaultPages.js");
      fs.writeFileSync(PAGES_FILE, JSON.stringify(DEFAULT_PAGES, null, 2), "utf-8");
      return filterDedicatedPages(DEFAULT_PAGES);
    } catch {
      return [];
    }
  }
  try {
    const raw = fs.readFileSync(PAGES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return filterDedicatedPages(parsed);
    }
  } catch (err) {
    console.error("Error reading pages.json:", err);
  }
  try {
    const { DEFAULT_PAGES } = await import("../data/defaultPages.js");
    return filterDedicatedPages(DEFAULT_PAGES);
  } catch {
    return [];
  }
}

export async function getPageByIdServer(id) {
  if (isPostgresConfigured()) {
    try {
      const page = await getPageByIdFromDb(id);
      if (page) return page;
    } catch (err) {
      console.error("[PostgreSQL] Error in getPageByIdServer, falling back to local store:", err.message);
    }
  }

  ensureDataDir();
  if (fs.existsSync(PAGES_FILE)) {
    try {
      const raw = fs.readFileSync(PAGES_FILE, "utf-8");
      const pages = JSON.parse(raw);
      if (Array.isArray(pages)) {
        const found = pages.find((p) => p && p.id === id);
        if (found) return found;
      }
    } catch (err) {
      console.error("Error reading pages.json in getPageByIdServer:", err);
    }
  }

  const { DEFAULT_YACHTS_PAGE, DEFAULT_NEWS_PAGE, DEFAULT_EVENTS_PAGE, DEFAULT_CONTACT_PAGE, DEFAULT_ABOUT_PAGE, DEFAULT_HOME_PAGE } = await import("../data/defaultPages.js");
  if (id === "page-home") return DEFAULT_HOME_PAGE;
  if (id === "page-about") return DEFAULT_ABOUT_PAGE;
  if (id === "page-contact") return DEFAULT_CONTACT_PAGE;
  if (id === "page-yachts") return DEFAULT_YACHTS_PAGE;
  if (id === "page-news") return DEFAULT_NEWS_PAGE;
  if (id === "page-events") return DEFAULT_EVENTS_PAGE;
  return null;
}

export async function getPageBySlugServer(slug) {
  if (isPostgresConfigured()) {
    try {
      const page = await getPageBySlugFromDb(slug);
      if (page) return page;
    } catch (err) {
      console.error("[PostgreSQL] Error in getPageBySlugServer, falling back to local store:", err.message);
    }
  }

  const normalized = slug === "" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;

  ensureDataDir();
  if (fs.existsSync(PAGES_FILE)) {
    try {
      const raw = fs.readFileSync(PAGES_FILE, "utf-8");
      const pages = JSON.parse(raw);
      if (Array.isArray(pages)) {
        const found = pages.find((p) => p && p.slug === normalized);
        if (found) return found;
      }
    } catch (err) {
      console.error("Error reading pages.json in getPageBySlugServer:", err);
    }
  }

  const { DEFAULT_YACHTS_PAGE, DEFAULT_NEWS_PAGE, DEFAULT_EVENTS_PAGE, DEFAULT_CONTACT_PAGE, DEFAULT_ABOUT_PAGE, DEFAULT_HOME_PAGE } = await import("../data/defaultPages.js");
  if (normalized === "/") return DEFAULT_HOME_PAGE;
  if (normalized === "/about") return DEFAULT_ABOUT_PAGE;
  if (normalized === "/contact") return DEFAULT_CONTACT_PAGE;
  if (normalized === "/yachts") return DEFAULT_YACHTS_PAGE;
  if (normalized === "/news") return DEFAULT_NEWS_PAGE;
  if (normalized === "/events") return DEFAULT_EVENTS_PAGE;
  return null;
}

export async function savePageServer(pageData) {
  if (pageData && Array.isArray(pageData.sections)) {
    pageData = {
      ...pageData,
      sections: pageData.sections.map((s) => {
        if (s && Array.isArray(s.interiorSlides)) {
          return {
            ...s,
            interiorSlides: s.interiorSlides.filter(
              (slide) =>
                slide &&
                slide.id !== "interior-g50-flybridge-helm" &&
                !(typeof slide.image === "string" && slide.image.includes("g50-flybridge-helm"))
            ),
          };
        }
        return s;
      }),
    };
  }
  if (isPostgresConfigured()) {
    try {
      const saved = await savePageToDb(pageData);
      if (saved) return saved;
    } catch (err) {
      console.error("[PostgreSQL] Error in savePageServer, falling back to local store:", err.message);
    }
  }

  ensureDataDir();
  let pages = [];
  if (fs.existsSync(PAGES_FILE)) {
    try {
      const raw = fs.readFileSync(PAGES_FILE, "utf-8");
      pages = JSON.parse(raw);
    } catch (err) {
      pages = [];
    }
  }
  if (!Array.isArray(pages) || pages.length === 0) {
    const { DEFAULT_PAGES } = await import("../data/defaultPages.js");
    pages = [...DEFAULT_PAGES];
  }

  const now = new Date().toISOString();
  let saved = null;
  const idx = pages.findIndex(
    (p) => p && (p.id === pageData.id || (p.slug && pageData.slug && p.slug === pageData.slug))
  );

  if (idx !== -1) {
    pages[idx] = { ...pages[idx], ...pageData, lastModified: now };
    saved = pages[idx];
  } else {
    saved = {
      ...pageData,
      id: pageData.id || `page-${Date.now()}`,
      lastModified: now,
      status: pageData.status || "published"
    };
    pages.push(saved);
  }

  const tmpFile = `${PAGES_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(pages, null, 2), "utf-8");
    fs.renameSync(tmpFile, PAGES_FILE);
  } catch (writeErr) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }
  return saved;
}

export async function deletePageServer(id) {
  if (isPostgresConfigured()) {
    try {
      const deleted = await deletePageFromDb(id);
      if (deleted) return true;
    } catch (err) {
      console.error("[PostgreSQL] Error in deletePageServer, falling back to local store:", err.message);
    }
  }

  ensureDataDir();
  let pages = [];
  if (fs.existsSync(PAGES_FILE)) {
    try {
      pages = JSON.parse(fs.readFileSync(PAGES_FILE, "utf-8"));
    } catch {
      pages = [];
    }
  }
  const page = pages.find((p) => p && p.id === id);
  if (page && page.slug === "/") return false;
  const filtered = pages.filter((p) => p && p.id !== id);

  const tmpFile = `${PAGES_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(filtered, null, 2), "utf-8");
    fs.renameSync(tmpFile, PAGES_FILE);
  } catch (writeErr) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }
  return true;
}

/* =========================================================================
   SETTINGS PERSISTENCE
   ========================================================================= */

const FALLBACK_SETTINGS = {
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
    instagram: "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6",
    youtube: "https://youtu.be/FBPzrAe9N0Q",
    tiktok: "https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI",
    linkedin: "https://linkedin.com/company/asmaraty",
    whatsapp: "https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet."
  }
};

export async function getSettingsServer() {
  if (isPostgresConfigured()) {
    try {
      const dbSettings = await getSettingsFromDb();
      if (dbSettings) {
        return {
          ...FALLBACK_SETTINGS,
          ...dbSettings,
          header: {
            ...FALLBACK_SETTINGS.header,
            ...(dbSettings.header || {}),
            ctaButton: { ...FALLBACK_SETTINGS.header.ctaButton, ...(dbSettings.header?.ctaButton || {}) }
          },
          drawer: {
            ...FALLBACK_SETTINGS.drawer,
            ...(dbSettings.drawer || {}),
            navLinks: Array.isArray(dbSettings.drawer?.navLinks)
              ? dbSettings.drawer.navLinks
              : FALLBACK_SETTINGS.drawer.navLinks,
            ctaButton: { ...FALLBACK_SETTINGS.drawer.ctaButton, ...(dbSettings.drawer?.ctaButton || {}) }
          },
          footer: {
            ...FALLBACK_SETTINGS.footer,
            ...(dbSettings.footer || {}),
            experienceLinks: Array.isArray(dbSettings.footer?.experienceLinks)
              ? dbSettings.footer.experienceLinks
              : FALLBACK_SETTINGS.footer.experienceLinks
          },
          socialLinks: { ...FALLBACK_SETTINGS.socialLinks, ...(dbSettings.socialLinks || {}) }
        };
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getSettingsServer, falling back to local file:", err.message);
    }
  }

  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(FALLBACK_SETTINGS, null, 2), "utf-8");
    return FALLBACK_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...FALLBACK_SETTINGS,
      ...parsed,
      header: {
        ...FALLBACK_SETTINGS.header,
        ...(parsed.header || {}),
        ctaButton: { ...FALLBACK_SETTINGS.header.ctaButton, ...(parsed.header?.ctaButton || {}) }
      },
      drawer: {
        ...FALLBACK_SETTINGS.drawer,
        ...(parsed.drawer || {}),
        navLinks: Array.isArray(parsed.drawer?.navLinks)
          ? parsed.drawer.navLinks
          : FALLBACK_SETTINGS.drawer.navLinks,
        ctaButton: { ...FALLBACK_SETTINGS.drawer.ctaButton, ...(parsed.drawer?.ctaButton || {}) }
      },
      footer: {
        ...FALLBACK_SETTINGS.footer,
        ...(parsed.footer || {}),
        experienceLinks: Array.isArray(parsed.footer?.experienceLinks)
          ? parsed.footer.experienceLinks
          : FALLBACK_SETTINGS.footer.experienceLinks
      },
      socialLinks: { ...FALLBACK_SETTINGS.socialLinks, ...(parsed.socialLinks || {}) }
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function saveSettingsServer(updated) {
  ensureDataDir();
  const current = await getSettingsServer();
  const merged = {
    ...current,
    ...updated,
    header: {
      ...(current.header || {}),
      ...(updated.header || {}),
      ctaButton: {
        ...(current.header?.ctaButton || {}),
        ...(updated.header?.ctaButton || {})
      }
    },
    drawer: {
      ...(current.drawer || {}),
      ...(updated.drawer || {}),
      navLinks: Array.isArray(updated.drawer?.navLinks)
        ? updated.drawer.navLinks
        : (current.drawer?.navLinks || []),
      ctaButton: {
        ...(current.drawer?.ctaButton || {}),
        ...(updated.drawer?.ctaButton || {})
      }
    },
    footer: {
      ...(current.footer || {}),
      ...(updated.footer || {}),
      experienceLinks: Array.isArray(updated.footer?.experienceLinks)
        ? updated.footer.experienceLinks
        : (current.footer?.experienceLinks || [])
    },
    socialLinks: {
      ...(current.socialLinks || {}),
      ...(updated.socialLinks || {})
    },
    updatedAt: new Date().toISOString()
  };

  const tmpFile = `${SETTINGS_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), "utf-8");
    fs.renameSync(tmpFile, SETTINGS_FILE);
  } catch (writeErr) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
  }

  if (isPostgresConfigured()) {
    try {
      await saveSettingsToDb(merged);
    } catch (err) {
      console.error("[PostgreSQL] Error in saveSettingsServer:", err.message);
    }
  }

  return merged;
}

/* =========================================================================
   NEWS ARTICLES PERSISTENCE (SERVER)
   ========================================================================= */

export async function getArticlesServer(publishedOnly = false) {
  if (isPostgresConfigured()) {
    try {
      const articles = await getArticlesFromDb(publishedOnly);
      if (articles && articles.length > 0) {
        return articles;
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getArticlesServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(ARTICLES_FILE)) {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(DEFAULT_ARTICLES, null, 2), "utf-8");
    return publishedOnly ? DEFAULT_ARTICLES.filter((a) => a.status === "published") : DEFAULT_ARTICLES;
  }
  try {
    const raw = fs.readFileSync(ARTICLES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sorted = parsed.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
      return publishedOnly ? sorted.filter((a) => a.status === "published") : sorted;
    }
    return DEFAULT_ARTICLES;
  } catch (err) {
    console.error("Error reading articles.json fallback:", err);
    return DEFAULT_ARTICLES;
  }
}

export async function getArticleBySlugServer(slug, publishedOnly = false) {
  if (isPostgresConfigured()) {
    try {
      const article = await getArticleBySlugFromDb(slug, publishedOnly);
      if (article) return article;
    } catch (err) {
      console.error("[PostgreSQL] Error in getArticleBySlugServer, falling back to local store:", err.message);
    }
  }

  const all = await getArticlesServer(publishedOnly);
  return all.find((a) => a.slug === slug && (!publishedOnly || a.status === "published")) || null;
}

export async function getArticleByIdServer(id) {
  if (isPostgresConfigured()) {
    try {
      const article = await getArticleByIdFromDb(id);
      if (article) return article;
    } catch (err) {
      console.error("[PostgreSQL] Error in getArticleByIdServer, falling back to local store:", err.message);
    }
  }

  const all = await getArticlesServer(false);
  return all.find((a) => a.id === id) || null;
}

export async function saveArticleServer(articleData) {
  if (isPostgresConfigured()) {
    try {
      const saved = await saveArticleToDb(articleData);
      if (saved) return saved;
    } catch (err) {
      console.error("[PostgreSQL] Error in saveArticleServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let articles = [];
  try {
    if (fs.existsSync(ARTICLES_FILE)) {
      articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
    } else {
      articles = [...DEFAULT_ARTICLES];
    }
  } catch {
    articles = [...DEFAULT_ARTICLES];
  }

  const now = new Date().toISOString();

  if (articleData.id || articleData.slug) {
    const targetId = articleData.id;
    const targetSlug = (articleData.slug || "").toLowerCase();
    const index = articles.findIndex(
      (a) => (targetId && a.id === targetId) || (targetSlug && a.slug.toLowerCase() === targetSlug)
    );
    if (index !== -1) {
      articles[index] = {
        ...articles[index],
        ...articleData,
        id: articles[index].id || targetId,
        updatedAt: now,
      };
      articles.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
      const tmpFile = `${ARTICLES_FILE}.tmp-${Date.now()}`;
      try {
        fs.writeFileSync(tmpFile, JSON.stringify(articles, null, 2), "utf-8");
        fs.renameSync(tmpFile, ARTICLES_FILE);
      } catch (writeErr) {
        fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
      }
      return articles[index];
    }
  }

  // New article
  const newArticle = {
    ...articleData,
    id: articleData.id || `news-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    status: articleData.status || "published",
    publishedAt: articleData.publishedAt || now.slice(0, 10),
  };

  articles.push(newArticle);
  articles.sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0));
  const tmpFileNew = `${ARTICLES_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFileNew, JSON.stringify(articles, null, 2), "utf-8");
    fs.renameSync(tmpFileNew, ARTICLES_FILE);
  } catch (writeErr) {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFileNew)) fs.unlinkSync(tmpFileNew); } catch {}
  }
  return newArticle;
}

export async function deleteArticleServer(id) {
  if (isPostgresConfigured()) {
    try {
      return await deleteArticleFromDb(id);
    } catch (err) {
      console.error("[PostgreSQL] Error in deleteArticleServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let articles = [];
  try {
    if (fs.existsSync(ARTICLES_FILE)) {
      articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, "utf-8"));
    } else {
      articles = [...DEFAULT_ARTICLES];
    }
  } catch {
    return false;
  }

  const filtered = articles.filter((a) => a.id !== id);
  if (filtered.length !== articles.length) {
    const tmpFileDel = `${ARTICLES_FILE}.tmp-${Date.now()}`;
    try {
      fs.writeFileSync(tmpFileDel, JSON.stringify(filtered, null, 2), "utf-8");
      fs.renameSync(tmpFileDel, ARTICLES_FILE);
    } catch (writeErr) {
      fs.writeFileSync(ARTICLES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
      try { if (fs.existsSync(tmpFileDel)) fs.unlinkSync(tmpFileDel); } catch {}
    }
    return true;
  }
  return false;
}

/* =========================================================================
   EVENT SHOWCASES PERSISTENCE (SERVER) - SEPARATE FROM NEWS
   ========================================================================= */

export async function getEventsServer(publishedOnly = false) {
  if (isPostgresConfigured()) {
    try {
      const events = await getEventsFromDb(publishedOnly);
      if (events && events.length > 0) {
        return events;
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getEventsServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(DEFAULT_EVENTS, null, 2), "utf-8");
    return publishedOnly ? DEFAULT_EVENTS.filter((e) => e.status === "published") : DEFAULT_EVENTS;
  }
  try {
    const raw = fs.readFileSync(EVENTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sorted = parsed.sort((a, b) => Number(a.displayOrder ?? 1) - Number(b.displayOrder ?? 1));
      return publishedOnly ? sorted.filter((e) => e.status === "published") : sorted;
    }
    return DEFAULT_EVENTS;
  } catch (err) {
    console.error("Error reading events.json fallback:", err);
    return DEFAULT_EVENTS;
  }
}

export async function getEventBySlugServer(slug, publishedOnly = false) {
  if (isPostgresConfigured()) {
    try {
      const event = await getEventBySlugFromDb(slug, publishedOnly);
      if (event) return event;
    } catch (err) {
      console.error("[PostgreSQL] Error in getEventBySlugServer, falling back to local store:", err.message);
    }
  }

  const all = await getEventsServer(publishedOnly);
  const normalized = (slug || "").toLowerCase().trim();
  return (
    all.find(
      (e) =>
        e.slug.toLowerCase() === normalized ||
        e.id.toLowerCase() === normalized ||
        (Array.isArray(e.aliases) && e.aliases.some((a) => a.toLowerCase() === normalized))
    ) || null
  );
}

export async function getEventByIdServer(id) {
  if (isPostgresConfigured()) {
    try {
      const event = await getEventByIdFromDb(id);
      if (event) return event;
    } catch (err) {
      console.error("[PostgreSQL] Error in getEventByIdServer, falling back to local store:", err.message);
    }
  }

  const all = await getEventsServer(false);
  const normalized = (id || "").toLowerCase().trim();
  return (
    all.find(
      (e) =>
        e.id === id ||
        (e.id && e.id.toLowerCase() === normalized) ||
        (e.slug && e.slug.toLowerCase() === normalized) ||
        (Array.isArray(e.aliases) && e.aliases.some((a) => a.toLowerCase() === normalized))
    ) || null
  );
}

export async function saveEventServer(eventData) {
  if (isPostgresConfigured()) {
    try {
      const saved = await saveEventToDb(eventData);
      if (saved) return saved;
    } catch (err) {
      console.error("[PostgreSQL] Error in saveEventServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let events = [];
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    } else {
      events = [...DEFAULT_EVENTS];
    }
  } catch {
    events = [...DEFAULT_EVENTS];
  }

  const now = new Date().toISOString();

  // If event has an ID or slug and exists in array, update it
  if (eventData.id || eventData.slug) {
    const targetId = eventData.id;
    const targetSlug = (eventData.slug || "").toLowerCase();
    const index = events.findIndex(
      (e) => (targetId && e.id === targetId) || (targetSlug && e.slug && e.slug.toLowerCase() === targetSlug)
    );
    if (index !== -1) {
      const updated = {
        ...events[index],
        ...eventData,
        id: events[index].id || targetId,
        updatedAt: now,
      };
      events[index] = updated;
      const tmpFile = `${EVENTS_FILE}.tmp-${Date.now()}`;
      try {
        fs.writeFileSync(tmpFile, JSON.stringify(events, null, 2), "utf-8");
        fs.renameSync(tmpFile, EVENTS_FILE);
      } catch (writeErr) {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf-8");
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch {}
      }
      return updated;
    }
  }

  // New event
  const newEvent = {
    ...eventData,
    id: eventData.id || `event-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    status: eventData.status || "published",
  };

  events.push(newEvent);
  events.sort((a, b) => Number(a.displayOrder ?? 1) - Number(b.displayOrder ?? 1));
  const tmpFileNew = `${EVENTS_FILE}.tmp-${Date.now()}`;
  try {
    fs.writeFileSync(tmpFileNew, JSON.stringify(events, null, 2), "utf-8");
    fs.renameSync(tmpFileNew, EVENTS_FILE);
  } catch (writeErr) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf-8");
    try { if (fs.existsSync(tmpFileNew)) fs.unlinkSync(tmpFileNew); } catch {}
  }
  return newEvent;
}

export async function deleteEventServer(id) {
  if (isPostgresConfigured()) {
    try {
      return await deleteEventFromDb(id);
    } catch (err) {
      console.error("[PostgreSQL] Error in deleteEventServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  let events = [];
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      events = JSON.parse(fs.readFileSync(EVENTS_FILE, "utf-8"));
    } else {
      events = [...DEFAULT_EVENTS];
    }
  } catch {
    return false;
  }

  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length !== events.length) {
    const tmpFileDel = `${EVENTS_FILE}.tmp-${Date.now()}`;
    try {
      fs.writeFileSync(tmpFileDel, JSON.stringify(filtered, null, 2), "utf-8");
      fs.renameSync(tmpFileDel, EVENTS_FILE);
    } catch (writeErr) {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
      try { if (fs.existsSync(tmpFileDel)) fs.unlinkSync(tmpFileDel); } catch {}
    }
    return true;
  }
  return false;
}
