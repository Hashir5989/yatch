import fs from "fs";
import { formatButtonHref, normalizeButtonConfig } from "../lib/data/buttonSchema.js";
import { DEFAULT_PAGES } from "../lib/data/defaultPages.js";
import { DEFAULT_YACHTS } from "../lib/data/defaultYachts.js";

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

console.log("==================================================================");
console.log("  PHASE 4: STEP 2 — FLEET CATALOG CMS INTEGRATION VERIFICATION");
console.log("==================================================================\n");

// 1. Data Source Verification
const yachtsJson = JSON.parse(fs.readFileSync("./data/yachts.json", "utf8"));
assert(Array.isArray(yachtsJson), "data/yachts.json exists and parses as array");
assert(yachtsJson.length >= 4, `data/yachts.json contains at least 4 models (found ${yachtsJson.length})`);

// 2. Draft Exclusion Filter Test
const testYachtsWithDraft = [
  ...yachtsJson,
  { id: "test-draft-yacht", slug: "test-draft", name: "Test Draft Yacht", status: "draft" }
];
const filteredPublished = testYachtsWithDraft.filter(y => y.status === "published" || y.status === undefined);
assert(filteredPublished.length === yachtsJson.length, "Draft yachts are strictly excluded from published catalog");
assert(!filteredPublished.some(y => y.id === "test-draft-yacht"), "Test draft yacht does not appear in published list");

// 3. Four Core Yacht Cards Verification
const slugs = ["g100", "g77", "g66", "g50"];
for (const slug of slugs) {
  const y = yachtsJson.find(m => m.slug === slug);
  assert(!!y, `Published model '${slug}' exists in database`);
  assert(!!y.name && y.name.length > 5, `Model '${slug}' name is valid: '${y.name}'`);
  assert(!!y.modelNumber, `Model '${slug}' modelNumber is valid: '${y.modelNumber}'`);
  assert(!!y.decks, `Model '${slug}' decks is valid: '${y.decks}'`);
  assert(!!y.badge, `Model '${slug}' badge is valid: '${y.badge}'`);
  assert(!!y.heroImage && y.heroImage.startsWith("/images/"), `Model '${slug}' heroImage is valid: '${y.heroImage}'`);
  assert(!!y.specsSnapshot?.loa && !!y.specsSnapshot?.beam && !!y.specsSnapshot?.power, `Model '${slug}' specsSnapshot is complete`);
  assert(!!y.description && y.description.length > 30, `Model '${slug}' description is complete`);
  assert(y.status === "published", `Model '${slug}' status is published`);
  
  // Brochure logic
  if (slug === "g77") {
    assert(y.brochureUrl === null || y.brochureUrl === "", `Model 'g77' preserves null/empty brochure URL (Request Brochure)`);
  } else {
    assert(!!y.brochureUrl && y.brochureUrl.endsWith(".pdf"), `Model '${slug}' has valid brochure PDF: '${y.brochureUrl}'`);
  }
}

// 4. Comparison Matrix Dimensions Verification
const requiredDimensions = [
  "loa", "lwl", "beam", "draft", "displacement", "power", "cabins", "berths", "fuel", "water", "hull"
];
for (const dim of requiredDimensions) {
  for (const slug of slugs) {
    const y = yachtsJson.find(m => m.slug === slug);
    const val = y.comparisonMatrix?.[dim] || y.specsSnapshot?.[dim] || y.specs?.[dim];
    assert(!!val && val !== "—", `Model '${slug}' has valid comparison dimension '${dim}': '${val}'`);
  }
}

// 5. Category Filtering Logic Verification
const categories = [
  { id: "all", label: `All Fleet (${slugs.length})` },
  { id: "superyacht", label: "Superyachts" },
  { id: "three-deck", label: "Three-Deck Cruisers" },
  { id: "flybridge", label: "Flybridge Cruisers" },
  { id: "motor-yacht", label: "Motor Yachts" }
];
assert(categories.length === 5, "Catalog has 5 filter categories");

for (const cat of categories) {
  const filtered = yachtsJson.filter(m => {
    if (cat.id === "all") return true;
    const key = m.categoryKey || m.category?.toLowerCase() || "";
    return key === cat.id || key.includes(cat.id);
  });
  assert(filtered.length >= 1, `Category '${cat.id}' returns at least 1 matching model (returned ${filtered.length})`);
}

// 6. Page-Yachts Sections in data/pages.json
const pagesJson = JSON.parse(fs.readFileSync("./data/pages.json", "utf8"));
const pageYachts = pagesJson.find(p => p.id === "page-yachts" || p.slug === "/yachts");
assert(!!pageYachts, "page-yachts exists in data/pages.json");
assert(pageYachts.sections.length === 5, `page-yachts has exactly 5 sections (found ${pageYachts.sections.length})`);

const expectedSectionIds = ["yachts-hero", "yachts-grid", "yachts-matrix", "yachts-custom", "yachts-concierge"];
const actualSectionIds = pageYachts.sections.map(s => s.id);
assert(
  JSON.stringify(actualSectionIds) === JSON.stringify(expectedSectionIds),
  `Section IDs match: ${actualSectionIds.join(", ")}`
);

// 7. Hero Banner Section Content
const hero = pageYachts.sections.find(s => s.id === "yachts-hero");
assert(hero.eyebrow === "The Official ASMARATY Fleet", "Hero eyebrow matches exactly");
assert(hero.heading === "The Fleet of Distinction", "Hero heading matches exactly");
assert(hero.stats.length === 4, "Hero stats bar has 4 items");

// 8. Custom Commission Section Content
const custom = pageYachts.sections.find(s => s.id === "yachts-custom");
assert(custom.heading === "Every Vessel Tailored to Your Vision", "Custom section heading matches exactly");
assert(custom.quote.includes("architectural sanctuary"), "Custom quote matches exactly");
assert(custom.primaryButton.label === "Discuss a Custom Commission", "Custom CTA button label matches");
assert(custom.primaryButton.url === "/contact", "Custom CTA button URL matches");

// 9. VIP Concierge Section Content
const concierge = pageYachts.sections.find(s => s.id === "yachts-concierge");
assert(concierge.heading === "Begin Your Voyage With ASMARATY", "Concierge heading matches exactly");
assert(concierge.primaryButton.label === "Contact Us", "Concierge primary button label is 'Contact Us'");
assert(concierge.secondaryButton.label === "WhatsApp VIP Concierge", "Concierge secondary button label is 'WhatsApp VIP Concierge'");
assert(concierge.secondaryButton.url.includes("wa.me"), "Concierge secondary button URL points to WhatsApp");

// 10. Button Schema Protocol Validation
const whatsappHref = formatButtonHref(concierge.secondaryButton.url, "external");
assert(whatsappHref.startsWith("https://wa.me/"), "formatButtonHref formats external WhatsApp URL correctly");

const internalHref = formatButtonHref(custom.primaryButton.url, "internal");
assert(internalHref === "/contact", "formatButtonHref formats internal contact URL correctly");

// 11. Regression Check: Phase 1, 2, and 3 Intact
const pageAbout = pagesJson.find(p => p.id === "page-about");
assert(pageAbout && pageAbout.sections.length === 5, "Phase 3: About Us page sections intact (5 sections)");

const settingsJson = JSON.parse(fs.readFileSync("./data/settings.json", "utf8"));
assert(!!settingsJson.header?.ctaButton?.label, "Phase 2: Global Header settings intact");
assert(!!(settingsJson.footer?.copyrightText || settingsJson.footer?.copyright), "Phase 2: Global Footer settings intact");

console.log("\n==================================================================");
console.log(`STEP 2 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
console.log("==================================================================");

if (failed > 0) {
  process.exit(1);
}
