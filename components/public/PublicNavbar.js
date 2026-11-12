"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Anchor, 
  X, 
  Sparkles, 
  Edit3, 
  ArrowUpRight,
  ChevronRight,
  Compass,
  Phone,
  Ship,
  Layers
} from "lucide-react";
import { 
  getAllPages, 
  getAllYachts, 
  syncYachtsFromServer,
  DEFAULT_SETTINGS,
  getSiteSettings,
  syncSettingsFromServer 
} from "@/lib/cmsStore";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import { InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/public/SocialIcons";

export default function PublicNavbar({ currentPageId, showAdminBar = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [yachts, setYachts] = useState(() => DEFAULT_YACHTS.filter((y) => y.status === "published"));
  const [settings, setSettings] = useState(() => DEFAULT_SETTINGS);
  const pathname = usePathname();

  // Derive target pageId to edit in visual builder directly without cascading setState
  const pageIdToEdit = useMemo(() => {
    if (currentPageId) return currentPageId;
    const pages = getAllPages();
    const match = pages.find((p) => p.slug === pathname);
    if (match) return match.id;
    if (pathname === "/") return "page-home";
    return "page-home";
  }, [currentPageId, pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // 0. Immediately read local client storage upon mounting
    setSettings(getSiteSettings());
    setYachts(getAllYachts().filter((y) => y.status === "published"));

    // Dynamic sync from server database API so admin-added models appear live in navbar
    syncYachtsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachts(synced.filter((y) => y.status === "published"));
      }
    });

    // Dynamic sync for site settings and navigation menus
    syncSettingsFromServer().then((syncedSettings) => {
      if (syncedSettings) setSettings(syncedSettings);
    });

    const handleUpdate = () => {
      setYachts(getAllYachts().filter((y) => y.status === "published"));
      setSettings(getSiteSettings());
    };
    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  // Close panel on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPanelMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { label: "Fleet", href: "/yachts" },
    { label: "About Us", href: "/about" },
    { label: "News", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "VIP Concierge", href: "/contact" },
  ];

  return (
    <>

      {/* Saxdor-Style Main Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#08101C]/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-2xl"
            : "bg-gradient-to-b from-[#08101C]/95 via-[#08101C]/70 to-transparent py-4 sm:py-5"
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between min-h-[50px] sm:min-h-[56px]">
          {/* Left: Saxdor 3-Line Panel Menu Toggle */}
          <div className="flex items-center flex-1 justify-start z-10">
            <button
              onClick={() => setPanelMenuOpen(true)}
              className="p-1 -ml-1 text-white hover:text-[#C6A155] transition-colors flex items-center gap-2 sm:gap-3 group cursor-pointer"
              aria-label="Open menu"
            >
              <svg width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 10H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                <path d="M7.5 17H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                <path d="M7.5 24H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline text-xs font-bold tracking-[0.2em] uppercase text-white/90 group-hover:text-[#C6A155]">
                {settings.header?.menuLabel || "Menu"}
              </span>
            </button>
          </div>

          {/* Center: Official ASMARATY Brand Logo - Mathematically Centered on All Responsive Screens */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto">
            <AsmaratyLogo 
              variant="full" 
              priority={true} 
              imgClassName="h-10 sm:h-12 md:h-14"
            />
          </div>

          {/* Right Action: Header CTA Button */}
          <div className="flex items-center justify-end flex-1 z-10">
            {settings.header?.ctaButton?.visible !== false && (
              <Link
                href={settings.header?.ctaButton?.url || "/contact"}
                target={settings.header?.ctaButton?.target || "_self"}
                rel={settings.header?.ctaButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                className="saxdor-btn-solid !h-[36px] sm:!h-[42px] !min-h-0 !min-w-0 !px-4 sm:!px-6 !text-[11px] sm:!text-xs font-bold rounded-none whitespace-nowrap"
              >
                {settings.header?.ctaButton?.label || "Contact Us"}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Saxdor-Style Full-Height Slide-Out Panel Menu Drawer */}
      {panelMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPanelMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-3xl bg-[#08101C] border-r border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)] z-10 flex flex-col h-full overflow-hidden animate-slideInLeft">
            {/* Drawer Header */}
            <div className="p-6 sm:p-8 border-b border-white/10 bg-[#0E2047]/60 flex items-center justify-between">
              <AsmaratyLogo 
                variant="full" 
                imgClassName="h-10 sm:h-12" 
                onClick={() => setPanelMenuOpen(false)} 
              />

              <button
                onClick={() => setPanelMenuOpen(false)}
                className="w-10 h-10 border border-white/10 bg-[#08101C] hover:bg-white hover:text-[#08101C] text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
              {/* Fleet Models Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#C6A155] font-semibold">
                    {settings.drawer?.fleetHeading || "The Fleet Collection"}
                  </span>
                  <Link
                    href={settings.drawer?.fleetViewAllUrl || "/yachts"}
                    onClick={() => setPanelMenuOpen(false)}
                    className="text-[11px] text-white/60 hover:text-white uppercase tracking-wider flex items-center gap-1 font-medium"
                  >
                    <span>{settings.drawer?.fleetViewAllText || "View All"}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C6A155]" />
                  </Link>
                </div>

                {/* Grid of Model Thumbnails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {yachts.map((yacht) => (
                    <Link
                      key={yacht.id}
                      href={`/yachts/${yacht.slug}`}
                      onClick={() => setPanelMenuOpen(false)}
                      className="group bg-[#0E2047]/40 hover:bg-[#0E2047] border border-white/5 hover:border-[#C6A155]/60 p-3 flex items-center gap-3.5 transition-all"
                    >
                      <div className="w-20 h-14 bg-black/50 overflow-hidden flex-shrink-0">
                        <img
                          src={yacht.mainImage}
                          alt={yacht.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[9px] uppercase tracking-wider text-[#C6A155] font-medium block">
                          {yacht.category}
                        </span>
                        <h4 className="text-sm font-sans font-medium text-white group-hover:text-[#DFBA73] transition-colors truncate">
                          {yacht.name}
                        </h4>
                        <span className="text-[10px] text-white/50 block font-mono">
                          {[yacht.specs?.lengthOverall || yacht.length, yacht.category].filter(Boolean).join(" • ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Main Navigation Links (Manageable via CMS) */}
              <div>
                <span className="text-xs uppercase tracking-[0.22em] text-[#C6A155] font-semibold block mb-3 pb-2 border-b border-white/10">
                  {settings.drawer?.navHeading || "Shipyard & Company"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {(settings.drawer?.navLinks || [])
                    .filter((item) => item.visible !== false)
                    .map((item, idx) => (
                      <Link
                        key={item.id || idx}
                        href={item.url || item.href || "/"}
                        target={item.target || "_self"}
                        rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                        onClick={() => setPanelMenuOpen(false)}
                        className="py-2.5 px-3 bg-[#08101C] hover:bg-[#0E2047] border border-white/5 text-white/90 hover:text-white text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-between group"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                </div>
              </div>

              {/* Contact Bar (Dynamic from Global Settings) */}
              <div className="p-5 bg-[#0E2047]/50 border border-white/10 text-xs text-white/80 space-y-2">
                <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
                  {settings.companyName || "AL SHAALI MARINE"}
                </div>
                <p className="text-[11px] text-white/60">
                  {settings.shipyardAddress || "RASHIDIA 1, AJMAN, United Arab Emirates"}
                </p>
                <div className="pt-2 space-y-2 text-xs">
                  {/* Telephone */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${(settings.contactPhone || "+971 6 743 6443").replace(/\s+/g, '')}`}
                      className="p-1 bg-white/5 border border-white/10 hover:border-[#C6A155]/60 rounded text-[#C6A155] hover:opacity-80 transition-all shrink-0"
                      title="Direct Phone Call"
                      aria-label={`Call ${settings.contactPhone || "+971 6 743 6443"}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
                    </a>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-[10px] text-white/50 uppercase tracking-wider font-sans">Tel</span>
                      <a 
                        href={`tel:${(settings.contactPhone || "+971 6 743 6443").replace(/\s+/g, '')}`} 
                        className="hover:underline text-white hover:text-[#C6A155] transition-colors"
                      >
                        {settings.contactPhone || "+971 6 743 6443"}
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${(settings.whatsappNumber || "+971 56 526 8126").replace(/[^0-9]/g, '')}?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-[#25D366]/10 border border-[#25D366]/30 hover:border-[#25D366] rounded text-[#25D366] hover:opacity-80 transition-all shrink-0"
                      title="Chat on WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                    </a>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-[10px] text-[#25D366]/80 uppercase tracking-wider font-sans">WhatsApp</span>
                      <a
                        href={`https://wa.me/${(settings.whatsappNumber || "+971 56 526 8126").replace(/[^0-9]/g, '')}?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-white/90 hover:text-[#25D366] transition-colors"
                      >
                        {settings.whatsappNumber || "+971 56 526 8126"}
                      </a>
                    </div>
                  </div>

                  <a href={`mailto:${settings.contactEmail || "info@asmaraty.com"}`} className="hover:underline text-white/70 block pt-1">
                    {settings.contactEmail || "info@asmaraty.com"}
                  </a>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href={settings.socialLinks?.instagram || "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                      title="Follow @asmaraty_yachts on Instagram"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">Instagram</span>
                    </a>
                    <span className="text-white/20">•</span>
                    <a
                      href={settings.socialLinks?.youtube || "https://youtu.be/FBPzrAe9N0Q"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                      title="Watch on YouTube"
                    >
                      <YoutubeIcon className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">YouTube</span>
                    </a>
                    <span className="text-white/20">•</span>
                    <a
                      href={settings.socialLinks?.tiktok || "https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                      title="Follow @asmaraty.yachts on TikTok"
                    >
                      <TiktokIcon className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">TikTok</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer CTA (Manageable from CMS) */}
            <div className="p-6 border-t border-white/10 bg-[#08101C] flex items-center justify-between">
              <span className="text-[11px] text-white/50 tracking-wider">
                {settings.drawer?.ctaText || "Experience bespoke nautical engineering"}
              </span>
              {settings.drawer?.ctaButton?.visible !== false && (
                <Link
                  href={settings.drawer?.ctaButton?.url || "/contact"}
                  target={settings.drawer?.ctaButton?.target || "_self"}
                  rel={settings.drawer?.ctaButton?.target === "_blank" ? "noopener noreferrer" : undefined}
                  onClick={() => setPanelMenuOpen(false)}
                  className="saxdor-btn-solid !h-[44px] !min-h-[44px] !min-w-0 !px-7 !text-xs rounded-none"
                >
                  {settings.drawer?.ctaButton?.label || "Book Sea Trial"}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
