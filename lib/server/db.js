import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DEFAULT_YACHTS } from "../data/defaultYachts";

const DATA_DIR = path.join(process.cwd(), "data");
const YACHTS_FILE = path.join(DATA_DIR, "yachts.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");

// Secret key for signing session tokens (fallback to secure random if env not set)
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "asmaraty_super_secret_jwt_hmac_key_2026";

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

/* ==================== YACHTS PERSISTENCE ==================== */

export function getYachtsServer() {
  ensureDataDir();
  if (!fs.existsSync(YACHTS_FILE)) {
    // Initialize with default 4 models
    fs.writeFileSync(YACHTS_FILE, JSON.stringify(DEFAULT_YACHTS, null, 2), "utf-8");
    return DEFAULT_YACHTS;
  }
  try {
    const raw = fs.readFileSync(YACHTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
    return DEFAULT_YACHTS;
  } catch (err) {
    console.error("Error reading yachts.json:", err);
    return DEFAULT_YACHTS;
  }
}

export function saveYachtServer(yachtData) {
  ensureDataDir();
  const yachts = getYachtsServer();
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

export function deleteYachtServer(id) {
  ensureDataDir();
  const yachts = getYachtsServer();
  const filtered = yachts.filter((y) => y.id !== id);
  // Re-assign displayOrder sequence
  filtered.forEach((y, idx) => {
    y.displayOrder = idx + 1;
  });
  fs.writeFileSync(YACHTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export function reorderYachtsServer(orderedIds) {
  ensureDataDir();
  const yachts = getYachtsServer();
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
  
  // Append any remaining yachts that were not explicitly in orderedIds
  yachtMap.forEach((y) => {
    y.displayOrder = reordered.length + 1;
    reordered.push(y);
  });
  
  fs.writeFileSync(YACHTS_FILE, JSON.stringify(reordered, null, 2), "utf-8");
  return reordered;
}

/* ==================== ADMIN AUTHENTICATION ==================== */

export function getAdminUserServer() {
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

export function verifyAdminCredentials(email, password) {
  const admin = getAdminUserServer();
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

export function updateAdminPassword(currentPassword, newPassword) {
  const admin = getAdminUserServer();
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

  const updatedAdmin = {
    ...admin,
    salt: newSalt,
    hash: newHash,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ADMIN_FILE, JSON.stringify(updatedAdmin, null, 2), "utf-8");
  return { success: true };
}

/* ==================== SESSION TOKEN GENERATION ==================== */

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
  } catch (err) {
    return null;
  }
}

/* ==================== ENQUIRIES PERSISTENCE ==================== */

export function saveEnquiryServer(enquiry) {
  ensureDataDir();
  let enquiries = [];
  if (fs.existsSync(ENQUIRIES_FILE)) {
    try {
      enquiries = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, "utf-8"));
    } catch (e) {
      enquiries = [];
    }
  }

  const newEnquiry = {
    ...enquiry,
    id: `enq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  enquiries.unshift(newEnquiry);
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), "utf-8");
  return newEnquiry;
}

export function getEnquiriesServer() {
  ensureDataDir();
  if (!fs.existsSync(ENQUIRIES_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ENQUIRIES_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}
