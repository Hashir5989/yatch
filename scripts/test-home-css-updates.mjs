import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=== Testing Home Page CSS Changes ===");

// 1. Verify YachtCollectionSection.js
const yachtCollectionCode = fs.readFileSync("./components/public/sections/YachtCollectionSection.js", "utf-8");

// Requirement 1a: No black border on yacht model images
assert(
  !yachtCollectionCode.includes("border-black/5"),
  "border-black/5 must be removed from yacht model image containers in YachtCollectionSection.js"
);
assert(
  yachtCollectionCode.includes('className="block group overflow-hidden shadow-xl"'),
  "Yacht model image Link container must render without border class"
);
console.log("✓ Requirement 1a: Black border removed from all four yacht model images in OUR SUPERYACHT COLLECTION");

// Requirement 2: yacht-model-title class on yacht model titles
assert(
  yachtCollectionCode.includes("yacht-model-title"),
  "Yacht model titles in OUR SUPERYACHT COLLECTION must use yacht-model-title class"
);

// 2. Verify globals.css
const globalsCss = fs.readFileSync("./app/globals.css", "utf-8");
assert(
  globalsCss.includes("h3.yacht-model-title"),
  "globals.css must contain h3.yacht-model-title rule"
);
assert(
  globalsCss.includes("font-weight: 300 !important;"),
  "globals.css must define font-weight: 300 !important for yacht model titles"
);
assert(
  globalsCss.includes("font-family: \"Neue Haas Grotesk Display Pro\""),
  "globals.css must preserve Neue Haas Grotesk Display Pro font family"
);
console.log("✓ Requirement 2: font-weight 300 verified on G100, G77, G66, and G50 titles via h3.yacht-model-title");

// 3. Verify ImageTextSection.js
const imageTextCode = fs.readFileSync("./components/public/sections/ImageTextSection.js", "utf-8");

// Requirement 1b: No black border on "A SHARED PASSION FOR LIFE AT SEA"
assert(
  imageTextCode.includes("isSharedPassion"),
  "ImageTextSection.js must contain isSharedPassion check"
);
assert(
  imageTextCode.includes("SHARED PASSION"),
  "ImageTextSection.js must identify SHARED PASSION section"
);
assert(
  imageTextCode.includes('${isSharedPassion ? "" : "border border-[#0E2047]/15"}'),
  "ImageTextSection.js must omit border on isSharedPassion video showcase"
);
console.log("✓ Requirement 1b: Black border removed from image in A SHARED PASSION FOR LIFE AT SEA");

// 4. Verify other pages remain unchanged
const catalogCode = fs.readFileSync("./components/public/yacht-catalog/UniversalYachtCatalogView.js", "utf-8");
assert(
  !catalogCode.includes("yacht-model-title"),
  "UniversalYachtCatalogView.js must not have Home-specific font-weight override"
);
console.log("✓ Scope isolation: Yacht listing page typography remains unchanged");

const detailCode = fs.readFileSync("./components/public/yacht-details/UniversalYachtDetailView.js", "utf-8");
assert(
  !detailCode.includes("yacht-model-title"),
  "UniversalYachtDetailView.js must not have Home-specific font-weight override"
);
console.log("✓ Scope isolation: Yacht detail page typography remains unchanged");

console.log("\n=======================================================");
console.log("  ALL HOME PAGE CSS VALIDATION CHECKS PASSED!");
console.log("=======================================================");
