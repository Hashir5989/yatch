import fs from "fs";
import path from "path";
import { YACHT_SHOWCASES } from "../lib/data/yachtShowcaseData.js";
import { isPostgresConfigured, saveYachtToDb, savePageToDb } from "../lib/server/postgres.js";

const DATA_DIR = path.join(process.cwd(), "data");
const YACHTS_FILE = path.join(DATA_DIR, "yachts.json");
const PAGES_FILE = path.join(DATA_DIR, "pages.json");
const DEFAULT_YACHTS_FILE = path.join(process.cwd(), "lib", "data", "defaultYachts.js");
const DEFAULT_PAGES_FILE = path.join(process.cwd(), "lib", "data", "defaultPages.js");

console.log("==================================================================");
console.log("  PHASE 4: STEP 1 — EXISTING YACHT DATA SYNCHRONIZATION");
console.log("==================================================================\n");

// 1. Safety Backups
const nowTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
const yachtBackupPath = path.join(DATA_DIR, `yachts.backup-${nowTimestamp}.json`);
const pagesBackupPath = path.join(DATA_DIR, `pages.backup-${nowTimestamp}.json`);

fs.copyFileSync(YACHTS_FILE, yachtBackupPath);
fs.copyFileSync(PAGES_FILE, pagesBackupPath);
console.log(`[Backup] Created backup: ${yachtBackupPath}`);
console.log(`[Backup] Created backup: ${pagesBackupPath}`);

// 2. Load existing source data
const existingYachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
const existingPages = JSON.parse(fs.readFileSync(PAGES_FILE, "utf-8"));

// Hardcoded FLEET_MODELS metadata from UniversalYachtCatalogView.js
const FLEET_METADATA = {
  g100: {
    categoryKey: "superyacht",
    categoryLabel: "Superyacht",
    decks: "Tri-Deck",
    heroImage: "/images/yachts/g100/0.jpg",
    specsSnapshot: {
      loa: "100 FT (30.48 M)",
      lwl: "85 FT (25.91 M)",
      beam: "22.91 FT (6.98 M)",
      draft: "7.5 FT (2.29 M)",
      power: "3,200 HP (2 × 1,600 HP MTU)",
      cabins: "5 + 2 Staterooms",
      berths: "12 + 5 Berths (17 Pax)",
      displacement: "95 Tons",
      fuel: "2,900 Gal (10,970 L)",
      water: "670 Gal (2,536 L)",
      hull: "Hand-Laid Honeycomb Composite",
    }
  },
  g77: {
    categoryKey: "three-deck",
    categoryLabel: "Three-Deck Yacht",
    decks: "Three Decks",
    heroImage: "/images/yachts/g77/g77_asset_01_1672x941.jpg",
    specsSnapshot: {
      loa: "77 FT (23.47 M)",
      lwl: "65 FT (19.81 M)",
      beam: "19.35 FT (5.90 M)",
      draft: "4.5 FT (1.37 M)",
      power: "2,400 HP (2 × 1,200 HP CAT)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "55 Tons",
      fuel: "1,600 Gal (6,056 L)",
      water: "400 Gal (1,514 L)",
      hull: "GRP Composite Three-Deck",
    }
  },
  g66: {
    categoryKey: "flybridge",
    categoryLabel: "Flybridge Cruiser",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g66/hero-01.jpg",
    specsSnapshot: {
      loa: "66 FT (20.12 M)",
      lwl: "55 FT (16.76 M)",
      beam: "20.00 FT (6.10 M)",
      draft: "3.5 FT (1.07 M)",
      power: "1,600 HP (2 × 800 HP Volvo)",
      cabins: "4 + 2 Staterooms",
      berths: "8 + 2 Berths (10 Pax)",
      displacement: "40 Tons",
      fuel: "1,870 Gal (7,080 L)",
      water: "300 Gal (1,135 L)",
      hull: "Hand-Laid Fiberglass Composite",
    }
  },
  g50: {
    categoryKey: "motor-yacht",
    categoryLabel: "Luxury Motor Yacht",
    decks: "Flybridge & Main Deck",
    heroImage: "/images/yachts/g50/hero-01.jpg",
    specsSnapshot: {
      loa: "50 FT (15.00 M)",
      lwl: "40 FT (12.00 M)",
      beam: "15.00 FT (4.50 M)",
      draft: "4.0 FT (1.35 M)",
      power: "1,100 HP (2 × 550 HP Cummins)",
      cabins: "3 Staterooms",
      berths: "6 Berths (15 Pax Capacity)",
      displacement: "15–20 Tons",
      fuel: "450 Gal (1,701 L)",
      water: "100 Gal (378 L)",
      hull: "Fiberglass Composite Sandwich",
    }
  }
};

// 3. Build fully merged, idempotent yacht records
const slugs = ["g100", "g77", "g66", "g50"];
const migratedYachts = [];

for (let idx = 0; idx < slugs.length; idx++) {
  const slug = slugs[idx];
  const showcase = YACHT_SHOWCASES[slug] || {};
  const meta = FLEET_METADATA[slug] || {};
  const existing = existingYachts.find((y) => y.slug === slug || y.id === `yacht-${slug}`) || {};

  // Build merged record preserving exact existing text, spelling, images & specs
  const mergedRecord = {
    id: existing.id || `yacht-${slug}`,
    name: showcase.fullName || existing.name || `ASMARATY ${showcase.modelNumber || slug.toUpperCase()}`,
    fullName: showcase.fullName || existing.name || `ASMARATY ${showcase.modelNumber || slug.toUpperCase()}`,
    modelNumber: showcase.modelNumber || slug.toUpperCase(),
    slug: slug,
    category: meta.categoryLabel || existing.category || "Luxury Yacht",
    categoryKey: meta.categoryKey || "luxury-yacht",
    categoryLabel: meta.categoryLabel || "Luxury Yacht",
    series: existing.series || `${showcase.modelNumber || slug.toUpperCase()} Series`,
    decks: meta.decks || "Multi-Deck",
    badge: showcase.badge || "Signature Fleet Model",
    tagline: showcase.tagline || existing.tagline || "",
    description: showcase.description || existing.description || "",
    summaryLine: showcase.summaryLine || "",
    insigniaSrc: showcase.insigniaSrc || "",
    length: meta.specsSnapshot?.loa || existing.length || "",
    mainImage: meta.heroImage || existing.mainImage || showcase.heroImages?.[0]?.src || "",
    primaryImage: meta.heroImage || existing.primaryImage || existing.mainImage || "",
    heroImage: meta.heroImage || showcase.heroImages?.[0]?.src || existing.mainImage || "",
    heroImages: showcase.heroImages || [],
    gallery: showcase.gallery && showcase.gallery.length > 0 ? showcase.gallery : (existing.gallery || []),
    galleryCategories: showcase.galleryCategories || ["All", "Exterior", "Interior", "Flybridge"],
    brochureUrl: showcase.brochureUrl || existing.brochureUrl || "",
    brochureLabel: showcase.brochureLabel || "Brochure (PDF)",
    floorplanUrl: existing.floorplanUrl || (showcase.deckPlans?.[1]?.image3D || ""),
    featured: existing.featured !== undefined ? existing.featured : true,
    status: existing.status || "published",
    displayOrder: existing.displayOrder || idx + 1,
    specsSnapshot: meta.specsSnapshot || {},
    comparisonMatrix: {
      loa: meta.specsSnapshot?.loa || "",
      lwl: meta.specsSnapshot?.lwl || "",
      beam: meta.specsSnapshot?.beam || "",
      draft: meta.specsSnapshot?.draft || "",
      displacement: meta.specsSnapshot?.displacement || "",
      power: meta.specsSnapshot?.power || "",
      cabins: meta.specsSnapshot?.cabins || "",
      berths: meta.specsSnapshot?.berths || "",
      fuel: meta.specsSnapshot?.fuel || "",
      water: meta.specsSnapshot?.water || "",
      hull: meta.specsSnapshot?.hull || "",
    },
    specs: existing.specs || {},
    specCategories: showcase.specCategories || [],
    highlights: existing.highlights && existing.highlights.length > 0 ? existing.highlights : (showcase.narrative?.cards?.map(c => `${c.title}: ${c.description}`) || []),
    keyMetrics: showcase.keyMetrics || [],
    narrative: showcase.narrative || {},
    deckPlans: showcase.deckPlans || [],
    seo: {
      metaTitle: `${showcase.fullName || existing.name} | ASMARATY Luxury Yachts UAE`,
      metaDescription: showcase.description || existing.description || "",
      ogImage: meta.heroImage || existing.mainImage || "",
    },
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  migratedYachts.push(mergedRecord);
}

// Preserve any extra non-standard yachts (e.g., expansion draft models)
for (const extra of existingYachts) {
  if (!slugs.includes(extra.slug)) {
    migratedYachts.push(extra);
  }
}

// 4. Write to data/yachts.json
fs.writeFileSync(YACHTS_FILE, JSON.stringify(migratedYachts, null, 2), "utf-8");
console.log(`[Database] Updated ${YACHTS_FILE} with ${migratedYachts.length} complete yacht records.`);

// 5. Update lib/data/defaultYachts.js
const defaultYachtsContent = `/**
 * ASMARATY Official Fleet Data
 * Automatically synchronized authoritative baseline records.
 */

export const DEFAULT_YACHTS = ${JSON.stringify(migratedYachts, null, 2)};
`;
fs.writeFileSync(DEFAULT_YACHTS_FILE, defaultYachtsContent, "utf-8");
console.log(`[Store] Synchronized ${DEFAULT_YACHTS_FILE}.`);

// 6. Update page-yachts in data/pages.json & lib/data/defaultPages.js
const pageYachtsIndex = existingPages.findIndex((p) => p.id === "page-yachts" || p.slug === "/yachts");

const synchronizedPageYachts = {
  id: "page-yachts",
  title: "Yacht Collections",
  slug: "/yachts",
  template: "fleet_catalog",
  status: "published",
  lastModified: new Date().toISOString(),
  sections: [
    {
      id: "yachts-hero",
      type: "hero_banner",
      visible: true,
      eyebrow: "The Official ASMARATY Fleet",
      heading: "The Fleet of Distinction",
      subheading: "Handcrafted composite superyachts and luxury motor yachts engineered in the United Arab Emirates since 1979. Each vessel unites naval precision, sunlit panoramic architecture, and bespoke master craftsmanship.",
      imageUrl: "/images/yachts/g100/0.jpg",
      imageAlt: "ASMARATY Luxury Yacht Fleet",
      videoUrl: "",
      primaryButtonText: "Explore Models",
      primaryButtonUrl: "#fleet-catalog",
      primaryButton: {
        label: "Explore Models",
        url: "#fleet-catalog",
        type: "anchor",
        target: "_self",
        visible: true,
        style: "solid-gold"
      },
      showModelPills: false,
      secondaryButtonText: "Compare Specs Matrix",
      secondaryButtonUrl: "#comparison-matrix",
      secondaryButton: {
        label: "Compare Specs Matrix",
        url: "#comparison-matrix",
        type: "anchor",
        target: "_self",
        visible: false,
        style: "outline-white"
      },
      stats: [
        { value: "50–100 FT", label: "Fleet Length Span" },
        { value: "3,200 HP", label: "Peak Propulsion Power" },
        { value: "4 Classes", label: "Distinct Naval Series" },
        { value: "1979", label: "Shipyard Heritage (45+ Yrs)" }
      ]
    },
    {
      id: "yachts-grid",
      type: "yacht_collection",
      visible: true,
      eyebrow: "CATALOGUE DOSSIER",
      heading: "Explore the Models",
      description: "",
      filterCategory: "all",
      categories: [
        { id: "all", label: "All Fleet (4)" },
        { id: "superyacht", label: "Superyachts" },
        { id: "three-deck", label: "Three-Deck Cruisers" },
        { id: "flybridge", label: "Flybridge Cruisers" },
        { id: "motor-yacht", label: "Motor Yachts" }
      ],
      primaryButtonText: "Explore Dossier",
      brochureButtonText: "Brochure (PDF)",
      consultationButtonText: "Book Private Sea Trial / Consultation",
      consultationButtonUrl: "/contact"
    },
    {
      id: "yachts-matrix",
      type: "comparison_matrix",
      visible: true,
      eyebrow: "TECHNICAL SPECIFICATIONS",
      heading: "Side-by-Side Fleet Comparison",
      description: "Compare naval dimensions, propulsion packages, accommodations, and engineering across all four ASMARATY yacht models.",
      dimensions: [
        "Length Overall (LOA)",
        "Waterline Length (LWL)",
        "Maximum Beam",
        "Draft at Full Load",
        "Displacement",
        "Propulsion Power",
        "Staterooms & Accommodations",
        "Sleeping Berths / Passenger Capacity",
        "Fuel Tank Capacity",
        "Freshwater Capacity",
        "Hull & Deck Construction"
      ]
    },
    {
      id: "yachts-custom",
      type: "image_text",
      visible: true,
      eyebrow: "CUSTOM COMMISSIONS • SHIPYARD HERITAGE",
      heading: "Every Vessel Tailored to Your Vision",
      quote: "“A yacht is not simply an engineering achievement; it is an architectural sanctuary forged between sky and ocean.”",
      description: "At ASMARATY, no two vessels leaving our shipyard facility are identical. From selecting book-matched Italian marbles and bespoke marine leather finishes to custom audio-visual installations and private tender arrangements, our master shipwrights partner with owners throughout every stage of the build.",
      imageUrl: "/images/interiors/g100-main-salon.jpg",
      imageAlt: "ASMARATY Custom Craftsmanship",
      badgeText: "Shipyard Facility • Ajman, UAE — Over 45 years of continuous marine craftsmanship by Al Shaali Marine.",
      stats: [
        { value: "100%", label: "Bespoke Interior Options" },
        { value: "UAE", label: "Direct Shipyard Direct Access" }
      ],
      buttonText: "Discuss a Custom Commission",
      buttonUrl: "/contact",
      primaryButton: {
        label: "Discuss a Custom Commission",
        url: "/contact",
        type: "internal",
        target: "_self",
        visible: true,
        style: "solid-gold"
      }
    },
    {
      id: "yachts-concierge",
      type: "call_to_action",
      visible: true,
      eyebrow: "VIP CONCIERGE & ADVISORY",
      heading: "Begin Your Voyage With ASMARATY",
      description: "Whether you wish to arrange a private sea trial, commission a bespoke naval build, or request confidential fleet pricing, our yacht advisory team in the UAE is at your service.",
      primaryButtonText: "Contact Us",
      primaryButtonUrl: "/contact",
      primaryButton: {
        label: "Contact Us",
        url: "/contact",
        type: "internal",
        target: "_self",
        visible: true,
        style: "solid-gold"
      },
      secondaryButtonText: "WhatsApp VIP Concierge",
      secondaryButtonUrl: "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet.",
      secondaryButton: {
        label: "WhatsApp VIP Concierge",
        url: "https://wa.me/971565268126?text=Hello%20ASMARATY%20Yachts,%20I%20am%20inquiring%20about%20your%20yacht%20fleet.",
        type: "external",
        target: "_blank",
        visible: true,
        style: "whatsapp"
      }
    }
  ]
};

if (pageYachtsIndex !== -1) {
  existingPages[pageYachtsIndex] = synchronizedPageYachts;
} else {
  existingPages.push(synchronizedPageYachts);
}

fs.writeFileSync(PAGES_FILE, JSON.stringify(existingPages, null, 2), "utf-8");
console.log(`[Pages] Synchronized page-yachts in ${PAGES_FILE}.`);

// 7. Update PostgreSQL if configured
console.log(`[PostgreSQL Status] isPostgresConfigured: ${isPostgresConfigured()}`);
if (isPostgresConfigured()) {
  console.log("[PostgreSQL] Synchronizing yacht and page records into PostgreSQL tables...");
  for (const y of migratedYachts) {
    await saveYachtToDb(y);
  }
  await savePageToDb(synchronizedPageYachts);
  console.log("[PostgreSQL] Synchronization complete.");
} else {
  console.log("[PostgreSQL] DATABASE_URL not set in environment; JSON database store is authoritative.");
}

// 8. Verification Checks
console.log("\n==================================================================");
console.log("  VERIFICATION OF MIGRATED DATABASE RECORDS");
console.log("==================================================================");

let passCount = 0;
let failCount = 0;

function check(cond, msg) {
  if (cond) {
    console.log(`  [PASS] ${msg}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failCount++;
  }
}

// Check each yacht
for (const slug of slugs) {
  const y = migratedYachts.find((m) => m.slug === slug);
  check(!!y, `Yacht '${slug}' exists in migrated database`);
  check(!!y.name && y.name.length > 5, `Yacht '${slug}' has full name: '${y.name}'`);
  check(!!y.modelNumber, `Yacht '${slug}' has modelNumber: '${y.modelNumber}'`);
  check(!!y.decks, `Yacht '${slug}' has decks: '${y.decks}'`);
  check(!!y.badge, `Yacht '${slug}' has badge: '${y.badge}'`);
  check(!!y.categoryKey && !!y.categoryLabel, `Yacht '${slug}' has categoryKey/Label: '${y.categoryKey}' / '${y.categoryLabel}'`);
  check(!!y.heroImage && y.heroImage.startsWith("/images/"), `Yacht '${slug}' has heroImage: '${y.heroImage}'`);
  check(Array.isArray(y.gallery) && y.gallery.length > 0, `Yacht '${slug}' has gallery (${y.gallery?.length} images)`);
  // Verify brochureUrl (g100, g66, g50 have PDF brochures; g77 has null to trigger 'Request Brochure' fallback)
  if (slug === "g77") {
    check(y.brochureUrl === null || y.brochureUrl === "", `Yacht '${slug}' correctly preserves null/empty brochureUrl (Request Brochure fallback)`);
  } else {
    check(!!y.brochureUrl, `Yacht '${slug}' has brochureUrl: '${y.brochureUrl}'`);
  }
  check(!!y.specsSnapshot?.loa && !!y.specsSnapshot?.beam && !!y.specsSnapshot?.power, `Yacht '${slug}' has complete specsSnapshot (LOA: ${y.specsSnapshot?.loa})`);
  check(!!y.comparisonMatrix?.lwl, `Yacht '${slug}' has comparisonMatrix LWL: '${y.comparisonMatrix?.lwl}'`);
  check(Array.isArray(y.deckPlans) && y.deckPlans.length > 0, `Yacht '${slug}' has deckPlans (${y.deckPlans?.length} deck cutaways)`);
  check(Array.isArray(y.keyMetrics) && y.keyMetrics.length > 0, `Yacht '${slug}' has keyMetrics (${y.keyMetrics?.length} metrics)`);
  check(!!y.narrative?.headline, `Yacht '${slug}' has narrative headline: '${y.narrative?.headline}'`);
}

// Check page-yachts
const pageYachtsCheck = existingPages.find((p) => p.id === "page-yachts");
check(!!pageYachtsCheck, "page-yachts exists in pages.json");
check(pageYachtsCheck?.sections?.length === 5, `page-yachts has exactly 5 sections (found ${pageYachtsCheck?.sections?.length})`);
check(pageYachtsCheck?.sections?.[0]?.heading === "The Fleet of Distinction", "page-yachts Hero heading verified");
check(pageYachtsCheck?.sections?.[2]?.id === "yachts-matrix", "page-yachts Comparison Matrix section verified");
check(pageYachtsCheck?.sections?.[3]?.heading === "Every Vessel Tailored to Your Vision", "page-yachts Bespoke Custom section verified");
check(pageYachtsCheck?.sections?.[4]?.heading === "Begin Your Voyage With ASMARATY", "page-yachts VIP Concierge section verified");

console.log("\n==================================================================");
console.log(`MIGRATION VERIFICATION COMPLETE: ${passCount} Passed, ${failCount} Failed.`);
console.log("==================================================================");

if (failCount > 0) {
  process.exit(1);
}
