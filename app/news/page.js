"use client";

import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalNewsListingView from "@/components/public/news/UniversalNewsListingView";

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-news" />

      <main className="flex-1">
        <UniversalNewsListingView />
      </main>

      <PublicFooter />
    </div>
  );
}
