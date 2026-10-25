"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Anchor, ShieldCheck } from "lucide-react";
import CmsSidebar from "./CmsSidebar";

export default function AdminAuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [authStatus, setAuthStatus] = useState(isLoginPage ? "authorized" : "checking");
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();

        if (isMounted) {
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            setAuthStatus("authorized");
          } else {
            setAuthStatus("unauthorized");
            router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAuthStatus("unauthorized");
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If on login page, render directly without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while verifying credentials
  if (authStatus === "checking") {
    return (
      <div className="min-h-screen bg-[#070A0F] text-[#E8EEF5] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border border-[#C6A155]/60 flex items-center justify-center bg-[#0E2047] text-[#C6A155] animate-pulse">
          <Anchor className="w-6 h-6" />
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-[#C6A155] font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 animate-spin" />
          <span>Verifying Admin Authorization...</span>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthorized") {
    return null;
  }

  // Authenticated: render full CMS layout with sidebar
  return (
    <div className="min-h-screen flex bg-[#070A0F] text-[#E8EAEE] font-sans">
      <CmsSidebar currentUser={adminUser} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
