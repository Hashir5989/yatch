import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Storage configuration resolved from environment variables.
 *
 * Environments:
 * - Local development: project_root/.uploads
 * - AWS demo / Hostinger VPS: /var/media/asmaraty/uploads (or MEDIA_STORAGE_PATH)
 */
export function getStorageConfig() {
  const driver = process.env.MEDIA_STORAGE_DRIVER || "local";
  
  let basePath = process.env.MEDIA_STORAGE_PATH;
  if (!basePath) {
    // Default for local development is project-root/.uploads
    basePath = path.join(process.cwd(), ".uploads");
  }

  return {
    driver,
    basePath: path.resolve(basePath),
  };
}

/**
 * Ensures a directory exists synchronously with recursive creation.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Validates subfolder name against path traversal.
 */
function sanitizeSubfolder(folder) {
  const allowed = new Set(["uploads", "news", "events", "yachts"]);
  const clean = (folder || "uploads").toLowerCase().trim();
  return allowed.has(clean) ? clean : "uploads";
}

/**
 * Validates and sanitizes a file name for secure storage.
 */
function sanitizeFileName(originalName, ext) {
  const base = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
  
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const timestamp = Date.now();
  const cleanExt = (ext || ".jpg").toLowerCase().replace(/[^a-z0-9.]/g, "");
  return `${base || "upload"}-${timestamp}-${randomSuffix}${cleanExt}`;
}

/**
 * Saves a file buffer atomically to persistent media storage.
 *
 * Returns metadata:
 * - relativeUrl: Public serving URL (e.g., /images/uploads/filename.ext)
 * - storageKey: Relative storage key (e.g., uploads/filename.ext)
 * - absolutePath: Full disk path where file was saved
 * - fileName: Securely generated file name
 * - size: Byte size
 */
export async function saveMediaFile({ buffer, originalName, subfolder = "uploads", mimeType = "image/jpeg" }) {
  const config = getStorageConfig();

  if (config.driver !== "local") {
    throw new Error(`Storage driver '${config.driver}' is not implemented yet. Supported drivers: local`);
  }

  const safeFolder = sanitizeSubfolder(subfolder);
  const ext = path.extname(originalName || "") || (mimeType.includes("png") ? ".png" : mimeType.includes("webp") ? ".webp" : ".jpg");
  const fileName = sanitizeFileName(originalName || "image", ext);

  const targetDir = path.join(config.basePath, safeFolder);
  ensureDir(targetDir);

  const finalPath = path.join(targetDir, fileName);

  // Security check: ensure finalPath is strictly inside targetDir (path traversal protection)
  const resolved = path.resolve(finalPath);
  if (!resolved.startsWith(config.basePath)) {
    throw new Error("Invalid target path: directory traversal detected.");
  }

  // Atomic write: write to temp file first, then rename
  const tempPath = path.join(targetDir, `.tmp-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`);
  try {
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, finalPath);
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    throw new Error(`Failed to write media file: ${err.message}`);
  }

  const storageKey = path.posix.join(safeFolder, fileName);
  const relativeUrl = `/images/${safeFolder}/${fileName}`;

  return {
    success: true,
    fileName,
    storageKey,
    relativeUrl,
    absolutePath: finalPath,
    size: buffer.length,
  };
}

/**
 * Locates an image file across persistent storage, legacy public directories, and fallbacks.
 * Prevents directory traversal attacks.
 *
 * Returns absolute path if found, or null.
 */
export function resolveMediaFile(relativeSlugParts) {
  if (!Array.isArray(relativeSlugParts) || relativeSlugParts.length === 0) {
    return null;
  }

  // Sanitize path against directory traversal
  const safeParts = relativeSlugParts.map((p) => path.basename(decodeURIComponent(p)));
  const relativePath = path.join(...safeParts);

  const config = getStorageConfig();

  // Search order:
  // 1. Configured persistent storage directory (outside Git)
  // 2. Local fallback .uploads directory (outside Git)
  // 3. Legacy public/images folder (in Git)
  // 4. Legacy user_uploads folder
  // 5. Legacy data/uploads folder
  const searchDirs = [
    config.basePath,
    path.join(process.cwd(), ".uploads"),
    path.join(process.cwd(), "public", "images"),
    path.join(process.cwd(), "user_uploads"),
    path.join(process.cwd(), "data", "uploads"),
  ];

  for (const baseDir of searchDirs) {
    if (!baseDir || !fs.existsSync(baseDir)) continue;

    const candidate = path.join(baseDir, relativePath);
    const resolved = path.resolve(candidate);

    // Guard against path traversal
    if (!resolved.startsWith(path.resolve(baseDir))) continue;

    if (fs.existsSync(resolved)) {
      try {
        if (fs.statSync(resolved).isFile()) {
          return resolved;
        }
      } catch (_) {}
    }
  }

  return null;
}

/**
 * Safely deletes a file from persistent storage only after confirmation.
 */
export async function deleteMediaFileByUrl(url) {
  if (!url || typeof url !== "string") return false;

  // Clean query params or hash
  const cleanUrl = url.split("?")[0].split("#")[0];

  // Only delete files in /images/uploads/ or /images/news/ etc.
  if (!cleanUrl.startsWith("/images/")) {
    return false; // Do not touch external or special URLs
  }

  const relativeParts = cleanUrl.replace(/^\/images\//, "").split("/");
  const resolved = resolveMediaFile(relativeParts);

  if (!resolved) {
    return false; // File doesn't exist on disk
  }

  // Security guard: never delete core brand assets in /public/images/yachts or brand icons
  const normalized = resolved.replace(/\\/g, "/");
  if (normalized.includes("/public/images/yachts/") || normalized.includes("/public/documents/")) {
    return false;
  }

  try {
    fs.unlinkSync(resolved);
    return true;
  } catch (err) {
    console.warn(`[storage] Could not delete physical file ${resolved}:`, err.message);
    return false;
  }
}

