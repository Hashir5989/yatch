import fs from 'fs';
import path from 'path';

console.log("=== Testing G100 Home Page Image Update ===");

// 1. Verify image file exists and is valid
const targetImgPath = path.resolve('public/images/yachts/g100/g100-home-showcase.jpg');
if (!fs.existsSync(targetImgPath)) {
  console.error("FAIL: Target image does not exist at:", targetImgPath);
  process.exit(1);
}
const imgStat = fs.statSync(targetImgPath);
if (imgStat.size < 50000) {
  console.error("FAIL: Target image size is too small:", imgStat.size);
  process.exit(1);
}
console.log("✓ Target image exists at public/images/yachts/g100/g100-home-showcase.jpg (size:", imgStat.size, "bytes)");

// 2. Check YachtCollectionSection.js implementation
const collectionFile = fs.readFileSync('components/public/sections/YachtCollectionSection.js', 'utf8');
if (!collectionFile.includes('g100-home-showcase.jpg')) {
  console.error("FAIL: YachtCollectionSection.js does not reference g100-home-showcase.jpg");
  process.exit(1);
}
if (!collectionFile.includes('src={modelImage}')) {
  console.error("FAIL: YachtCollectionSection.js does not render modelImage in img tag");
  process.exit(1);
}
console.log("✓ YachtCollectionSection.js contains modelImage resolution with g100-home-showcase.jpg");

// 3. Check data/pages.json
const pages = JSON.parse(fs.readFileSync('data/pages.json', 'utf8'));
const home = pages.find(p => p.id === 'page-home');
const fourModels = home.sections.find(s => s.id === 'home-four-models');
if (fourModels?.modelImageOverrides?.g100 !== '/images/yachts/g100/g100-home-showcase.jpg') {
  console.error("FAIL: data/pages.json home-four-models missing modelImageOverrides.g100");
  process.exit(1);
}
console.log("✓ data/pages.json home-four-models has modelImageOverrides.g100");

// 4. Check lib/data/defaultPages.js
const defaultPages = fs.readFileSync('lib/data/defaultPages.js', 'utf8');
if (!defaultPages.includes("modelImageOverrides:") || !defaultPages.includes("g100-home-showcase.jpg")) {
  console.error("FAIL: lib/data/defaultPages.js missing modelImageOverrides for g100");
  process.exit(1);
}
console.log("✓ lib/data/defaultPages.js has modelImageOverrides for g100");

// 5. Check data/yachts.json
const yachts = JSON.parse(fs.readFileSync('data/yachts.json', 'utf8'));
const g100 = yachts.find(y => y.slug === 'g100');
if (g100?.homeImage !== '/images/yachts/g100/g100-home-showcase.jpg') {
  console.error("FAIL: data/yachts.json g100 missing homeImage");
  process.exit(1);
}
console.log("✓ data/yachts.json g100 has homeImage property");

// 6. Check other models are unchanged
const g77 = yachts.find(y => y.slug === 'g77');
const g66 = yachts.find(y => y.slug === 'g66');
const g50 = yachts.find(y => y.slug === 'g50');
if (!g77.mainImage.includes('g77') || !g66.mainImage.includes('g66') || !g50.mainImage.includes('g50')) {
  console.error("FAIL: Other yacht model images were unintentionally modified");
  process.exit(1);
}
console.log("✓ Other yacht models (G77, G66, G50) remain untouched");

console.log("\n=======================================================");
console.log("  ALL G100 HOME IMAGE VERIFICATION CHECKS PASSED!");
console.log("=======================================================\n");

