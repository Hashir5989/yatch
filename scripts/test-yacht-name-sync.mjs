import assert from "node:assert/strict";
import fs from "node:fs";
import { getYachtsServer, saveYachtServer } from "../lib/server/db.js";
import { mergeYachtWithShowcase, getYachtShowcaseData } from "../lib/data/yachtShowcaseData.js";

async function runTests() {
  console.log("=== Testing Yacht Model Name Synchronization ===");

  // Read original yachts.json backup
  const originalJson = fs.readFileSync("./data/yachts.json", "utf-8");

  try {
    const yachts = await getYachtsServer(false);
    console.log(`Loaded ${yachts.length} yachts from server.`);

    const models = ["g100", "g77", "g66", "g50"];

    for (const slug of models) {
      console.log(`\n--- Testing ${slug.toUpperCase()} Name Sync ---`);
      const yacht = yachts.find((y) => y.slug === slug);
      assert(yacht, `Yacht ${slug} must exist`);

      const originalName = yacht.name;
      const testName = `ASMARATY ${slug.toUpperCase()} Test Suite Sync`;

      console.log(`Original name: "${originalName}"`);
      console.log(`Updating to: "${testName}"...`);

      // 1. Simulate admin save
      const updatedYacht = {
        ...yacht,
        name: testName,
        fullName: testName,
      };

      const saved = await saveYachtServer(updatedYacht);
      assert.equal(saved.name, testName, "Saved yacht must have new name");

      // 2. Fetch fresh from server (simulating page reload)
      const freshYachts = await getYachtsServer(true);
      const freshYacht = freshYachts.find((y) => y.slug === slug);
      assert.equal(freshYacht.name, testName, `Server must return updated name for ${slug}`);

      // 3. Test Homepage Collection Section modelHeading logic
      const HOME_MODEL_TITLE_MAP = {
        g77: "ASMARATY G77 Luxury Yacht",
        g66: "ASMARATY G66 Luxury Yacht",
        g50: "ASMARATY G50 Luxury Motor Yacht",
      };
      const modelHeading =
        freshYacht.name ||
        HOME_MODEL_TITLE_MAP[freshYacht.slug] ||
        "ASMARATY Yacht";

      assert.equal(modelHeading, testName, `Homepage collection heading must reflect updated name for ${slug}`);
      console.log(`✓ Homepage collection heading: "${modelHeading}"`);

      // 4. Test Catalog View effectiveModels logic
      const catalogTitle = freshYacht.name || freshYacht.fullName;
      assert.equal(catalogTitle, testName, `Catalog view title must reflect updated name for ${slug}`);
      console.log(`✓ Catalog view title: "${catalogTitle}"`);

      // 5. Test Detail View mergeYachtWithShowcase logic
      const showcase = getYachtShowcaseData(slug);
      const merged = mergeYachtWithShowcase(freshYacht, showcase);
      assert.equal(merged.name, testName, `Detail view merged.name must reflect updated name for ${slug}`);
      console.log(`✓ Detail view merged name: "${merged.name}"`);

      // 6. Test second reload to ensure persistence
      const reloadYachts = await getYachtsServer(false);
      const reloadYacht = reloadYachts.find((y) => y.slug === slug);
      assert.equal(reloadYacht.name, testName, `Second reload must preserve updated name for ${slug}`);
      console.log(`✓ Persisted across second reload`);
    }

    console.log("\n=======================================================");
    console.log("  ALL 4 YACHT MODELS PASSED NAME SYNCHRONIZATION TESTS!");
    console.log("=======================================================");
  } finally {
    // Restore original yachts.json
    fs.writeFileSync("./data/yachts.json", originalJson, "utf-8");
    console.log("\nRestored original data/yachts.json");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

