"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import UniversalYachtDetailView from "@/components/public/yacht-details/UniversalYachtDetailView";
import { getYachtShowcaseData } from "@/lib/data/yachtShowcaseData";
import { getYachtBySlug, syncYachtsFromServer } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Active showcase models (e.g. G100, G77) render the unified luxury template.
 * All other yacht slugs show Under Construction until their content is ready.
 */
const IS_UNDER_CONSTRUCTION = true;

function YachtDetailPageInner() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [yacht, setYacht] = useState(() => (slug ? getYachtBySlug(slug) : null));

  useEffect(() => {
    syncYachtsFromServer();

    if (slug) {
      const y = getYachtBySlug(slug);
      setYacht(y);
    }

    const handleUpdate = () => {
      if (slug) {
        const y = getYachtBySlug(slug);
        setYacht(y);
      }
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  // If this yacht has a configured showcase (G100, G77, etc.), render the universal luxury showcase template
  const showcaseData = getYachtShowcaseData(slug);
  if (showcaseData) {
    return <UniversalYachtDetailView data={showcaseData} />;
  }

  // If Under Construction flag is active and this model does not yet have full showcase content
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

  // Fallback for non-existent yacht
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

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] flex flex-col justify-between">
      <PublicNavbar />
      <div className="py-40 text-center space-y-4">
        <h1 className="font-serif text-3xl text-white">{yacht.name}</h1>
        <p className="text-sm text-[#828F9E]">{yacht.tagline || "Specification dossier coming soon."}</p>
      </div>
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
