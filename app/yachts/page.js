"use client";

import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalYachtCatalogView from "@/components/public/yacht-catalog/UniversalYachtCatalogView";

export default function YachtsCollectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-yachts" />

      <main className="flex-1">
        <UniversalYachtCatalogView />
      </main>

      <PublicFooter />
    </div>
  );
}
