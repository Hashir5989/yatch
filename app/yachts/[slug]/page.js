"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Anchor, 
  ShieldCheck, 
  Award, 
  Check, 
  Layers, 
  Sparkles, 
  Mail, 
  Phone,
  ZoomIn,
  X
} from "lucide-react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getYachtBySlug, getAllYachts, syncYachtsFromServer } from "@/lib/cmsStore";

/**
 * Under Construction Flag: Public yacht detail pages display Under Construction view
 */
const IS_UNDER_CONSTRUCTION = true;

function YachtDetailPageInner() {
  const params = useParams();
  const slug = params?.slug;

  const [yacht, setYacht] = useState(() => (slug ? getYachtBySlug(slug) : null));
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("specs"); // specs, highlights, layout

  useEffect(() => {
    syncYachtsFromServer().then((synced) => {
      if (slug && synced) {
        const found = synced.find((y) => y.slug === slug);
        if (found) setYacht(found);
      }
    });

    const handleUpdate = () => {
      if (slug) {
        const y = getYachtBySlug(slug);
        setYacht(y);
      }
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  if (IS_UNDER_CONSTRUCTION) {
    const modelTitle = yacht?.name ? `${yacht.name} — Specification Dossier` : "Yacht Model Dossier";
    const modelDesc = yacht?.name
      ? `The dedicated specification dossier and interactive configurator for ${yacht.name} are currently under construction. Complete specifications and photo galleries can be explored on our Home page.`
      : "The individual yacht specification dossier is currently under construction. Complete specifications for our featured yacht models are on the Home page.";

    return (
      <UnderConstructionView
        pageTitle={modelTitle}
        pageSlug={`/yachts/${slug || ""}`}
        description={modelDesc}
        customBadge="UNDER CONSTRUCTION"
        yacht={yacht}
      />
    );
  }

  if (!yacht) {
    return (
      <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] flex flex-col justify-between">
        <PublicNavbar />
        <div className="py-40 text-center space-y-4">
          <h1 className="font-serif text-3xl text-white">Yacht Model Not Found</h1>
          <p className="text-sm text-[#828F9E]">The requested vessel could not be found or has not been published.</p>
          <Link href="/yachts" className="saxdor-btn-solid !h-[48px] px-8 text-xs inline-flex items-center justify-center mt-4 rounded-none">
            Return to Fleet
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const allImages = [yacht.mainImage, ...(yacht.gallery || [])].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10] text-[#E8EAEE]">
      <PublicNavbar />

      <main className="flex-1">
        {/* Back Link Breadcrumb & CMS Link */}
        <div className="bg-[#0A0D14] border-b border-white/5 py-3 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <Link
              href="/yachts"
              className="inline-flex items-center gap-2 text-[#9DAAB8] hover:text-[#C5A880] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Fleet Collections</span>
            </Link>
          </div>
        </div>

        {/* Yacht Hero Section */}
        <section className="relative min-h-[65vh] sm:min-h-[75vh] lg:min-h-[80vh] flex flex-col justify-end bg-[#080B10] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-[#080B10]">
            <img
              src={selectedImage || yacht.mainImage}
              alt={yacht.name}
              className="w-full h-full object-contain object-center transition-all duration-700"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/25 to-transparent pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#080B10]/70 via-transparent to-transparent pointer-events-none"></div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pb-16 w-full">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#C5A880] text-[#080B10] text-xs font-semibold uppercase tracking-luxury rounded-sm">
                  {yacht.category}
                </span>
                <span className="text-xs uppercase tracking-luxury text-[#E5C392]">
                  {yacht.series}
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white leading-tight mb-4">
                {yacht.name}
              </h1>

              <p className="text-base sm:text-xl text-[#C9D2DF] font-light max-w-2xl leading-relaxed mb-8">
                {yacht.tagline}
              </p>

              {/* Action Buttons - Rectangular Box UI */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="saxdor-btn-solid !h-[52px] px-8 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
                >
                  <span>Book Private Sea Trial</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setLightboxOpen(true)}
                  className="saxdor-btn-outline !h-[52px] px-6 text-xs font-medium tracking-wider rounded-none inline-flex items-center gap-2"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>View Gallery ({allImages.length})</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Thumbnails Strip */}
        <section className="bg-[#0C1017] border-y border-white/5 py-4 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-4 overflow-x-auto pb-2">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-28 h-20 sm:w-36 sm:h-24 flex-shrink-0 rounded-sm overflow-hidden border transition-all ${
                  selectedImage === img
                    ? "border-[#C5A880] ring-1 ring-[#C5A880]"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* Yacht Specifications & Narrative Tabs */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 sm:px-8">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 mb-12 gap-8">
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-xs uppercase tracking-luxury font-medium transition-all relative ${
                activeTab === "specs"
                  ? "text-[#C5A880]"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
            >
              Technical Specifications
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("highlights")}
              className={`pb-4 text-xs uppercase tracking-luxury font-medium transition-all relative ${
                activeTab === "highlights"
                  ? "text-[#C5A880]"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
            >
              Bespoke Highlights
              {activeTab === "highlights" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880]"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("layout")}
              className={`pb-4 text-xs uppercase tracking-luxury font-medium transition-all relative ${
                activeTab === "layout"
                  ? "text-[#C5A880]"
                  : "text-[#8E9AA8] hover:text-white"
              }`}
            >
              Deck Layout & Floorplan
              {activeTab === "layout" && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C5A880]"></span>
              )}
            </button>
          </div>

          {/* Tab 1: Technical Specs */}
          {activeTab === "specs" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-6">
                  <h3 className="font-serif text-3xl text-white font-light">
                    Naval Engineering & Architecture
                  </h3>
                  <p className="text-sm text-[#9DAAB8] leading-relaxed font-light">
                    {yacht.description}
                  </p>
                  <div className="p-6 bg-[#0E131C] border border-[#C5A880]/20 rounded-sm space-y-3">
                    <div className="flex items-center gap-2 text-xs text-[#C5A880] font-medium uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Certified Naval Integrity</span>
                    </div>
                    <p className="text-xs text-[#828F9E] leading-relaxed">
                      Built in full compliance with international maritime registers (RINA / CE Class A Ocean), incorporating resin-infused composite structures and redundancy across all critical systems.
                    </p>
                  </div>
                </div>

                {/* Specs Table */}
                <div className="lg:col-span-7">
                  <div className="bg-[#0E131C] border border-white/10 rounded-sm divide-y divide-white/5">
                    {Object.entries(yacht.specs || {}).map(([key, val]) => {
                      const labelMap = {
                        yachtType: "Yacht Type",
                        hullConstruction: "Hull Construction",
                        lengthOverall: "Length Overall (LOA)",
                        lengthWaterline: "Length at Waterline",
                        maximumBeam: "Maximum Beam",
                        heightAboveWaterline: "Height Above Waterline",
                        draftAtFullLoad: "Draft at Full Load",
                        displacement: "Displacement",
                        fuelCapacity: "Fuel Capacity",
                        freshwaterCapacity: "Freshwater Capacity",
                        blackwaterTank: "Blackwater Tank",
                        greywaterTank: "Greywater Tank",
                        airConditioningChiller: "Air-Conditioning Chiller System",
                        marineGenerators: "Marine Generators",
                        engines: "Engines",
                        gearbox: "Gearbox",
                        bedrooms: "Bedrooms",
                        berths: "Berths",
                        headCompartments: "Head Compartments"
                      };
                      const friendlyLabel = labelMap[key] || key.replace(/([A-Z])/g, " $1").trim();

                      return (
                        <div key={key} className="grid grid-cols-2 p-3.5 text-xs hover:bg-[#141D2B] transition-colors">
                          <span className="text-[#8E9EAF] uppercase tracking-wider font-medium">
                            {friendlyLabel}
                          </span>
                          <span className="text-white font-semibold text-right font-mono">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Bespoke Highlights */}
          {activeTab === "highlights" && (
            <div className="space-y-8">
              <div className="max-w-2xl">
                <h3 className="font-serif text-3xl text-white font-light mb-4">
                  Signature Features & Customization
                </h3>
                <p className="text-sm text-[#9DAAB8] font-light leading-relaxed">
                  Every ASMARATY vessel is individually customized. Explore the hallmark appointments engineered into the {yacht.name}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(yacht.highlights || []).map((highlight, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-sm bg-[#0E131C] border border-white/5 flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#17202C] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-[#E0E6EF] font-light leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Deck Layout */}
          {activeTab === "layout" && (
            <div className="space-y-8 text-center">
              <div className="max-w-xl mx-auto">
                <h3 className="font-serif text-3xl text-white font-light mb-3">
                  General Arrangement & Deck Plan
                </h3>
                <p className="text-sm text-[#9DAAB8] font-light">
                  Customized layouts are available including 4 or 5-stateroom configurations, expanded salon lounges, and custom tender bay dimensions.
                </p>
              </div>

              <div className="p-8 bg-[#0E131C] border border-white/5 rounded-sm max-w-4xl mx-auto">
                <img
                  src={yacht.floorplanUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"}
                  alt="Floorplan"
                  className="w-full h-auto max-h-[500px] object-contain mx-auto filter invert opacity-80"
                />
                <div className="mt-6 flex justify-center gap-4">
                  <Link
                    href="/contact"
                    className="saxdor-btn-solid !h-[48px] px-8 text-xs tracking-wider rounded-none font-semibold"
                  >
                    Request High-Res CAD & GA Drawings
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Sea Trial Booking CTA Banner */}
        <section className="bg-[#0C121B] border-t border-[#1C2533] py-20 px-6 sm:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-luxury text-[#C5A880] font-sans font-medium">
              PRIVATE VIEWINGS & SEA TRIALS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-white">
              Experience the {yacht.name} in Dubai
            </h2>
            <p className="text-sm sm:text-base text-[#9DAAB8] font-light max-w-xl mx-auto leading-relaxed">
              We coordinate private sea trials departing from Dubai Harbour and Ajman Marina for qualified prospective owners and charter representatives.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="saxdor-btn-solid !h-[54px] px-10 text-xs font-semibold tracking-wider rounded-none inline-flex items-center gap-2"
              >
                <span>Schedule Confidential Sea Trial</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl max-h-[85vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt={yacht.name}
              className="max-h-[80vh] w-auto object-contain rounded-sm border border-white/10"
            />
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}

export default function YachtDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B10] text-white flex items-center justify-center font-serif text-sm">Loading Yacht...</div>}>
      <YachtDetailPageInner />
    </Suspense>
  );
}
