"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Official ASMARATY Luxury Yacht Brand Logo Component
 * 
 * Variants:
 * - "full": Stacked chrome wings emblem + metallic ASMARATY wordmark (default)
 * - "horizontal": Chrome wings emblem inline with metallic ASMARATY wordmark (ideal for Navbar)
 * - "emblem": Chrome wings emblem only (ideal for badges & icons)
 * - "wordmark": Metallic ASMARATY typography only
 */
export default function AsmaratyLogo({
  variant = "full",
  tone = "light", // "light" (white/platinum for dark UI) | "dark" (charcoal for light surfaces)
  className = "",
  imgClassName = "",
  emblemClassName = "",
  textClassName = "",
  href = "/",
  priority = false,
  onClick = null,
}) {
  const isDarkTone = tone === "dark";
  const logoSrc = isDarkTone ? "/images/asmaraty-logo-dark.png" : "/images/asmaraty-logo.png";
  const emblemSrc = isDarkTone ? "/images/asmaraty-emblem-dark.png" : "/images/asmaraty-emblem.png";
  const wordmarkSrc = isDarkTone ? "/images/asmaraty-wordmark-dark.png" : "/images/asmaraty-wordmark.png";

  const effectiveImgClass = imgClassName || (className && className.includes("h-") ? className : "h-11 sm:h-13 md:h-14");

  const content = (
    <div className={`inline-flex items-center transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      {variant === "full" && (
        <div className="flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="ASMARATY YACHTS"
            className={`w-auto object-contain ${isDarkTone ? "" : "drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"} ${effectiveImgClass}`}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      )}

      {variant === "horizontal" && (
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-shrink-0">
          <img
            src={emblemSrc}
            alt="ASMARATY Emblem"
            className={`w-auto h-5 sm:h-7 md:h-8 object-contain flex-shrink-0 ${isDarkTone ? "" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"} ${emblemClassName}`}
            loading={priority ? "eager" : "lazy"}
          />
          <img
            src={wordmarkSrc}
            alt="ASMARATY YACHTS"
            className={`w-auto h-4 sm:h-5 md:h-[22px] object-contain flex-shrink-0 ${isDarkTone ? "" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"} ${textClassName}`}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      )}

      {variant === "emblem" && (
        <img
          src={emblemSrc}
          alt="ASMARATY Emblem"
          className={`w-auto h-8 sm:h-10 object-contain ${isDarkTone ? "" : "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"} ${emblemClassName}`}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {variant === "wordmark" && (
        <img
          src={wordmarkSrc}
          alt="ASMARATY YACHTS"
          className={`w-auto h-5 sm:h-6 object-contain ${isDarkTone ? "" : "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"} ${textClassName}`}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );

  if (href) {
    return (
      <Link 
        href={href} 
        onClick={onClick}
        className="inline-flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C6A155]"
        aria-label="ASMARATY Luxury Yachts"
      >
        {content}
      </Link>
    );
  }

  return content;
}
