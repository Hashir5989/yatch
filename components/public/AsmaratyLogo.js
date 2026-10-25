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
  className = "",
  emblemClassName = "",
  textClassName = "",
  href = "/",
  priority = false,
  onClick = null,
}) {
  const content = (
    <div className={`inline-flex items-center transition-transform duration-300 hover:scale-[1.02] ${className}`}>
      {variant === "full" && (
        <div className="flex flex-col items-center justify-center">
          <img
            src="/images/asmaraty-logo.png"
            alt="ASMARATY"
            className="w-auto h-12 sm:h-14 md:h-16 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      )}

      {variant === "horizontal" && (
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 flex-shrink-0">
          <img
            src="/images/asmaraty-emblem.png"
            alt="ASMARATY Emblem"
            className={`w-auto h-5 sm:h-7 md:h-8 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${emblemClassName}`}
            loading={priority ? "eager" : "lazy"}
          />
          <img
            src="/images/asmaraty-wordmark.png"
            alt="ASMARATY"
            className={`w-auto h-3 sm:h-4 md:h-[18px] object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${textClassName}`}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
      )}

      {variant === "emblem" && (
        <img
          src="/images/asmaraty-emblem.png"
          alt="ASMARATY Emblem"
          className={`w-auto h-8 sm:h-10 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${emblemClassName}`}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {variant === "wordmark" && (
        <img
          src="/images/asmaraty-wordmark.png"
          alt="ASMARATY"
          className={`w-auto h-5 sm:h-6 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${textClassName}`}
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
