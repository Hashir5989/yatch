import fs from "fs";
import { DEFAULT_PAGES } from "../lib/data/defaultPages.js";
import { formatButtonHref, normalizeButtonConfig } from "../lib/data/buttonSchema.js";

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passed++;
  } else {
    console.error(`FAIL: ${testName}`);
    failed++;
  }
}

console.log("=========================================");
console.log("  PHASE 3: ABOUT US CMS VERIFICATION");
console.log("=========================================\n");

// 1. Verify defaultPages.js About Page
const defaultAbout = DEFAULT_PAGES.find((p) => p.id === "page-about" || p.slug === "/about");
assert(!!defaultAbout, "Default pages has page-about");
assert(defaultAbout.sections.length === 5, `About page has exactly 5 sections (found ${defaultAbout?.sections?.length})`);

const expectedSectionIds = ["about-hero", "about-story", "about-stats", "about-values", "about-cta"];
const actualSectionIds = defaultAbout.sections.map((s) => s.id);
assert(
  JSON.stringify(actualSectionIds) === JSON.stringify(expectedSectionIds),
  `About page section IDs match exact user structure: ${actualSectionIds.join(", ")}`
);

// 2. Verify data/pages.json matches
const pagesJson = JSON.parse(fs.readFileSync("./data/pages.json", "utf8"));
const jsonAbout = pagesJson.find((p) => p.id === "page-about");
assert(!!jsonAbout, "data/pages.json contains page-about");
assert(jsonAbout.sections.length === 5, `data/pages.json page-about has exactly 5 sections (found ${jsonAbout?.sections?.length})`);

// 3. Verify Hero Banner content
const hero = jsonAbout.sections.find((s) => s.id === "about-hero");
assert(hero.eyebrow === "ABOUT US", "Hero eyebrow is 'ABOUT US'");
assert(hero.heading.includes("Excellence on the Water"), "Hero heading is 'A Legacy of Excellence on the Water'");
assert(hero.imageUrl.includes("g100-burj-al-arab.jpg"), "Hero image is '/images/g100-burj-al-arab.jpg'");

// 4. Verify Our Story content & Button
const story = jsonAbout.sections.find((s) => s.id === "about-story");
assert(story.eyebrow === "OUR STORY", "Story eyebrow is 'OUR STORY'");
assert(story.heading.includes("Crafting Exceptional"), "Story heading is 'Crafting Exceptional Yachting Experiences'");
assert(story.badgeText === "UAE Naval Heritage • Since 1979", "Story has badge 'UAE Naval Heritage • Since 1979'");
assert(story.primaryButton.label === "Discover Our Journey", "Story button label is 'Discover Our Journey'");
assert(story.primaryButton.url === "/contact", "Story button URL is '/contact'");

// 5. Verify Metrics Bar content
const stats = jsonAbout.sections.find((s) => s.id === "about-stats");
assert(stats.items.length === 3, "Metrics bar has 3 items");
assert(stats.items[0].number === "1979" && stats.items[0].label === "Heritage", "First metric is 1979 Heritage");
assert(stats.items[1].number === "UAE" && stats.items[1].label === "Home Waters", "Second metric is UAE Home Waters");
assert(stats.items[2].number === "Excellence" && stats.items[2].label === "Our Standard", "Third metric is Excellence Our Standard");

// 6. Verify Values Pillars content
const values = jsonAbout.sections.find((s) => s.id === "about-values");
assert(values.pillars.length === 4, "Values section has 4 pillars");
assert(values.pillars[0].title === "Craftsmanship", "Pillar 1 is Craftsmanship");
assert(values.pillars[1].title === "Trust & Integrity", "Pillar 2 is Trust & Integrity");
assert(values.pillars[2].title === "Innovation", "Pillar 3 is Innovation");
assert(values.pillars[3].title === "Personalised Experiences", "Pillar 4 is Personalised Experiences");

// 7. Verify CTA content & Button
const cta = jsonAbout.sections.find((s) => s.id === "about-cta");
assert(cta.heading === "Your Journey Begins Here", "CTA heading is 'Your Journey Begins Here'");
assert(cta.imageUrl.includes("a77-journey-bg.jpg"), "CTA image is '/images/a77-journey-bg.jpg'");
assert(cta.primaryButton.label === "Explore Our Collection", "CTA button label is 'Explore Our Collection'");
assert(cta.primaryButton.url === "/yachts", "CTA button URL is '/yachts'");

// 8. Verify Button Schema & Link Formatter for About buttons
const testHref1 = formatButtonHref(cta.primaryButton.url, cta.primaryButton.type);
assert(testHref1 === "/yachts", "formatButtonHref('/yachts', 'internal') produces '/yachts'");

const testHref2 = formatButtonHref("+971 56 526 8126", "phone");
assert(testHref2 === "tel:+971565268126", "formatButtonHref phone formatted correctly");

const normalizedBtn = normalizeButtonConfig(story.primaryButton);
assert(normalizedBtn.visible === true, "Normalized button is visible");
assert(normalizedBtn.target === "_self", "Normalized button target is _self");

// 9. Verify No Hardcoded Timeline or Leadership in About
assert(!jsonAbout.sections.some((s) => s.type === "timeline"), "No unwanted timeline section in page-about");
assert(!jsonAbout.sections.some((s) => s.type === "leadership_team"), "No unwanted leadership section in page-about");

console.log("\n=========================================");
console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=========================================");

if (failed > 0) {
  process.exit(1);
}

