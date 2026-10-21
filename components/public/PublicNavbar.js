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
import { getAllPages, getAllYachts } from "@/lib/cmsStore";

export default function PublicNavbar({ currentPageId, showAdminBar = false }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [yachts, setYachts] = useState(() => getAllYachts().filter((y) => y.status !== "draft"));
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
    const handleUpdate = () => {
      setYachts(getAllYachts().filter((y) => y.status !== "draft"));
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
    { label: "Concept & Shipyard", href: "/about" },
    { label: "News & Events", href: "/news" },
    { label: "VIP Concierge", href: "/contact" },
  ];

  return (
    <>
      {/* Top Demo Bar / Nuvyara Digital Prototype Header */}
      <div className="bg-[#08101C] border-b border-white/10 text-xs py-2 px-4 sm:px-8 text-[#A0AAB8] z-50 relative select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-[#C6A155] tracking-wider uppercase text-[10px]">
              ASMARATY CMS
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-[#8E9CAE] text-[11px]">
              Saxdor-Inspired Visual Architecture
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/admin/editor/${pageIdToEdit}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#101A29] hover:bg-[#C6A155] hover:text-[#08101C] text-[#D8C29D] border border-white/10 text-[11px] font-medium transition-all"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Page</span>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C6A155] hover:bg-white text-[#08101C] text-[11px] font-bold tracking-wider uppercase transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>CMS Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Saxdor-Style Main Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#08101C]/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-2xl"
            : "bg-gradient-to-b from-[#08101C]/95 via-[#08101C]/70 to-transparent py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Left: Saxdor 3-Line Panel Menu Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => setPanelMenuOpen(true)}
              className="p-1 -ml-1 text-white hover:text-[#C6A155] transition-colors flex items-center gap-3 group cursor-pointer"
              aria-label="Open menu"
            >
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 10H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                <path d="M7.5 17H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
                <path d="M7.5 24H26.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline text-xs font-bold tracking-[0.2em] uppercase text-white/90 group-hover:text-[#C6A155]">
                Menu
              </span>
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 border border-[#C6A155]/60 flex items-center justify-center bg-[#0E2047] text-[#C6A155] group-hover:border-white transition-all">
                <Anchor className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-center">
                <span className="font-sans tracking-[0.24em] text-base sm:text-lg font-light text-white uppercase group-hover:text-[#DFBA73] transition-colors leading-tight">
                  ASMARATY
                </span>
                <span className="text-[8px] tracking-[0.3em] text-[#C6A155] font-sans uppercase font-medium">
                  Yachts & Boats UAE
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action: Saxdor-Style Solid White CTA Button */}
          <div className="flex items-center gap-4">
            <a
              href="tel:1234567890"
              className="hidden lg:flex items-center gap-2 text-xs text-white/70 hover:text-[#C6A155] transition-colors font-mono"
            >
              <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>+971 1234567890</span>
            </a>

            <Link
              href="/contact"
              className="saxdor-btn-solid !h-[42px] !min-h-[42px] !min-w-0 !px-6 !text-xs font-bold rounded-none"
            >
              <span>Discuss Build</span>
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
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-[#C6A155]/60 flex items-center justify-center bg-[#08101C] text-[#C6A155]">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-white tracking-[0.16em] uppercase">
                    ASMARATY
                  </h3>
                  <p className="text-[10px] text-[#C6A155] tracking-[0.2em] uppercase font-medium">
                    European & Arabian Maritime Excellence
                  </p>
                </div>
              </div>

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
                          {yacht.specs?.lengthOverall} • {yacht.specs?.maxSpeed}
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
                    { label: "Concept & Naval Architecture", href: "/about" },
                    { label: "UAE Shipyard & Facilities", href: "/about" },
                    { label: "Newsroom & Sea Trials", href: "/news" },
                    { label: "Private VIP Sea Trials", href: "/contact" },
                    { label: "Dealers & Global Network", href: "/contact" },
                    { label: "CMS Content Studio", href: "/admin" },
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
