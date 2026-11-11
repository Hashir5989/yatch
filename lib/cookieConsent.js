"use client";

export const COOKIE_CONSENT_STORAGE_KEY = "asm_cookie_consent_v1";
export const COOKIE_CONSENT_COOKIE_NAME = "asm_cookie_consent";
export const COOKIE_CONSENT_EVENT = "asm-cookie-consent-change";
export const COOKIE_OPEN_PREFERENCES_EVENT = "asm-open-cookie-settings";
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_MAX_AGE_DAYS = 365;
export const COOKIE_CONSENT_MAX_AGE_MS = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export const VALID_CONSENT_STATUSES = ["accepted_all", "essential_only", "custom"];

export const DEFAULT_COOKIE_CATEGORIES = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export const ANALYTICS_COOKIE_EXACT_NAMES = ["_ga", "_gid", "_gat"];
export const ANALYTICS_COOKIE_PREFIXES = ["_ga_", "_gat_"];
export const MARKETING_COOKIE_EXACT_NAMES = ["_fbp", "_fbc"];

export const COOKIE_CATEGORY_DEFINITIONS = [
  {
    key: "essential",
    label: "Essential Cookies",
    badge: "Always Active",
    locked: true,
    description:
      "Required for core website navigation, security, session integrity, and saving your privacy preferences. These cookies cannot be disabled.",
  },
  {
    key: "functional",
    label: "Functional Cookies",
    badge: "Optional",
    locked: false,
    description:
      "Enable enhanced yacht browsing preferences, concierge convenience features, and remembered interface choices across visits.",
  },
  {
    key: "analytics",
    label: "Analytics Cookies",
    badge: "Optional",
    locked: false,
    description:
      "Help us understand visitor engagement, popular fleet models, and page performance so we can refine the digital shipyard experience.",
  },
  {
    key: "marketing",
    label: "Marketing Cookies",
    badge: "Optional",
    locked: false,
    description:
      "Allow us to measure promotional campaigns and tailor ASMARATY exhibition invitations and showcase updates.",
  },
];

const isBrowser = () => typeof window !== "undefined";

/**
 * Normalizes a partial category object so essential is always enabled
 * and optional categories are strictly booleans.
 */
export function normalizeConsentCategories(categories = {}) {
  return {
    essential: true,
    functional: Boolean(categories.functional),
    analytics: Boolean(categories.analytics),
    marketing: Boolean(categories.marketing),
  };
}

/**
 * Derives overall consent status string from selected optional categories.
 */
export function deriveConsentStatus(categories) {
  const normalized = normalizeConsentCategories(categories);
  const optionalValues = [normalized.functional, normalized.analytics, normalized.marketing];
  if (optionalValues.every(Boolean)) return "accepted_all";
  if (optionalValues.every((v) => !v)) return "essential_only";
  return "custom";
}

const MULTI_LABEL_PUBLIC_SUFFIXES = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.in",
  "net.in",
  "org.in",
  "co.nz",
  "co.jp",
  "ne.jp",
  "com.br",
  "com.sg",
  "co.za",
  "com.ae",
  "net.ae",
  "gov.ae",
]);

const CC_SECOND_LEVEL_PUBLIC_PREFIXES = new Set([
  "co",
  "com",
  "org",
  "net",
  "gov",
  "edu",
  "ac",
  "ne",
]);

/**
 * Checks whether a normalized domain string is a single-label TLD or known
 * two-label public suffix (explicit set or 2-letter ccTLD + common 2nd-level prefix).
 */
export function isPublicSuffix(domain) {
  if (!domain || typeof domain !== "string") return true;
  const clean = domain.replace(/^\.+/, "").trim().toLowerCase();
  const labels = clean.split(".").filter(Boolean);
  if (labels.length < 2) return true;
  if (labels.length === 2) {
    const twoLabel = `${labels[0]}.${labels[1]}`;
    if (MULTI_LABEL_PUBLIC_SUFFIXES.has(twoLabel)) return true;
    if (/^[a-z]{2}$/.test(labels[1]) && CC_SECOND_LEVEL_PUBLIC_PREFIXES.has(labels[0])) {
      return true;
    }
  }
  return false;
}

/**
 * Computes host-only (`null`) plus applicable domain and parent-domain variants safely.
 * Stops at the registrable domain and never returns single-label or multi-label public suffixes.
 */
export function getCookieDomainVariants(hostname) {
  const variants = [null];
  if (!hostname || typeof hostname !== "string") return variants;

  const cleanHost = hostname.trim().toLowerCase().replace(/:\d+$/, "");
  if (!cleanHost || cleanHost === "localhost" || /^[0-9.]+$/.test(cleanHost) || cleanHost.includes(":")) {
    return variants;
  }

  const parts = cleanHost.split(".").filter(Boolean);
  if (parts.length < 2) {
    return variants;
  }

  const tailTwo = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  const minDomainLabels = isPublicSuffix(tailTwo) ? 3 : 2;
  const maxStartIndex = parts.length - minDomainLabels;

  for (let i = 0; i <= maxStartIndex; i += 1) {
    const domain = parts.slice(i).join(".");
    if (isPublicSuffix(domain)) continue;
    if (!variants.includes(domain)) variants.push(domain);
    const dotted = `.${domain}`;
    if (!variants.includes(dotted)) variants.push(dotted);
  }

  return variants;
}

function expireCookieEverywhere(cookieName) {
  if (!isBrowser() || typeof document === "undefined" || !cookieName) return;
  const hostname = window.location?.hostname || "";
  const isHttps = window.location?.protocol === "https:";
  const domains = getCookieDomainVariants(hostname);
  const paths = ["/"];
  const base = `${cookieName}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`;

  for (const pathVal of paths) {
    for (const domain of domains) {
      const domainAttr = domain ? `; Domain=${domain}` : "";
      document.cookie = `${base}; Path=${pathVal}${domainAttr}`;
      if (isHttps) {
        document.cookie = `${base}; Path=${pathVal}${domainAttr}; Secure`;
      }
    }
  }
}

/**
 * Strictly validates a consent JSON string or parsed object.
 * Rejects outdated versions, invalid statuses, non-boolean categories, and records > 365 days old.
 */
export function parseAndValidateConsent(rawOrObject, nowMs = Date.now()) {
  if (!rawOrObject) return null;

  let parsed = rawOrObject;
  if (typeof rawOrObject === "string") {
    try {
      parsed = JSON.parse(rawOrObject);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  if (Number(parsed.version) !== COOKIE_CONSENT_VERSION) {
    return null;
  }

  if (typeof parsed.status !== "string" || !VALID_CONSENT_STATUSES.includes(parsed.status)) {
    return null;
  }

  if (typeof parsed.updatedAt !== "string" || !parsed.updatedAt.trim()) {
    return null;
  }

  const updatedTimestamp = Date.parse(parsed.updatedAt);
  if (!Number.isFinite(updatedTimestamp)) {
    return null;
  }

  // Reject records older than 365 days
  if (nowMs - updatedTimestamp > COOKIE_CONSENT_MAX_AGE_MS) {
    return null;
  }

  const rawCategories = parsed.categories;
  if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) {
    return null;
  }

  if (
    (rawCategories.essential !== undefined && typeof rawCategories.essential !== "boolean") ||
    typeof rawCategories.functional !== "boolean" ||
    typeof rawCategories.analytics !== "boolean" ||
    typeof rawCategories.marketing !== "boolean"
  ) {
    return null;
  }

  return {
    version: COOKIE_CONSENT_VERSION,
    status: parsed.status,
    categories: {
      essential: true,
      functional: rawCategories.functional,
      analytics: rawCategories.analytics,
      marketing: rawCategories.marketing,
    },
    updatedAt: parsed.updatedAt,
  };
}

/**
 * Clears stored consent records from both localStorage and the consent cookie.
 */
export function clearStoredConsent() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear cookie consent from localStorage:", err);
  }
  expireCookieEverywhere(COOKIE_CONSENT_COOKIE_NAME);
}

/**
 * Safely expires known tracking cookies and notifies any loaded tracking SDKs
 * when optional analytics or marketing consent is disabled or withdrawn.
 * Never deletes essential or unrelated cookies and never loads new SDKs.
 */
export function revokeOptionalCookies(categoriesInput = {}) {
  if (!isBrowser() || typeof document === "undefined") return;
  const normalized = normalizeConsentCategories(categoriesInput);

  // Collect matching tracking cookies currently present
  const existingCookieNames = [];
  try {
    const rawCookie = document.cookie || "";
    if (rawCookie) {
      for (const pair of rawCookie.split(";")) {
        const eqIdx = pair.indexOf("=");
        const name = (eqIdx !== -1 ? pair.slice(0, eqIdx) : pair).trim();
        if (name) existingCookieNames.push(name);
      }
    }
  } catch {}

  if (!normalized.analytics) {
    const analyticsCookiesToExpire = new Set(ANALYTICS_COOKIE_EXACT_NAMES);
    const gaMeasurementIds = [];

    for (const name of existingCookieNames) {
      if (ANALYTICS_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) {
        analyticsCookiesToExpire.add(name);
      }
      if (name.startsWith("_ga_")) {
        const suffix = name.slice(4);
        if (suffix) gaMeasurementIds.push(`G-${suffix}`);
      }
    }

    analyticsCookiesToExpire.forEach((cookieName) => expireCookieEverywhere(cookieName));

    // Toggle Google Analytics disable flags if any GA cookies or prior flags exist
    try {
      for (const gaId of gaMeasurementIds) {
        window[`ga-disable-${gaId}`] = true;
      }
      for (const key of Object.keys(window)) {
        if (key.startsWith("ga-disable-")) {
          window[key] = true;
        }
      }
    } catch {}
  } else {
    // Restore any existing ga-disable flags if analytics is explicitly enabled
    try {
      for (const key of Object.keys(window)) {
        if (key.startsWith("ga-disable-")) {
          window[key] = false;
        }
      }
    } catch {}
  }

  if (!normalized.marketing) {
    MARKETING_COOKIE_EXACT_NAMES.forEach((cookieName) => expireCookieEverywhere(cookieName));
  }

  // Safely notify already-loaded tracking SDKs (do not introduce any if absent)
  try {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: normalized.analytics ? "granted" : "denied",
        ad_storage: normalized.marketing ? "granted" : "denied",
        ad_user_data: normalized.marketing ? "granted" : "denied",
        ad_personalization: normalized.marketing ? "granted" : "denied",
        functionality_storage: normalized.functional ? "granted" : "denied",
      });
    }
  } catch {}

  try {
    if (typeof window.fbq === "function") {
      window.fbq("consent", normalized.marketing ? "grant" : "revoke");
    }
  } catch {}
}

function readRawConsentCookie() {
  if (!isBrowser() || typeof document === "undefined") return null;
  try {
    const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
    const parts = document.cookie ? document.cookie.split(";") : [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
  } catch {
    return null;
  }
  return null;
}

function writeConsentCookie(record) {
  if (!isBrowser() || typeof document === "undefined") return;
  try {
    const maxAgeSeconds = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
    const isHttps = window.location?.protocol === "https:";
    const encoded = encodeURIComponent(JSON.stringify(record));
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${isHttps ? "; Secure" : ""}`;
  } catch (err) {
    console.warn("Could not write cookie consent cookie:", err);
  }
}

/**
 * Reads saved visitor consent preferences from localStorage (or valid cookie fallback).
 * Clears invalid/outdated records and returns null when re-consent is required.
 */
export function getStoredConsent() {
  if (!isBrowser()) return null;

  let rawLocal = null;
  try {
    rawLocal = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch (err) {
    console.warn("Could not read cookie consent from localStorage:", err);
  }

  if (rawLocal !== null) {
    const validatedLocal = parseAndValidateConsent(rawLocal);
    if (validatedLocal) {
      return validatedLocal;
    }
    // Invalid or outdated localStorage record: clear it and check whether a valid current cookie exists
    try {
      window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    } catch {}
  }

  const rawCookie = readRawConsentCookie();
  if (rawCookie !== null) {
    const validatedCookie = parseAndValidateConsent(rawCookie);
    if (validatedCookie) {
      // Only restore if localStorage was absent (do not overwrite cleared invalid localStorage with outdated cookie; outdated already returned null above)
      if (rawLocal === null) {
        try {
          window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(validatedCookie));
        } catch {}
        return validatedCookie;
      }
    }
    // Cookie is invalid or outdated (or paired with invalid localStorage) -> clear both
    clearStoredConsent();
    return null;
  }

  return null;
}

/**
 * Persists visitor cookie preferences to both localStorage and HTTP cookie,
 * revokes disabled optional cookies/SDK consent, and dispatches update event.
 */
export function saveConsentPreferences(categoriesInput, statusOverride = null) {
  const categories = normalizeConsentCategories(categoriesInput);
  const derivedStatus = deriveConsentStatus(categories);
  const status =
    typeof statusOverride === "string" && VALID_CONSENT_STATUSES.includes(statusOverride)
      ? statusOverride
      : derivedStatus;

  const record = {
    version: COOKIE_CONSENT_VERSION,
    status,
    categories,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch (err) {
      console.warn("Could not save cookie consent to localStorage:", err);
    }

    writeConsentCookie(record);
    revokeOptionalCookies(categories);

    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, {
        detail: record,
      })
    );
  }

  return record;
}

/**
 * Checks whether consent has been granted for a specific category.
 * Optional categories always return false until explicitly consented.
 */
export function hasConsentFor(category) {
  if (category === "essential") return true;
  const stored = getStoredConsent();
  if (!stored || !stored.categories) return false;
  return Boolean(stored.categories[category]);
}

/**
 * Dispatches an event asking CookieConsentManager to open the Cookie Preferences modal.
 */
export function openCookiePreferences() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(COOKIE_OPEN_PREFERENCES_EVENT));
}
