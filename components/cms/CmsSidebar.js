"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Layers, 
  Anchor, 
  Images, 
  Sliders, 
  ExternalLink, 
  RotateCcw, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  LogOut,
  UserCheck
} from "lucide-react";
import { resetAllDemoData } from "@/lib/cmsStore";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";

export default function CmsSidebar({ currentUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { label: "Pages & Sections", href: "/admin", icon: Layers, exact: true },
    { label: "Yacht Models", href: "/admin/yachts", icon: Anchor },
    { label: "Media Library", href: "/admin/media", icon: Images },
    { label: "Settings & System", href: "/admin/settings", icon: Sliders },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/admin/login");
    }
  };

  const handleResetData = () => {
    resetAllDemoData();
    setShowResetConfirm(false);
    router.refresh();
    window.location.reload();
  };

  return (
    <>
      <aside className="w-64 bg-[#0A0D14] border-r border-[#1B2230] flex flex-col justify-between flex-shrink-0 min-h-screen text-[#9DAAB8]">
        {/* Top: Brand & Identity */}
        <div>
          <div className="p-6 border-b border-[#1B2230]">
            <Link href="/admin" className="block group">
              <AsmaratyLogo variant="horizontal" className="h-7" />
              <p className="mt-2 text-[9px] uppercase tracking-widest text-[#C5A880] font-sans font-medium pl-1">
                Shipyard Content Studio
              </p>
            </Link>

            {/* Authenticated Admin User Status */}
            <div className="mt-4 p-2.5 rounded bg-[#121824] border border-[#232E42] flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-[#1B273A] border border-[#C5A880]/50 flex items-center justify-center text-[#C5A880] flex-shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] font-medium text-white block truncate">
                    {currentUser?.email || "admin@asmaraty.ae"}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-[#C5A880] block">
                    {currentUser?.role || "Administrator"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-[#5C697A] font-semibold">
              Management
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs transition-all duration-200 group ${
                    isActive
                      ? "bg-[#C5A880] text-[#080B10] font-semibold shadow-md"
                      : "text-[#A7B3C2] hover:bg-[#141A26] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#080B10]" : "text-[#7F8D9F] group-hover:text-[#C5A880]"}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-[#080B10] opacity-100" : ""}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#1B2230] space-y-2">
          {/* View Public Website */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs bg-[#121824] hover:bg-[#1A2333] text-[#D1D9E4] transition-colors border border-white/5"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Public Live Site</span>
            </div>
            <span className="text-[10px] text-[#C5A880]">Live</span>
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-[#A7B3C2] hover:text-white hover:bg-[#17202C] rounded-sm transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
            </div>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#7E8B9C] hover:text-red-300 hover:bg-red-950/20 rounded-sm transition-colors text-left cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

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
              This will restore all pages, sections, yacht fleet models, and media assets back to the original ASMARATY luxury demonstration defaults. Any custom changes you made in localStorage will be cleared.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs text-[#A7B2C2] hover:bg-white/5 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded tracking-wider cursor-pointer"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
