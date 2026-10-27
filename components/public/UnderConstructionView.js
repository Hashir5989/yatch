"use client";

import Link from "next/link";
import { 
  Anchor, 
  ArrowLeft, 
  ArrowUpRight, 
  Compass, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Layers, 
  CheckCircle2 
} from "lucide-react";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";

export default function UnderConstructionView({
  pageTitle = "Page Under Construction",
  pageSlug = "",
  description = "This section is currently under construction. Please explore our official yacht models and verified specifications on our Home page, or contact our private client advisory team.",
  customBadge = "UNDER CONSTRUCTION",
  yacht = null
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#08101C] text-[#E8EEF5]">
      <PublicNavbar />

      <main className="flex-1 flex flex-col justify-center items-center relative overflow-hidden py-24 sm:py-32 px-6 sm:px-12">
        {/* Subtle background glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: "radial-gradient(circle at 50% 35%, rgba(198, 161, 85, 0.12) 0%, rgba(8, 16, 28, 0.6) 55%, rgba(8, 16, 28, 1) 100%)"
          }}
        />

        <div className="relative z-10 max-w-3xl w-full text-center space-y-8">
          {/* Emblem & Badge */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <AsmaratyLogo variant="full" className="h-16 sm:h-20" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0E2047]/80 border border-[#C6A155]/40 text-[#C6A155] text-[11px] font-semibold tracking-[0.2em] uppercase">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{customBadge}</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="font-sans text-3xl sm:text-5xl lg:text-6xl font-light text-white uppercase tracking-[0.04em] leading-tight">
              {pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-[#9DAAB8] max-w-xl mx-auto leading-relaxed font-normal">
              {description}
            </p>
          </div>

          {/* Route path badge */}
          {pageSlug && (
            <div className="inline-block px-3 py-1 bg-[#101B2E] border border-white/10 text-xs font-mono text-[#C6A155]">
              Path: {pageSlug}
            </div>
          )}

          {/* Model Preview Card if yacht prop is passed */}
          {yacht && (
            <div className="max-w-md mx-auto bg-[#0E1A2D]/85 border border-[#C6A155]/40 overflow-hidden text-left shadow-2xl">
              {(yacht.mainImage || yacht.primaryImage) && (
                <div className="relative aspect-[16/9] overflow-hidden bg-black/40">
                  <img
                    src={yacht.mainImage || yacht.primaryImage}
                    alt={yacht.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2D] via-transparent to-transparent opacity-90" />
                  <div className="absolute top-3 left-3 bg-[#08101C]/90 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[#C6A155] font-semibold border border-[#C6A155]/30">
                    {yacht.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-[#08101C]/90 px-2.5 py-1 text-[10px] text-white/90 font-mono border border-white/20">
                    {(yacht.specs?.lengthOverall || yacht.length || "").toUpperCase()}
                  </div>
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C6A155] font-semibold">
                    {yacht.series || yacht.category}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">Dossier In Production</span>
                </div>
                <h3 className="font-sans text-xl font-light text-white uppercase tracking-wider">
                  {yacht.name}
                </h3>
                {yacht.tagline && (
                  <p className="text-xs text-[#C6A155]/90 italic font-serif">
                    “{yacht.tagline}”
                  </p>
                )}
                {yacht.specs?.hullMaterial && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#9DAAB8]">
                    <span>Hull Material:</span>
                    <span className="text-white font-medium">{yacht.specs.hullMaterial}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 w-full max-w-xl mx-auto">
            <Link
              href="/"
              className="saxdor-btn-solid !h-[48px] sm:!h-[50px] !px-6 sm:!px-8 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO HOME</span>
            </Link>
            <Link
              href="/#fleet"
              className="saxdor-btn-navy-outline !h-[48px] sm:!h-[50px] !px-6 sm:!px-8 text-xs font-bold text-white border-white/20 hover:border-[#C6A155] inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>EXPLORE FLEET MODELS</span>
              <ArrowUpRight className="w-4 h-4 text-[#C6A155]" />
            </Link>
            <Link
              href="/#enquiry-form"
              className="saxdor-btn-navy-outline !h-[48px] sm:!h-[50px] !px-6 sm:!px-8 text-xs font-bold text-white border-white/20 hover:border-[#C6A155] inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto text-center"
            >
              <span>DIRECT ENQUIRY</span>
              <ArrowUpRight className="w-4 h-4 text-[#C6A155]" />
            </Link>
          </div>

          {/* Client Advisory Contact Card */}
          <div className="mt-12 p-6 sm:p-8 bg-[#0E1A2D]/70 border border-white/10 text-left max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#C6A155] font-semibold flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C6A155]" />
                PRIVATE CLIENT ADVISORY
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Inquiries Open</span>
            </div>

            <p className="text-xs text-[#9DAAB8] leading-relaxed">
              Our bespoke shipyard representatives in the United Arab Emirates are available for private consultations, custom commissions, and sea trial arrangements.
            </p>

            {/* Shipyard Direct Contact */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#9DAAB8]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
                <span className="text-white">+971 56 526 8126</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C6A155]" />
                <span className="text-white">info@asmaraty.fake</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C6A155]" />
                <span>UAE Headquarters</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
