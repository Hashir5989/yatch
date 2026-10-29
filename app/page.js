"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";
import { DEFAULT_PAGES } from "@/lib/data/defaultPages";

export default function HomePage() {
  // Always initialize from DEFAULT_PAGES so server SSR and client hydration match 100%
  const [page, setPage] = useState(() => {
    return DEFAULT_PAGES.find((p) => p.slug === "/") || null;
  });

  useEffect(() => {
    // Read any locally updated content from storage immediately after hydration
    const local = getPageBySlug("/");
    if (local) setPage(local);

    // Dynamic sync from server database API so all admin changes show live on the frontend
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/");
        if (found) setPage(found);
      }
    });

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
