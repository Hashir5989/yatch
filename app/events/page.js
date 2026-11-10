"use client";

import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalEventsView from "@/components/public/events/UniversalEventsView";

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-events" />

      <main className="flex-1">
        <UniversalEventsView />
      </main>

      <PublicFooter />
    </div>
  );
}

