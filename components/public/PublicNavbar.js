"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Anchor, 
  X, 
  Sparkles, 
  Edit3, 
  Phone, 
  ArrowUpRight,
  ChevronRight,
  Compass,
  Ship,
  Layers
} from "lucide-react";
import { getAllPages, getAllYachts, syncYachtsFromServer } from "@/lib/cmsStore";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";

export default function PublicNavbar({ currentPageId, showAdminBar = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [yachts, setYachts] = useState(() => getAllYachts().filter((y) => y.status === "published"));
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
    // Dynamic sync from server database API so admin-added models appear live in navbar
    syncYachtsFromServer(true).then((synced) => {
      if (synced && Array.isArray(synced) && synced.length > 0) {
        setYachts(synced.filter((y) => y.status === "published"));
      }
    });

    const handleUpdate = () => {
      setYachts(getAllYachts().filter((y) => y.status === "published"));
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
    { label: "News & Events", href: "/news" },
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
                Menu
              </span>
            </button>
          </div>

          {/* Center: Official ASMARATY Brand Logo - Mathematically Centered on All Responsive Screens */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto">
            <AsmaratyLogo 
              variant="horizontal" 
              priority={true} 
            />
          </div>

          {/* Right Action: Saxdor-Style Solid White CTA Button */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1 z-10">
            <a
              href="tel:1234567890"
              className="hidden lg:flex items-center gap-2 text-xs text-white/70 hover:text-[#C6A155] transition-colors font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>+971 1234567890</span>
            </a>

            <Link
              href="/contact"
              className="saxdor-btn-solid !h-[36px] sm:!h-[42px] !min-h-0 !min-w-0 !px-3 sm:!px-6 !text-[11px] sm:!text-xs font-bold rounded-none whitespace-nowrap"
            >
              <span className="hidden sm:inline">Discuss Build</span>
              <span className="inline sm:hidden">Enquire</span>
            </Link>
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
                className="h-12 sm:h-14" 
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
                    The Fleet Collection
                  </span>
                  <Link
                    href="/yachts"
                    onClick={() => setPanelMenuOpen(false)}
                    className="text-[11px] text-white/60 hover:text-white uppercase tracking-wider flex items-center gap-1 font-medium"
                  >
                    <span>View All</span>
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

              {/* Main Navigation Links */}
              <div>
                <span className="text-xs uppercase tracking-[0.22em] text-[#C6A155] font-semibold block mb-3 pb-2 border-b border-white/10">
                  Shipyard & Company
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "About Us", href: "/about" },
                    { label: "News", href: "/news" },
                    { label: "Contact Us", href: "/contact" },
                    { label: "Bespoke Yacht Commissions", href: "/#enquiry-form" },
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setPanelMenuOpen(false)}
                      className="py-2.5 px-3 bg-[#08101C] hover:bg-[#0E2047] border border-white/5 text-white/90 hover:text-white text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-between group"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact Bar */}
              <div className="p-5 bg-[#0E2047]/50 border border-white/10 text-xs text-white/80 space-y-2">
                <div className="font-semibold text-white tracking-wider uppercase text-[11px]">
                  ASMARATY Shipyard HQ
                </div>
                <p className="text-[11px] text-white/60">
                  Maritime District, United Arab Emirates • Direct VIP Advisory
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-[#C6A155]">
                  <a href="tel:1234567890" className="hover:underline font-mono">
                    +971 1234567890
                  </a>
                  <a href="mailto:info@asmaraty.fake" className="hover:underline">
                    info@asmaraty.fake
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer CTA */}
            <div className="p-6 border-t border-white/10 bg-[#08101C] flex items-center justify-between">
              <span className="text-[11px] text-white/50 tracking-wider">
                Experience bespoke nautical engineering
              </span>
              <Link
                href="/contact"
                onClick={() => setPanelMenuOpen(false)}
                className="saxdor-btn-solid !h-[44px] !min-h-[44px] !min-w-0 !px-7 !text-xs rounded-none"
              >
                Book Sea Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
