"use client";

import { useState, useRef } from "react";

export default function InlineEditableText({
  value = "",
  onChange,
  isEditable = false,
  as: Component = "span",
  className = "",
  placeholder = "Click to edit text...",
  multiline = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const elementRef = useRef(null);

  if (!isEditable) {
    return <Component className={className} {...props}>{value}</Component>;
  }

  const handleBlur = (e) => {
    setIsFocused(false);
    const newText = e.currentTarget.innerText.trim();
    if (onChange && newText !== value) {
      onChange(newText);
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return (
    <Component
      ref={elementRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} transition-all duration-200 cursor-text outline-none ${
        isFocused
          ? "ring-1 ring-[#C5A880] bg-[#C5A880]/10 rounded-xs shadow-[0_0_15px_rgba(197,168,128,0.25)]"
          : "hover:outline-dashed hover:outline-1 hover:outline-[#C5A880]/60 hover:bg-white/[0.03] rounded-xs"
      }`}
      title="Click directly to edit text"
      {...props}
    >
      {value || placeholder}
    </Component>
  );
}
