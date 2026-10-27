"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Public fleet page displays Under Construction view until full catalog is ready.
 */
const IS_UNDER_CONSTRUCTION = true;

export default function YachtsCollectionPage() {
  const [page, setPage] = useState(() => getPageBySlug("/yachts"));

  useEffect(() => {
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/yachts");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/yachts");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  if (IS_UNDER_CONSTRUCTION) {
    return (
      <UnderConstructionView
        pageTitle="The Yacht Fleet Catalog"
        pageSlug="/yachts"
        description="The full fleet catalog is currently under construction. All featured yacht models with verified specifications and photo galleries can be explored right now on our Home page."
        customBadge="UNDER CONSTRUCTION"
      />
    );
  }

  // Full page view when under construction is disabled
  return (
    <div className="min-h-screen flex flex-col bg-[#08101C]">
      <PublicNavbar currentPageId={page?.id || "page-yachts"} />

      <main className="flex-1">
        {page?.sections && page.sections.length > 0 ? (
          page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="py-32 text-center text-[#828F9E]">
            Loading Yacht Fleet...
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
