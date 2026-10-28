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
    phone = "+971 56 526 8126",
    address = "AL SHAALI MARINE, RASHIDIA 1, AJMAN, United Arab Emirates",
  } = data;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    country: "",
    message: "",
    consentPrivacy: true,
    consentMailing: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setFormSubmitted(true);
      } else {
        setErrorMessage(data.error || "Failed to submit enquiry. Please check your inputs.");
      }
    } catch (err) {
      console.warn("Could not submit enquiry to API:", err);
      setErrorMessage("Network error. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
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

          <p className="text-sm sm:text-base text-[#8E9EAF] leading-relaxed font-light saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
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
                <div className="saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold">Headquarters & Marine Facilities</div>
                <div className="text-sm text-white font-medium mt-0.5 whitespace-pre-line leading-relaxed">
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
                  Thank you. An ASMARATY Senior Naval Advisor will review your details and contact you shortly.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      location: "",
                      country: "",
                      message: "",
                      consentPrivacy: true,
                      consentMailing: false,
                    });
                  }}
                  className="mt-6 text-xs text-[#C6A155] underline uppercase tracking-widest font-bold cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* Row 2: Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* Row 3: Location & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City / Marina"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>

                  <div>
                    <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="United Arab Emirates"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* Row 4: Message */}
                <div>
                  <label className="block saxdor-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#8E9EAF] font-bold mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type of Message Here!"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-[#08101C] border border-[#1B2D49] text-sm text-white focus:outline-none focus:border-[#C6A155] transition-colors resize-none rounded-none"
                  ></textarea>
                </div>

                {/* Consents */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#8E9EAF] leading-relaxed">
                    <input
                      type="checkbox"
                      checked={formData.consentPrivacy}
                      onChange={(e) => setFormData({ ...formData, consentPrivacy: e.target.checked })}
                      className="mt-0.5 accent-[#C6A155] rounded-none cursor-pointer"
                    />
                    <span>By submitting a contact request, you provide consent for us to collect and use your information pursuant to our Privacy Policy and Terms of Use.</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#8E9EAF]">
                    <input
                      type="checkbox"
                      checked={formData.consentMailing}
                      onChange={(e) => setFormData({ ...formData, consentMailing: e.target.checked })}
                      className="accent-[#C6A155] rounded-none cursor-pointer"
                    />
                    <span>I would like to be added to the Mailing List</span>
                  </label>
                </div>

                <p className="text-[11px] text-[#5A6B80] leading-relaxed pt-1 saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
                  ASMARATY will use the information you provide on this form to be in touch with you and provide updates and marketing. You can change your mind at any time by clicking the unsubscribe link in the footer of any email you receive from us, or by contacting us. We will treat your information with respect.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full saxdor-btn-solid !h-[54px] py-4 flex items-center justify-center gap-2 rounded-none font-bold uppercase tracking-wider text-xs cursor-pointer transition-all disabled:opacity-50"
                >
                  <span>{submitting ? "Sending..." : "Send Message"}</span>
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
