import fs from "fs";
import path from "path";
import assert from "assert";

const ROOT = process.cwd();
const YACHTS_FILE = path.join(ROOT, "data", "yachts.json");
const PAGES_FILE = path.join(ROOT, "data", "pages.json");
const SETTINGS_FILE = path.join(ROOT, "data", "settings.json");

console.log("==================================================================");
console.log("  PHASE 4: STEP 3 — ADMIN YACHT MANAGEMENT INTERFACE VERIFICATION");
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
  const yachts = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));

  // 1. Initial 4 Migrated Records Integrity
  await test("Initial Data: 4 core migrated yachts exist and intact", async () => {
    assert(Array.isArray(yachts), "yachts must be an array");
    assert(yachts.length >= 4, `Expected at least 4 models, found ${yachts.length}`);
  });

  const coreModels = ["g100", "g77", "g66", "g50"];
  for (const slug of coreModels) {
    await test(`Model '${slug}' retains all complete metadata, specifications, and media`, async () => {
      const y = yachts.find(m => m.slug === slug);
      assert(y, `Model '${slug}' must exist`);
      assert(y.id, `Model '${slug}' must have an ID`);
      assert(y.name, `Model '${slug}' must have name`);
      assert(y.modelNumber, `Model '${slug}' must have modelNumber`);
      assert(y.category, `Model '${slug}' must have category`);
      assert(y.series, `Model '${slug}' must have series`);
      assert(y.decks, `Model '${slug}' must have decks`);
      assert(y.badge, `Model '${slug}' must have badge`);
      assert(y.tagline, `Model '${slug}' must have tagline`);
      assert(y.description, `Model '${slug}' must have description`);
      assert(y.heroImage, `Model '${slug}' must have heroImage`);
      assert(Array.isArray(y.gallery) && y.gallery.length > 0, `Model '${slug}' must have non-empty gallery`);
      assert(y.specsSnapshot, `Model '${slug}' must have specsSnapshot`);
      assert(y.comparisonMatrix, `Model '${slug}' must have comparisonMatrix`);

      // Check all 11 comparison/snapshot specs
      const requiredSpecs = ["loa", "lwl", "beam", "draft", "displacement", "power", "cabins", "berths", "fuel", "water", "hull"];
      for (const spec of requiredSpecs) {
        assert(y.specsSnapshot[spec], `Model '${slug}' specsSnapshot.${spec} missing`);
        assert(y.comparisonMatrix[spec], `Model '${slug}' comparisonMatrix.${spec} missing`);
      }
    });
  }

  await test("Model 'g77' correctly preserves empty/null brochure URL for Request Brochure CTA", async () => {
    const g77 = yachts.find(m => m.slug === "g77");
    assert(g77, "g77 must exist");
    assert(!g77.brochureUrl, "g77 brochureUrl must be null/empty");
  });

  await test("Models 'g100', 'g66', 'g50' have valid PDF brochure links", async () => {
    for (const slug of ["g100", "g66", "g50"]) {
      const y = yachts.find(m => m.slug === slug);
      assert(y.brochureUrl && y.brochureUrl.endsWith(".pdf"), `Model '${slug}' brochureUrl must end with .pdf`);
    }
  });

  // 2. Server-side Validation & Slug Collisions
  const { saveYachtServer, deleteYachtServer, reorderYachtsServer } = await import("../lib/server/db.js");

  await test("Server Validation: saveYachtServer rejects missing name", async () => {
    let threw = false;
    try {
      await saveYachtServer({ name: "   ", slug: "test-slug" });
    } catch (e) {
      threw = true;
      assert(e.message.includes("name is required"));
    }
    assert(threw);
  });

  await test("Server Validation: saveYachtServer rejects missing slug", async () => {
    let threw = false;
    try {
      await saveYachtServer({ name: "Test Vessel", slug: "   " });
    } catch (e) {
      threw = true;
      assert(e.message.includes("slug is required"));
    }
    assert(threw);
  });

  await test("Server Validation: saveYachtServer rejects invalid slug format", async () => {
    let threw = false;
    try {
      await saveYachtServer({ name: "Test Vessel", slug: "Invalid Slug With Spaces!" });
    } catch (e) {
      threw = true;
      assert(e.message.includes("lowercase alphanumeric"));
    }
    assert(threw);
  });

  await test("Server Validation: saveYachtServer blocks slug collision on new yacht", async () => {
    let threw = false;
    try {
      await saveYachtServer({
        id: "yacht-collision-new",
        name: "Fake Flagship",
        slug: "g100"
      });
    } catch (e) {
      threw = true;
      assert(e.message.includes("already in use"));
    }
    assert(threw);
  });

  await test("Server Validation: saveYachtServer permits updating yacht without changing slug", async () => {
    const originalG100 = yachts.find(y => y.slug === "g100");
    const updated = await saveYachtServer({
      ...originalG100,
      id: "yacht-g100",
      slug: "g100"
    });
    assert(updated.id === "yacht-g100");
    assert(updated.slug === "g100");
  });

  // 3. Complete CRUD Operations Lifecycle
  const testId = `yacht-test-crud-${Date.now()}`;
  const testSlug = `test-phantom-${Date.now()}`;

  await test("CRUD Create: Successfully create a new draft yacht model", async () => {
    const created = await saveYachtServer({
      id: testId,
      name: "ASMARATY Test Phantom 85",
      fullName: "ASMARATY Test Phantom 85 Superyacht",
      modelNumber: "TP85",
      slug: testSlug,
      category: "Superyacht",
      categoryKey: "superyacht",
      categoryLabel: "Superyacht",
      series: "Phantom Series",
      decks: "Three Decks",
      badge: "Experimental Concept",
      tagline: "The Future of Arabian Marine Luxury",
      description: "An experimental high-performance vessel.",
      heroImage: "/images/yachts/g100/0.jpg",
      mainImage: "/images/yachts/g100/0.jpg",
      primaryImage: "/images/yachts/g100/0.jpg",
      gallery: ["/images/yachts/g100/0.jpg", "/images/yachts/g77/g77_asset_01_1672x941.jpg"],
      brochureUrl: "/documents/test.pdf",
      brochureLabel: "Download Dossier (PDF)",
      status: "draft",
      featured: false,
      specsSnapshot: {
        loa: "85 FT (25.9 M)",
        lwl: "72 FT",
        beam: "20 FT",
        draft: "5.5 FT",
        displacement: "60 Tons",
        power: "2,200 HP",
        cabins: "4 Staterooms",
        berths: "8 Berths",
        fuel: "1,800 Gal",
        water: "500 Gal",
        hull: "Carbon-Infused Honeycomb Composite"
      },
      comparisonMatrix: {
        loa: "85 FT (25.9 M)",
        lwl: "72 FT",
        beam: "20 FT",
        draft: "5.5 FT",
        displacement: "60 Tons",
        power: "2,200 HP",
        cabins: "4 Staterooms",
        berths: "8 Berths",
        fuel: "1,800 Gal",
        water: "500 Gal",
        hull: "Carbon-Infused Honeycomb Composite"
      },
      highlights: ["Carbon-fiber reinforced superstructure", "Zero-speed hydraulic stabilization"],
      seo: {
        title: "Test Phantom 85 | ASMARATY",
        description: "Experimental vessel specifications",
        ogImage: "/images/yachts/g100/0.jpg"
      }
    });

    assert(created.id === testId);
    assert(created.status === "draft");
    assert(created.specsSnapshot.loa === "85 FT (25.9 M)");

    // Read directly from disk
    const onDisk = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
    const found = onDisk.find(y => y.id === testId);
    assert(found, "Record must be written to data/yachts.json");
    assert(found.name === "ASMARATY Test Phantom 85");
  });

  await test("CRUD Conflict: Block updating test yacht slug to collision with 'g66'", async () => {
    let threw = false;
    try {
      await saveYachtServer({
        id: testId,
        name: "Test Collision",
        slug: "g66"
      });
    } catch (e) {
      threw = true;
      assert(e.message.includes("already in use"));
    }
    assert(threw);
  });

  await test("CRUD Update: Update test yacht specifications, publish status, and gallery", async () => {
    const updated = await saveYachtServer({
      id: testId,
      name: "ASMARATY Test Phantom 85 - Published Edition",
      slug: testSlug,
      status: "published",
      specsSnapshot: {
        loa: "86 FT (26.2 M)",
        lwl: "73 FT",
        beam: "20.5 FT",
        draft: "5.6 FT",
        displacement: "62 Tons",
        power: "2,600 HP (2 × 1,300 HP CAT)",
        cabins: "4 + 1 Staterooms",
        berths: "10 Berths",
        fuel: "2,000 Gal",
        water: "550 Gal",
        hull: "Carbon-Infused Honeycomb Composite"
      },
      gallery: [
        "/images/yachts/g100/0.jpg",
        "/images/yachts/g77/g77_asset_01_1672x941.jpg",
        "/images/yachts/g66/hero-01.jpg"
      ]
    });

    assert(updated.status === "published");
    assert(updated.specsSnapshot.loa === "86 FT (26.2 M)");
    assert(updated.gallery.length === 3);

    // Verify disk persistence
    const onDisk = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
    const found = onDisk.find(y => y.id === testId);
    assert(found.status === "published");
    assert(found.gallery.length === 3);
  });

  await test("CRUD Delete: Successfully delete test yacht model and verify disk removal", async () => {
    const res = await deleteYachtServer(testId);
    assert(res === true);

    const onDisk = JSON.parse(fs.readFileSync(YACHTS_FILE, "utf-8"));
    const found = onDisk.find(y => y.id === testId);
    assert(!found, "Deleted yacht must not exist in data/yachts.json");
    assert(onDisk.length >= 4, "Initial 4 models must remain safe");
  });

  // 4. Duplication Logic
  await test("Duplication: duplicateYacht creates unique copy with draft status and unique slug", async () => {
    const { duplicateYacht } = await import("../lib/cmsStore.js");
    const duplicated = duplicateYacht("yacht-g100");
    assert(duplicated, "duplicateYacht must return duplicate");
    assert(duplicated.id !== "yacht-g100", "New ID must be generated");
    assert(duplicated.slug.includes("copy"), "Slug must include copy suffix");
    assert(duplicated.status === "draft", "Duplicated model must default to draft");
    assert(duplicated.name.includes("(Copy)"), "Name must include (Copy)");

    // Clean up duplicated yacht
    await deleteYachtServer(duplicated.id);
  });

  // 5. API Security
  await test("API Security: Yacht mutation routes enforce server session authentication", async () => {
    const routeContent = fs.readFileSync(path.join(ROOT, "app", "api", "yachts", "route.js"), "utf-8");
    assert(routeContent.includes("verifySessionToken(token)"), "POST /api/yachts must verify session token");
    assert(routeContent.includes("status: 401"), "POST /api/yachts must return 401 if unauthorized");

    const idRouteContent = fs.readFileSync(path.join(ROOT, "app", "api", "yachts", "[id]", "route.js"), "utf-8");
    assert(idRouteContent.includes("verifySessionToken(token)"), "PUT/DELETE /api/yachts/[id] must verify session token");
    assert(idRouteContent.includes("status: 401"), "PUT/DELETE /api/yachts/[id] must return 401 if unauthorized");
  });

  // 6. Admin UI Code Structure
  await test("Admin UI: app/admin/yachts/page.js implements complete tabbed editing interface", async () => {
    const content = fs.readFileSync(path.join(ROOT, "app", "admin", "yachts", "page.js"), "utf-8");
    assert(content.includes("specsSnapshot"), "Manages specsSnapshot");
    assert(content.includes("comparisonMatrix"), "Manages comparisonMatrix");
    assert(content.includes("handleDuplicate"), "Supports model duplication");
    assert(content.includes("Critical: This Yacht is Currently Published Live"), "Includes warning when deleting published model");
    assert(content.includes("MediaPickerModal"), "Integrated MediaPickerModal");
    assert(content.includes("Save as Draft"), "Contains Save as Draft action");
    assert(content.includes("Publish Vessel Live"), "Contains Publish action");
    assert(content.includes("seo"), "Contains SEO metadata tab");
    assert(content.includes("keyMetrics"), "Contains Key Metrics management");
  });

  // Print Summary
  console.log("\n==================================================================");
  console.log(`STEP 3 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED.`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error("Unhandled error in Step 3 verification:", err);
  process.exit(1);
});
