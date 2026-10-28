"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Image as ImageIcon } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";

export default function VideoBannerSection({ 
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "CINEMATIC EXPERIENCE",
    heading = "Pure Power in Motion",
    subheading = "Witness the hydrodynamic balance and refined posture of our superyachts.",
    videoPlaceholderUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80",
    videoTitle = "ASMARATY Fleet Sea Trials — Dubai & Arabian Gulf",
    videoDuration = "02:45"
  } = data;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="py-24 bg-[#08101C] relative overflow-hidden border-t border-b border-[#14233A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          {eyebrow && (
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
              <span className="w-6 h-[1.5px] bg-[#C6A155]"></span>
            </div>
          )}
          <h2 className="saxdor-title text-3xl sm:text-5xl font-light text-white leading-tight uppercase tracking-[0.06em]">
            <InlineEditableText
              as="span"
              value={heading}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="ENTER VIDEO TITLE..."
              multiline={true}
            />
          </h2>
          {subheading && (
            <p className="text-sm sm:text-base text-[#8E9EAF] mt-4 font-light max-w-xl mx-auto saxdor-desc-justified" style={{ textAlign: "justify", textJustify: "inter-word" }}>
              <InlineEditableText
                as="span"
                value={subheading}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("subheading", val)}
                placeholder="Enter video subtitle..."
                multiline={true}
              />
            </p>
          )}
        </div>

        {/* Cinematic Video Player Mockup Container */}
        <div className="relative max-w-5xl mx-auto overflow-hidden border border-[#182C4B] shadow-2xl group bg-black">
          {isEditable && onOpenMediaPicker && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMediaPicker("videoPlaceholderUrl", videoPlaceholderUrl);
              }}
              className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-[#08101C]/90 backdrop-blur-md text-[#C5A880] border border-[#C5A880]/50 hover:bg-[#C5A880] hover:text-[#08101C] text-xs font-medium flex items-center gap-2 shadow-xl transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Change Video Poster</span>
            </button>
          )}
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={videoPlaceholderUrl}
              alt="Video thumbnail"
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                isPlaying ? "scale-105 filter brightness-110" : "scale-100 filter brightness-90"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 bg-white hover:bg-[#C6A155] text-[#08101C] hover:text-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-serif text-[#F2E6D8] tracking-wider">
                  {videoTitle}
                </span>
                <span className="text-xs text-[#828F9E]">({videoDuration})</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-none hover:bg-white/10 text-[#C6A155]"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="text-[11px] text-[#A7B2C2] uppercase tracking-wider font-sans">
                  {isPlaying ? "Simulated 4K UHD Feed" : "Ready"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
