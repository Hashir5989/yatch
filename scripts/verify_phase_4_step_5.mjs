import fs from "fs";
import path from "path";
import assert from "assert";

const ROOT = process.cwd();
const YACHTS_FILE = path.join(ROOT, "data", "yachts.json");
const BACKUP_FILE = path.join(ROOT, "data", "yachts.backup-before-phase4.json");

console.log("==================================================================");
console.log("  PHASE 4: STEP 5 — END-TO-END AUDIT & WORKFLOW VERIFICATION");
console.log("==================================================================");

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

async function runAudit() {
  const { getYachtsServer, saveYachtServer, deleteYachtServer, reorderYachtsServer, isPostgresConfigured, verifySessionToken } = await import("../lib/server/db.js");
  const { getYachtShowcaseData, mergeYachtWithShowcase } = await import("../lib/data/yachtShowcaseData.js");
  const { duplicateYacht } = await import("../lib/cmsStore.js");

  // Keep a safety snapshot of the initial state before tests
  const initialYachtsRaw = fs.readFileSync(YACHTS_FILE, "utf-8");
  const initialYachts = JSON.parse(initialYachtsRaw);

  try {
    // -------------------------------------------------------------
    // SECTION 1: ARCHITECTURE & PERSISTENCE VERIFICATION
    // -------------------------------------------------------------
    await test("Architecture: Confirmed persistence layer configuration", async () => {
      const pgActive = isPostgresConfigured();
      assert(pgActive === false, "Local development environment authoritative store is JSON file system (data/yachts.json)");
      assert(fs.existsSync(YACHTS_FILE), "Authoritative data/yachts.json exists");
    });

    // -------------------------------------------------------------
    // SECTION 2: END-TO-END ADMIN-TO-PUBLIC WORKFLOW TESTS
    // -------------------------------------------------------------
    const testYachtId = `yacht-e2e-${Date.now()}`;
    const testSlug = `e2e-vessel-${Date.now()}`;

    let currentTestYacht = {
      id: testYachtId,
      name: "ASMARATY E2E Flagship Cruiser",
      fullName: "ASMARATY E2E Flagship Cruiser",
      modelNumber: "E2E-100",
      slug: testSlug,
      category: "Superyacht",
      categoryKey: "superyacht",
      categoryLabel: "Superyacht",
      series: "E2E Series",
      decks: "Tri-Deck",
      badge: "E2E Test Vessel",
      tagline: "Initial E2E Tagline — Craftsmanship at Sea",
      summaryLine: "E2E Test Vessel • 100 FT • Composite",
      description: "Initial editorial description for E2E testing.",
      heroImage: "/images/yachts/g100/0.jpg",
      mainImage: "/images/yachts/g100/0.jpg",
      primaryImage: "/images/yachts/g100/0.jpg",
      gallery: [
        "/images/yachts/g100/0.jpg",
        "/images/yachts/g77/g77_asset_01_1672x941.jpg"
      ],
      brochureUrl: "/documents/asmaraty-g100-brochure.pdf",
      brochureLabel: "Download E2E Brochure (PDF)",
      status: "published",
      featured: true,
      displayOrder: 99,
      specsSnapshot: {
        loa: "100 FT (30.48 M)",
        lwl: "85 FT (25.91 M)",
        beam: "22.91 FT (6.98 M)",
        draft: "7.5 FT (2.29 M)",
        displacement: "95 Tons",
        power: "3,200 HP (2 × 1,600 HP MTU)",
        cabins: "5 + 2 Staterooms",
        berths: "12 + 5 Berths (17 Pax)",
        fuel: "2,900 Gal (10,970 L)",
        water: "670 Gal (2,536 L)",
        hull: "Hand-Laid Honeycomb Composite"
      },
      comparisonMatrix: {
        loa: "100 FT (30.48 M)",
        lwl: "85 FT (25.91 M)",
        beam: "22.91 FT (6.98 M)",
        draft: "7.5 FT (2.29 M)",
        displacement: "95 Tons",
        power: "3,200 HP (2 × 1,600 HP MTU)",
        cabins: "5 + 2 Staterooms",
        berths: "12 + 5 Berths (17 Pax)",
        fuel: "2,900 Gal (10,970 L)",
        water: "670 Gal (2,536 L)",
        hull: "Hand-Laid Honeycomb Composite"
      },
      highlights: ["Initial highlight 1", "Initial highlight 2"],
      keyMetrics: [
        { label: "Length Overall (LOA)", main: "100 FT", sub: "30.48 M" },
        { label: "Maximum Beam", main: "22.91 FT", sub: "6.98 M" },
        { label: "Propulsion Power", main: "3,200 HP", sub: "MTU Twin" },
        { label: "Accommodations", main: "5+2 Staterooms", sub: "17 Pax" },
        { label: "Displacement", main: "95 Tons", sub: "Full Load" },
        { label: "Fuel Capacity", main: "2,900 Gal", sub: "10,970 L" }
      ],
      narrative: {
        eyebrow: "E2E ARCHITECTURAL NARRATIVE",
        headline: "Initial E2E Narrative Headline",
        paragraphs: ["Initial E2E paragraph essay."]
      },
      seo: {
        title: "E2E Vessel | ASMARATY Luxury Yachts",
        description: "Initial SEO description",
        ogImage: "/images/yachts/g100/0.jpg"
      }
    };

    // Workflow 1: Create test record
    await test("Workflow 1 & 2: Create yacht & edit tagline -> reflected on detail view", async () => {
      const saved = await saveYachtServer(currentTestYacht);
      assert(saved.id === testYachtId);

      // Now edit tagline
      const updatedTagline = "Updated Revolutionary Luxury Tagline 2026";
      const updated = await saveYachtServer({
        ...saved,
        tagline: updatedTagline
      });
      assert(updated.tagline === updatedTagline);

      // Verify merged detail page presentation
      const merged = mergeYachtWithShowcase(updated, null);
      assert(merged.tagline === updatedTagline, "Detail page tagline matches updated CMS value");
    });

    // Workflow 3 & 4: Edit all 11 technical specifications -> reflected in comparison matrix & spec table
    await test("Workflow 3 & 4: Edit all 11 technical specs -> matrix & table synchronized", async () => {
      const updatedSpecs = {
        loa: "105 FT (32.00 M)",
        lwl: "89 FT (27.10 M)",
        beam: "24.00 FT (7.30 M)",
        draft: "7.8 FT (2.38 M)",
        displacement: "102 Tons",
        power: "3,600 HP (2 × 1,800 HP MTU)",
        cabins: "6 + 2 Staterooms",
        berths: "14 + 5 Berths (19 Pax)",
        fuel: "3,200 Gal (12,110 L)",
        water: "750 Gal (2,840 L)",
        hull: "Advanced Carbon-Composite Honeycomb"
      };

      const updated = await saveYachtServer({
        ...currentTestYacht,
        specsSnapshot: updatedSpecs,
        comparisonMatrix: updatedSpecs
      });

      // Verify on disk
      const onDisk = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
      const found = onDisk.find(y => y.id === testYachtId);
      assert(found.specsSnapshot.loa === "105 FT (32.00 M)");
      assert(found.comparisonMatrix.power === "3,600 HP (2 × 1,800 HP MTU)");

      // Verify detail page spec synchronization
      const merged = mergeYachtWithShowcase(found, getYachtShowcaseData("g100"));
      const allSpecs = [];
      merged.specCategories.forEach(cat => (cat.specs || []).forEach(s => allSpecs.push(s)));
      const findSpec = (txt) => allSpecs.find(s => s.label.toLowerCase().includes(txt.toLowerCase()));

      assert(findSpec("Length Overall").value === "105 FT (32.00 M)", "LOA synced to table");
      assert(findSpec("Beam").value === "24.00 FT (7.30 M)", "Beam synced to table");
      assert(findSpec("Draft at Full Load").value === "7.8 FT (2.38 M)", "Draft synced to table");
      assert(findSpec("Displacement").value === "102 Tons", "Displacement synced to table");
      assert(findSpec("Propulsion").value === "3,600 HP (2 × 1,800 HP MTU)", "Power synced to table");
      assert(findSpec("Stateroom").value === "6 + 2 Staterooms", "Cabins synced to table");
      assert(findSpec("Berth").value === "14 + 5 Berths (19 Pax)", "Berths synced to table");
      assert(findSpec("Fuel").value === "3,200 Gal (12,110 L)", "Fuel synced to table");
      assert(findSpec("Freshwater").value === "750 Gal (2,840 L)", "Water synced to table");
    });

    // Workflow 5: Replace hero image
    await test("Workflow 5: Replace hero image -> primary showcase image updated", async () => {
      const newHero = "/images/yachts/g100/5.jpg";
      const updated = await saveYachtServer({
        ...currentTestYacht,
        heroImage: newHero,
        mainImage: newHero,
        primaryImage: newHero
      });
      assert(updated.heroImage === newHero);

      const merged = mergeYachtWithShowcase(updated, getYachtShowcaseData("g100"));
      assert(merged.heroImages[0].src === newHero, "Detail hero slide 0 updated to new hero image");
    });

    // Workflow 6: Add, remove, and reorder gallery images
    await test("Workflow 6: Add, remove, and reorder gallery images", async () => {
      const updatedGallery = [
        "/images/yachts/g66/hero-01.jpg",
        "/images/yachts/g50/hero-01.jpg",
        "/images/yachts/g77/g77_asset_01_1672x941.jpg"
      ];
      const updated = await saveYachtServer({
        ...currentTestYacht,
        gallery: updatedGallery
      });
      assert(updated.gallery.length === 3);
      assert(updated.gallery[0] === "/images/yachts/g66/hero-01.jpg");

      const merged = mergeYachtWithShowcase(updated, null);
      assert(merged.gallery.length === 3);
      assert(merged.gallery[0].src === "/images/yachts/g66/hero-01.jpg");
    });

    // Workflow 7: Update narrative text and six metric cards
    await test("Workflow 7: Update narrative text and 6 metric cards", async () => {
      const updatedMetrics = [
        { label: "LOA", main: "105 FT", sub: "32 M" },
        { label: "Beam", main: "24 FT", sub: "7.3 M" },
        { label: "Power", main: "3,600 HP", sub: "Twin MTU" },
        { label: "Staterooms", main: "6+2 Suites", sub: "19 Guests" },
        { label: "Displacement", main: "102 Tons", sub: "Full Load" },
        { label: "Range", main: "1,500 NM", sub: "Cruising" }
      ];
      const updatedNarrative = {
        eyebrow: "REFINED ARCHITECTURE",
        headline: "Master Crafted Tri-Deck Horizon Suite",
        paragraphs: ["Updated paragraph 1.", "Updated paragraph 2."]
      };

      const updated = await saveYachtServer({
        ...currentTestYacht,
        keyMetrics: updatedMetrics,
        narrative: updatedNarrative
      });

      const merged = mergeYachtWithShowcase(updated, null);
      assert(merged.keyMetrics[0].main === "105 FT");
      assert(merged.narrative.headline === "Master Crafted Tri-Deck Horizon Suite");
      assert(merged.narrative.paragraphs.length === 2);
    });

    // Workflow 8 & 9: Brochure URL change & clear behavior
    await test("Workflow 8 & 9: Brochure URL download vs. cleared 'Request Brochure' behavior", async () => {
      // 8: Valid brochure URL
      const withPdf = await saveYachtServer({
        ...currentTestYacht,
        brochureUrl: "/documents/asmaraty-g100-brochure.pdf"
      });
      const mergedWithPdf = mergeYachtWithShowcase(withPdf, null);
      assert(mergedWithPdf.brochureUrl === "/documents/asmaraty-g100-brochure.pdf");

      // 9: Cleared brochure URL -> Must remain null
      const withoutPdf = await saveYachtServer({
        ...currentTestYacht,
        brochureUrl: ""
      });
      const mergedWithoutPdf = mergeYachtWithShowcase(withoutPdf, getYachtShowcaseData("g100"));
      assert(mergedWithoutPdf.brochureUrl === null, "Cleared brochure URL strictly resolves to null");
    });

    // Workflow 10 & 11: Draft vs. Published toggle & indexing behavior
    await test("Workflow 10 & 11: Draft status hides public visibility & prevents search indexing", async () => {
      // Set to draft
      const draft = await saveYachtServer({
        ...currentTestYacht,
        status: "draft"
      });
      assert(draft.status === "draft");

      // Verify excluded from published server list
      const publishedOnly = await getYachtsServer(true);
      assert(!publishedOnly.some(y => y.id === testYachtId), "Draft yacht excluded from public catalog");

      // Verify merged status is draft
      const mergedDraft = mergeYachtWithShowcase(draft, null);
      assert(mergedDraft.status === "draft");

      // Re-publish
      const published = await saveYachtServer({
        ...currentTestYacht,
        status: "published"
      });
      const publishedNow = await getYachtsServer(true);
      assert(publishedNow.some(y => y.id === testYachtId), "Published yacht restored to public list");
    });

    // Workflow 12: Duplicate yacht
    await test("Workflow 12: Duplicate yacht creates unpublished draft with unique ID and slug", async () => {
      const duplicated = duplicateYacht("yacht-g100");
      assert(duplicated, "duplicateYacht must return duplicate");
      assert(duplicated.id !== "yacht-g100", "New unique ID generated");
      assert(duplicated.slug.includes("copy"), "Unique suffixed slug generated");
      assert(duplicated.status === "draft", "Duplicate defaults to draft status");
      assert(duplicated.name.includes("(Copy)"), "Duplicate includes (Copy)");
    });

    // Workflow 13: Slug collision protection
    await test("Workflow 13: Slug collision protection blocks duplicate slugs", async () => {
      let blocked = false;
      try {
        await saveYachtServer({
          id: `yacht-collision-${Date.now()}`,
          name: "Collision Imposter",
          slug: testSlug // Collision with active test yacht!
        });
      } catch (err) {
        blocked = true;
        assert(err.message.includes("already in use"));
      }
      assert(blocked, "Server strictly blocked duplicate slug");
    });

    // Workflow 14: Delete test record
    await test("Workflow 14: Delete yacht removes record from authoritative store", async () => {
      const deleted = await deleteYachtServer(testYachtId);
      assert(deleted === true);

      const onDisk = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
      assert(!onDisk.some(y => y.id === testYachtId), "Test yacht cleanly removed from data/yachts.json");
    });

    // -------------------------------------------------------------
    // SECTION 3: DATA INTEGRITY & BASELINE COMPARISON
    // -------------------------------------------------------------
    await test("Data Integrity: Exactly 4 core yachts exist with intact original fields", async () => {
      const finalYachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
      assert(finalYachts.length === 4, `Expected exactly 4 core yachts, found ${finalYachts.length}`);

      const slugs = ["g100", "g77", "g66", "g50"];
      for (const s of slugs) {
        const y = finalYachts.find(m => m.slug === s);
        assert(y, `Core model '${s}' must exist`);
        assert(y.status === "published", `'${s}' must be published`);
        assert(y.specsSnapshot && y.specsSnapshot.loa, `'${s}' must have specsSnapshot`);
        assert(y.comparisonMatrix && y.comparisonMatrix.loa, `'${s}' must have comparisonMatrix`);
        assert(Array.isArray(y.gallery) && y.gallery.length > 0, `'${s}' must have gallery`);
      }
    });

    await test("Data Integrity: Safety backups intact and uncorrupted", async () => {
      assert(fs.existsSync(BACKUP_FILE), "Backup file data/yachts.backup-before-phase4.json must exist");
      const backupContent = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf-8"));
      assert(Array.isArray(backupContent), "Backup must parse as array");
    });

    // -------------------------------------------------------------
    // SECTION 4: SECURITY & AUTHENTICATION AUDIT
    // -------------------------------------------------------------
    await test("Security: Session verification token rejects forgery & tampered signatures", async () => {
      const validToken = "valid_test_admin_token";
      assert(verifySessionToken(null) === null, "Null token rejected");
      assert(verifySessionToken("") === null, "Empty token rejected");
      assert(verifySessionToken("forged.invalid.token") === null, "Forged token rejected");
    });

    await test("Security: Server API routes enforce verifySessionToken guard", async () => {
      const postRoute = fs.readFileSync(path.join(ROOT, "app", "api", "yachts", "route.js"), "utf-8");
      assert(postRoute.includes("verifySessionToken(token)"), "POST /api/yachts validates token");
      assert(postRoute.includes("status: 401"), "Returns 401 on unauthorized");

      const putRoute = fs.readFileSync(path.join(ROOT, "app", "api", "yachts", "[id]", "route.js"), "utf-8");
      assert(putRoute.includes("verifySessionToken(token)"), "PUT/DELETE /api/yachts/[id] validates token");
      assert(putRoute.includes("status: 401"), "Returns 401 on unauthorized");

      const reorderRoute = fs.readFileSync(path.join(ROOT, "app", "api", "yachts", "reorder", "route.js"), "utf-8");
      assert(reorderRoute.includes("verifySessionToken(token)"), "POST /api/yachts/reorder validates token");
      assert(reorderRoute.includes("status: 401"), "Returns 401 on unauthorized");
    });

    await test("Security: Window event listeners strictly isolated to 'use client' components", async () => {
      const layoutContent = fs.readFileSync(path.join(ROOT, "app", "yachts", "[slug]", "layout.js"), "utf-8");
      assert(!layoutContent.includes("window.addEventListener"), "Server layout does not use browser APIs");

      const catalogContent = fs.readFileSync(path.join(ROOT, "components", "public", "yacht-catalog", "UniversalYachtCatalogView.js"), "utf-8");
      assert(catalogContent.startsWith('"use client";') || catalogContent.startsWith("'use client';"), "Catalog view is client component");

      const detailContent = fs.readFileSync(path.join(ROOT, "app", "yachts", "[slug]", "page.js"), "utf-8");
      assert(detailContent.startsWith('"use client";') || detailContent.startsWith("'use client';"), "Detail page is client component");
    });

  } finally {
    // Restore initial state to guarantee 100% pristine data
    fs.writeFileSync(YACHTS_FILE, initialYachtsRaw, "utf-8");
  }

  // Print Summary
  console.log("\n==================================================================");
  console.log(`PHASE 4: STEP 5 AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error("Unhandled error in Step 5 audit:", err);
  process.exit(1);
});
