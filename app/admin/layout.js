import { Suspense } from "react";
import CmsSidebar from "@/components/cms/CmsSidebar";

export const metadata = {
  title: "CMS Studio | ASMARATY by Nuvyara Digital",
  description: "Bespoke Content Management System for ASMARATY luxury yachts and pages.",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-[#070A0F] text-[#E8EAEE] font-sans">
      <Suspense fallback={<div className="w-64 bg-[#0A0D14] min-h-screen" />}>
        <CmsSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
