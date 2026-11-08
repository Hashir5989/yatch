"use client";

import { useState, useEffect } from "react";
import UniversalAboutView from "@/components/public/about/UniversalAboutView";
import { getPageBySlug, getPageById, syncPagesFromServer } from "@/lib/cmsStore";
import { DEFAULT_PAGES, DEFAULT_ABOUT_PAGE } from "@/lib/data/defaultPages";

export default function AboutPage() {
  const [page, setPage] = useState(() => {
    return (
      DEFAULT_PAGES.find((p) => p.slug === "/about" || p.id === "page-about") ||
      DEFAULT_ABOUT_PAGE ||
      null
    );
  });

  useEffect(() => {
    const local = getPageBySlug("/about") || getPageById("page-about");
    if (local) {
      queueMicrotask(() => setPage(local));
    }

    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/about" || p.id === "page-about");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/about") || getPageById("page-about");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  return (
    <UniversalAboutView
      pageData={page}
      isEditable={false}
      showNavAndFooter={true}
    />
  );
}
