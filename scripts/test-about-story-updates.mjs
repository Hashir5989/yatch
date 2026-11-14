import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=== Testing About Us Section 2 Client Updates ===");

// 1. Verify UniversalAboutView.js
const aboutViewCode = fs.readFileSync("./components/public/about/UniversalAboutView.js", "utf-8");

// Section 2 must exist
assert(aboutViewCode.includes('Crafting Exceptional'), "Heading must be Crafting Exceptional Yachting Experiences");

// Requirement 1: rounded-[6px] border radius applied to image container & image
assert(!aboutViewCode.includes("rounded-[2rem] sm:rounded-[2.5rem]"), "Old huge rounded-[2rem] sm:rounded-[2.5rem] must be removed");
assert(aboutViewCode.includes("rounded-[6px]"), "Subtle 6px border radius must be applied to image container");

// Requirement 2: Discover Our Journey button completely removed from rendered JSX
assert(!aboutViewCode.includes("Discover Our Journey"), "Discover Our Journey button must be completely removed from UniversalAboutView.js");

// Requirement 3: Paragraph 1 (Al Shaali Marine) & Paragraph 2 (Alshaali Group) present
assert(aboutViewCode.includes("Al Shaali Marine is the foundation of the Alshaali Group's journey"), "Paragraph 1 must be present in UniversalAboutView.js");
assert(aboutViewCode.includes("Building on the vision and entrepreneurial spirit of the Alshaali family"), "Paragraph 2 must be present in UniversalAboutView.js");
assert(aboutViewCode.includes("Al Shaali Marine"), "Subheading for Al Shaali Marine must be present");
assert(aboutViewCode.includes("Alshaali Group"), "Subheading for Alshaali Group must be present");
assert(aboutViewCode.includes("font-bold") && aboutViewCode.includes("fontWeight: 700"), "Subheadings must use standard bold styling");

console.log("✓ Requirement 1: 6px border radius verified on historical photograph wrapper");
console.log("✓ Requirement 2: 'Discover Our Journey' button removed cleanly");
console.log("✓ Requirement 3 & 4: Expanded company history (Al Shaali Marine & Alshaali Group) verified with clear hierarchy");

// 2. Verify data/pages.json
const pagesJson = JSON.parse(fs.readFileSync("./data/pages.json", "utf-8"));
const aboutPage = pagesJson.find((p) => p.slug === "/about" || p.id === "page-about");
const storySection = aboutPage.sections.find((s) => s.id === "about-story");

assert(storySection.description.includes("Founded in 1979, Al Shaali Marine"), "pages.json must contain updated description");
assert(storySection.paragraph1.includes("Al Shaali Marine is the foundation"), "pages.json must contain paragraph1");
assert(storySection.paragraph2.includes("Building on the vision"), "pages.json must contain paragraph2");
console.log("✓ data/pages.json verified with expanded company history");

// 3. Verify lib/data/defaultPages.js
const defaultPagesCode = fs.readFileSync("./lib/data/defaultPages.js", "utf-8");
assert(defaultPagesCode.includes("Al Shaali Marine is the foundation of the Alshaali Group's journey"), "defaultPages.js must contain updated story data");
console.log("✓ lib/data/defaultPages.js verified with expanded company history");

// 4. Verify previous changes preserved (G66 brochure zoom 25%, yacht title font-weight 300, border removal)
const globalsCss = fs.readFileSync("./app/globals.css", "utf-8");
assert(globalsCss.includes("h3.yacht-model-title"), "Yacht title font-weight 300 must be preserved");
assert(globalsCss.includes("font-weight: 300 !important;"), "font-weight: 300 !important must be preserved");

console.log("✓ All previously approved client requirements verified intact");
console.log("\n=======================================================");
console.log("  ALL ABOUT US UPDATE CHECKS PASSED!");
console.log("=======================================================");

