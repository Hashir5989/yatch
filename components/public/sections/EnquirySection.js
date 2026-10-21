"use client";

import { useState } from "react";
import { Send, CheckCircle2, Phone, Mail, MapPin, Shield } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";

export default function EnquirySection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "VIP CONCIERGE & COMMISSIONS",
    heading = "Request Private Sea Trial or Shipyard Consultation",
    description = "Connect directly with our luxury yacht advisory team in the UAE. We arrange private sea trials and confidential bespoke build consultations.",
    recipientEmail = "info@asmaraty.fake",
    phone = "+971 1234567890",
    address = "ASMARATY Shipyard, Maritime District, UAE",
    yachtOptions = [
      "AS 100 Superyacht",
      "Magellan 32 Explorer",
      "AS 88 Flybridge",
      "AS 68 Sports Cruiser",
      "AS 45 Island Explorer",
      "Custom Vessel Build"
    ]
  } = data;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    model: yachtOptions[0] || "AS 100 Superyacht",
    inquiryType: "Sea Trial Request",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#08101C] text-[#E8EAEE] relative border-t border-b border-[#14233A]" id="enquiry-form">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-6 h-[1.5px] bg-[#C6A155]"></span>
                <InlineEditableText
                  as="span"
                  value={eyebrow}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
                  className="saxdor-eyebrow text-xs uppercase tracking-[0.24em] text-[#C6A155] font-sans font-bold"
                  placeholder="EYEBROW..."
                />
              </div>

              <h2 className="saxdor-title text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight uppercase tracking-[0.06em]">
                <InlineEditableText
                  as="span"
                  value={heading}
                  isEditable={isEditable}
                  onChange={(val) => onUpdateField && onUpdateField("heading", val)}
                  placeholder="Enter enquiry heading..."
                  multiline={true}
                />
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#8E9EAF] leading-relaxed font-light">
              <InlineEditableText
                as="span"
                value={description}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("description", val)}
                placeholder="Enter description..."
                multiline={true}
              />
            </p>

            <div className="space-y-6 pt-4 border-t border-[#182C4B]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0E2047] border border-[#1E345A] flex items-center justify-center text-[#C6A155] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold">Direct Concierge Phone</div>
                  <div className="text-sm text-white font-medium mt-0.5">
                    <InlineEditableText
                      as="span"
                      value={phone}
                      isEditable={isEditable}
                      onChange={(val) => onUpdateField && onUpdateField("phone", val)}
                      placeholder="+971 6 ..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0E2047] border border-[#1E345A] flex items-center justify-center text-[#C6A155] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold">VIP Advisory Email</div>
                  <div className="text-sm text-[#C6A155] font-medium mt-0.5">
                    <InlineEditableText
                      as="span"
                      value={recipientEmail}
                      isEditable={isEditable}
                      onChange={(val) => onUpdateField && onUpdateField("recipientEmail", val)}
                      placeholder="vip@..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0E2047] border border-[#1E345A] flex items-center justify-center text-[#C6A155] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold">Shipyard & Marina Facilities</div>
                  <div className="text-sm text-white font-medium mt-0.5">
                    <InlineEditableText
                      as="span"
                      value={address}
                      isEditable={isEditable}
                      onChange={(val) => onUpdateField && onUpdateField("address", val)}
                      placeholder="Shipyard location..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#0E2047]/40 border border-[#C6A155]/20 flex items-center gap-3 text-xs text-[#8E9EAF]">
              <Shield className="w-5 h-5 text-[#C6A155] flex-shrink-0" />
              <span>All consultations and private sea trials are held under strict non-disclosure discretion.</span>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#0E2047]/60 p-8 sm:p-10 border border-[#182C4B] relative">
              {formSubmitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#C6A155]/20 text-[#C6A155] flex items-center justify-center mx-auto mb-4 border border-[#C6A155]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="saxdor-title text-2xl text-white uppercase tracking-wider">
                    Enquiry Received with Discretion
                  </h3>
                  <p className="text-sm text-[#8E9EAF] max-w-md mx-auto">
                    Thank you. An ASMARATY Senior Naval Advisor will contact you within 2 hours to confirm your private sea trial or consultation.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="mt-6 text-xs text-[#C6A155] underline uppercase tracking-widest font-bold"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sheikh / Mr / Dr. ..."
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="owner@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                        Contact Number / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+971 50 ..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                        Yacht Model of Interest
                      </label>
                      <select
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors"
                      >
                        {yachtOptions.map((opt, i) => (
                          <option key={i} value={opt} className="bg-[#08101C]">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Inquiry Focus
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["Sea Trial Request", "Custom Build Consultation", "Price & Spec List"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, inquiryType: type })}
                          className={`text-xs py-2.5 px-3 border text-center transition-all uppercase tracking-wider font-semibold rounded-none cursor-pointer ${
                            formData.inquiryType === type
                              ? "bg-white text-[#0E2047] font-bold border-white"
                              : "bg-[#08101C] text-[#8E9EAF] border-[#1B2D49] hover:border-white/30"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Confidential Notes / Custom Preferences
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please mention preferred dates for sea trials, cruising range requirements, or interior customization requests..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors resize-none rounded-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full saxdor-btn-solid !h-[56px] py-4 flex items-center justify-center gap-2 rounded-none font-bold"
                  >
                    <span>Submit Confidential Inquiry</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
