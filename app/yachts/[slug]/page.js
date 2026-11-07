"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import UniversalYachtDetailView from "@/components/public/yacht-details/UniversalYachtDetailView";
import { getYachtShowcaseData, mergeYachtWithShowcase } from "@/lib/data/yachtShowcaseData";
import { getYachtBySlug, syncYachtsFromServer } from "@/lib/cmsStore";

function YachtDetailPageInner() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const [cmsYacht, setCmsYacht] = useState(() => (slug ? getYachtBySlug(slug) : null));

  useEffect(() => {
    // Initial fetch from server API
    syncYachtsFromServer().then(() => {
      if (slug) {
        setCmsYacht(getYachtBySlug(slug));
      }
    });

    if (slug) {
      setCmsYacht(getYachtBySlug(slug));
    }

    // Reactive listener for live updates when saved in /admin/yachts
    const handleUpdate = () => {
      if (slug) {
        setCmsYacht(getYachtBySlug(slug));
      }
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, [slug]);

  // Retrieve base static showcase details (cutaways, original imagery)
  const staticShowcase = getYachtShowcaseData(slug);

  // If no CMS record and no showcase found: 404 Not Found
  if (!cmsYacht && !staticShowcase) {
    return (
      <div className="min-h-screen bg-[#080B10] text-[#E8EAEE] flex flex-col justify-between">
        <PublicNavbar />
        <div className="py-40 text-center space-y-4 px-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C8A870] block">
            404 • VESSEL NOT FOUND
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-light">
            Yacht Model Not Found
          </h1>
          <p className="text-sm text-[#828F9E] max-w-md mx-auto leading-relaxed">
            The requested vessel dossier could not be located in the shipyard catalog or has not yet been registered.
          </p>
          <div className="pt-4">
            <Link
              href="/yachts"
              className="saxdor-btn-solid !h-[48px] px-8 text-xs inline-flex items-center justify-center rounded-none tracking-wider"
            >
              Return to Fleet Catalog
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Merge authoritative CMS yacht record with static showcase visual assets
  const data = mergeYachtWithShowcase(cmsYacht, staticShowcase);

  // Draft Handling:
  // If the vessel is explicitly marked as draft, hide content from public view and disallow indexing
  if (data.status === "draft") {
    const modelTitle = `${data.fullName || data.name} (Draft)`;
    const modelDesc =
      "This vessel dossier is currently in private draft preparation and has not yet been published to the live public catalog.";

    return (
      <>
        {/* Strictly prevent search engine indexing of draft vessels */}
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <UnderConstructionView
          pageTitle={modelTitle}
          pageSlug={`/yachts/${slug || ""}`}
          description={modelDesc}
          customBadge="DRAFT VESSEL"
          yacht={data}
        />
      </>
    );
  }

  // Render unified luxury showcase template
  return <UniversalYachtDetailView data={data} />;
}

export default function YachtDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B10] text-white flex items-center justify-center font-serif text-sm">
          Loading Yacht Dossier...
        </div>
      }
    >
      <YachtDetailPageInner />
    </Suspense>
  );
}
