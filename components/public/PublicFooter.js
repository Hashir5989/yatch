import Link from "next/link";
import { Anchor, ArrowUpRight, Shield, Award, Compass, Sparkles } from "lucide-react";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";

export default function PublicFooter() {
  return (
    <footer className="bg-[#08101C] border-t border-[#152338] text-[#8E9EAF] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12 pb-16 border-b border-[#152338]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col items-start gap-2">
              <AsmaratyLogo variant="full" imgClassName="h-14 sm:h-16" />
              <p className="saxdor-eyebrow text-[9px] tracking-[0.26em] text-[#C6A155] uppercase font-bold pl-1">
                Boats & Yatchs • United Arab Emirates
              </p>
            </div>
            <p className="text-xs sm:text-sm text-[#8E9EAF] leading-relaxed max-w-md font-light">
              Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels where architectural clarity meets endurance at sea.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C6A155] tracking-wider uppercase font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Certified Boats & Yatchs</span>
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
                  <span className="group-hover:translate-x-0.5 transition-transform text-[#DFBA73] font-medium">G100</span>
                  <span className="text-[9px] bg-[#C6A155] text-[#08101C] px-1.5 py-0.5 font-bold tracking-widest uppercase">Flagship</span>
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
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
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
            <div className="space-y-1.5 text-xs text-[#8E9EAF] leading-relaxed">
              <p className="text-white font-semibold tracking-wide">AL SHAALI MARINE</p>
              <p>RASHIDIA 1</p>
              <p>AJMAN, United Arab Emirates</p>
              <p className="text-white pt-2 font-medium">Tel: +971 56 526 8126</p>
              <p className="text-[#C6A155] font-semibold">info@asmaraty.fake</p>
              <div className="pt-2">
                <a
                  href={`https://wa.me/971565268126?text=${encodeURIComponent("Hello ASMARATY, I would like to enquire about your yacht fleet.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:text-white transition-colors font-medium group"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                  <span>WhatsApp Concierge</span>
                  <ArrowUpRight className="w-3 h-3 text-[#25D366]/70 group-hover:text-white" />
                </a>
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
