"use client";

import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";
import UniversalContactView from "@/components/public/contact/UniversalContactView";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080B10]">
      <PublicNavbar currentPageId="page-contact" />

      <main className="flex-1">
        <UniversalContactView />
      </main>

      <PublicFooter />
    </div>
  );
}
