"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Sliders, X, Lock, Check } from "lucide-react";
import {
  COOKIE_CATEGORY_DEFINITIONS,
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_OPEN_PREFERENCES_EVENT,
  DEFAULT_COOKIE_CATEGORIES,
  getStoredConsent,
  revokeOptionalCookies,
  saveConsentPreferences,
} from "@/lib/cookieConsent";

const STATUS_LABELS = {
  accepted_all: "All Cookies Accepted",
  essential_only: "Essential Cookies Only",
  custom: "Custom Preferences Saved",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export default function CookieConsentManager() {
  const pathname = usePathname();
  const isAdminRoute = Boolean(pathname && pathname.startsWith("/admin"));

  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftCategories, setDraftCategories] = useState(DEFAULT_COOKIE_CATEGORIES);

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  const openPreferencesModal = useCallback(() => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }
    const latest = getStoredConsent();
    setDraftCategories(latest ? { ...latest.categories } : { ...DEFAULT_COOKIE_CATEGORIES });
    setIsModalOpen(true);
  }, []);

  const closePreferencesModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    setMounted(true);

    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored);
      setDraftCategories(stored.categories);
      setShowBanner(false);
      // Enforce revocation of disabled optional cookies/SDKs on subsequent visits too
      revokeOptionalCookies(stored.categories);
    } else {
      setConsent(null);
      setDraftCategories({ ...DEFAULT_COOKIE_CATEGORIES });
      setShowBanner(true);
    }

    const handleOpenPreferences = () => {
      openPreferencesModal();
    };

    const handleConsentChange = (event) => {
      const next = event?.detail || getStoredConsent();
      if (next) {
        setConsent(next);
        setDraftCategories({ ...next.categories });
        setShowBanner(false);
      } else {
        setConsent(null);
        setDraftCategories({ ...DEFAULT_COOKIE_CATEGORIES });
        setShowBanner(true);
      }
    };

    const handleStorageSync = (event) => {
      if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
        const synced = getStoredConsent();
        if (synced) {
          setConsent(synced);
          setDraftCategories({ ...synced.categories });
          setShowBanner(false);
          revokeOptionalCookies(synced.categories);
        } else {
          setConsent(null);
          setDraftCategories({ ...DEFAULT_COOKIE_CATEGORIES });
          setShowBanner(true);
        }
      }
    };

    window.addEventListener(COOKIE_OPEN_PREFERENCES_EVENT, handleOpenPreferences);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    window.addEventListener("storage", handleStorageSync);

    return () => {
      window.removeEventListener(COOKIE_OPEN_PREFERENCES_EVENT, handleOpenPreferences);
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, [openPreferencesModal]);

  // Modal accessibility: focus entry, Tab/Shift+Tab trapping, Escape close, body scroll lock, focus restoration
  useEffect(() => {
    if (!isModalOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const rafId = window.requestAnimationFrame(() => {
      const container = modalRef.current;
      if (!container) return;
      const focusables = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length > 0 && focusables[0] instanceof HTMLElement) {
        focusables[0].focus();
      } else {
        container.focus();
      }
    });

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const container = modalRef.current;
        if (!container) return;
        const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el instanceof HTMLElement && !el.hasAttribute("disabled")
        );

        if (focusables.length === 0) {
          e.preventDefault();
          container.focus();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || active === container || !container.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !container.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      const prevEl = previousFocusRef.current;
      previousFocusRef.current = null;
      if (prevEl && typeof prevEl.focus === "function" && document.contains(prevEl)) {
        prevEl.focus();
      }
    };
  }, [isModalOpen]);

  // Keep revocation synchronized whenever consent state updates
  useEffect(() => {
    if (!mounted || isAdminRoute || !consent?.categories) return;
    revokeOptionalCookies(consent.categories);
  }, [mounted, isAdminRoute, consent]);

  const handleAcceptAll = useCallback(() => {
    const saved = saveConsentPreferences(
      {
        essential: true,
        functional: true,
        analytics: true,
        marketing: true,
      },
      "accepted_all"
    );
    setConsent(saved);
    setDraftCategories({ ...saved.categories });
    setShowBanner(false);
    setIsModalOpen(false);
  }, []);

  const handleRejectOptional = useCallback(() => {
    const saved = saveConsentPreferences(
      {
        essential: true,
        functional: false,
        analytics: false,
        marketing: false,
      },
      "essential_only"
    );
    setConsent(saved);
    setDraftCategories({ ...saved.categories });
    setShowBanner(false);
    setIsModalOpen(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    const saved = saveConsentPreferences(draftCategories);
    setConsent(saved);
    setDraftCategories({ ...saved.categories });
    setShowBanner(false);
    setIsModalOpen(false);
  }, [draftCategories]);

  const handleToggleCategory = (key) => {
    if (key === "essential") return;
    setDraftCategories((prev) => ({
      ...prev,
      essential: true,
      [key]: !prev[key],
    }));
  };

  if (!mounted || isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* ==================== COOKIE CONSENT BANNER ==================== */}
      {showBanner && !isModalOpen && (
        <aside
          role="region"
          aria-label="Cookie consent banner"
          className="fixed bottom-0 inset-x-0 sm:bottom-5 sm:inset-x-6 lg:max-w-6xl lg:mx-auto z-[70] bg-[#08101C]/95 backdrop-blur-xl border-t sm:border border-[#C6A155]/45 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        >
          {/* Top gold hairline accent */}
          <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#C6A155] to-transparent" />

          <div className="px-4 py-4 sm:px-7 sm:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            {/* Copy */}
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Privacy &amp; Cookie Preferences</span>
              </div>
              <h2 className="font-serif text-base sm:text-lg text-white font-normal tracking-wide">
                Tailoring Your ASMARATY Digital Experience
              </h2>
              <p className="text-xs text-[#9DAAB8] font-light leading-relaxed">
                We use essential cookies to ensure secure navigation and site functionality. Optional cookies help us remember preferences, analyze fleet interest, and personalize showcase invitations. You may manage or withdraw your consent at any time.
              </p>
            </div>

            {/* Action Buttons (non-truncating responsive labels at 360px–375px+) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={openPreferencesModal}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 border border-white/20 hover:border-[#C6A155] bg-transparent text-white/85 hover:text-[#DFBA73] text-[11px] font-semibold uppercase tracking-[0.10em] leading-snug text-center !whitespace-normal !text-clip transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span className="!whitespace-normal !text-clip">Customize Settings</span>
              </button>

              <button
                type="button"
                onClick={handleRejectOptional}
                className="inline-flex items-center justify-center px-3.5 py-2.5 sm:px-4 border border-[#C6A155]/60 hover:border-[#DFBA73] hover:bg-[#C6A155]/15 text-[#DFBA73] hover:text-white text-[11px] font-semibold uppercase tracking-[0.10em] leading-snug text-center !whitespace-normal !text-clip transition-colors cursor-pointer"
              >
                <span className="!whitespace-normal !text-clip">Reject Optional Cookies</span>
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-5 bg-[#C6A155] hover:bg-[#DFBA73] border border-[#C6A155] hover:border-[#DFBA73] text-[#08101C] text-[11px] font-bold uppercase tracking-[0.12em] leading-snug text-center !whitespace-normal !text-clip transition-colors cursor-pointer shadow-lg"
              >
                <span className="!whitespace-normal !text-clip">Accept All</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ==================== COOKIE PREFERENCES MODAL ==================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-6"
          onClick={closePreferencesModal}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="w-full sm:max-w-2xl max-h-[92vh] flex flex-col bg-[#08101C] border-t sm:border border-[#C6A155]/45 shadow-[0_25px_75px_rgba(0,0,0,0.9)] overflow-hidden outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold hairline top accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#C6A155]/40 via-[#DFBA73] to-[#C6A155]/40 shrink-0" />

            {/* Modal Header */}
            <div className="px-5 py-4 sm:px-7 sm:py-5 bg-[#0A1322] border-b border-white/10 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.24em] text-[#C6A155] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Cookie Settings &amp; Consent</span>
                </div>
                <h2
                  id="cookie-preferences-title"
                  className="font-serif text-xl sm:text-2xl text-white font-normal tracking-wide"
                >
                  Manage Cookie Preferences
                </h2>
              </div>

              <button
                type="button"
                onClick={closePreferencesModal}
                className="p-2 text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/15 transition-colors cursor-pointer shrink-0"
                aria-label="Close cookie preferences"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-5 sm:px-7 sm:py-6 overflow-y-auto space-y-4">
              <p className="text-xs sm:text-sm text-[#9DAAB8] font-light leading-relaxed">
                Select which cookie categories you allow on the ASMARATY website. Essential cookies remain active to support core security and navigation. Optional analytics and marketing scripts remain inactive unless explicitly enabled.
              </p>

              {/* Current Saved Status Bar */}
              {consent && (
                <div className="px-4 py-2.5 bg-[#0D1627] border border-[#C6A155]/25 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-[#DFBA73] font-medium">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{STATUS_LABELS[consent.status] || "Preferences Saved"}</span>
                  </span>
                  {consent.updatedAt && (
                    <span className="text-white/50 font-mono text-[10px]">
                      Updated: {new Date(consent.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Category Toggle Cards */}
              <div className="space-y-3">
                {COOKIE_CATEGORY_DEFINITIONS.map((cat) => {
                  const isEnabled = cat.locked ? true : Boolean(draftCategories[cat.key]);

                  return (
                    <div
                      key={cat.key}
                      className={`p-4 border transition-colors ${
                        isEnabled
                          ? "bg-[#0D1627] border-[#C6A155]/35"
                          : "bg-[#0A111D] border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-medium text-white tracking-wide">
                              {cat.label}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.16em] font-semibold ${
                                cat.locked
                                  ? "bg-[#C6A155]/20 text-[#DFBA73] border border-[#C6A155]/35"
                                  : isEnabled
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-white/5 text-white/55 border border-white/10"
                              }`}
                            >
                              {cat.locked && <Lock className="w-2.5 h-2.5 shrink-0" />}
                              <span>{cat.locked ? "Always Active" : isEnabled ? "Enabled" : "Disabled"}</span>
                            </span>
                          </div>
                          <p className="text-xs text-[#8E9EAF] font-light leading-relaxed">
                            {cat.description}
                          </p>
                        </div>

                        {/* Switch Control */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isEnabled}
                          aria-label={cat.label}
                          disabled={cat.locked}
                          onClick={() => handleToggleCategory(cat.key)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center border transition-colors ${
                            cat.locked
                              ? "bg-[#C6A155]/35 border-[#C6A155]/60 cursor-not-allowed opacity-85"
                              : isEnabled
                              ? "bg-[#C6A155] border-[#DFBA73] cursor-pointer"
                              : "bg-[#152238] border-white/20 hover:border-white/40 cursor-pointer"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform transition-transform ${
                              isEnabled ? "translate-x-6 bg-[#08101C]" : "translate-x-1 bg-white/75"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-4 sm:px-7 sm:py-5 bg-[#0A1322] border-t border-white/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="text-left sm:text-center text-[11px] font-mono uppercase tracking-[0.12em] text-white/60 hover:text-[#DFBA73] !whitespace-normal !text-clip transition-colors cursor-pointer py-1"
              >
                Reject Optional Cookies
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="inline-flex items-center justify-center px-4 py-2.5 sm:px-5 border border-[#C6A155]/70 hover:border-[#DFBA73] hover:bg-[#C6A155]/15 text-[#DFBA73] hover:text-white text-[11px] font-semibold uppercase tracking-[0.12em] leading-snug text-center !whitespace-normal !text-clip transition-colors cursor-pointer"
                >
                  <span className="!whitespace-normal !text-clip">Save Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 bg-[#C6A155] hover:bg-[#DFBA73] border border-[#C6A155] hover:border-[#DFBA73] text-[#08101C] text-[11px] font-bold uppercase tracking-[0.12em] leading-snug text-center !whitespace-normal !text-clip transition-colors cursor-pointer shadow-lg"
                >
                  <span className="!whitespace-normal !text-clip">Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
