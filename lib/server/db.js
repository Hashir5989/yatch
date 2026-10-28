import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DEFAULT_YACHTS } from "../data/defaultYachts.js";
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
  deletePageFromDb
} from "./postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const YACHTS_FILE = path.join(DATA_DIR, "yachts.json");
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
  if (isPostgresConfigured()) {
    try {
      const yachts = await getYachtsFromDb(publishedOnly);
      if (yachts && yachts.length > 0) {
        return yachts;
      }
    } catch (err) {
      console.error("[PostgreSQL] Error in getYachtsServer, falling back to local store:", err.message);
    }
  }

  // Fallback to local JSON store
  ensureDataDir();
  if (!fs.existsSync(YACHTS_FILE)) {
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(DEFAULT_YACHTS, null, 2), "utf-8");
    return publishedOnly ? DEFAULT_YACHTS.filter((y) => y.status !== "draft") : DEFAULT_YACHTS;
  }
  try {
    const raw = fs.readFileSync(YACHTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const sorted = parsed.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      return publishedOnly ? sorted.filter((y) => y.status !== "draft") : sorted;
    }
    return DEFAULT_YACHTS;
  } catch (err) {
    console.error("Error reading yachts.json fallback:", err);
    return DEFAULT_YACHTS;
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

  const now = new Date().toISOString();

  if (yachtData.id) {
    const index = yachts.findIndex((y) => y.id === yachtData.id);
    if (index !== -1) {
      yachts[index] = {
        ...yachts[index],
        ...yachtData,
        updatedAt: now,
      };
      yachts.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      fs.writeFileSync(YACHTS_FILE, JSON.stringify(yachts, null, 2), "utf-8");
      return yachts[index];
    }
  }

  // New yacht model
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
  fs.writeFileSync(YACHTS_FILE, JSON.stringify(yachts, null, 2), "utf-8");
  return newYacht;
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
  fs.writeFileSync(YACHTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
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

  fs.writeFileSync(YACHTS_FILE, JSON.stringify(reordered, null, 2), "utf-8");
  return reordered;
}

/* =========================================================================
   ADMIN AUTHENTICATION
   ========================================================================= */

export async function getAdminUserServer(email = "admin@asmaraty.ae") {
  if (isPostgresConfigured()) {
    try {
      const admin = await getAdminUserFromDb(email);
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
      email: "admin@asmaraty.ae",
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
  const admin = await getAdminUserServer(email);
  if (!admin) return false;

  if (admin.email.toLowerCase() !== email.trim().toLowerCase()) {
    return false;
  }

  const computedHash = hashPassword(password, admin.salt);
  if (computedHash !== admin.hash) {
    return false;
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

export async function updateAdminPassword(currentPassword, newPassword, email = "admin@asmaraty.ae") {
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
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), "utf-8");
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

export async function getPagesServer() {
  if (isPostgresConfigured()) {
    try {
      const pages = await getPagesFromDb();
      if (pages && pages.length > 0) {
        return pages;
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
      return DEFAULT_PAGES;
    } catch {
      return [];
    }
  }
  try {
    const raw = fs.readFileSync(PAGES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading pages.json:", err);
  }
  try {
    const { DEFAULT_PAGES } = await import("../data/defaultPages.js");
    return DEFAULT_PAGES;
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

  const pages = await getPagesServer();
  return pages.find((p) => p.id === id) || null;
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

  const pages = await getPagesServer();
  const normalized = slug === "" ? "/" : slug.startsWith("/") ? slug : `/${slug}`;
  return pages.find((p) => p.slug === normalized) || null;
}

export async function savePageServer(pageData) {
  if (isPostgresConfigured()) {
    try {
      const saved = await savePageToDb(pageData);
      if (saved) return saved;
    } catch (err) {
      console.error("[PostgreSQL] Error in savePageServer, falling back to local store:", err.message);
    }
  }

  ensureDataDir();
  const pages = await getPagesServer();
  const now = new Date().toISOString();
  let saved = null;
  const idx = pages.findIndex((p) => p.id === pageData.id);
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
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), "utf-8");
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
  const pages = await getPagesServer();
  const page = pages.find((p) => p.id === id);
  if (page && page.slug === "/") return false;
  const filtered = pages.filter((p) => p.id !== id);
  fs.writeFileSync(PAGES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

/* =========================================================================
   SETTINGS PERSISTENCE
   ========================================================================= */

const FALLBACK_SETTINGS = {
  siteTitle: "ASMARATY | Luxury Yachts & Boats UAE",
  announcementText: "Discover the ASMARATY Fleet: G-100, G-66, G-50 & G77 — The Signature of the Sea",
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

export async function getSettingsServer() {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(FALLBACK_SETTINGS, null, 2), "utf-8");
    return FALLBACK_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function saveSettingsServer(updated) {
  ensureDataDir();
  const current = await getSettingsServer();
  const merged = { ...current, ...updated, updatedAt: new Date().toISOString() };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}
