"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AsmaratyLogo from "@/components/public/AsmaratyLogo";
import { 
  Anchor, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  KeyRound
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("admin@asmaraty.ae");
  const [password, setPassword] = useState("Asmaraty#2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Success: redirect to target admin page
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError("Network or server connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-[#E8EEF5] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Subtle background glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(198, 161, 85, 0.15) 0%, rgba(7, 10, 15, 0.7) 60%, rgba(7, 10, 15, 1) 100%)"
        }}
      />

      {/* Top Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <AsmaratyLogo variant="horizontal" className="h-7" />
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.24em] text-[#C6A155] font-semibold border-l border-white/10 pl-3">
            Shipyard CMS Studio
          </span>
        </div>

        <Link
          href="/"
          className="text-xs text-white/60 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Website</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0A0E17]/95 border border-[#1C2638] shadow-2xl p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <AsmaratyLogo variant="full" className="h-14 mx-auto" />
            <h1 className="font-serif text-xl font-light text-white uppercase tracking-wider">
              Administrator Login
            </h1>
            <p className="text-xs text-[#8E9DAE]">
              Authenticate to manage yacht models, visual pages, and shipyard records.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-700/60 text-xs text-rose-200 flex items-start gap-2.5 rounded-sm">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8E9DAE] font-semibold mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@asmaraty.ae"
                  className="w-full pl-10 pr-4 py-3 bg-[#070A0F] border border-[#1B2738] text-white text-xs focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8E9DAE] font-semibold mb-2">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#070A0F] border border-[#1B2738] text-white text-xs focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full saxdor-btn-solid !h-[48px] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to CMS Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credentials Helper Pill */}
          <div className="p-4 bg-[#0E1522] border border-[#C6A155]/20 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#C6A155] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Default Evaluation Credentials</span>
            </div>
            <div className="font-mono text-[11px] text-white/80 space-y-0.5">
              <div>Email: <strong className="text-white">admin@asmaraty.ae</strong></div>
              <div>Password: <strong className="text-white">Asmaraty#2026</strong></div>
            </div>
            <p className="text-[10px] text-white/40">
              Credentials can be updated in Admin Settings once logged in.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[10px] text-white/30 border-t border-white/5 uppercase tracking-widest">
        ASMARATY Yachts & Boats • United Arab Emirates • Secure Content Studio
      </footer>
    </div>
  );
}
