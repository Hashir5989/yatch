/**
 * ASMARATY Luxury Yachts — Database & Auth Integration Verification Test
 * 
 * Verifies:
 * 1. Resilient server data-access layer (PostgreSQL + Local fallback)
 * 2. Yacht operations (Read, Create, Update, Reorder, Delete)
 * 3. Customer Enquiry validation & persistence
 * 4. Admin authentication & HMAC session token signing
 * 
 * Usage:
 *   node scripts/test-db-integration.js
 */

async function runTests() {
  const {
    getYachtsServer,
    saveYachtServer,
    deleteYachtServer,
    reorderYachtsServer,
    saveEnquiryServer,
    getEnquiriesServer,
    verifyAdminCredentials,
    createSessionToken,
    verifySessionToken
  } = await import("../lib/server/db.js");
  console.log("\n============================================================");
  console.log("🧪 ASMARATY — Database & Security Integration Test Suite");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Fetch Yachts
    console.log("[Test Suite 1: Yacht Model Catalog Operations]");
    const initialYachts = await getYachtsServer();
    assert(Array.isArray(initialYachts) && initialYachts.length >= 4, "Initial yachts loaded dynamically (at least 4 models)");
    
    const publishedYachts = await getYachtsServer(true);
    assert(Array.isArray(publishedYachts), "Published yachts filtered correctly");
    assert(publishedYachts.every((y) => y.status === "published"), "Published-only query excludes drafts");

    // Test 2: Create a dynamic yacht model
    const testYachtId = `yacht-test-${Date.now()}`;
    const newYacht = await saveYachtServer({
      id: testYachtId,
      name: "G120 Sovereign Test",
      slug: "g120-sovereign-test",
      category: "Superyacht",
      tagline: "The Zenith of Naval Power",
      description: "Automated test vessel for verifying database persistence.",
      length: "120 FT",
      mainImage: "/images/yachts/g100.jpg",
      gallery: ["/images/yachts/g100.jpg"],
      status: "draft",
      displayOrder: 99,
      specs: { lengthOverall: "120 ft", hullMaterial: "Carbon Composite" },
      highlights: ["Testing highlight 1", "Testing highlight 2"]
    });
    assert(newYacht && newYacht.id === testYachtId, "Dynamic yacht created with unique ID");

    // Test 3: Edit yacht model
    const updatedYacht = await saveYachtServer({
      id: testYachtId,
      name: "G120 Sovereign Test (Updated)",
      status: "published"
    });
    assert(updatedYacht && updatedYacht.name.includes("Updated"), "Yacht model edited successfully");
    assert(updatedYacht.status === "published", "Yacht status toggled to published");

    // Test 4: Reorder yachts
    const reorderedList = await reorderYachtsServer([testYachtId, initialYachts[0].id]);
    assert(reorderedList && reorderedList[0].id === testYachtId, "Yachts display order re-sequenced dynamically");

    // Test 5: Delete test yacht
    const deleted = await deleteYachtServer(testYachtId);
    assert(deleted === true, "Yacht deleted successfully from store");
    const checkYachts = await getYachtsServer();
    assert(!checkYachts.some((y) => y.id === testYachtId), "Deleted yacht is absent from catalog");

    // Test 6: Customer Enquiry Persistence
    console.log("\n[Test Suite 2: Customer Enquiry Persistence]");
    const testEnquiry = await saveEnquiryServer({
      name: "His Excellency Sheikh Al-Qasimi",
      email: "sheikh.test@asmaraty-advisory.ae",
      phone: "+971 50 123 4567",
      model: "G100 Superyacht",
      inquiryType: "Private Sea Trial Request",
      message: "Requesting VIP confidential sea trial departing Dubai Harbour."
    });
    assert(testEnquiry && testEnquiry.id, "Customer enquiry created with timestamped ID");
    assert(testEnquiry.email === "sheikh.test@asmaraty-advisory.ae", "Customer email recorded accurately");

    const allEnquiries = await getEnquiriesServer();
    assert(allEnquiries.some((e) => e.email === "sheikh.test@asmaraty-advisory.ae"), "Enquiry retrieved from datastore");

    // Test 7: Admin Authentication & HMAC Session Tokens
    console.log("\n[Test Suite 3: Admin Authentication & Session Security]");
    const verified = await verifyAdminCredentials("admin@asmaraty.ae", "Asmaraty#2026");
    assert(verified && verified.email === "admin@asmaraty.ae", "Admin credentials verified with PBKDF2/SHA-512");

    const failedAuth = await verifyAdminCredentials("admin@asmaraty.ae", "WrongPassword!99");
    assert(failedAuth === false, "Unauthorized login rejected with invalid password");

    const token = createSessionToken(verified);
    assert(token && typeof token === "string" && token.includes("."), "HMAC-SHA256 session token signed");

    const payload = verifySessionToken(token);
    assert(payload && payload.email === verified.email, "Session token verified & decoded truthfully");

    const tampered = token.slice(0, -5) + "abcde";
    const tamperedPayload = verifySessionToken(tampered);
    assert(tamperedPayload === null, "Tampered session token rejected cryptographically");

    console.log("\n============================================================");
    console.log(`Results: ${passed} passed, ${failed} failed.`);
    console.log("============================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
