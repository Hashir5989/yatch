"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Award, Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XTwitterIcon, TiktokIcon } from "@/components/public/SocialIcons";
import { 
  DEFAULT_SETTINGS,
  getSiteSettings, 
  getAllYachts, 
  syncSettingsFromServer, 
  syncYachtsFromServer 
} from "@/lib/cmsStore";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";
import { openCookiePreferences } from "@/lib/cookieConsent";

export default function PublicFooter() {
  const [settings, setSettings] = useState(() => DEFAULT_SETTINGS);
  const [yachts, setYachts] = useState(() => DEFAULT_YACHTS.filter((y) => y.status === "published"));

  useEffect(() => {
    // 0. Immediately read local client storage upon mounting
    setSettings(getSiteSettings());
    setYachts(getAllYachts().filter((y) => y.status === "published"));

    // 1. Initial background sync from server
    syncSettingsFromServer().then((synced) => {
      if (synced) setSettings(synced);
    });
    syncYachtsFromServer(true).then((syncedYachts) => {
      if (syncedYachts && Array.isArray(syncedYachts)) {
        setYachts(syncedYachts.filter((y) => y.status === "published"));
      }
    });

    // 2. Reactive listener for CMS state modifications
    const handleCmsChange = () => {
      setSettings(getSiteSettings());
      setYachts(getAllYachts().filter((y) => y.status === "published"));
    };

    window.addEventListener("asm-cms-change", handleCmsChange);
    return () => window.removeEventListener("asm-cms-change", handleCmsChange);
  }, []);

  const footer = settings.footer || {};
  const social = settings.socialLinks || {};
  const publishedYachts = (yachts || []).filter((y) => y.status === "published");

  const cleanPhone = (settings.contactPhone || "+971 56 526 8126").replace(/\s+/g, "");
  const cleanWhatsapp = (settings.whatsappNumber || "+971 56 526 8126").replace(/[^0-9]/g, "");

  return (
    <footer className="bg-[#08101C] border-t border-[#152338] text-[#8E9EAF] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16 border-b border-[#152338]">
          {/* Brand Info (Dynamic from CMS) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <div className="flex flex-col items-start gap-2">
              <AsmaratyLogo variant="full" imgClassName="h-14 sm:h-16 md:h-18" />
              <p className="saxdor-eyebrow text-[9px] tracking-[0.26em] text-[#C6A155] uppercase font-bold pl-1">
                {footer.brandEyebrow || "Yachts • United Arab Emirates"}
              </p>
            </div>
            <p
              className="text-xs sm:text-sm text-[#8E9EAF] leading-relaxed max-w-md font-light saxdor-desc-justified"
              style={{ textAlign: "justify", textJustify: "inter-word", textAlignLast: "left" }}
            >
              {footer.brandDescription ||
                "Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels where architectural clarity meets endurance at sea."}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C6A155] tracking-wider uppercase font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{footer.trustBadge1 || "Certified Yachts"}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{footer.trustBadge2 || "45+ Years Heritage"}</span>
              </div>
            </div>
          </div>

          {/* Fleet Links (Dynamic from CMS Published Yachts) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              {footer.fleetHeading || "The Fleet"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {publishedYachts.length > 0 ? (
                publishedYachts.slice(0, 6).map((yacht) => (
                  <li key={yacht.id}>
                    <Link
                      href={`/yachts/${yacht.slug}`}
                      className="hover:text-white transition-colors flex items-center justify-between gap-3 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform text-white/90 leading-snug">
                        {yacht.name}
                      </span>
                      <span className="w-[118px] h-[24px] shrink-0 inline-flex items-center justify-center text-center whitespace-nowrap text-[8px] bg-[#C6A155]/20 text-[#DFBA73] px-1.5 font-bold tracking-[0.09em] uppercase">
                        <span className="truncate">
                          {yacht.category || (yacht.specs?.lengthOverall ? `${yacht.specs.lengthOverall} FT` : "Yacht")}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between gap-3 group">
                      <span className="group-hover:translate-x-0.5 transition-transform">G100</span>
                      <span className="w-[118px] h-[24px] shrink-0 inline-flex items-center justify-center text-center whitespace-nowrap text-[8px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 font-bold tracking-[0.09em] uppercase">
                        Superyacht
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between gap-3 group">
                      <span className="group-hover:translate-x-0.5 transition-transform">G77</span>
                      <span className="w-[118px] h-[24px] shrink-0 inline-flex items-center justify-center text-center whitespace-nowrap text-[8px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 font-bold tracking-[0.09em] uppercase">
                        Luxury Yacht
                      </span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Experience Links (Manageable via CMS) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              {footer.experienceHeading || "Experience"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {(footer.experienceLinks || [
                { id: "exp-yachts", label: "All Collections", url: "/yachts", target: "_self", visible: true },
                { id: "exp-about", label: "About Us", url: "/about", target: "_self", visible: true },
                { id: "exp-news", label: "News & Dispatches", url: "/news", target: "_self", visible: true },
                { id: "exp-events", label: "Events & Exhibitions", url: "/events", target: "_self", visible: true },
                { id: "exp-contact", label: "Book Sea Trial", url: "/contact", target: "_self", visible: true }
              ])
                .filter((item) => item.visible !== false)
                .map((item, idx) => (
                  <li key={item.id || idx}>
                    <Link
                      href={item.url || item.href || "/"}
                      target={item.target || "_self"}
                      rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                      className="hover:text-white transition-colors block text-white/80 hover:translate-x-0.5 transition-transform"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Headquarters / Contact (Dynamic from Site Settings) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              {footer.hqHeading || "Headquarters"}
            </h4>
            <div className="space-y-2 text-xs text-[#8E9EAF] leading-relaxed">
              <p className="text-white font-semibold tracking-wide">
                {settings.companyName || "AL SHAALI MARINE"}
              </p>
              <p className="whitespace-pre-line">
                {settings.shipyardAddress || "RASHIDIA 1\nAJMAN, United Arab Emirates"}
              </p>
              <div className="pt-2 space-y-2">
                {/* Telephone */}
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="p-1 bg-white/5 border border-white/10 hover:border-[#C6A155]/60 rounded text-[#C6A155] hover:opacity-80 transition-all shrink-0"
                    title="Direct Phone Call"
                    aria-label={`Call ${settings.contactPhone || "+971 6 743 6443"}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
                  </a>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-sans">Tel</span>
                    <a 
                      href={`tel:${cleanPhone}`} 
                      className="hover:text-[#C6A155] text-white transition-colors tracking-wide"
                    >
                      {settings.contactPhone || "+971 6 743 6443"}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.`}
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
                      href={`https://wa.me/${cleanWhatsapp}?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#25D366] text-white/90 transition-colors tracking-wide"
                    >
                      {settings.whatsappNumber || "+971 56 526 8126"}
                    </a>
                  </div>
                </div>

                <p className="text-[#C6A155] font-semibold pt-1 text-xs">
                  <a href={`mailto:${settings.contactEmail || "info@asmaraty.com"}`} className="hover:underline">
                    {settings.contactEmail || "info@asmaraty.com"}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Cookie Settings & Social Links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-white/60">
            <p>{footer.copyrightText || "© 2026 ASMARATY LLC. All rights reserved."}</p>
            <span className="text-[#243550] hidden sm:inline">•</span>
            <p className="text-[#8E9EAF]">
              {footer.tagline || "Official Shipyard & Luxury Naval Architecture UAE"}
            </p>
            <span className="text-[#243550] hidden sm:inline">•</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="text-white/75 hover:text-[#DFBA73] underline decoration-[#C6A155]/40 hover:decoration-[#DFBA73] underline-offset-4 transition-colors cursor-pointer"
            >
              Cookie Settings
            </button>
          </div>

          {/* Social Channels (Instagram, YouTube, TikTok + extras) */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-white/80">
            {/* Instagram */}
            <a
              href={social.instagram || "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded flex items-center gap-1.5 text-white/90 hover:text-white transition-all shadow-sm group"
              aria-label="ASMARATY Official Instagram"
              title="Follow @asmaraty_yachts on Instagram"
            >
              <InstagramIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">Instagram</span>
            </a>

            {/* YouTube */}
            <a
              href={social.youtube || "https://youtu.be/FBPzrAe9N0Q"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded flex items-center gap-1.5 text-white/90 hover:text-white transition-all shadow-sm group"
              aria-label="ASMARATY Official YouTube"
              title="Watch on YouTube"
            >
              <YoutubeIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">YouTube</span>
            </a>

            {/* TikTok */}
            <a
              href={social.tiktok || "https://www.tiktok.com/@asmaraty.yachts?_r=1&_t=ZS-9BJeuRzx6UI"}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded flex items-center gap-1.5 text-white/90 hover:text-white transition-all shadow-sm group"
              aria-label="ASMARATY Official TikTok"
              title="Follow @asmaraty.yachts on TikTok"
            >
              <TiktokIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">TikTok</span>
            </a>

            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center"
                aria-label="ASMARATY Facebook"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {social.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center"
                aria-label="ASMARATY LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center justify-center"
                aria-label="ASMARATY X (Twitter)"
                title="X / Twitter"
              >
                <XTwitterIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
