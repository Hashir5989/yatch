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
  MapPin,
  Lock,
  KeyRound,
  AlertCircle,
  Menu,
  Navigation,
  PanelBottom,
  Share2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Award
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";
import { 
  getSiteSettings, 
  saveSiteSettings, 
  resetAllDemoData,
  syncSettingsFromServer 
} from "@/lib/cmsStore";

const TABS = [
  { id: "brand", label: "Brand & Shipyard", icon: Globe },
  { id: "navigation", label: "Header & Navigation", icon: Navigation },
  { id: "footer", label: "Footer Content", icon: PanelBottom },
  { id: "social", label: "Social Channels", icon: Share2 },
  { id: "security", label: "Security & System", icon: Lock },
];

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState(() => getSiteSettings());
  const [activeTab, setActiveTab] = useState("brand");
  const [toastMessage, setToastMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(null);

  useEffect(() => {
    syncSettingsFromServer().then((synced) => {
      if (synced) setSettings(synced);
    });
    const handleUpdate = () => setSettings(getSiteSettings());
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await saveSiteSettings(settings);
      showToast("CMS Settings saved and synchronized successfully");
    } catch (err) {
      showToast("Failed to save settings: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirm password do not match.");
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPwdError(data.error || "Failed to update password. Verify current password.");
        setPwdLoading(false);
        return;
      }

      setPwdSuccess("Administrator password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully");
      setPwdLoading(false);
    } catch (err) {
      setPwdError("Network error while updating password.");
      setPwdLoading(false);
    }
  };

  const handleReset = () => {
    resetAllDemoData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  // --- Helper state updater functions for nested settings ---
  const updateHeader = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      header: {
        ...(prev.header || {}),
        [field]: value
      }
    }));
  };

  const updateHeaderCta = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      header: {
        ...(prev.header || {}),
        ctaButton: {
          ...(prev.header?.ctaButton || {}),
          [field]: value
        }
      }
    }));
  };

  const updateDrawer = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      drawer: {
        ...(prev.drawer || {}),
        [field]: value
      }
    }));
  };

  const updateDrawerCtaButton = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      drawer: {
        ...(prev.drawer || {}),
        ctaButton: {
          ...(prev.drawer?.ctaButton || {}),
          [field]: value
        }
      }
    }));
  };

  const updateFooter = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      footer: {
        ...(prev.footer || {}),
        [field]: value
      }
    }));
  };

  const updateSocial = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [field]: value
      }
    }));
  };

  // --- Drawer Navigation Link Management ---
  const handleAddDrawerNavLink = () => {
    const current = settings.drawer?.navLinks || [];
    const newLink = {
      id: "nav-" + Date.now(),
      label: "New Page",
      url: "/",
      target: "_self",
      visible: true
    };
    updateDrawer("navLinks", [...current, newLink]);
  };

  const handleUpdateDrawerNavLink = (index, field, value) => {
    const current = [...(settings.drawer?.navLinks || [])];
    current[index] = { ...current[index], [field]: value };
    updateDrawer("navLinks", current);
  };

  const handleMoveDrawerNavLink = (index, direction) => {
    const current = [...(settings.drawer?.navLinks || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    updateDrawer("navLinks", current);
  };

  const handleDeleteDrawerNavLink = (index) => {
    const current = [...(settings.drawer?.navLinks || [])];
    current.splice(index, 1);
    updateDrawer("navLinks", current);
  };

  // --- Footer Experience Link Management ---
  const handleAddFooterExpLink = () => {
    const current = settings.footer?.experienceLinks || [];
    const newLink = {
      id: "exp-" + Date.now(),
      label: "New Experience Link",
      url: "/",
      target: "_self",
      visible: true
    };
    updateFooter("experienceLinks", [...current, newLink]);
  };

  const handleUpdateFooterExpLink = (index, field, value) => {
    const current = [...(settings.footer?.experienceLinks || [])];
    current[index] = { ...current[index], [field]: value };
    updateFooter("experienceLinks", current);
  };

  const handleMoveFooterExpLink = (index, direction) => {
    const current = [...(settings.footer?.experienceLinks || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    updateFooter("experienceLinks", current);
  };

  const handleDeleteFooterExpLink = (index) => {
    const current = [...(settings.footer?.experienceLinks || [])];
    current.splice(index, 1);
    updateFooter("experienceLinks", current);
  };

  if (!settings) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Settings & Navigation CMS" 
        subtitle="Manage brand attributes, desktop header, navigation drawer, footer, and social channels"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#C5A880] text-[#080B10] px-5 py-2.5 rounded shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Top Control Bar: Tabs + Quick Save */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#C5A880] text-[#080B10] font-bold shadow-md"
                      : "bg-[#0E1522] text-white/70 hover:text-white hover:bg-[#162030] border border-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: BRAND & SHIPYARD INFORMATION
            ------------------------------------------------------------- */}
        {activeTab === "brand" && (
          <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6 text-xs">
            <div className="border-b border-white/5 pb-4">
              <h2 className="font-serif text-lg text-white font-medium">
                Shipyard & Brand Headquarters
              </h2>
              <p className="text-xs text-[#7A8798] mt-0.5">
                Global parameters rendered in website headers, navigation drawers, footers, and contact sections.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Global Site Title
                </label>
                <input
                  type="text"
                  value={settings.siteTitle || ""}
                  onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Official Shipbuilder / Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName || ""}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="AL SHAALI MARINE"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  VIP Concierge Hotline
                </label>
                <input
                  type="text"
                  value={settings.contactPhone || ""}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+971 56 526 8126"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  WhatsApp Direct Number
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="+971 56 526 8126"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Direct Advisory Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail || ""}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  placeholder="info@asmaraty.com"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                Corporate Headquarters & Shipyard Address
              </label>
              <textarea
                rows={3}
                value={settings.shipyardAddress || ""}
                onChange={(e) => setSettings({ ...settings, shipyardAddress: e.target.value })}
                placeholder="RASHIDIA 1, AJMAN, United Arab Emirates"
                className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] leading-relaxed resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Shipyard Operating Hours
                </label>
                <input
                  type="text"
                  value={settings.operatingHours || ""}
                  onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                  placeholder="Saturday – Thursday: 08:00 – 17:00 GST"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Google Maps Location Link
                </label>
                <input
                  type="text"
                  value={settings.googleMapsUrl || ""}
                  onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: HEADER & NAVIGATION DRAWER CMS
            ------------------------------------------------------------- */}
        {activeTab === "navigation" && (
          <div className="space-y-6 text-xs">
            {/* Header Settings Section */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="font-serif text-lg text-white font-medium">
                  Desktop Header & Action Button
                </h2>
                <p className="text-xs text-[#7A8798] mt-0.5">
                  Configure the primary header menu trigger and the top-right call-to-action button.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Menu Trigger Label
                  </label>
                  <input
                    type="text"
                    value={settings.header?.menuLabel || "Menu"}
                    onChange={(e) => updateHeader("menuLabel", e.target.value)}
                    placeholder="Menu"
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <p className="text-[10px] text-white/40 mt-1">Text shown next to the hamburger icon.</p>
                </div>

                <div className="p-4 bg-[#0E1522] border border-white/5 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white uppercase text-[10px] tracking-wider">Top-Right CTA Button</span>
                    <button
                      type="button"
                      onClick={() => updateHeaderCta("visible", settings.header?.ctaButton?.visible === false ? true : false)}
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer rounded-none border ${
                        settings.header?.ctaButton?.visible !== false
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                          : "bg-white/5 text-white/50 border-white/10"
                      }`}
                    >
                      {settings.header?.ctaButton?.visible !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{settings.header?.ctaButton?.visible !== false ? "Visible" : "Hidden"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Button Label</label>
                      <input
                        type="text"
                        value={settings.header?.ctaButton?.label || "Private Consultation"}
                        onChange={(e) => updateHeaderCta("label", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Destination URL</label>
                      <input
                        type="text"
                        value={settings.header?.ctaButton?.url || "/contact"}
                        onChange={(e) => updateHeaderCta("url", e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Open In</label>
                    <select
                      value={settings.header?.ctaButton?.target || "_self"}
                      onChange={(e) => updateHeaderCta("target", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Drawer Links Section */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-serif text-lg text-white font-medium">
                    Navigation Drawer Links
                  </h2>
                  <p className="text-xs text-[#7A8798] mt-0.5">
                    Add, edit, reorder, and toggle visibility for menu links inside the slide-out navigation drawer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDrawerNavLink}
                  className="px-3.5 py-2 bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#DFBA73] border border-[#C5A880]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer rounded-none self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Menu Link</span>
                </button>
              </div>

              {/* Headings inside Drawer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Fleet Section Heading
                  </label>
                  <input
                    type="text"
                    value={settings.drawer?.fleetHeading || "The Fleet Collection"}
                    onChange={(e) => updateDrawer("fleetHeading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Menu Links Section Heading
                  </label>
                  <input
                    type="text"
                    value={settings.drawer?.navHeading || "Shipyard & Company"}
                    onChange={(e) => updateDrawer("navHeading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              {/* Links List */}
              <div className="space-y-3">
                {(settings.drawer?.navLinks || []).map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="p-3 sm:p-4 bg-[#0E1522] border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-3"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-6 h-6 rounded bg-black/40 text-[10px] font-mono text-white/60 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveDrawerNavLink(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDrawerNavLink(idx, 1)}
                          disabled={idx === (settings.drawer?.navLinks?.length || 0) - 1}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Link Label</label>
                        <input
                          type="text"
                          value={link.label || ""}
                          onChange={(e) => handleUpdateDrawerNavLink(idx, "label", e.target.value)}
                          placeholder="e.g. About Us"
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Destination URL</label>
                        <input
                          type="text"
                          value={link.url || link.href || ""}
                          onChange={(e) => handleUpdateDrawerNavLink(idx, "url", e.target.value)}
                          placeholder="/about"
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Open In</label>
                        <select
                          value={link.target || "_self"}
                          onChange={(e) => handleUpdateDrawerNavLink(idx, "target", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdateDrawerNavLink(idx, "visible", link.visible === false ? true : false)}
                        className={`p-2 border cursor-pointer ${
                          link.visible !== false
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}
                        title={link.visible !== false ? "Hide Link" : "Show Link"}
                      >
                        {link.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteDrawerNavLink(idx)}
                        className="p-2 border border-red-950/50 bg-red-950/30 text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Bottom CTA Box */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="font-semibold text-white uppercase text-[10px] tracking-wider block">Drawer Bottom CTA Bar</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={settings.drawer?.ctaText || "Experience bespoke nautical engineering"}
                      onChange={(e) => updateDrawer("ctaText", e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Button Label</label>
                    <input
                      type="text"
                      value={settings.drawer?.ctaButton?.label || "Book Sea Trial"}
                      onChange={(e) => updateDrawerCtaButton("label", e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: FOOTER CONTENT & LINKS CMS
            ------------------------------------------------------------- */}
        {activeTab === "footer" && (
          <div className="space-y-6 text-xs">
            {/* Column 1: Brand Narrative & Trust Badges */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h2 className="font-serif text-lg text-white font-medium">
                  Footer Column 1: Brand Narrative & Trust Badges
                </h2>
                <p className="text-xs text-[#7A8798] mt-0.5">
                  Manage the official shipyard heritage statement and credentials rendered in the footer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Eyebrow / Sub-brand
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.brandEyebrow || "Yachts • United Arab Emirates"}
                    onChange={(e) => updateFooter("brandEyebrow", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                      Trust Badge 1
                    </label>
                    <input
                      type="text"
                      value={settings.footer?.trustBadge1 || "Certified Yachts"}
                      onChange={(e) => updateFooter("trustBadge1", e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                      Trust Badge 2
                    </label>
                    <input
                      type="text"
                      value={settings.footer?.trustBadge2 || "45+ Years Heritage"}
                      onChange={(e) => updateFooter("trustBadge2", e.target.value)}
                      className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Heritage Description Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settings.footer?.brandDescription || ""}
                  onChange={(e) => updateFooter("brandDescription", e.target.value)}
                  placeholder="Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing..."
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880] leading-relaxed resize-y"
                />
              </div>
            </div>

            {/* Column 2 & Column 4 Headings */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h2 className="font-serif text-lg text-white font-medium">
                  Footer Column Headings & Fleet Synchronization
                </h2>
                <p className="text-xs text-[#7A8798] mt-0.5">
                  Headings for the 4 footer columns across all desktop and mobile viewports.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Column 2 Heading (The Fleet)
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.fleetHeading || "The Fleet"}
                    onChange={(e) => updateFooter("fleetHeading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <p className="text-[10px] text-emerald-400/80 mt-1">
                    ✓ Yacht links are dynamically auto-synchronized from published vessels in the Yacht Manager.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Column 3 Heading (Experience)
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.experienceHeading || "Experience"}
                    onChange={(e) => updateFooter("experienceHeading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <p className="text-[10px] text-white/40 mt-1">
                    Manageable via the Experience Links list below.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Column 4 Heading (Headquarters)
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.hqHeading || "Headquarters"}
                    onChange={(e) => updateFooter("hqHeading", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  <p className="text-[10px] text-emerald-400/80 mt-1">
                    ✓ Address, Phone, WhatsApp, and Email are auto-synchronized from Brand & Shipyard tab.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 3: Experience Links Manager */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h2 className="font-serif text-lg text-white font-medium">
                    Footer Column 3: Experience Links Manager
                  </h2>
                  <p className="text-xs text-[#7A8798] mt-0.5">
                    Add, edit, reorder, and toggle visibility for public footer experience links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFooterExpLink}
                  className="px-3.5 py-2 bg-[#C5A880]/20 hover:bg-[#C5A880]/30 text-[#DFBA73] border border-[#C5A880]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer rounded-none self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Footer Link</span>
                </button>
              </div>

              <div className="space-y-3">
                {(settings.footer?.experienceLinks || []).map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="p-3 sm:p-4 bg-[#0E1522] border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row items-stretch md:items-center gap-3"
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="w-6 h-6 rounded bg-black/40 text-[10px] font-mono text-white/60 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveFooterExpLink(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFooterExpLink(idx, 1)}
                          disabled={idx === (settings.footer?.experienceLinks?.length || 0) - 1}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Link Label</label>
                        <input
                          type="text"
                          value={link.label || ""}
                          onChange={(e) => handleUpdateFooterExpLink(idx, "label", e.target.value)}
                          placeholder="e.g. All Collections"
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Destination URL</label>
                        <input
                          type="text"
                          value={link.url || link.href || ""}
                          onChange={(e) => handleUpdateFooterExpLink(idx, "url", e.target.value)}
                          placeholder="/yachts"
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-wider text-[#7A8798] mb-1">Open In</label>
                        <select
                          value={link.target || "_self"}
                          onChange={(e) => handleUpdateFooterExpLink(idx, "target", e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#080B10] border border-white/10 rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        >
                          <option value="_self">Same Tab (_self)</option>
                          <option value="_blank">New Tab (_blank)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                      <button
                        type="button"
                        onClick={() => handleUpdateFooterExpLink(idx, "visible", link.visible === false ? true : false)}
                        className={`p-2 border cursor-pointer ${
                          link.visible !== false
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                            : "bg-white/5 text-white/40 border-white/10"
                        }`}
                        title={link.visible !== false ? "Hide Link" : "Show Link"}
                      >
                        {link.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFooterExpLink(idx)}
                        className="p-2 border border-red-950/50 bg-red-950/30 text-red-400 hover:bg-red-900 hover:text-white cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bar: Copyright & Tagline */}
            <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h2 className="font-serif text-lg text-white font-medium">
                  Footer Bottom Bar (Copyright & Legal)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.copyrightText || "© 2026 ASMARATY LLC. All rights reserved."}
                    onChange={(e) => updateFooter("copyrightText", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1 font-semibold">
                    Legal Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.footer?.tagline || "Official Shipyard & Luxury Naval Architecture UAE"}
                    onChange={(e) => updateFooter("tagline", e.target.value)}
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: SOCIAL CHANNELS CMS
            ------------------------------------------------------------- */}
        {activeTab === "social" && (
          <div className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6 text-xs">
            <div className="border-b border-white/5 pb-4">
              <h2 className="font-serif text-lg text-white font-medium">
                Official Social Media Channels
              </h2>
              <p className="text-xs text-[#7A8798] mt-0.5">
                Connect your social profiles. Non-empty links will automatically render in the public website footer and contact views.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.instagram || ""}
                  onChange={(e) => updateSocial("instagram", e.target.value)}
                  placeholder="https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.facebook || ""}
                  onChange={(e) => updateSocial("facebook", e.target.value)}
                  placeholder="https://facebook.com/asmaraty"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  LinkedIn Corporate Page URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.linkedin || ""}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/asmaraty"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.youtube || ""}
                  onChange={(e) => updateSocial("youtube", e.target.value)}
                  placeholder="https://youtu.be/FBPzrAe9N0Q"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  TikTok Profile URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.tiktok || ""}
                  onChange={(e) => updateSocial("tiktok", e.target.value)}
                  placeholder="https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  X (formerly Twitter) URL
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.twitter || ""}
                  onChange={(e) => updateSocial("twitter", e.target.value)}
                  placeholder="https://x.com/asmaraty"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                  WhatsApp Direct Chat Link
                </label>
                <input
                  type="text"
                  value={settings.socialLinks?.whatsapp || ""}
                  onChange={(e) => updateSocial("whatsapp", e.target.value)}
                  placeholder="https://wa.me/971565268126"
                  className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: SYSTEM & SECURITY
            ------------------------------------------------------------- */}
        {activeTab === "security" && (
          <div className="space-y-6 text-xs">
            {/* Password Management Form */}
            <form onSubmit={handlePasswordChange} className="bg-[#0A0D15] p-6 sm:p-8 rounded-sm border border-[#1A2230] space-y-6 text-xs">
              <div className="border-b border-white/5 pb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-white font-serif text-lg font-medium">
                    <Lock className="w-4 h-4 text-[#C5A880]" />
                    <h2>Administrator Password & Security</h2>
                  </div>
                  <p className="text-xs text-[#7A8798] mt-0.5">
                    Update client login credentials for accessing the ASMARATY CMS Studio.
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#121A28] text-[#C5A880] border border-[#C5A880]/30 rounded">
                  PBKDF2 Secured
                </span>
              </div>

              {pwdError && (
                <div className="p-3 bg-rose-950/40 border border-rose-700/60 text-xs text-rose-200 flex items-start gap-2.5 rounded-sm">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{pwdError}</span>
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 text-xs text-emerald-200 flex items-start gap-2.5 rounded-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#9DAAB8] mb-1.5 font-semibold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 bg-[#090D14] border border-[#1E2736] rounded-sm text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[10px] text-[#7A8798]">
                  Ensure your new password contains at least 6 characters.
                </p>
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-sm tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{pwdLoading ? "Updating..." : "Update Password"}</span>
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
                className="px-4 py-2 rounded-sm bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-medium transition-colors cursor-pointer"
              >
                Reset All Demo Data
              </button>
            </div>
          </div>
        )}
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
                className="px-4 py-2 text-xs text-[#A7B2C2] hover:bg-white/5 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded tracking-wider cursor-pointer"
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
