"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalContactView from "@/components/public/contact/UniversalContactView";
import { getPageBySlug, getPageById, syncPagesFromServer } from "@/lib/cmsStore";
import { DEFAULT_PAGES } from "@/lib/data/defaultPages";

export default function ContactPage() {
  const [page, setPage] = useState(() => {
    return DEFAULT_PAGES.find((p) => p.slug === "/contact" || p.id === "page-contact") || null;
  });

  useEffect(() => {
    const local = getPageBySlug("/contact") || getPageById("page-contact");
    if (local) {
      queueMicrotask(() => setPage(local));
    }

    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/contact" || p.id === "page-contact");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/contact") || getPageById("page-contact");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-contact" />

      <main className="flex-1">
        <UniversalContactView pageData={page} />
      </main>

      <PublicFooter />
    </div>
  );
}
