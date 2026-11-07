"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Anchor, 
  Compass, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Download, 
  ArrowRight, 
  ArrowUpRight, 
  Check, 
  ChevronRight, 
  Gauge, 
  BedDouble, 
  Maximize2, 
  Send, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Ship,
  Eye
} from "lucide-react";
import { YACHT_SHOWCASES } from "@/lib/data/yachtShowcaseData";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";

const FLEET_MODELS = [
  {
    ...YACHT_SHOWCASES.g100,
    categoryKey: "superyacht",
    categoryLabel: "Superyacht",
    decks: "Tri-Deck",
    heroImage: "/images/yachts/g100/0.jpg",
    specsSnapshot: {
      loa: "100 FT (30.48 M)",
      beam: "22.91 FT (6.98 M)",
      draft: "7.5 FT (2.29 M)",
      power: "3,200 HP (2 × 1,600 HP MTU)",
      cabins: "5 + 2 Staterooms",
      berths: "12 + 5 Berths (17 Pax)",
      displacement: "95 Tons",
      fuel: "2,900 Gal (10,970 L)",
      water: "670 Gal (2,536 L)",
      hull: "Hand-Laid Honeycomb Composite",
    }
  },
  {
    ...YACHT_SHOWCASES.g77,
    categoryKey: "three-deck",
    categoryLabel: "Three-Deck Yacht",
    decks: "Three Decks",
    heroImage: "/images/yachts/g77/g77_asset_01_1672x941.jpg",
    specsSnapshot: {
      loa: "78 FT (23.77 M)",
      beam: "19.35 FT (5.90 M)",
      draft: "4.5 FT (1.37 M)",
      power: "2,400 HP (2 × 1,200 HP CAT)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "55 Tons",
      fuel: "1,600 Gal (6,056 L)",
      water: "400 Gal (1,514 L)",
      hull: "GRP Composite Three-Deck",
    }
  },
  {
    ...YACHT_SHOWCASES.g66,
    categoryKey: "flybridge",
    categoryLabel: "Flybridge Cruiser",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g66/hero-01.jpg",
    specsSnapshot: {
      loa: "66 FT (20.12 M)",
      beam: "20.00 FT (6.10 M)",
      draft: "3.5 FT (1.07 M)",
      power: "1,600 HP (2 × 800 HP Volvo)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "40 Tons",
      fuel: "1,870 Gal (7,080 L)",
      water: "300 Gal (1,135 L)",
      hull: "Hand-Laid Fiberglass Composite",
    }
  },
  {
    ...YACHT_SHOWCASES.g50,
    categoryKey: "motor-yacht",
    categoryLabel: "Luxury Motor Yacht",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g50/hero-01.jpg",
    specsSnapshot: {
      loa: "50 FT (15.00 M)",
      beam: "15.00 FT (4.50 M)",
      draft: "4.0 FT (1.35 M)",
      power: "1,100 HP (2 × 550 HP Cummins)",
      cabins: "3 Staterooms",
      berths: "6 Berths (15 Pax Capacity)",
      displacement: "15–20 Tons",
      fuel: "450 Gal (1,701 L)",
      water: "100 Gal (378 L)",
      hull: "Fiberglass Composite Sandwich",
    }
  }
];

const CATEGORIES = [
  { id: "all", label: "All Fleet (4)" },
  { id: "superyacht", label: "Superyachts" },
  { id: "three-deck", label: "Three-Deck Cruisers" },
  { id: "flybridge", label: "Flybridge Cruisers" },
  { id: "motor-yacht", label: "Motor Yachts" }
];

export default function UniversalYachtCatalogView() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedEnquiryModel, setSelectedEnquiryModel] = useState("All Fleet Inquiry");

  // Filtered models
  const filteredModels = FLEET_MODELS.filter((m) => {
    if (activeCategory === "all") return true;
    return m.categoryKey === activeCategory;
  });

  // Form State
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    modelInterested: "ASMARATY G-100 Super Yacht",
    message: "",
  });

  const handleSelectModelForEnquiry = (modelName) => {
    setFormData((prev) => ({ ...prev, modelInterested: modelName }));
    setSelectedEnquiryModel(modelName);
    const formElem = document.getElementById("catalog-enquiry");
    if (formElem) {
      formElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: "Website Fleet Catalogue",
          message: `[Model of Interest: ${formData.modelInterested}]\n\n${formData.message}`,
          consentPrivacy: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit enquiry. Please try again.");
      }
    } catch (err) {
      console.warn("Could not submit enquiry:", err);
      setErrorMessage("Network error. Please try again or reach out on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. CATALOG HERO BANNER
          ------------------------------------------------------------- */}
      <section className="relative min-h-[75vh] lg:min-h-[82vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/yachts/g100/0.jpg"
            alt="ASMARATY Luxury Yacht Fleet"
            className="w-full h-full object-cover object-center scale-105 filter brightness-[0.6] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/70 to-[#080B10]/60" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#080B10]/40 to-[#080B10]/90 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-28 text-center flex flex-col items-center">
          {/* Insignia / Eyebrow */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#0E1A2D]/80 border border-[#C6A155]/40 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#DFBA73]">
              The Official ASMARATY Fleet
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-normal text-white uppercase tracking-[0.03em] leading-[1.08] mb-6 max-w-5xl">
            The Fleet of Distinction
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-white/80 font-light max-w-3xl mx-auto leading-relaxed mb-10 text-justify sm:text-center">
            Handcrafted composite superyachts and luxury motor yachts engineered in the United Arab Emirates since 1979. Each vessel unites naval precision, sunlit panoramic architecture, and bespoke master craftsmanship.
          </p>

          {/* Quick Model Jump Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-12">
            {FLEET_MODELS.map((m) => (
              <a
                key={m.slug}
                href={`#yacht-${m.slug}`}
                className="px-5 py-2.5 bg-white/5 hover:bg-[#C6A155] text-white hover:text-[#080B10] border border-white/15 hover:border-[#C6A155] text-xs font-semibold uppercase tracking-wider transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                <span>{m.modelNumber}</span>
                <span className="opacity-60 ml-1.5 font-normal">({m.specsSnapshot.loa.split(' ')[0]} FT)</span>
              </a>
            ))}
            <a
              href="#comparison-matrix"
              className="px-5 py-2.5 bg-[#C6A155]/20 hover:bg-[#C6A155] text-[#DFBA73] hover:text-[#080B10] border border-[#C6A155]/60 text-xs font-semibold uppercase tracking-wider transition-all duration-300 backdrop-blur-sm cursor-pointer"
            >
              Compare Specs Matrix
            </a>
          </div>

          {/* Key Fleet Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 w-full max-w-4xl pt-8 border-t border-white/15">
            <div>
              <div className="font-serif text-2xl sm:text-3xl text-[#DFBA73] font-normal">50–100 FT</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">Fleet Length Span</div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl text-white font-normal">3,200 HP</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">Peak Propulsion Power</div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl text-[#DFBA73] font-normal">4 Classes</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">Distinct Naval Series</div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl text-white font-normal">1979</div>
              <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">Shipyard Heritage (45+ Yrs)</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. FLEET SERIES SHOWCASE & FILTER
          ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16" id="fleet-catalog">
        {/* Header with Series Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
              CATALOGUE DOSSIER
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white uppercase tracking-[0.03em]">
              Explore the Models
            </h2>
          </div>

          {/* Series Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-4 py-2.5 uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#C6A155] text-[#080B10] font-bold shadow-lg"
                    : "bg-[#0E1A2D] text-white/70 hover:text-white border border-white/10 hover:border-white/30"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yacht Model Cards - Detailed Editorial Presentation */}
        <div className="space-y-20 lg:space-y-24">
          {filteredModels.map((model, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <article
                key={model.slug}
                id={`yacht-${model.slug}`}
                className="scroll-mt-28 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-500 overflow-hidden shadow-2xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Image Column */}
                  <div
                    className={`lg:col-span-7 relative overflow-hidden bg-[#0A101A] min-h-[340px] sm:min-h-[420px] ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}
                  >
                    <Link href={`/yachts/${model.slug}`} className="block h-full group">
                      <img
                        src={model.heroImage}
                        alt={model.fullName}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1522] via-transparent to-transparent opacity-60 lg:opacity-30" />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-[#080B10]/85 backdrop-blur-md border border-[#C6A155]/40 text-[#DFBA73] text-[10px] uppercase tracking-wider font-semibold">
                          {model.badge}
                        </span>
                        <span className="px-3 py-1 bg-[#080B10]/85 backdrop-blur-md border border-white/20 text-white/90 text-[10px] uppercase tracking-wider font-medium">
                          {model.categoryLabel}
                        </span>
                      </div>

                      {/* View Showcase Hover Pill */}
                      <div className="absolute bottom-4 right-4 px-4 py-2 bg-[#080B10]/90 backdrop-blur-md border border-white/20 text-white group-hover:border-[#C6A155] group-hover:text-[#DFBA73] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all">
                        <span>View Showcase</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#C6A155]" />
                      </div>
                    </Link>
                  </div>

                  {/* Details Column */}
                  <div
                    className={`lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 ${
                      isEven ? "lg:order-2" : "lg:order-1"
                    }`}
                  >
                    <div>
                      {/* Model Number Pill */}
                      <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold mb-2">
                        {model.modelNumber} • {model.decks}
                      </div>

                      {/* Model Title */}
                      <Link href={`/yachts/${model.slug}`} className="group block">
                        <h3 className="font-serif text-3xl sm:text-4xl text-white font-normal group-hover:text-[#DFBA73] transition-colors leading-tight mb-2">
                          {model.fullName}
                        </h3>
                      </Link>

                      {/* Tagline */}
                      {model.tagline && (
                        <p className="text-xs sm:text-sm text-[#C6A155] italic font-serif leading-relaxed mb-4">
                          “{model.tagline}”
                        </p>
                      )}

                      {/* Narrative Description */}
                      <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed mb-6 text-justify" style={{ textJustify: "inter-word" }}>
                        {model.description}
                      </p>

                      {/* Key Specs Snapshot Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#080B10]/60 border border-white/5 mb-6">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Length (LOA)</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.loa}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Beam</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.beam}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Propulsion</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.power.split('(')[0]}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Cabins</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.cabins}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Capacity</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.berths}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-white/50 font-mono">Fuel Tank</div>
                          <div className="text-xs font-semibold text-white mt-0.5">{model.specsSnapshot.fuel}</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/yachts/${model.slug}`}
                        className="flex-1 min-w-[170px] saxdor-btn-solid !h-[46px] !px-5 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none"
                      >
                        <span>Explore Dossier</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {model.brochureUrl ? (
                        <a
                          href={model.brochureUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[170px] saxdor-btn-outline !h-[46px] !px-5 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none hover:border-[#C6A155] hover:text-[#DFBA73]"
                        >
                          <Download className="w-3.5 h-3.5 text-[#C6A155]" />
                          <span>{model.brochureLabel || "Brochure (PDF)"}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectModelForEnquiry(model.fullName)}
                          className="flex-1 min-w-[170px] saxdor-btn-outline !h-[46px] !px-5 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none hover:border-[#C6A155] hover:text-[#DFBA73] cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#C6A155]" />
                          <span>Request Brochure</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSelectModelForEnquiry(model.fullName)}
                        className="w-full text-center text-xs text-[#C6A155] hover:text-white uppercase tracking-wider font-semibold pt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Book Private Sea Trial / Consultation</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. COMPREHENSIVE SIDE-BY-SIDE FLEET COMPARISON MATRIX
          ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-[#06090D] border-t border-b border-white/10" id="comparison-matrix">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
              TECHNICAL SPECIFICATIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white uppercase tracking-[0.03em] mb-4">
              Side-by-Side Fleet Comparison
            </h2>
            <p className="text-sm sm:text-base text-white/70 font-light">
              Compare naval dimensions, propulsion packages, accommodations, and engineering across all four ASMARATY yacht models.
            </p>
          </div>

          {/* Comparison Table Container with Horizontal Scroll */}
          <div className="overflow-x-auto shadow-2xl border border-white/10 bg-[#0A101A]">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/15 bg-[#0E1A2D]">
                  <th className="py-5 px-6 text-xs uppercase tracking-wider text-[#DFBA73] font-semibold font-mono w-1/5">
                    Specification Dimension
                  </th>
                  {FLEET_MODELS.map((m) => (
                    <th key={m.slug} className="py-5 px-6 text-center border-l border-white/10 w-1/5">
                      <div className="font-serif text-lg sm:text-xl text-white font-normal">{m.modelNumber}</div>
                      <div className="text-[10px] text-[#C6A155] uppercase tracking-wider mt-0.5">{m.categoryLabel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Length Overall (LOA)
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 font-semibold text-white">
                      {m.specsSnapshot.loa}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Waterline Length (LWL)
                  </td>
                  <td className="py-4 px-6 text-center border-l border-white/5 text-white/90">85 FT (25.91 M)</td>
                  <td className="py-4 px-6 text-center border-l border-white/5 text-white/90">65 FT (19.81 M)</td>
                  <td className="py-4 px-6 text-center border-l border-white/5 text-white/90">55 FT (16.76 M)</td>
                  <td className="py-4 px-6 text-center border-l border-white/5 text-white/90">40 FT (12.00 M)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Maximum Beam
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.beam}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Draft at Full Load
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.draft}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Displacement
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.displacement}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Propulsion Power
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 font-semibold text-[#DFBA73]">
                      {m.specsSnapshot.power}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Staterooms & Accommodations
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.cabins}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Sleeping Berths / Passenger Capacity
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.berths}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Fuel Tank Capacity
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.fuel}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Freshwater Capacity
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-white/90">
                      {m.specsSnapshot.water}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-6 text-white/60 font-mono uppercase tracking-wider text-xs bg-white/[0.02]">
                    Hull & Deck Construction
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-4 px-6 text-center border-l border-white/5 text-xs text-white/80">
                      {m.specsSnapshot.hull}
                    </td>
                  ))}
                </tr>
                <tr className="bg-[#0E1A2D]/40">
                  <td className="py-5 px-6 text-[#C6A155] font-semibold text-xs uppercase tracking-wider">
                    Dossier & Brochure Links
                  </td>
                  {FLEET_MODELS.map((m) => (
                    <td key={m.slug} className="py-5 px-6 text-center border-l border-white/10 space-y-2">
                      <Link
                        href={`/yachts/${m.slug}`}
                        className="block w-full py-2 px-3 bg-[#C6A155] hover:bg-white text-[#080B10] text-[11px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Explore {m.modelNumber}
                      </Link>
                      {m.brochureUrl && (
                        <a
                          href={m.brochureUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-1.5 px-2 text-[10px] uppercase tracking-wider text-white/70 hover:text-[#DFBA73] transition-colors"
                        >
                          Brochure PDF ↓
                        </a>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. BESPOKE COMMISSIONING & CRAFTSMANSHIP
          ------------------------------------------------------------- */}
      <section className="py-24 sm:py-32 bg-[#08101C] relative overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block">
                CUSTOM COMMISSIONS • SHIPYARD HERITAGE
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white uppercase tracking-[0.03em] leading-tight">
                Every Vessel Tailored to Your Vision
              </h2>
              <blockquote className="border-l-2 border-[#C6A155] pl-6 text-base sm:text-lg italic font-serif text-[#DFBA73] leading-relaxed">
                “A yacht is not simply an engineering achievement; it is an architectural sanctuary forged between sky and ocean.”
              </blockquote>
              <p className="text-sm sm:text-base text-white/75 font-light leading-relaxed text-justify" style={{ textJustify: "inter-word" }}>
                At ASMARATY, no two vessels leaving our shipyard facility are identical. From selecting book-matched Italian marbles and bespoke marine leather finishes to custom audio-visual installations and private tender arrangements, our master shipwrights partner with owners throughout every stage of the build.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[#0E1A2D]/60 border border-white/5">
                  <div className="font-serif text-2xl text-[#C6A155] font-normal">100%</div>
                  <div className="text-xs text-white/70 mt-1">Bespoke Interior Options</div>
                </div>
                <div className="p-4 bg-[#0E1A2D]/60 border border-white/5">
                  <div className="font-serif text-2xl text-white font-normal">UAE</div>
                  <div className="text-xs text-white/70 mt-1">Direct Shipyard Direct Access</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectModelForEnquiry("Custom Commission Consultation")}
                  className="saxdor-btn-solid !h-[48px] !px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 rounded-none cursor-pointer"
                >
                  <span>Discuss a Custom Commission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0A101A] shadow-2xl border border-white/10">
                <img
                  src="/images/interiors/g100-main-salon.jpg"
                  alt="ASMARATY Custom Craftsmanship"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08101C]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#08101C]/90 backdrop-blur-md border border-white/15">
                  <span className="text-[10px] uppercase tracking-wider text-[#C6A155] font-semibold block mb-1">
                    Shipyard Facility • Ajman, UAE
                  </span>
                  <p className="text-xs text-white/80 font-light">
                    Over 45 years of continuous marine craftsmanship by Al Shaali Marine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. VIP FLEET ENQUIRY & CONSULTATION
          ------------------------------------------------------------- */}
      <section className="py-24 sm:py-32 bg-[#06090D] relative" id="catalog-enquiry">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Direct Contacts */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.24em] text-[#C6A155] font-semibold block mb-2">
                  VIP CONCIERGE & ADVISORY
                </span>
                <h2 className="font-serif text-3xl sm:text-5xl font-normal text-white uppercase tracking-[0.03em] leading-tight mb-4">
                  Request Fleet Dossier or Private Consultation
                </h2>
                <p className="text-sm text-white/75 font-light leading-relaxed">
                  Connect directly with our luxury yacht advisory team in the UAE. We arrange private sea trials, confidential bespoke build consultations, and VIP shipyard walkthroughs.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 bg-[#0D1522] border border-white/10">
                  <MapPin className="w-5 h-5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/50 block font-mono">Shipyard & Headquarters</span>
                    <span className="text-sm text-white font-medium">Al Shaali Marine, Rashidia 1, Ajman, United Arab Emirates</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#0D1522] border border-white/10">
                  <Phone className="w-5 h-5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/50 block font-mono">Direct Advisory Line</span>
                    <a href="tel:+971565268126" className="text-sm text-white font-medium hover:text-[#DFBA73] transition-colors">
                      +971 56 526 8126
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#0D1522] border border-white/10">
                  <Mail className="w-5 h-5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs uppercase tracking-wider text-white/50 block font-mono">Confidential Inquiries</span>
                    <a href="mailto:info@asmaraty.com" className="text-sm text-white font-medium hover:text-[#DFBA73] transition-colors">
                      info@asmaraty.com
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Direct Action */}
              <div className="pt-2">
                <a
                  href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet%20catalogue."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Connect on WhatsApp VIP Concierge</span>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Consultation Form */}
            <div className="lg:col-span-7 bg-[#0D1522] border border-white/10 p-8 sm:p-12 shadow-2xl">
              {formSubmitted ? (
                <div className="py-16 text-center space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-[#C6A155] mx-auto animate-bounce" />
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                    Enquiry Received with Priority
                  </h3>
                  <p className="text-sm text-white/75 max-w-md mx-auto leading-relaxed">
                    Thank you. Our luxury yacht advisory team has logged your interest for <span className="text-[#DFBA73] font-semibold">{formData.modelInterested}</span>. A senior naval consultant will reach out confidentially within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        modelInterested: "ASMARATY G-100 Super Yacht",
                        message: "",
                      });
                    }}
                    className="saxdor-btn-solid !h-[42px] px-6 text-xs font-bold uppercase tracking-wider mt-4"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-white font-normal mb-1">
                      Private Fleet Consultation
                    </h3>
                    <p className="text-xs text-white/60">
                      Please enter your contact details and select the vessel of interest.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-900/40 border border-red-500/60 text-red-200 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Model Selection Dropdown */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Vessel of Interest
                    </label>
                    <select
                      value={formData.modelInterested}
                      onChange={(e) => setFormData({ ...formData, modelInterested: e.target.value })}
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white focus:outline-none"
                    >
                      <option value="ASMARATY G-100 Super Yacht">ASMARATY G-100 Super Yacht (100 FT • Flagship)</option>
                      <option value="ASMARATY G77 Luxury Yacht">ASMARATY G77 Luxury Yacht (78 FT • Three-Deck)</option>
                      <option value="ASMARATY G-66 Luxury Yacht">ASMARATY G-66 Luxury Yacht (66 FT • Flybridge)</option>
                      <option value="ASMARATY G-50 Luxury Motor Yacht">ASMARATY G-50 Luxury Motor Yacht (50 FT • Motor Yacht)</option>
                      <option value="Custom Bespoke Commission">Custom Bespoke Commission (UAE Shipyard)</option>
                      <option value="All Fleet Inquiry">General Fleet Consultation / Price List</option>
                    </select>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Alexander"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Sterling"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alexander@domain.com"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+971 50 000 0000"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Specific Requirements / Sea Trial Dates
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share any bespoke requirements, delivery timing, or preferred dates for sea trials in Dubai..."
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full saxdor-btn-solid !h-[50px] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-none shadow-xl"
                  >
                    {submitting ? (
                      <span>Sending Consultation Request...</span>
                    ) : (
                      <>
                        <span>Submit Private Fleet Consultation</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    By submitting this request, you agree to our confidential advisory privacy policy. Your information will never be shared.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
