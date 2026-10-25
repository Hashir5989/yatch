"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getPageBySlug } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Public news page displays Under Construction view until articles are ready.
 */
const IS_UNDER_CONSTRUCTION = true;

export default function NewsPage() {
  const [page, setPage] = useState(() => getPageBySlug("/news"));

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getPageBySlug("/news");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  if (IS_UNDER_CONSTRUCTION) {
    return (
      <UnderConstructionView
        pageTitle="News, Insights & Boat Shows"
        pageSlug="/news"
        description="Our international boat show highlights, naval architecture dispatches, and media articles are currently under construction. Explore our featured yacht models on the Home page."
        customBadge="UNDER CONSTRUCTION"
      />
    );
  }

  // Full page view when under construction is disabled
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar currentPageId={page?.id || "page-news"} />

      <main className="flex-1">
        {page?.sections && page.sections.length > 0 ? (
          page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="py-32 text-center text-[#828F9E]">
            Loading News & Insights...
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
