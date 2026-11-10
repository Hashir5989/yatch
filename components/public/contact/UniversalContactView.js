"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Anchor,
  Sparkles,
  Ship,
  HelpCircle,
  Calendar,
  Building2
} from "lucide-react";
import { WhatsAppIcon } from "@/components/public/WhatsAppConcierge";

const FAQS = [
  {
    q: "How can I schedule a private sea trial?",
    a: "Private sea trials can be arranged directly through our VIP concierge. We coordinate trial departures from Dubai Marina or our shipyard harbor in Ajman, complete with a professional captain and technical crew to demonstrate hull performance and onboard systems."
  },
  {
    q: "Where is the ASMARATY shipyard located?",
    a: "Our primary naval shipyard facility is operated by Al Shaali Marine in Rashidia 1, Ajman, United Arab Emirates. Established in 1979, the shipyard spans extensive manufacturing halls, composite lamination bays, an interior carpentry atelier, and direct waterfront access."
  },
  {
    q: "What customization options are offered for new builds?",
    a: "Every ASMARATY yacht is fully customizable. Owners partner with our naval architects to tailor deck layouts, select rare book-matched marbles, specify bespoke leather upholstery, configure engine and generator packages, and install custom audio-visual or tender handling solutions."
  },
  {
    q: "Do you assist with international delivery and export certification?",
    a: "Yes. We manage turnkey international maritime logistics, CE and RINA classification documentation, customs clearance, sea transport, and worldwide commissioning through our global network of marine partners."
  }
];

export default function UniversalContactView({ pageData = null }) {
  const heroSection = pageData?.sections?.find((s) => s.id === "contact-hero" || s.type === "hero_banner");
  const enquirySection = pageData?.sections?.find((s) => s.id === "enquiry-form" || s.type === "enquiry_section");

  const heroEyebrow = heroSection?.eyebrow || "VIP Maritime Concierge & Shipyard Headquarters";
  const heroHeading = heroSection?.heading || "Contact ASMARATY";
  const heroSubheading = heroSection?.subheading || "Connect directly with our luxury yacht advisory team in the United Arab Emirates. Schedule a private sea trial, discuss bespoke superyacht commissions, or arrange an exclusive walkthrough at our shipyard.";
  const heroImage = heroSection?.imageUrl || "/images/yachts/g100/5.jpg";
  const heroImageAlt = heroSection?.imageAlt || "ASMARATY Yacht Maritime Concierge";

  const formEyebrow = enquirySection?.eyebrow || "DIRECT DIALOGUE";
  const formHeading = enquirySection?.heading || "Request Private Consultation";
  const formDescription = enquirySection?.description || "Whether you are planning to commission an ASMARATY flagship superyacht or wish to experience our dynamic flybridge cruisers firsthand, our advisory team coordinates private sea trials and confidential walkthroughs across the UAE.";
  const contactPhone = enquirySection?.phone || "+971 56 526 8126";
  const contactEmail = enquirySection?.recipientEmail || "info@asmaraty.com";
  const contactAddress = enquirySection?.address || "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "United Arab Emirates",
    modelInterested: "ASMARATY G-100 Super Yacht (100 FT • Flagship)",
    serviceRequired: "Private Sea Trial",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const clientCountry = (formData.country || "United Arab Emirates").trim();
    const finalMessage = formData.message.trim()
      ? `[Vessel: ${formData.modelInterested}]\n[Service: ${formData.serviceRequired}]\n\n${formData.message.trim()}`
      : `[Vessel: ${formData.modelInterested}]\n[Service: ${formData.serviceRequired}]\n\nPrivate consultation request submitted for ${formData.modelInterested}.`;

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          country: clientCountry,
          location: clientCountry,
          model: formData.modelInterested,
          message: finalMessage,
          consentPrivacy: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit enquiry. Please verify your details.");
      }
    } catch (err) {
      console.warn("Could not submit enquiry:", err);
      setErrorMessage("Network error. Please try again or reach out directly on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#080B10] text-[#E8EAEE] min-h-screen">
      {/* -------------------------------------------------------------
          1. HERO HEADER BANNER
          ------------------------------------------------------------- */}
      <section className="relative min-h-[60vh] lg:min-h-[68vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Image with Dark Maritime Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={heroImageAlt}
            className="w-full h-full object-cover object-center filter brightness-[0.5] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/75 to-[#080B10]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-24 text-center flex flex-col items-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-[#0E1A2D]/85 border border-[#C6A155]/40 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C6A155] animate-pulse" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.28em] text-[#DFBA73]">
              {heroEyebrow}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal text-white uppercase tracking-[0.03em] leading-[1.18] mb-4 max-w-3xl">
            {heroHeading}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-white/75 font-light max-w-3xl mx-auto leading-relaxed mb-6 text-center [text-wrap:balance]">
            {heroSubheading}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href="#contact-form"
              className="saxdor-btn-solid !h-[44px] !px-6 sm:!px-8 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none shadow-xl cursor-pointer"
            >
              <span>Submit Enquiry</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20would%20like%20to%20connect%20with%20your%20advisory%20team."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 h-[44px] bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all rounded-none shadow-xl"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp VIP Concierge</span>
            </a>

            <a
              href="tel:+971565268126"
              className="saxdor-btn-outline !h-[44px] !px-6 sm:!px-8 text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 rounded-none hover:border-[#C6A155] hover:text-[#DFBA73]"
            >
              <Phone className="w-3.5 h-3.5 text-[#C6A155]" />
              <span>+971 56 526 8126</span>
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. OFFICIAL SHIPYARD DETAILS CARDS (ADDRESS, PHONE, EMAIL, HOURS)
          ------------------------------------------------------------- */}
      <section className="py-16 sm:py-20 bg-[#06090D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Shipyard Address */}
            <div className="p-8 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 bg-[#080B10] border border-[#C6A155]/30 flex items-center justify-center mb-5 text-[#C6A155]">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                  SHIPYARD HEADQUARTERS
                </span>
                <h3 className="font-serif text-base sm:text-lg text-white font-normal mb-1.5">
                  Al Shaali Marine
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  Rashidia 1, Ajman Waterfront<br />
                  P.O. Box 787<br />
                  United Arab Emirates
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=Al+Shaali+Marine+Ajman+UAE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#DFBA73] hover:text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 pt-3 border-t border-white/10 transition-colors"
              >
                <span>View on Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 2: Telephone Advisory */}
            <div className="p-8 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 bg-[#080B10] border border-[#C6A155]/30 flex items-center justify-center mb-5 text-[#C6A155]">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                  DIRECT CLIENT DESK
                </span>
                <h3 className="font-serif text-base sm:text-lg text-white font-normal mb-1.5">
                  Advisory Hotline
                </h3>
                <p 
                  className="text-xs text-white/70 leading-relaxed font-light mb-3 min-h-[36px] text-justify"
                  style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                >
                  Direct telephone contact for private client inquiries, vessel pricing, and sea trials.
                </p>
                <a
                  href="tel:+971565268126"
                  className="font-mono text-xs sm:text-[13px] font-semibold text-white hover:text-[#DFBA73] block transition-colors"
                >
                  +971 56 526 8126
                </a>
                <a
                  href="tel:+97167436443"
                  className="font-mono text-xs text-white/60 hover:text-white block mt-1 transition-colors"
                >
                  Tel: +971 6 743 6443
                </a>
              </div>
              <a
                href="tel:+971565268126"
                className="text-xs text-[#DFBA73] hover:text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 pt-3 border-t border-white/10 transition-colors"
              >
                <span>Call Concierge Now</span>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 3: Confidential Email */}
            <div className="p-8 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 bg-[#080B10] border border-[#C6A155]/30 flex items-center justify-center mb-5 text-[#C6A155]">
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                  CONFIDENTIAL INQUIRIES
                </span>
                <h3 className="font-serif text-base sm:text-lg text-white font-normal mb-1.5">
                  Official Email
                </h3>
                <p 
                  className="text-xs text-white/70 leading-relaxed font-light mb-3 min-h-[36px] text-justify"
                  style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                >
                  Submit detailed technical requirements, charter partnerships, or brochure requests.
                </p>
                <a
                  href="mailto:info@asmaraty.com"
                  className="font-mono text-xs sm:text-[13px] font-semibold text-white hover:text-[#DFBA73] block transition-colors"
                >
                  info@asmaraty.com
                </a>
              </div>
              <a
                href="mailto:info@asmaraty.com"
                className="text-xs text-[#DFBA73] hover:text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1.5 pt-3 border-t border-white/10 transition-colors"
              >
                <span>Send Direct Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Card 4: Operating Hours */}
            <div className="p-8 bg-[#0D1522] border border-white/10 hover:border-[#C6A155]/60 transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 bg-[#080B10] border border-[#C6A155]/30 flex items-center justify-center mb-5 text-[#C6A155]">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C6A155] font-semibold block mb-1">
                  OFFICIAL HOURS (GST)
                </span>
                <h3 className="font-serif text-base sm:text-lg text-white font-normal mb-1.5">
                  Visiting Schedule
                </h3>
                <div className="text-xs text-white/70 space-y-1.5 font-light">
                  <div className="flex justify-between">
                    <span>Saturday – Thursday:</span>
                    <span className="text-white font-mono">08:00 – 17:00</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Friday:</span>
                    <span className="text-[#DFBA73] font-medium font-mono">Closed (Weekly Leave)</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#C6A155] pt-3 border-t border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Private appointments accommodated Saturday – Thursday</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. INTERACTIVE CONTACT & SEA TRIAL CONSULTATION FORM
          ------------------------------------------------------------- */}
      <section className="py-24 sm:py-32 bg-[#080B10] relative" id="contact-form">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Context & Concierge Promise */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6A155] font-semibold block mb-2">
                  {formEyebrow}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em] leading-tight mb-3">
                  {formHeading}
                </h2>
                <p 
                  className="text-xs sm:text-sm text-white/75 font-light leading-relaxed text-justify"
                  style={{ textAlign: "justify", textJustify: "inter-word", hyphens: "auto" }}
                >
                  {formDescription}
                </p>
              </div>

              {/* Service Capabilities Checklist */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3.5 p-3.5 sm:p-4 bg-[#0D1522] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#C6A155]/15 border border-[#C6A155]/40 flex items-center justify-center text-[#DFBA73] flex-shrink-0 mt-0.5">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white mb-0.5">Private Sea Trials</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light">
                      Departing from Dubai Marina or Ajman harbor with our naval engineering team.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 sm:p-4 bg-[#0D1522] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#C6A155]/15 border border-[#C6A155]/40 flex items-center justify-center text-[#DFBA73] flex-shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white mb-0.5">Shipyard Walkthroughs</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light">
                      Inspect active hull laminations, composite joinery, and engineering bays in Ajman.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 sm:p-4 bg-[#0D1522] border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-[#C6A155]/15 border border-[#C6A155]/40 flex items-center justify-center text-[#DFBA73] flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-[13px] font-semibold text-white mb-0.5">Bespoke Design Atelier</h4>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light">
                      Customize 3D interior layouts, marble selections, audio-visual suites, and tender garages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="p-5 sm:p-6 bg-[#0E1A2D]/80 border border-[#C6A155]/30 space-y-2.5">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#DFBA73] font-semibold block">
                  FAST-TRACK VIP ACCESS
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  Require instant yacht brochures, current delivery lead times, or immediate sea trial scheduling?
                </p>
                <a
                  href="https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Message on WhatsApp (+971 56 526 8126)</span>
                </a>
              </div>
            </div>

            {/* Right Column: Complete Interactive Form */}
            <div className="lg:col-span-7 bg-[#0D1522] border border-white/10 p-6 sm:p-10 shadow-2xl">
              {formSubmitted ? (
                <div className="py-14 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-[#C6A155] mx-auto animate-bounce" />
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-normal">
                    Enquiry Received with Priority
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-[#DFBA73] font-semibold">{formData.firstName} {formData.lastName}</span>. Your consultation request regarding <span className="text-white font-medium">{formData.modelInterested}</span> has been routed directly to our senior yacht advisory team in the UAE.
                  </p>
                  <p className="text-xs text-white/60">
                    A dedicated naval representative will contact you via email or WhatsApp within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        country: "United Arab Emirates",
                        modelInterested: "ASMARATY G-100 Super Yacht (100 FT • Flagship)",
                        serviceRequired: "Private Sea Trial",
                        message: "",
                      });
                    }}
                    className="saxdor-btn-solid !h-[42px] px-6 text-xs font-bold uppercase tracking-wider mt-3"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-white font-normal mb-1">
                      Client Consultation Form
                    </h3>
                    <p className="text-xs text-white/60">
                      Please enter your contact details and select your vessel or service of interest.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-red-900/40 border border-red-500/60 text-red-200 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Vessel of Interest Selection */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Vessel of Interest *
                    </label>
                    <select
                      value={formData.modelInterested}
                      onChange={(e) => setFormData({ ...formData, modelInterested: e.target.value })}
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white focus:outline-none"
                    >
                      <option value="ASMARATY G-100 Super Yacht (100 FT • Flagship)">ASMARATY G-100 Super Yacht (100 FT • Tri-Deck Flagship)</option>
                      <option value="ASMARATY G77 Luxury Yacht (77 FT • Two-Deck)">ASMARATY G77 Luxury Yacht (77 FT • Two-Deck Yacht)</option>
                      <option value="ASMARATY G-66 Luxury Yacht (66 FT • Flybridge)">ASMARATY G-66 Luxury Yacht (66 FT • Flybridge Cruiser)</option>
                      <option value="ASMARATY G-50 Luxury Motor Yacht (50 FT • Motor Yacht)">ASMARATY G-50 Luxury Motor Yacht (50 FT • Flybridge)</option>
                      <option value="All Fleet Inquiry & Price List">General Fleet Inquiry & Price List</option>
                    </select>
                  </div>

                  {/* Service Required */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Primary Service Required
                    </label>
                    <select
                      value={formData.serviceRequired}
                      onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white focus:outline-none"
                    >
                      <option value="Private Sea Trial">Book Private Sea Trial (Dubai / Ajman)</option>
                      <option value="Shipyard Walkthrough">Schedule VIP Shipyard Walkthrough</option>
                      <option value="Purchase Consultation">New Build Purchase & Specifications Consultation</option>
                      <option value="Brochure & Price List Request">Brochure & Specification Dossier Request</option>
                    </select>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Alexander"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Sterling"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alexander@domain.com"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+971 50 000 0000"
                        className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Country / Residence */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Country of Residence / Yacht Home Port
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United Arab Emirates, Saudi Arabia, Monaco, United Kingdom"
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-2">
                      Specific Requirements / Preferred Dates
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please share any preferred sea trial dates, delivery timing, or bespoke interior requests..."
                      className="w-full bg-[#080B10] border border-white/15 focus:border-[#C6A155] px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full saxdor-btn-solid !h-[52px] text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-none shadow-2xl"
                  >
                    {submitting ? (
                      <span>Transmitting Consultation Request...</span>
                    ) : (
                      <>
                        <span>Submit Private Consultation Request</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-white/40 text-center leading-relaxed">
                    By submitting this form, you authorize our confidential yacht advisory team to contact you regarding your inquiry. Your private data is never shared.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. INTERACTIVE SHIPYARD LOCATION & GOOGLE MAP
          ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-[#06090D] border-t border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6A155] font-semibold block mb-2">
              LOCATION & ACCESS
            </span>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-normal text-white uppercase tracking-[0.03em] mb-2">
              Visit Our UAE Shipyard Facility
            </h2>
            <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed max-w-2xl mx-auto text-center [text-wrap:balance]">
              Centrally located on the Ajman waterfront, within 35 minutes of Dubai International Airport (DXB). Private marina berths and helicopter arrival can be coordinated upon request.
            </p>
          </div>

          {/* Map Frame Container */}
          <div className="bg-[#0D1522] border border-white/10 p-2 sm:p-4 shadow-2xl">
            <div className="relative w-full h-[400px] sm:h-[480px] overflow-hidden bg-[#080B10]">
              <iframe
                title="ASMARATY - Al Shaali Marine Shipyard Location"
                src="https://maps.google.com/maps?q=Al%20Shaali%20Marine,%20Rashidia%201,%20Ajman,%20UAE&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(1.1) brightness(0.85)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Address Overlay Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md p-4 sm:p-5 bg-[#080B10]/95 backdrop-blur-md border border-[#C6A155]/40 shadow-2xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C6A155] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-wider text-[#DFBA73] font-semibold font-mono mb-1">
                      Al Shaali Marine Shipyard
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-light">
                      Rashidia 1, Ajman Waterfront, United Arab Emirates
                    </p>
                    <a
                      href="https://maps.google.com/?q=Al+Shaali+Marine+Ajman+UAE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#C6A155] hover:text-white uppercase tracking-wider font-semibold inline-flex items-center gap-1 mt-2.5 transition-colors"
                    >
                      <span>Open in Google Maps App</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. FREQUENTLY ASKED QUESTIONS (FAQ)
          ------------------------------------------------------------- */}
      <section className="py-20 sm:py-28 bg-[#080B10]">
        <div className="max-w-4xl mx-auto px-6 sm:px-12">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#C6A155] font-semibold block mb-2">
              CLIENT ASSISTANCE
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-white uppercase tracking-[0.03em] mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-light max-w-xl mx-auto text-center [text-wrap:balance]">
              Key details regarding private sea trials, shipyard visits, and bespoke yacht commissioning.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/10 bg-[#0D1522] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="font-serif text-sm sm:text-base text-white font-normal">
                      {faq.q}
                    </span>
                    <span className={`text-[#C6A155] text-lg font-light transform transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-[13px] text-white/75 font-light leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
