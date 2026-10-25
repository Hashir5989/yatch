"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import { getPageBySlug } from "@/lib/cmsStore";

export default function HomePage() {
  const [page, setPage] = useState(() => getPageBySlug("/"));

  useEffect(() => {
    const handleUpdate = () => {
      const updated = getPageBySlug("/");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#08101C]">
      <PublicNavbar currentPageId={page?.id || "page-home"} />

      <main className="flex-1">
        {page?.sections && page.sections.length > 0 ? (
          page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="py-32 text-center text-[#828F9E]">
            Loading ASMARATY experience...
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
