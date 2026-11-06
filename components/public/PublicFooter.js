import Link from "next/link";
import { Anchor, ArrowUpRight, Shield, Award, Compass, Sparkles, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";

export default function PublicFooter() {
  return (
    <footer className="bg-[#08101C] border-t border-[#152338] text-[#8E9EAF] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 pb-16 border-b border-[#152338]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col items-start gap-2">
              <AsmaratyLogo variant="full" imgClassName="h-14 sm:h-16 md:h-18" />
              <p className="saxdor-eyebrow text-[9px] tracking-[0.26em] text-[#C6A155] uppercase font-bold pl-1">
                Yachts • United Arab Emirates
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#8E9EAF] leading-relaxed max-w-md font-light">
              Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels where architectural clarity meets endurance at sea.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C6A155] tracking-wider uppercase font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Certified Yachts</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>45+ Years Heritage</span>
              </div>
            </div>
          </div>

          {/* Fleet Links */}
          <div className="space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              The Fleet
            </h4>
            <ul className="space-y-2.5 text-xs">
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
              <li>
                <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition-transform">G66</span>
                  <span className="text-[9px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 py-0.5 font-bold tracking-widest uppercase">Flybridge</span>
                </Link>
              </li>
              <li>
                <Link href="/#fleet" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition-transform">G50</span>
                  <span className="text-[9px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 py-0.5 font-bold tracking-widest uppercase">Motor Yacht</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Experience Links */}
          <div className="space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              Experience
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/yachts" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  News & Boat Shows
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Book Sea Trial
                </Link>
              </li>
            </ul>
          </div>

          {/* Headquarters / Contact */}
          <div className="space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              Headquarters
            </h4>
            <div className="space-y-2 text-xs text-[#8E9EAF] leading-relaxed">
              <p className="text-white font-semibold tracking-wide">AL SHAALI MARINE</p>
              <p>RASHIDIA 1</p>
              <p>AJMAN, United Arab Emirates</p>
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-white">
                  <a
                    href="tel:+971565268126"
                    className="text-[#C6A155] hover:opacity-80 transition-opacity"
                    title="Direct Phone Call"
                    aria-label="Call +971 56 526 8126"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
                  </a>
                  <a
                    href="https://wa.me/971565268126?text=Hello%20ASMARATY%2C%20I%20would%20like%20to%20enquire%20about%20your%20yacht%20fleet."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:opacity-80 transition-opacity"
                    title="Chat on WhatsApp"
                    aria-label="WhatsApp +971 56 526 8126"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a href="tel:+971565268126" className="hover:text-[#C6A155] font-mono transition-colors">
                    +971 56 526 8126
                  </a>
                </div>
                <p className="text-[#C6A155] font-semibold pt-0.5">
                  <a href="mailto:info@asmaraty.com" className="hover:underline">info@asmaraty.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© 2026 ASMARATY LLC. All rights reserved.</p>
            <span className="text-[#243550] hidden sm:inline">•</span>
            <p className="text-[#64768C]">
              Official Shipyard & Luxury Naval Architecture UAE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
