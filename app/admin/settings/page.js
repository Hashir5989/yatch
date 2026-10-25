"use client";

import { useState, useEffect } from "react";
import { 
  Sliders, 
  Save, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Globe, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import { 
  getSiteSettings, 
  saveSiteSettings, 
  resetAllDemoData 
} from "@/lib/cmsStore";

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState(() => getSiteSettings());
  const [toastMessage, setToastMessage] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSettings(getSiteSettings());
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSiteSettings(settings);
    showToast("Settings saved successfully");
  };

  const handleReset = () => {
    resetAllDemoData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  if (!settings) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Settings & System" 
        subtitle="Configure global brand attributes, announcement bar, and demo reset"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
        {/* Prototype Explanation Banner */}
        <div className="p-6 rounded-sm bg-[#0E1522] border border-[#233146] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded bg-[#162030] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base text-white font-medium">
                ASMARATY CMS Studio & System Architecture
              </h3>
              <p className="text-xs text-[#8E9DAE] mt-1 leading-relaxed">
                Official yacht content studio. Edits to yacht models, specifications, and pages are synchronized with server storage and live endpoints.
              </p>
            </div>
          </div>
        </div>

        {/* System Architecture & Status Panel */}
        <div className="p-6 rounded-sm bg-[#0A0E17] border border-[#1C2638] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-white font-serif text-sm font-medium">
              <ShieldAlert className="w-4 h-4 text-[#C5A880]" />
              <span>System Security & Data Persistence</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#152030] text-emerald-400 border border-emerald-400/30">
              Active & Protected
            </span>
          </div>

          <p className="text-[#8E9DAE] text-xs">
            Admin routes and API endpoints are secured with session tokens, encrypted cookies, and server-side data persistence:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#0E1522] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Yacht Catalog Database</span>
                <span className="text-[10px] text-emerald-400 font-mono">Live (/api/yachts)</span>
              </div>
              <p className="text-[11px] text-[#7A8798]">Dynamic persistence in server storage synchronized with frontend showcase.</p>
            </div>

            <div className="p-3 bg-[#0E1522] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Admin Authentication</span>
                <span className="text-[10px] text-emerald-400 font-mono">Enforced (PBKDF2)</span>
              </div>
              <p className="text-[11px] text-[#7A8798]">Secure HTTP-only session cookies and authentication guard on all admin routes.</p>
            </div>

            <div className="p-3 bg-[#0E1522] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Customer Enquiries</span>
                <span className="text-[10px] text-emerald-400 font-mono">Capturing (/api/enquiries)</span>
              </div>
              <p className="text-[11px] text-[#7A8798]">Sea trial and private consultation submissions are recorded directly on the server.</p>
            </div>

            <div className="p-3 bg-[#0E1522] border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Public Route Status</span>
                <span className="text-[10px] text-[#C5A880] font-mono">Under Construction</span>
              </div>
              <p className="text-[11px] text-[#7A8798]">Secondary public pages display the official Under Construction advisory notice.</p>
            </div>
          </div>
        </div>

        {/* Global Settings Form */}
        <form onSubmit={handleSave} className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6 text-xs">
          <div className="border-b border-white/5 pb-4">
            <h2 className="font-serif text-lg text-white font-medium">
              Shipyard & Brand Information
            </h2>
            <p className="text-xs text-[#7A8798] mt-0.5">
              Global parameters rendered in website headers, footers, and contact sections.
            </p>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
              Global Site Title
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-sm text-white focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                VIP Concierge Hotline
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                Direct Advisory Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
              Shipyard Headquarters Address
            </label>
            <input
              type="text"
              value={settings.shipyardAddress}
              onChange={(e) => setSettings({ ...settings, shipyardAddress: e.target.value })}
              className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>

        {/* Demo Reset Card */}
        <div className="p-6 bg-[#0E121B] rounded-sm border border-red-950/40 space-y-4">
          <div className="flex items-center gap-3 text-red-400">
            <RotateCcw className="w-5 h-5" />
            <h3 className="font-serif text-base text-white font-medium">
              Reset Demonstration Data
            </h3>
          </div>
          <p className="text-xs text-[#8E9AA8] leading-relaxed">
            Want to start fresh for a client presentation? This will clear any drafts and custom pages created in this browser, and restore the default ASMARATY luxury fleet, pages, and media catalog.
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-sm bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-medium transition-colors"
          >
            Reset All Demo Data
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-[#2B3548] p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-serif text-lg text-white font-medium">
                Reset Demo Data?
              </h3>
            </div>
            <p className="text-xs text-[#9DAAB8] leading-relaxed">
              This will restore all pages, sections, yacht fleet models, and media assets back to the original ASMARATY luxury demonstration defaults.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs text-[#A7B2C2] hover:bg-white/5 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded tracking-wider"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
