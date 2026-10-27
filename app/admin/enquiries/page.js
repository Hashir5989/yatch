"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  Search, 
  Clock, 
  CheckCircle2, 
  Phone, 
  User, 
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Globe
} from "lucide-react";
import CmsHeader from "@/components/cms/CmsHeader";

export default function AdminEnquiriesScreen() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [error, setError] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data.success && Array.isArray(data.enquiries)) {
        setEnquiries(data.enquiries);
        if (data.enquiries.length > 0 && !selectedEnquiry) {
          setSelectedEnquiry(data.enquiries[0]);
        }
      } else {
        setError(data.error || "Failed to load enquiries");
      }
    } catch (err) {
      setError("Network error fetching enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filteredEnquiries = enquiries.filter((enq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (enq.firstName && enq.firstName.toLowerCase().includes(q)) ||
      (enq.lastName && enq.lastName.toLowerCase().includes(q)) ||
      (enq.name && enq.name.toLowerCase().includes(q)) ||
      (enq.email && enq.email.toLowerCase().includes(q)) ||
      (enq.phone && enq.phone.toLowerCase().includes(q)) ||
      (enq.location && enq.location.toLowerCase().includes(q)) ||
      (enq.country && enq.country.toLowerCase().includes(q)) ||
      (enq.message && enq.message.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070A0F]">
      <CmsHeader 
        title="Customer Enquiries" 
        subtitle="Review prospective client contact enquiries, messages, and locations"
      />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0E1522] border border-[#233146] p-4 rounded-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E9DAE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone, location, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080B10] border border-white/10 rounded-sm pl-9 pr-3 py-2 text-xs text-white placeholder-[#5C697A] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8E9DAE]">
              Total Leads: <strong className="text-[#C5A880]">{enquiries.length}</strong>
            </span>
            <button
              onClick={fetchEnquiries}
              disabled={loading}
              className="px-3 py-2 bg-[#162030] hover:bg-[#1E2B40] border border-white/10 text-xs text-white flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {loading && enquiries.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-20 text-[#8E9DAE] text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#C5A880]" />
            Loading enquiries from database...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#0A0E17] border border-[#1C2638] text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#141C2A] flex items-center justify-center text-[#8E9DAE]">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base text-white">No Enquiries Found</h3>
            <p className="text-xs text-[#8E9DAE] max-w-md">
              {searchQuery ? "No customer enquiries match your search query." : "Customer enquiries submitted via the website Contact form will appear here dynamically."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* Left Column: Enquiry List */}
            <div className="lg:col-span-5 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filteredEnquiries.map((enq) => {
                const isSelected = selectedEnquiry?.id === enq.id;
                const formattedDate = enq.createdAt 
                  ? new Date(enq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recent";

                return (
                  <div
                    key={enq.id}
                    onClick={() => setSelectedEnquiry(enq)}
                    className={`p-4 border transition-all cursor-pointer rounded-sm ${
                      isSelected 
                        ? "bg-[#142032] border-[#C5A880]" 
                        : "bg-[#0A0E17] border-[#1C2638] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {enq.firstName ? `${enq.firstName} ${enq.lastName || ""}`.trim() : (enq.name || "Anonymous Visitor")}
                      </span>
                      <span className="text-[10px] text-[#8E9DAE] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C5A880]" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#C5A880] truncate font-medium mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#C5A880]" />
                      <span>{[enq.location, enq.country].filter(Boolean).join(", ") || "Location Unspecified"}</span>
                    </div>

                    <p className="text-xs text-[#8E9DAE] line-clamp-2 leading-relaxed">
                      {enq.message || "No message body provided."}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed View */}
            <div className="lg:col-span-7 bg-[#0A0E17] border border-[#1C2638] p-6 rounded-sm space-y-6">
              {selectedEnquiry ? (
                <>
                  <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880] block mb-1">
                        Enquiry ID: {selectedEnquiry.id}
                      </span>
                      <h2 className="font-serif text-xl text-white">
                        {selectedEnquiry.firstName ? `${selectedEnquiry.firstName} ${selectedEnquiry.lastName || ""}`.trim() : selectedEnquiry.name}
                      </h2>
                    </div>

                    <span className="px-2.5 py-1 bg-[#142236] border border-[#C5A880]/30 text-[#C5A880] text-[10px] font-mono uppercase tracking-wider">
                      {selectedEnquiry.country || "Website Lead"}
                    </span>
                  </div>

                  {/* Details Grid: Exactly 7 Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <User className="w-3 h-3 text-[#C5A880]" />
                        First Name
                      </span>
                      <span className="text-white block font-medium">
                        {selectedEnquiry.firstName || (selectedEnquiry.name ? selectedEnquiry.name.split(" ")[0] : "—")}
                      </span>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <User className="w-3 h-3 text-[#C5A880]" />
                        Last Name
                      </span>
                      <span className="text-white block font-medium">
                        {selectedEnquiry.lastName || (selectedEnquiry.name ? selectedEnquiry.name.split(" ").slice(1).join(" ") : "—")}
                      </span>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <Mail className="w-3 h-3 text-[#C5A880]" />
                        Email Address
                      </span>
                      <a href={`mailto:${selectedEnquiry.email}`} className="text-white hover:text-[#C5A880] block font-mono">
                        {selectedEnquiry.email}
                      </a>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <Phone className="w-3 h-3 text-[#C5A880]" />
                        Phone Number
                      </span>
                      <span className="text-white block font-mono">
                        {selectedEnquiry.phone || "Not provided"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3 h-3 text-[#C5A880]" />
                        Location
                      </span>
                      <span className="text-white block font-medium">
                        {selectedEnquiry.location || "Not specified"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <Globe className="w-3 h-3 text-[#C5A880]" />
                        Country
                      </span>
                      <span className="text-white block font-medium">
                        {selectedEnquiry.country || "Not specified"}
                      </span>
                    </div>

                    <div className="p-3 bg-[#080B10] border border-white/5 space-y-1 sm:col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3 h-3 text-[#C5A880]" />
                        Submission Timestamp
                      </span>
                      <span className="text-white block font-mono">
                        {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dubai" }) + " (GST)" : "Recent"}
                      </span>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9DAE] font-semibold block">
                      Message:
                    </span>
                    <div className="p-4 bg-[#080B10] border border-white/5 text-xs text-white/90 leading-relaxed rounded-sm whitespace-pre-wrap min-h-[120px]">
                      {selectedEnquiry.message || "No written message was included with this enquiry submission."}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`mailto:${selectedEnquiry.email}?subject=ASMARATY%20Shipyard%20Enquiry%20Response`}
                      className="px-4 py-2 bg-[#C5A880] hover:bg-[#d6bc96] text-[#080B10] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                    {selectedEnquiry.phone && (
                      <a
                        href={`tel:${selectedEnquiry.phone}`}
                        className="px-4 py-2 bg-[#162030] hover:bg-[#1E2B40] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Call Client</span>
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-[#8E9DAE] text-xs">
                  Select an enquiry from the list on the left to view details.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
