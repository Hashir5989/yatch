"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowUpRight, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/cmsStore";

export function WhatsAppIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.979-.275-.1-.476-.15-.676.15-.2.301-.776.979-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.3-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.677-.517-.175-.009-.376-.011-.577-.011-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.91 1.228 3.111.15.201 2.12 3.238 5.136 4.542.717.31 1.277.496 1.713.634.72.229 1.375.196 1.894.119.578-.087 1.78-.727 2.03-1.429.25-.702.25-1.304.175-1.43-.075-.125-.275-.2-.576-.351zM12.04 2C6.52 2 2.03 6.49 2.03 12.01c0 1.98.58 3.82 1.58 5.37L2 22l4.78-1.55c1.49.88 3.22 1.38 5.26 1.38 5.52 0 10.01-4.49 10.01-10.01C22.05 6.49 17.56 2 12.04 2zm0 18.25c-1.78 0-3.44-.52-4.85-1.41l-.35-.22-2.85.93.94-2.77-.24-.37A8.19 8.19 0 0 1 3.85 12c0-4.52 3.67-8.19 8.19-8.19 4.52 0 8.19 3.67 8.19 8.19 0 4.52-3.67 8.25-8.19 8.25z" />
    </svg>
  );
}

export default function WhatsAppConcierge() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("971565268126");
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    try {
      const settings = getSiteSettings();
      const phone = settings?.contactPhone || "+971 56 526 8126";
      // Clean digits only for wa.me
      const cleaned = phone.replace(/[^0-9]/g, "");
      if (cleaned) setPhoneNumber(cleaned);
    } catch {
      // fallback
    }

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not show widget on admin dashboard
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const defaultMessage = encodeURIComponent(
    "Hello ASMARATY, I would like to enquire about your luxury yacht collection and arrange a private consultation."
  );

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside aria-label="VIP WhatsApp Concierge" className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Expandable Luxury Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-[#0A1526]/95 backdrop-blur-md border border-[#C6A155]/40 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start justify-between pb-3 border-b border-[#1E2E48]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 border border-[#25D366]/50 flex items-center justify-center text-[#25D366]">
                <WhatsAppIcon className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wider uppercase font-sans">
                  ASMARATY Concierge
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-[#25D366] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>Online • Typical reply in minutes</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8E9EAF] hover:text-white p-1 transition-colors"
              aria-label="Close WhatsApp Concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 text-xs text-[#CBD5E1] leading-relaxed font-light">
            Welcome to <strong className="text-white font-medium">ASMARATY Luxury Yachts</strong>. Connect directly with our Senior Naval Advisory Team for confidential fleet specifications, build slots, or private sea trial bookings.
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full mt-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-[#08101C] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)]"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current" />
            <span>Open WhatsApp Chat</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="relative group flex items-center">
        {/* Subtle hover tooltip badge */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 bg-[#0A1526]/90 backdrop-blur-md border border-[#C6A155]/40 text-xs text-white hover:text-[#C6A155] shadow-lg transition-all opacity-95 group-hover:opacity-100"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span className="text-[11px] font-semibold tracking-wider uppercase font-sans">
              VIP WhatsApp Concierge
            </span>
          </button>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Chat on WhatsApp with ASMARATY Concierge"
          className="relative w-14 h-14 rounded-full bg-[#0E1E34] border-2 border-[#C6A155] text-[#25D366] hover:text-white hover:border-[#25D366] shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          {/* Subtle pulse wave */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping opacity-60 pointer-events-none" />

          {/* Green active status indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#25D366] border-2 border-[#08101C] shadow-sm z-10" />

          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform" />
          ) : (
            <WhatsAppIcon className="w-7 h-7 fill-[#25D366] group-hover:fill-white transition-colors" />
          )}
        </button>
      </div>
    </aside>
  );
}
