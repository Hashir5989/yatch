"use client";

import { Award } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";

export default function RichTextSection({
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "THE SHIPYARD PHILOSOPHY",
    heading = "An Uncompromising Commitment to Maritime Perfection",
    content = `Founded in 1979, our shipyard in the United Arab Emirates was established with a daring mission: to pioneer the Middle East's very first high-tech composite yacht manufacturing enterprise.

Over the past four and a half decades, ASMARATY has delivered hundreds of luxury yachts, law enforcement patrol vessels, and commercial marine crafts that navigate oceans across five continents. We remain dedicated to a bespoke shipbuilding philosophy where no two hulls are identical.`,
    authorName = "Naval Architecture Advisory",
    authorTitle = "Founder & Chairman, ASMARATY",
    contentAlignment = "left"
  } = data;

  const isCenter = contentAlignment === "center";
  const paragraphs = (content || "").split("\n\n").filter(Boolean);

  return (
    <section className="py-24 sm:py-32 bg-[#090C12] text-[#E8EAEE] relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className={isCenter ? "text-center" : "text-left"}>
          <div className={`inline-flex items-center gap-2 mb-4 ${isCenter ? "justify-center" : ""}`}>
            <span className="w-8 h-[1px] bg-[#C5A880]"></span>
            <InlineEditableText
              as="span"
              value={eyebrow}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("eyebrow", val)}
              className="text-xs uppercase tracking-luxury text-[#C5A880] font-sans font-medium"
              placeholder="EYEBROW..."
            />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight mb-12">
            <InlineEditableText
              as="span"
              value={heading}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="Enter section headline..."
              multiline={true}
            />
          </h2>

          <div className="space-y-6 text-base sm:text-lg text-[#A6B4C4] font-light leading-relaxed saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
            {isEditable ? (
              <InlineEditableText
                as="div"
                value={content}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("content", val)}
                placeholder="Write editorial essay here..."
                multiline={true}
                className="whitespace-pre-line"
              />
            ) : (
              paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? "first-letter:text-5xl first-letter:font-serif first-letter:text-[#C5A880] first-letter:mr-3 first-letter:float-left first-letter:leading-none" : ""}>
                  {p}
                </p>
              ))
            )}
          </div>

          {(authorName || authorTitle) && (
            <div className={`mt-12 pt-8 border-t border-white/10 flex items-center gap-4 ${isCenter ? "justify-center" : ""}`}>
              <div className="w-12 h-12 rounded-full border border-[#C5A880]/50 bg-[#121822] flex items-center justify-center text-[#C5A880]">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-serif text-lg text-white font-normal">
                  <InlineEditableText
                    as="span"
                    value={authorName}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("authorName", val)}
                    placeholder="Author Name"
                  />
                </div>
                <div className="text-xs text-[#C5A880] tracking-wider uppercase font-sans">
                  <InlineEditableText
                    as="span"
                    value={authorTitle}
                    isEditable={isEditable}
                    onChange={(val) => onUpdateField && onUpdateField("authorTitle", val)}
                    placeholder="Author Title"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
