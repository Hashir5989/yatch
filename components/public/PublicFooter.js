"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Award, Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { InstagramIcon, FacebookIcon, LinkedinIcon, YoutubeIcon, XTwitterIcon } from "@/components/public/SocialIcons";
import { 
  DEFAULT_SETTINGS,
  getSiteSettings, 
  getAllYachts, 
  syncSettingsFromServer, 
  syncYachtsFromServer 
} from "@/lib/cmsStore";
import { DEFAULT_YACHTS } from "@/lib/data/defaultYachts";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 pb-16 border-b border-[#152338]">
          {/* Brand Info (Dynamic from CMS) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col items-start gap-2">
              <AsmaratyLogo variant="full" imgClassName="h-14 sm:h-16 md:h-18" />
              <p className="saxdor-eyebrow text-[9px] tracking-[0.26em] text-[#C6A155] uppercase font-bold pl-1">
                {footer.brandEyebrow || "Yachts • United Arab Emirates"}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#8E9EAF] leading-relaxed max-w-md font-light">
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
          <div className="space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              {footer.fleetHeading || "The Fleet"}
            </h4>
            <ul className="space-y-2.5 text-xs">
              {publishedYachts.length > 0 ? (
                publishedYachts.slice(0, 6).map((yacht) => (
                  <li key={yacht.id}>
                    <Link
                      href={`/yachts/${yacht.slug}`}
                      className="hover:text-white transition-colors flex items-center justify-between group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform text-white/90">
                        {yacht.name}
                      </span>
                      <span className="text-[9px] bg-[#C6A155]/20 text-[#DFBA73] px-1.5 py-0.5 font-bold tracking-widest uppercase">
                        {yacht.category || (yacht.specs?.lengthOverall ? `${yacht.specs.lengthOverall} FT` : "Yacht")}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between group">
                      <span className="group-hover:translate-x-0.5 transition-transform">G100</span>
                      <span className="text-[9px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 py-0.5 font-bold tracking-widest uppercase">Superyacht</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between group">
                      <span className="group-hover:translate-x-0.5 transition-transform">G77</span>
                      <span className="text-[9px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 py-0.5 font-bold tracking-widest uppercase">Luxury Yacht</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Experience Links (Manageable via CMS) */}
          <div className="space-y-4">
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
          <div className="space-y-4">
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
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-white">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="text-[#C6A155] hover:opacity-80 transition-opacity"
                    title="Direct Phone Call"
                    aria-label={`Call ${settings.contactPhone || "+971 56 526 8126"}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
                  </a>
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:opacity-80 transition-opacity"
                    title="Chat on WhatsApp"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a 
                    href={`tel:${cleanPhone}`} 
                    className="hover:text-[#C6A155] font-mono transition-colors"
                  >
                    {settings.contactPhone || "+971 56 526 8126"}
                  </a>
                </div>
                <p className="text-[#C6A155] font-semibold pt-0.5">
                  <a href={`mailto:${settings.contactEmail || "info@asmaraty.com"}`} className="hover:underline">
                    {settings.contactEmail || "info@asmaraty.com"}
                  </a>
                </p>
                <div className="pt-2">
                  <a
                    href={social.instagram || "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-[#DFBA73] transition-colors group"
                    title="Follow ASMARATY on Instagram"
                  >
                    <span className="p-1 rounded bg-[#C6A155]/10 border border-[#C6A155]/40 text-[#DFBA73] group-hover:bg-[#C6A155] group-hover:text-black transition-colors">
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-mono text-[11px] tracking-wider">@asmaraty_yachts</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-white/60">
            <p>{footer.copyrightText || "© 2026 ASMARATY LLC. All rights reserved."}</p>
            <span className="text-[#243550] hidden sm:inline">•</span>
            <p className="text-[#8E9EAF]">
              {footer.tagline || "Official Shipyard & Luxury Naval Architecture UAE"}
            </p>
          </div>

          {/* Social Channels (Manageable via CMS) */}
          <div className="flex items-center gap-4 text-white/60">
            <a
              href={social.instagram || "https://www.instagram.com/asmaraty_yachts?mdxt=NnA5dGNweTYwNDB6"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DFBA73] hover:text-white transition-colors p-1.5 bg-white/5 hover:bg-[#C6A155]/20 border border-[#C6A155]/40 rounded flex items-center gap-1.5"
              aria-label="ASMARATY Official Instagram"
              title="Follow @asmaraty_yachts on Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider hidden sm:inline">Instagram</span>
            </a>
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C6A155] transition-colors p-1"
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
                className="hover:text-[#C6A155] transition-colors p-1"
                aria-label="ASMARATY LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C6A155] transition-colors p-1"
                aria-label="ASMARATY YouTube"
                title="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            )}
            {social.twitter && (
              <a
                href={social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#C6A155] transition-colors p-1"
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
