import Link from "next/link";
import { Anchor, ArrowUpRight, Shield, Award, Compass, Sparkles } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-[#08101C] border-t border-[#152338] text-[#8E9EAF] pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#152338]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-[#C6A155]/60 flex items-center justify-center bg-[#0E2047] text-[#C6A155]">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="saxdor-title text-base tracking-[0.18em] text-white uppercase font-light">
                  ASMARATY
                </h3>
                <p className="saxdor-eyebrow text-[9px] tracking-[0.24em] text-[#C6A155] uppercase font-bold">
                  Yachts & Boats • United Arab Emirates
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#8E9EAF] leading-relaxed max-w-md font-light">
              Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels where Scandinavian architectural clarity meets Arabian endurance.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#C6A155] tracking-wider uppercase font-semibold">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>RINA / CE Certified</span>
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
                <Link href="/yachts/as-100" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-0.5 transition-transform">AS 100 Tri-Deck</span>
                  <span className="text-[9px] bg-[#C6A155]/20 text-[#C6A155] px-1.5 py-0.5 font-bold tracking-widest uppercase">Flagship</span>
                </Link>
              </li>
              <li>
                <Link href="/yachts/magellan-32" className="hover:text-white transition-colors block hover:translate-x-0.5">
                  Magellan 32 Explorer
                </Link>
              </li>
              <li>
                <Link href="/yachts/as-88" className="hover:text-white transition-colors block hover:translate-x-0.5">
                  AS 88 Flybridge
                </Link>
              </li>
              <li>
                <Link href="/yachts/as-68" className="hover:text-white transition-colors block hover:translate-x-0.5">
                  AS 68 Sports Cruiser
                </Link>
              </li>
              <li>
                <Link href="/yachts/as-45" className="hover:text-white transition-colors block hover:translate-x-0.5">
                  AS 45 Island Explorer
                </Link>
              </li>
              <li>
                <Link href="/yachts/as-38" className="hover:text-white transition-colors block hover:translate-x-0.5">
                  AS 38 Offshore GT
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
                  About Our Shipyard
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
              <li>
                <Link href="/admin" className="text-[#C6A155] hover:text-[#DFC27D] flex items-center gap-1.5 font-semibold tracking-wider transition-colors">
                  <Sparkles className="w-3 h-3" />
                  <span>CMS Studio Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Shipyard Contact */}
          <div className="space-y-4">
            <h4 className="saxdor-eyebrow text-xs font-bold text-white uppercase tracking-[0.18em]">
              ASMARATY Shipyard HQ
            </h4>
            <div className="space-y-2.5 text-xs text-[#8E9EAF]">
              <p>ASMARATY Shipyard</p>
              <p>Maritime Industrial Zone, UAE</p>
              <p className="text-white pt-1 font-medium">Tel: +971 1234567890</p>
              <p className="text-[#C6A155] font-semibold">info@asmaraty.fake</p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C6A155] hover:text-white transition-colors font-medium"
                >
                  <span>Private Helipad Coordinates</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Demo Attribution */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p>© 2026 ASMARATY LLC. All rights reserved.</p>
            <span className="text-[#243550] hidden sm:inline">•</span>
            <p className="text-[#64768C]">
              Design aesthetic inspired by Saxdor Yachts & ASMARATY UAE
            </p>
          </div>

          {/* Nuvyara Digital CMS Badge */}
          <div className="flex items-center gap-2 bg-[#0E2047] px-4 py-2 border border-[#1E335B]">
            <span className="w-1.5 h-1.5 bg-[#C6A155]"></span>
            <span className="text-[#B5C2D4]">CMS Solution Prototype by</span>
            <span className="text-white font-semibold tracking-wider">Nuvyara Digital</span>
            <Link
              href="/admin"
              className="ml-2 text-[#C6A155] hover:text-white underline text-[11px] font-bold tracking-widest uppercase"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
