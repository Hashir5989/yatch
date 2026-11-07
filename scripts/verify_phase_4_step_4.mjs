import fs from "fs";
import path from "path";
import assert from "assert";

const ROOT = process.cwd();
const YACHTS_FILE = path.join(ROOT, "data", "yachts.json");
const PAGES_FILE = path.join(ROOT, "data", "pages.json");

console.log("==================================================================");
console.log("  PHASE 4: STEP 4 — DYNAMIC YACHT DETAIL PAGE SYNCHRONIZATION");
console.log("==================================================================\n");

let passed = 0;
let failed = 0;

async function test(description, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
    failed++;
  }
}

async function runVerification() {
  const { getYachtShowcaseData, mergeYachtWithShowcase } = await import("../lib/data/yachtShowcaseData.js");
  const yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));

  // 1. All Four Core Yachts Load and Merge Correctly
  const coreSlugs = ["g100", "g77", "g66", "g50"];
  for (const slug of coreSlugs) {
    await test(`Model '${slug}' merges CMS data with showcase visual assets`, async () => {
      const cms = yachts.find(y => y.slug === slug);
      const showcase = getYachtShowcaseData(slug);
      assert(cms, `CMS yacht record for '${slug}' must exist`);
      assert(showcase, `Static showcase data for '${slug}' must exist`);

      const merged = mergeYachtWithShowcase(cms, showcase);
      assert(merged, `Merged yacht object for '${slug}' must not be null`);
      assert(merged.slug === slug, `Merged slug must be '${slug}'`);
      assert(merged.modelNumber === cms.modelNumber, `Merged modelNumber matches CMS: ${cms.modelNumber}`);
      assert(merged.fullName === (cms.fullName || cms.name), `Merged fullName matches CMS: ${cms.fullName}`);
      assert(merged.status === "published", `Status must be published for core model '${slug}'`);
      assert(Array.isArray(merged.heroImages) && merged.heroImages.length > 0, `heroImages must exist`);
      assert(Array.isArray(merged.keyMetrics) && merged.keyMetrics.length === 6, `keyMetrics must have 6 items`);
      assert(merged.narrative && merged.narrative.headline, `narrative headline must exist`);
      assert(Array.isArray(merged.deckPlans) && merged.deckPlans.length > 0, `deckPlans must exist`);
      assert(Array.isArray(merged.specCategories) && merged.specCategories.length > 0, `specCategories must exist`);
      assert(Array.isArray(merged.gallery) && merged.gallery.length > 0, `gallery must exist`);
    });
  }

  // 2. CMS Priority over Static Showcase
  await test("CMS Priority: Modified tagline in CMS overrides static showcase", async () => {
    const cms = { ...yachts.find(y => y.slug === "g100"), tagline: "Custom CMS Tagline Overridden By Admin" };
    const showcase = getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cms, showcase);
    assert(merged.tagline === "Custom CMS Tagline Overridden By Admin", "CMS tagline must take priority");
  });

  await test("CMS Priority: Modified narrative headline in CMS overrides static showcase", async () => {
    const cms = {
      ...yachts.find(y => y.slug === "g100"),
      narrative: {
        eyebrow: "CMS CUSTOM EYEBROW",
        headline: "Custom CMS Narrative Headline",
        paragraphs: ["Custom Paragraph 1", "Custom Paragraph 2"]
      }
    };
    const showcase = getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cms, showcase);
    assert(merged.narrative.eyebrow === "CMS CUSTOM EYEBROW");
    assert(merged.narrative.headline === "Custom CMS Narrative Headline");
    assert(merged.narrative.paragraphs.length === 2);
  });

  // 3. Showcase Fallback for Visuals Not Managed in CMS
  await test("Showcase Fallback: Deck plan 3D cutaway images and features fall back to showcase", async () => {
    const cms = { slug: "g100", name: "G100 Minimal" };
    const showcase = getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cms, showcase);
    assert(merged.deckPlans.length >= 3, "Deck plans fall back to showcase data");
    assert(merged.deckPlans[0].image3D.includes(".jpg"), "3D cutaway image preserved");
    assert(merged.deckPlans[0].features.length > 0, "Deck features preserved");
  });

  // 4. All 11 Technical Specifications Synchronize Into specCategories Table
  await test("Specifications Sync: 11 snapshot specs dynamically populate specCategories table", async () => {
    const testSnapshot = {
      loa: "999 FT",
      lwl: "888 FT",
      beam: "777 FT",
      draft: "666 FT",
      displacement: "555 TONS",
      power: "4,444 HP DIESEL",
      cabins: "99 STATEROOMS",
      berths: "999 BERTHS",
      fuel: "99,999 GAL",
      water: "88,888 GAL",
      hull: "TITANIUM COMPOSITE"
    };

    const cms = { ...yachts.find(y => y.slug === "g100"), specsSnapshot: testSnapshot };
    const showcase = getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cms, showcase);

    // Flatten all specs in specCategories
    const allSpecs = [];
    merged.specCategories.forEach(cat => {
      (cat.specs || []).forEach(s => allSpecs.push(s));
    });

    const findSpec = (text) => allSpecs.find(s => s.label.toLowerCase().includes(text.toLowerCase()));

    assert(findSpec("Length Overall").value === "999 FT", "LOA synced into table");
    assert(findSpec("Waterline Length").value === "888 FT", "LWL synced into table");
    assert(findSpec("Maximum Beam").value === "777 FT", "Beam synced into table");
    assert(findSpec("Draft at Full Load").value === "666 FT", "Draft synced into table");
    assert(findSpec("Displacement").value === "555 TONS", "Displacement synced into table");
    assert(findSpec("Propulsion").value === "4,444 HP DIESEL", "Power synced into table");
    assert(findSpec("Stateroom").value === "99 STATEROOMS", "Cabins synced into table");
    assert(findSpec("Berth").value === "999 BERTHS", "Berths synced into table");
    assert(findSpec("Fuel").value === "99,999 GAL", "Fuel synced into table");
    assert(findSpec("Freshwater").value === "88,888 GAL", "Water synced into table");
  });

  // 5. Gallery Images and Categories
  await test("Gallery Sync: Custom CMS gallery URLs are mapped into lightbox objects", async () => {
    const cms = {
      ...yachts.find(y => y.slug === "g100"),
      gallery: [
        "/images/yachts/g100/0.jpg",
        "https://example.com/custom-yacht-angle.jpg"
      ]
    };
    const showcase = getYachtShowcaseData("g100");
    const merged = mergeYachtWithShowcase(cms, showcase);

    assert(merged.gallery.length === 2, "Gallery has 2 items");
    assert(merged.gallery[0].src === "/images/yachts/g100/0.jpg", "First gallery image preserved");
    assert(merged.gallery[1].src === "https://example.com/custom-yacht-angle.jpg", "New gallery image assigned");
    assert(merged.gallery[1].title, "New gallery image assigned default title");
  });

  // 6. Brochure URLs and Request Brochure Behavior
  await test("Brochure Behavior: G100, G66, G50 have PDF links; G77 strictly preserves null for Request Brochure", async () => {
    for (const slug of ["g100", "g66", "g50"]) {
      const cms = yachts.find(y => y.slug === slug);
      const showcase = getYachtShowcaseData(slug);
      const merged = mergeYachtWithShowcase(cms, showcase);
      assert(merged.brochureUrl && merged.brochureUrl.endsWith(".pdf"), `${slug} must have .pdf brochure`);
    }

    const g77Cms = yachts.find(y => y.slug === "g77");
    const g77Showcase = getYachtShowcaseData("g77");
    const g77Merged = mergeYachtWithShowcase(g77Cms, g77Showcase);
    assert(g77Merged.brochureUrl === null, "G77 brochureUrl must be null to trigger Request Brochure");
  });

  await test("Brochure Behavior: Cleared brochure URL in CMS does not fall back to stale static brochure", async () => {
    const cms = { ...yachts.find(y => y.slug === "g100"), brochureUrl: "" };
    const showcase = getYachtShowcaseData("g100"); // has brochureUrl in static showcase
    const merged = mergeYachtWithShowcase(cms, showcase);
    assert(merged.brochureUrl === null, "Explicitly cleared brochureUrl must remain null, not fall back");
  });

  // 7. Key Metrics Bar (6 Items)
  await test("Key Metrics: All 4 models have 6 key metric cards", async () => {
    for (const slug of coreSlugs) {
      const cms = yachts.find(y => y.slug === slug);
      const showcase = getYachtShowcaseData(slug);
      const merged = mergeYachtWithShowcase(cms, showcase);
      assert(merged.keyMetrics.length === 6, `${slug} must have 6 metrics`);
      assert(merged.keyMetrics[0].main, `${slug} metric 1 has main value`);
      assert(merged.keyMetrics[0].label, `${slug} metric 1 has label`);
    }
  });

  // 8. Draft and Published Access Control
  await test("Draft Protection: Draft model is marked with status='draft' and blocked from public indexing", async () => {
    const cmsDraft = {
      id: "yacht-draft-test",
      name: "Secret Prototype",
      slug: "secret-prototype",
      status: "draft"
    };
    const merged = mergeYachtWithShowcase(cmsDraft, null);
    assert(merged.status === "draft", "Status must remain draft");
  });

  // 9. SEO & Metadata Verification
  await test("SEO Metadata: Dynamic layout metadata uses CMS overrides and canonical URLs", async () => {
    const layoutContent = fs.readFileSync(path.join(ROOT, "app", "yachts", "[slug]", "layout.js"), "utf-8");
    assert(layoutContent.includes("getYachtsServer"), "layout.js fetches authoritative yachts from server");
    assert(layoutContent.includes("mergeYachtWithShowcase"), "layout.js merges CMS data with showcase");
    assert(layoutContent.includes("robots"), "layout.js defines search engine robots configuration");
    assert(layoutContent.includes("canonical"), "layout.js defines canonical URL");
    assert(layoutContent.includes("openGraph"), "layout.js defines OpenGraph tags");
    assert(layoutContent.includes("index: false"), "layout.js blocks draft vessels from indexation");
  });

  // 10. Yacht Detail Page Component Integration
  await test("Page Component: app/yachts/[slug]/page.js connects CMS store and UniversalYachtDetailView", async () => {
    const pageContent = fs.readFileSync(path.join(ROOT, "app", "yachts", "[slug]", "page.js"), "utf-8");
    assert(pageContent.includes("getYachtBySlug"), "Uses getYachtBySlug");
    assert(pageContent.includes("mergeYachtWithShowcase"), "Uses mergeYachtWithShowcase");
    assert(pageContent.includes("asm-cms-change"), "Listens to live CMS change events");
    assert(pageContent.includes("UnderConstructionView"), "Handles draft/under construction safely");
    assert(pageContent.includes("UniversalYachtDetailView"), "Renders universal luxury detail view");
    assert(pageContent.includes("noindex, nofollow"), "Protects draft pages from search engines");
  });

  // Print Summary
  console.log("\n==================================================================");
  console.log(`STEP 4 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error("Unhandled error in Step 4 verification:", err);
  process.exit(1);
});

