"use client";

import { useState } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import InlineEditableText from "@/components/cms/InlineEditableText";

export default function ImageGallerySection({ 
  data = {},
  isEditable = false,
  onUpdateField = null,
  onOpenMediaPicker = null,
}) {
  const {
    eyebrow = "VISUAL DIARY",
    heading = "Moments of Maritime Elegance",
    description = "Step aboard our handcrafted vessels and discover the exquisite textures, sweeping lines, and bespoke appointments.",
    images = [
      {
        url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
        caption: "Full-beam master stateroom with panoramic views",
        alt: "Master suite with bespoke furnishings"
      },
      {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
        caption: "Main deck saloon featuring Italian open-grain oak",
        alt: "Contemporary yacht saloon"
      },
      {
        url: "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?auto=format&fit=crop&w=1200&q=80",
        caption: "Upper flybridge with glass-edge jacuzzi",
        alt: "Flybridge spa and loungers"
      },
      {
        url: "https://images.unsplash.com/photo-1540946485038-504a37090af7?auto=format&fit=crop&w=1200&q=80",
        caption: "Modern glass cockpit navigation helm",
        alt: "Yacht helm controls"
      },
      {
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        caption: "Hydraulic beach club and swim terrace",
        alt: "Aft yacht terrace"
      },
      {
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
        caption: "Bow sun lounge for sunset entertaining",
        alt: "Forward yacht deck"
      }
    ]
  } = data;

  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const openLightbox = (index) => setActiveImageIndex(index);
  const closeLightbox = () => setActiveImageIndex(null);
  
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="py-24 sm:py-32 bg-[#08101C] text-[#E8EAEE] relative border-t border-b border-[#14233A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
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
            </div>
          )}
          <h2 className="saxdor-title text-3xl sm:text-4xl md:text-5xl font-light text-white leading-tight uppercase tracking-[0.06em]">
            <InlineEditableText
              as="span"
              value={heading}
              isEditable={isEditable}
              onChange={(val) => onUpdateField && onUpdateField("heading", val)}
              placeholder="ENTER GALLERY TITLE..."
              multiline={true}
            />
          </h2>
          {description && (
            <p className="text-sm sm:text-base text-[#8E9EAF] mt-4 font-light">
              <InlineEditableText
                as="span"
                value={description}
                isEditable={isEditable}
                onChange={(val) => onUpdateField && onUpdateField("description", val)}
                placeholder="Enter gallery description..."
                multiline={true}
              />
            </p>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className="group relative h-80 overflow-hidden border border-[#182C4B] cursor-pointer bg-[#0E2047]"
            >
              <img
                src={item.url}
                alt={item.alt || item.caption || "Yacht Gallery"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08101C]/90 via-[#08101C]/30 to-transparent opacity-60 group-hover:opacity-85 transition-opacity"></div>
              
              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 w-9 h-9 bg-[#0E2047]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-[#C6A155]" />
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="absolute bottom-4 left-4 right-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="text-xs font-sans text-white tracking-wide font-medium">
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 text-white hover:text-[#0E2047] w-12 h-12 border border-white/20 bg-[#08101C]/80 hover:bg-white flex items-center justify-center transition-all cursor-pointer rounded-none"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={images[activeImageIndex].url}
              alt="Preview"
              className="max-h-[75vh] w-auto object-contain shadow-2xl border border-white/10"
            />
            {images[activeImageIndex].caption && (
              <p className="mt-4 text-center font-sans text-sm sm:text-base text-[#DFBA73] uppercase tracking-wider">
                {images[activeImageIndex].caption}
              </p>
            )}
          </div>

          <button
            onClick={nextImage}
            className="absolute right-6 text-white hover:text-[#0E2047] w-12 h-12 border border-white/20 bg-[#08101C]/80 hover:bg-white flex items-center justify-center transition-all cursor-pointer rounded-none"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}
