import { Suspense } from "react";
import AdminAuthGuard from "@/components/cms/AdminAuthGuard";

export const metadata = {
  title: "CMS Studio | ASMARATY Luxury Yachts",
  description: "Bespoke Content Management System for ASMARATY luxury yachts, models, and pages.",
};

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070A0F]" />}>
      <AdminAuthGuard>
        {children}
      </AdminAuthGuard>
    </Suspense>
  );
}
