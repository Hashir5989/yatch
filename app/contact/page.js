"use client";

import { useState, useEffect } from "react";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import SectionRenderer from "@/components/public/SectionRenderer";
import UnderConstructionView from "@/components/public/UnderConstructionView";
import { getPageBySlug, syncPagesFromServer } from "@/lib/cmsStore";

/**
 * Under Construction Flag:
 * Public contact page displays Under Construction view until portal is ready.
 */
const IS_UNDER_CONSTRUCTION = true;

export default function ContactPage() {
  const [page, setPage] = useState(() => getPageBySlug("/contact"));

  useEffect(() => {
    syncPagesFromServer().then((synced) => {
      if (synced && Array.isArray(synced)) {
        const found = synced.find((p) => p.slug === "/contact");
        if (found) setPage(found);
      }
    });

    const handleUpdate = () => {
      const updated = getPageBySlug("/contact");
      if (updated) setPage(updated);
    };

    window.addEventListener("asm-cms-change", handleUpdate);
    return () => window.removeEventListener("asm-cms-change", handleUpdate);
  }, []);

  if (IS_UNDER_CONSTRUCTION) {
    return (
      <UnderConstructionView
        pageTitle="VIP Concierge & Enquiries"
        pageSlug="/contact"
        description="Our standalone VIP concierge portal is currently under construction. You can book a sea trial and submit private yacht enquiries directly via our Home page."
        customBadge="UNDER CONSTRUCTION"
      />
    );
  }

  // Full page view when under construction is disabled
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId={page?.id || "page-contact"} />

      <main className="flex-1">
        {page?.sections && page.sections.length > 0 ? (
          page.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))
        ) : (
          <div className="py-32 text-center text-[#828F9E]">
            Loading VIP Concierge...
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
