"use client";

import Link from "next/link";
import { ExternalLink, Sparkles, Globe } from "lucide-react";

export default function CmsHeader({ title = "Content Studio", subtitle = "ASMARATY Website CMS" }) {
  return (
    <header className="h-16 bg-[#0B0F16] border-b border-[#1B2230] px-6 sm:px-8 flex items-center justify-between z-30">
      <div>
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-serif">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-[#7E8B9C] font-sans">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[#121824] border border-[#232E42] text-xs text-[#9DAAB8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]"></span>
          <span>ASMARATY Maritime Studio</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#17202C] hover:bg-[#C5A880] hover:text-[#080B10] text-[#D1D9E4] text-xs font-medium border border-[#28354A] transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Live Site Preview</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </Link>
      </div>
    </header>
  );
}
