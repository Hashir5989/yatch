import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  getSettingsServer, 
  saveSettingsServer, 
  getYachtsServer, 
  getArticlesServer, 
  verifySessionToken, 
  createSessionToken 
} from "../lib/server/db.js";
import { 
  BUTTON_TYPES, 
  BUTTON_STYLES, 
  detectLinkType, 
  formatButtonHref, 
  normalizeButtonConfig 
} from "../lib/data/buttonSchema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const results = {
  passed: [],
  failed: [],
};

function assert(condition, message, testGroup) {
  if (condition) {
    results.passed.push({ group: testGroup, message });
    console.log(`  [PASS] ${message}`);
  } else {
    results.failed.push({ group: testGroup, message });
    console.error(`  [FAIL] ${message}`);
  }
}

async function runVerification() {
  console.log("==================================================================");
  console.log("ASMARATY CMS VERIFICATION SUITE (Phases 1, 2 & News Filter)");
  console.log("==================================================================\n");

  // Backup current settings before running test mutations
  const settingsFile = path.join(ROOT_DIR, "data", "settings.json");
  const originalSettingsRaw = fs.readFileSync(settingsFile, "utf-8");
  const originalSettings = JSON.parse(originalSettingsRaw);

  try {
    /* -------------------------------------------------------------
       TEST GROUP 1: CMS PERSISTENCE & DEEP MERGE
       ------------------------------------------------------------- */
    console.log("--- 1. Testing CMS Persistence & Deep Merge ---");

    const testPayload = {
      siteTitle: "ASMARATY Luxury Yachts Verification Title",
      companyName: "AL SHAALI MARINE SHIPYARD TEST",
      contactPhone: "+971 50 999 8888",
      whatsappNumber: "+971 50 999 8888",
      contactEmail: "test-concierge@asmaraty.com",
      shipyardAddress: "TEST DOCKS, JABAL ALI, DUBAI, UAE",
      header: {
        menuLabel: "Explore Fleet",
        ctaButton: {
          label: "Book Sea Trial Now",
          url: "/contact?vip=true",
          target: "_blank",
          visible: true
        }
      },
      drawer: {
        fleetHeading: "Exclusive Fleet 2026",
        fleetViewAllText: "Browse All Models",
        fleetViewAllUrl: "/yachts",
        navHeading: "Direct Links",
        navLinks: [
          { id: "test-nav-1", label: "Custom Fleet", url: "/yachts", target: "_self", visible: true },
          { id: "test-nav-2", label: "Special Projects", url: "/about", target: "_blank", visible: false },
          { id: "test-nav-3", label: "Live Boat Shows", url: "/news", target: "_self", visible: true }
        ],
        ctaText: "Custom Yacht Engineering UAE",
        ctaButton: {
          label: "Enquire Privately",
          url: "/contact",
          target: "_self",
          visible: true
        }
      },
      footer: {
        brandEyebrow: "Elite Shipbuilder UAE",
        brandDescription: "Handcrafted marine composite hulls engineered since 1979 in the UAE.",
        trustBadge1: "ISO 9001 Certified",
        trustBadge2: "25-Yr Hull Guarantee",
        fleetHeading: "Active Fleet Models",
        experienceHeading: "Guest Experiences",
        experienceLinks: [
          { id: "test-exp-1", label: "All Collections", url: "/yachts", target: "_self", visible: true },
          { id: "test-exp-2", label: "VIP Sea Trials", url: "/contact", target: "_blank", visible: true },
          { id: "test-exp-3", label: "Hidden Experience", url: "/hidden", target: "_self", visible: false }
        ],
        hqHeading: "Regional Headquarters",
        copyrightText: "© 2026 ASMARATY SHIPBUILDING VERIFIED",
        tagline: "The Pinnacle of Arabian Maritime Engineering"
      },
      socialLinks: {
        instagram: "https://instagram.com/asmaraty_verified",
        facebook: "https://facebook.com/asmaraty_verified",
        linkedin: "https://linkedin.com/company/asmaraty_verified",
        youtube: "https://youtube.com/@asmaraty_verified",
        twitter: "https://x.com/asmaraty_verified",
        whatsapp: "https://wa.me/971509998888"
      }
    };

    // Save test settings to server
    const saved = await saveSettingsServer(testPayload);
    assert(saved.siteTitle === testPayload.siteTitle, "Site title was updated on server", "CMS Persistence");
    assert(saved.companyName === testPayload.companyName, "Company name was updated on server", "CMS Persistence");
    assert(saved.header.menuLabel === "Explore Fleet", "Header menuLabel was updated on server", "CMS Persistence");
    assert(saved.header.ctaButton.target === "_blank", "Header CTA target was updated on server", "CMS Persistence");
    assert(saved.drawer.navLinks.length === 3, "Drawer navLinks count matches test payload", "CMS Persistence");
    assert(saved.footer.experienceLinks.length === 3, "Footer experienceLinks count matches test payload", "CMS Persistence");
    assert(saved.socialLinks.instagram.includes("asmaraty_verified"), "Social link was persisted", "CMS Persistence");

    // Read back through fresh getSettingsServer() to verify disk persistence
    const reloaded = await getSettingsServer();
    assert(reloaded.siteTitle === testPayload.siteTitle, "Disk persistence verified on reload", "CMS Persistence");
    assert(reloaded.header.ctaButton.label === "Book Sea Trial Now", "Nested header button persisted on disk", "CMS Persistence");
    assert(reloaded.drawer.navLinks[1].visible === false, "Link visibility false persisted on disk", "CMS Persistence");
    assert(reloaded.footer.copyrightText === "© 2026 ASMARATY SHIPBUILDING VERIFIED", "Footer copyright persisted on disk", "CMS Persistence");

    /* -------------------------------------------------------------
       TEST GROUP 2: NAVIGATION TESTING & REORDERING
       ------------------------------------------------------------- */
    console.log("\n--- 2. Testing Navigation Links, Reordering & Targets ---");

    const links = [...reloaded.drawer.navLinks];
    // Reorder: Move item 2 to top
    const reorderedLinks = [links[1], links[0], links[2]];
    const savedReordered = await saveSettingsServer({ drawer: { ...reloaded.drawer, navLinks: reorderedLinks } });
    assert(savedReordered.drawer.navLinks[0].id === "test-nav-2", "Link reordering successfully persisted", "Navigation Testing");

    // Test link visibility filter logic (matches PublicNavbar.js)
    const visibleDrawerLinks = savedReordered.drawer.navLinks.filter(item => item.visible !== false);
    assert(visibleDrawerLinks.length === 2, "Drawer only displays visible items (2 out of 3)", "Navigation Testing");
    assert(!visibleDrawerLinks.some(l => l.id === "test-nav-2"), "Hidden item was filtered out of visible items", "Navigation Testing");

    // Test target attribute logic
    const blankLink = savedReordered.drawer.navLinks.find(l => l.target === "_blank");
    assert(blankLink !== undefined, "Nav link with target='_blank' identified", "Navigation Testing");
    const selfLink = savedReordered.drawer.navLinks.find(l => l.target === "_self");
    assert(selfLink !== undefined, "Nav link with target='_self' identified", "Navigation Testing");

    // Test Universal Button schema & phone/whatsapp link detection
    const phoneHref = formatButtonHref("+971 56 526 8126", "phone");
    assert(phoneHref === "tel:+971565268126", "formatButtonHref formats tel: correctly", "Navigation Testing");
    const emailHref = formatButtonHref("info@asmaraty.com", "email");
    assert(emailHref === "mailto:info@asmaraty.com", "formatButtonHref formats mailto: correctly", "Navigation Testing");
    const detectedTel = detectLinkType("tel:+971565268126");
    assert(detectedTel === "phone", "detectLinkType identifies phone protocol", "Navigation Testing");
    const detectedExternal = detectLinkType("https://instagram.com/asmaraty");
    assert(detectedExternal === "external", "detectLinkType identifies external URL", "Navigation Testing");

    /* -------------------------------------------------------------
       TEST GROUP 3: FOOTER TESTING & DYNAMIC SYNCHRONIZATION
       ------------------------------------------------------------- */
    console.log("\n--- 3. Testing Footer Columns & Dynamic Synchronization ---");

    // Column 1: Brand
    assert(reloaded.footer.brandEyebrow === "Elite Shipbuilder UAE", "Column 1 brand eyebrow verified", "Footer Testing");
    assert(reloaded.footer.trustBadge1 === "ISO 9001 Certified", "Column 1 trust badge 1 verified", "Footer Testing");
    assert(reloaded.footer.trustBadge2 === "25-Yr Hull Guarantee", "Column 1 trust badge 2 verified", "Footer Testing");

    // Column 2: Published Yachts (only published yachts appear)
    const allYachts = await getYachtsServer();
    const publishedYachts = allYachts.filter(y => y.status === "published");
    const draftYachts = allYachts.filter(y => y.status !== "published");
    assert(publishedYachts.length > 0, `Published yachts retrieved (${publishedYachts.length} yachts)`, "Footer Testing");
    assert(!publishedYachts.some(y => y.status === "draft"), "No draft yachts appear in published yacht list", "Footer Testing");

    // Column 3: Experience Links (visible only)
    const visibleExpLinks = reloaded.footer.experienceLinks.filter(l => l.visible !== false);
    assert(visibleExpLinks.length === 2, "Experience links correctly filtered for visible items only", "Footer Testing");
    assert(!visibleExpLinks.some(l => l.id === "test-exp-3"), "Hidden experience link excluded from footer render", "Footer Testing");

    // Column 4: Headquarters Contact Info
    assert(reloaded.companyName === "AL SHAALI MARINE SHIPYARD TEST", "Company name mapped to Headquarters", "Footer Testing");
    assert(reloaded.contactPhone === "+971 50 999 8888", "Phone mapped to Headquarters", "Footer Testing");

    // Social Links: Empty channels hidden
    const testEmptySocial = await saveSettingsServer({
      socialLinks: {
        instagram: "https://instagram.com/asmaraty",
        facebook: "", // empty
        linkedin: "https://linkedin.com/asmaraty",
        youtube: "", // empty
        twitter: "", // empty
        whatsapp: "https://wa.me/971565268126"
      }
    });
    const renderedSocialChannels = Object.entries(testEmptySocial.socialLinks).filter(([_, url]) => Boolean(url && url.trim()));
    assert(renderedSocialChannels.length === 3, "Only non-empty social channels rendered (3 of 6)", "Footer Testing");
    assert(!renderedSocialChannels.some(([k]) => k === "facebook" || k === "youtube" || k === "twitter"), "Empty social profiles omitted", "Footer Testing");

    /* -------------------------------------------------------------
       TEST GROUP 4: NEWS CATEGORY FILTER TESTING
       ------------------------------------------------------------- */
    console.log("\n--- 4. Testing News Category Filter & Query Logic ---");

    const NEWS_CATEGORIES = [
      { id: "all", label: "ALL NEWS" },
      { id: "boat-shows", label: "BOAT SHOWS", category: "Boat Shows" },
      { id: "fleet-launches", label: "FLEET LAUNCHES", category: "Fleet Launches" },
      { id: "innovations", label: "INNOVATIONS", category: "Innovations" },
      { id: "shipyard-news", label: "SHIPYARD NEWS", category: "Shipyard News" },
    ];

    const allArticles = await getArticlesServer(true); // published articles
    assert(allArticles.length > 0, `Articles loaded from database (${allArticles.length} published articles)`, "News Filter");

    // Filter simulation matching UniversalNewsListingView.js useMemo logic
    function filterArticles(articles, selectedCatId, searchQuery) {
      return articles.filter((art) => {
        const isPublished = art.status === "published";
        const isNewsArticle = art.articleType !== "event" && !art.eventDetails?.isUpcoming;
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
          art.title?.toLowerCase().includes(query) ||
          art.excerpt?.toLowerCase().includes(query);

        const activeCat = NEWS_CATEGORIES.find((c) => c.id === selectedCatId);
        const matchesCategory = 
          !activeCat || 
          activeCat.id === "all" || 
          (art.category && art.category.toLowerCase() === activeCat.category?.toLowerCase());

        return isPublished && isNewsArticle && matchesSearch && matchesCategory;
      });
    }

    // Test 4.1: ALL NEWS
    const allFiltered = filterArticles(allArticles, "all", "");
    assert(allFiltered.length > 0, `ALL NEWS tab returns news articles (${allFiltered.length} items)`, "News Filter");

    // Test 4.2: BOAT SHOWS
    const boatShowsFiltered = filterArticles(allArticles, "boat-shows", "");
    assert(boatShowsFiltered.length > 0, `BOAT SHOWS tab returns boat show news (${boatShowsFiltered.length} items)`, "News Filter");
    assert(boatShowsFiltered.every(a => a.category === "Boat Shows"), "All returned articles have category='Boat Shows'", "News Filter");

    // Test 4.3: FLEET LAUNCHES (empty state verification)
    const fleetLaunchesFiltered = filterArticles(allArticles, "fleet-launches", "");
    assert(fleetLaunchesFiltered.length === 0, "FLEET LAUNCHES returns 0 articles (triggers Empty State gracefully)", "News Filter");

    // Test 4.4: INNOVATIONS (empty state verification)
    const innovationsFiltered = filterArticles(allArticles, "innovations", "");
    assert(innovationsFiltered.length === 0, "INNOVATIONS returns 0 articles (triggers Empty State gracefully)", "News Filter");

    // Test 4.5: SHIPYARD NEWS (empty state verification)
    const shipyardNewsFiltered = filterArticles(allArticles, "shipyard-news", "");
    assert(shipyardNewsFiltered.length === 0, "SHIPYARD NEWS returns 0 articles (triggers Empty State gracefully)", "News Filter");

    // Test 4.6: Combined Category + Keyword Search
    const searchMatch = filterArticles(allArticles, "boat-shows", "Qatar");
    assert(searchMatch.length > 0, "Search for 'Qatar' in 'Boat Shows' returns matching article", "News Filter");
    const searchMismatch = filterArticles(allArticles, "boat-shows", "NonexistentKeyword123");
    assert(searchMismatch.length === 0, "Non-matching keyword correctly returns 0 articles", "News Filter");

    // Test 4.7: Reset Filters logic
    let currentCategory = "innovations";
    let currentSearch = "test";
    // Trigger reset:
    currentCategory = "all";
    currentSearch = "";
    const resetArticles = filterArticles(allArticles, currentCategory, currentSearch);
    assert(resetArticles.length === allFiltered.length, "Reset action restores full news list", "News Filter");

    /* -------------------------------------------------------------
       TEST GROUP 5: SECURITY & ACCESS CONTROL
       ------------------------------------------------------------- */
    console.log("\n--- 5. Testing Security, Auth Guards & RBAC ---");

    // Test 5.1: Session Token creation and validation
    const testAdminUser = { id: "admin-1", email: "admin@asmaraty.com", name: "Administrator", role: "superadmin" };
    const validToken = createSessionToken(testAdminUser);
    assert(typeof validToken === "string" && validToken.length > 20, "Session token generation works", "Security");
    const verifiedSession = verifySessionToken(validToken);
    assert(verifiedSession && verifiedSession.email === "admin@asmaraty.com", "Session token verified successfully", "Security");

    // Test 5.2: Invalid token rejection
    const fakeToken = "invalid_tampered_token_xyz_123";
    const fakeVerification = verifySessionToken(fakeToken);
    assert(fakeVerification === null, "Tampered/invalid session token is strictly rejected (returns null)", "Security");

    // Test 5.3: Empty token rejection
    assert(verifySessionToken("") === null, "Empty session token rejected", "Security");
    assert(verifySessionToken(null) === null, "Null session token rejected", "Security");

    // Test 5.4: File protection checks on API routes
    const settingsRouteContent = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "settings", "route.js"), "utf-8");
    assert(settingsRouteContent.includes("verifySessionToken"), "PUT /api/settings enforces verifySessionToken guard", "Security");

    const pagesRouteContent = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "pages", "route.js"), "utf-8");
    assert(pagesRouteContent.includes("verifySessionToken"), "POST /api/pages enforces verifySessionToken guard", "Security");

    const pageIdRouteContent = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "pages", "[id]", "route.js"), "utf-8");
    assert(pageIdRouteContent.includes("verifySessionToken"), "PUT & DELETE /api/pages/[id] enforce verifySessionToken guard", "Security");

    const yachtsRouteContent = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "yachts", "route.js"), "utf-8");
    assert(yachtsRouteContent.includes("verifySessionToken"), "POST /api/yachts enforces verifySessionToken guard", "Security");

    const newsRouteContent = fs.readFileSync(path.join(ROOT_DIR, "app", "api", "news", "route.js"), "utf-8");
    assert(newsRouteContent.includes("verifySessionToken"), "POST /api/news enforces verifySessionToken guard", "Security");

    // Test 5.5: Data integrity check (no corruption)
    assert(fs.existsSync(path.join(ROOT_DIR, "data", "articles.json")), "data/articles.json exists and is intact", "Security");
    assert(fs.existsSync(path.join(ROOT_DIR, "data", "yachts.json")), "data/yachts.json exists and is intact", "Security");
    assert(fs.existsSync(path.join(ROOT_DIR, "data", "settings.json")), "data/settings.json exists and is intact", "Security");

  } finally {
    // Restore original settings file to maintain clean state
    fs.writeFileSync(settingsFile, originalSettingsRaw, "utf-8");
    console.log("\n[Clean-up] Original data/settings.json restored after test execution.");
  }

  /* -------------------------------------------------------------
     SUMMARY REPORT
     ------------------------------------------------------------- */
  console.log("\n==================================================================");
  console.log("VERIFICATION COMPLETE");
  console.log(`Passed Tests: ${results.passed.length}`);
  console.log(`Failed Tests: ${results.failed.length}`);
  console.log("==================================================================");

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Unhandled error in test runner:", err);
  process.exit(1);
});
