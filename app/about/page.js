"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Gem, Waves, Users } from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";

export default function AboutPage() {
  const values = [
    {
      title: "Craftsmanship",
      desc: "Meticulously crafted yachts for the ultimate experience.",
      icon: Gem,
    },
    {
      title: "Trust & Integrity",
      desc: "A relationship built on transparency and reliability.",
      icon: ShieldCheck,
    },
    {
      title: "Innovation",
      desc: "Constantly evolving for a better tomorrow.",
      icon: Waves,
    },
    {
      title: "Personalised Experiences",
      desc: "Tailored journeys, designed around you.",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#0A121E] selection:bg-[#C6A155] selection:text-black font-sans">
      {/* Public Navigation */}
      <PublicNavbar currentPageId="page-about" />

      <main className="flex-1">
        {/* =========================================================
            SECTION 1: HERO — A Legacy of Excellence on the Water
           ========================================================= */}
        <section className="relative min-h-[78vh] sm:min-h-[84vh] flex items-center overflow-hidden bg-[#070D18]">
          {/* Background ASMARATY Flagship Yacht */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/g100-burj-al-arab.jpg"
              alt="ASMARATY Flagship Yacht Dubai"
              className="w-full h-full object-cover object-center scale-105 filter brightness-[0.80] contrast-[1.08]"
            />
            {/* Ambient luxury gradients for typographic clarity */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/65 to-transparent sm:via-[#070D18]/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/90 via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-28 sm:py-36">
            <div className="max-w-2xl">
              {/* Eyebrow with gold horizontal accent line */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#C6A155] font-semibold">
                  ABOUT US
                </span>
                <span className="w-16 h-[1.5px] bg-[#C6A155]/80" />
              </div>

              {/* Semantic Luxury H1 */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] text-white font-normal leading-[1.12] tracking-tight">
                A Legacy of
                <br />
                Excellence on the Water
              </h1>

              {/* Lead Narrative */}
              <p className="text-base sm:text-lg text-[#D0D9E4] font-light leading-relaxed mt-6 mb-8 max-w-xl">
                At ASMARATY, we believe in more than just luxury — we believe in creating unforgettable journeys.
              </p>

              {/* Gold decorative bar */}
              <div className="w-20 h-[2px] bg-[#C6A155]" />
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: OUR STORY — Crafting Exceptional Yachting Experiences
           ========================================================= */}
        <section id="story" className="bg-[#FAF8F5] py-20 lg:py-28 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Narrative & Action */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                    OUR STORY
                  </span>
                  <span className="w-14 h-[1.5px] bg-[#A68037]/60" />
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal leading-[1.18] tracking-tight">
                  Crafting Exceptional
                  <br />
                  Yachting Experiences
                </h2>

                <p className="text-[#556375] text-base sm:text-[17px] font-light leading-relaxed">
                  Since 1979, ASMARATY has pioneered composite boat and high-performance yacht manufacturing across the Arabian Gulf, crafting custom naval vessels that set new standards in luxury and performance.
                </p>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 bg-[#0B1523] hover:bg-[#162338] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-xl group"
                  >
                    <span>Discover Our Journey</span>
                    <ArrowRight className="w-4 h-4 text-[#C6A155] group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Meaningful Fleet & Craftsmanship Visual */}
              <div className="lg:col-span-6 relative">
                {/* Soft warm champagne backdrop shape */}
                <div className="absolute -inset-6 bg-[#EFE9DD] rounded-full blur-2xl opacity-70 pointer-events-none" />

                <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-[#E8E2D5] bg-[#EFECE5] group">
                  <img
                    src="/images/asmaraty-four-yachts-journey.jpg"
                    alt="ASMARATY Fleet Formation Cruising Arabian Gulf"
                    className="w-full h-[320px] sm:h-[400px] lg:h-[440px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Floating Heritage Badge */}
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-[#0B1523]/85 backdrop-blur-md border border-[#C6A155]/30 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#FAF8F5] font-semibold">
                      UAE Naval Heritage • Since 1979
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transition Key Metrics Bar: 1979 | UAE | Excellence */}
        <section className="bg-[#EFECE5] border-y border-[#E2DDD2] py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6D0C3] text-center">
              <div className="py-6 md:py-2 md:px-8">
                <div className="font-serif text-4xl sm:text-5xl font-normal text-[#0A121E] tracking-tight">
                  1979
                </div>
                <div className="text-xs sm:text-sm text-[#667484] font-light mt-2 tracking-wide uppercase">
                  Heritage
                </div>
              </div>
              <div className="py-6 md:py-2 md:px-8">
                <div className="font-serif text-4xl sm:text-5xl font-normal text-[#0A121E] tracking-tight">
                  UAE
                </div>
                <div className="text-xs sm:text-sm text-[#667484] font-light mt-2 tracking-wide uppercase">
                  Home Waters
                </div>
              </div>
              <div className="py-6 md:py-2 md:px-8">
                <div className="font-serif text-4xl sm:text-5xl font-normal text-[#0A121E] tracking-tight">
                  Excellence
                </div>
                <div className="text-xs sm:text-sm text-[#667484] font-light mt-2 tracking-wide uppercase">
                  Our Standard
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: OUR VALUES — Built on Trust. Driven by Passion.
           ========================================================= */}
        <section id="values" className="bg-[#FAF8F5] py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
            {/* Centered Section Header with Flanking Lines */}
            <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-4 mb-4">
                <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
                <span className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[#A68037] font-semibold">
                  OUR VALUES
                </span>
                <span className="w-12 h-[1.5px] bg-[#A68037]/60" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#0A121E] font-normal tracking-tight">
                Built on Trust. Driven by Passion.
              </h2>

              <p className="text-[#556375] text-sm sm:text-base font-light mt-4 max-w-2xl mx-auto leading-relaxed">
                We are committed to delivering unparalleled quality, innovation, and personalized experiences for every client.
              </p>
            </div>

            {/* 4 Values Pillars with Subtle Thin Vertical Dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD3]">
              {values.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div key={idx} className="p-6 sm:p-8 flex flex-col items-center text-center group">
                    <div className="w-14 h-14 rounded-full bg-[#EFECE5] flex items-center justify-center mb-5 text-[#C6A155] group-hover:bg-[#0B1523] group-hover:text-[#C6A155] transition-all duration-300 shadow-sm">
                      <IconComponent className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <h3 className="font-serif text-xl sm:text-[22px] font-normal text-[#0A121E] mb-2 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#697787] font-light leading-relaxed max-w-xs">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: FINAL CTA — Your Journey Begins Here
           ========================================================= */}
        <section className="relative min-h-[50vh] sm:min-h-[55vh] flex items-center overflow-hidden bg-[#070D18]">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="/images/a77-journey-bg.jpg"
              alt="ASMARATY Superyacht Cruising Open Ocean"
              className="w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.08]"
            />
            {/* Left dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/65 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/80 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 w-full py-20 sm:py-24">
            <div className="max-w-xl space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                Your Journey Begins Here
              </h2>

              <p className="text-[#D0D9E4] text-base sm:text-lg font-light leading-relaxed pb-4">
                Explore our exclusive yacht collection and experience the ASMARATY difference.
              </p>

              <div>
                <Link
                  href="/yachts"
                  className="inline-flex items-center gap-3 bg-[#E5B869] hover:bg-[#D9AA58] text-[#0A111E] text-sm font-semibold px-8 py-4 rounded-full transition-all shadow-xl hover:shadow-2xl group"
                >
                  <span>Explore Our Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
