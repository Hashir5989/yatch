"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  ExternalLink, 
  Phone, 
  Mail, 
  Download, 
  EyeOff, 
  Sparkles 
} from "lucide-react";
import { 
  normalizeButtonConfig, 
  formatButtonHref, 
  BUTTON_STYLES 
} from "@/lib/data/buttonSchema";
import InlineButtonEditor from "@/components/cms/InlineButtonEditor";

export default function UniversalButton({
  config,
  fallbackLabel = "Learn More",
  fallbackUrl = "/contact",
  fallbackStyle = "solid-gold",
  className = "",
  isEditable = false,
  onSave = null,
  icon: CustomIcon = null,
  children,
}) {
  const normalized = normalizeButtonConfig(config, fallbackLabel, fallbackUrl, fallbackStyle);

  // When button is disabled:
  // - On public frontend: completely omit from DOM
  // - In CMS editor preview: display with a clear [Hidden] indicator so client can click & re-enable
  if (!normalized.visible && !isEditable) {
    return null;
  }

  // Resolve style class name from predefined luxury variants or custom override
  const matchedStyle = BUTTON_STYLES.find((s) => s.id === normalized.style);
  const baseStyleClass = matchedStyle ? matchedStyle.className : BUTTON_STYLES[0].className;
  const combinedClass = `${baseStyleClass} ${className}`.trim();

  // If in CMS visual editor mode, wrap inside InlineButtonEditor
  if (isEditable) {
    return (
      <InlineButtonEditor
        config={normalized}
        onSave={onSave}
        className={combinedClass}
        isEditable={true}
        icon={CustomIcon}
      >
        {children}
      </InlineButtonEditor>
    );
  }

  // Public visitor rendering
  const formattedHref = formatButtonHref(normalized.url, normalized.type);
  const target = normalized.target || (normalized.type === "external" ? "_blank" : "_self");
  const rel = target === "_blank" ? "noopener noreferrer" : undefined;

  const content = (
    <>
      <span>{children || normalized.label}</span>
      {CustomIcon && <CustomIcon className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />}
      {normalized.type === "external" && !CustomIcon && (
        <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70 group-hover:opacity-100" />
      )}
    </>
  );

  // Anchor or External links using native <a> tag
  if (normalized.type === "external" || normalized.type === "anchor" || normalized.type === "phone" || normalized.type === "email") {
    return (
      <a
        href={formattedHref}
        target={target}
        rel={rel}
        className={combinedClass}
        title={normalized.label}
      >
        {content}
      </a>
    );
  }

  // Standard internal page transition using Next.js Link
  return (
    <Link
      href={formattedHref}
      target={target}
      rel={rel}
      className={combinedClass}
      title={normalized.label}
    >
      {content}
    </Link>
  );
}

