"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getPageBySlug } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Public page displays Under Construction view until full content is ready.
 */
const IS_UNDER_CONSTRUCTION = true;

export default function AboutPage() {
  const [page, setPage] = useState(() => getPageBySlug("/about"));

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getPageBySlug("/about");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  if (IS_UNDER_CONSTRUCTION) {
    return (
      <UnderConstructionView
        pageTitle="About Us"
        pageSlug="/about"
        description="Our comprehensive shipyard history, master craftsmen profiles, and composite engineering facilities are currently under construction. Explore our featured yacht models on the Home page."
        customBadge="UNDER CONSTRUCTION"
      />
    );
  }

  // Full page view when under construction is disabled
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar currentPageId={page?.id || "page-about"} />

      <main className="flex-1">
        {page?.sections && page.sections.length > 0 ? (
          page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="py-32 text-center text-[#828F9E]">
            Loading About ASMARATY...
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
