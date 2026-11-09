import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log("=========================================");
console.log("  HOME COLLECTION & CATEGORY VERIFICATION");
console.log("=========================================");

// 1. Check data/yachts.json
const yachtsJson = JSON.parse(fs.readFileSync('./data/yachts.json', 'utf8'));
const g100 = yachtsJson.find(y => y.slug === 'g100');
const g77 = yachtsJson.find(y => y.slug === 'g77');
const g66 = yachtsJson.find(y => y.slug === 'g66');
const g50 = yachtsJson.find(y => y.slug === 'g50');

assert.equal(g100.category, 'Superyacht', "G100 category should be Superyacht");
assert.equal(g77.category, 'Motor Yacht', "G77 category should be Motor Yacht");
assert.equal(g66.category, 'Motor Yacht', "G66 category should be Motor Yacht");
assert.equal(g50.category, 'Motor Yacht', "G50 category should be Motor Yacht");

assert.equal(g77.name, 'ASMARATY G77 Motor Yacht', "G77 name should be ASMARATY G77 Motor Yacht");
assert.equal(g66.name, 'ASMARATY G66 Motor Yacht', "G66 name should be ASMARATY G66 Motor Yacht");
assert.equal(g50.name, 'ASMARATY G50 Motor Yacht', "G50 name should be ASMARATY G50 Motor Yacht");
console.log("PASS: data/yachts.json categories and names updated for G77, G66, G50");

// 2. Check components/public/sections/YachtCollectionSection.js
const collectionCode = fs.readFileSync('./components/public/sections/YachtCollectionSection.js', 'utf8');

assert.ok(collectionCode.includes('MOTOR YACHT'), "YachtCollectionSection must reference MOTOR YACHT");
assert.ok(collectionCode.includes('model.category.toUpperCase().replace(/^ASMARATY\\s*•?\\s*/i, "")'), "YachtCollectionSection must strip ASMARATY prefix");
assert.ok(collectionCode.includes('font-logo'), "Yacht heading must use official logo font-logo typography");
assert.ok(!collectionCode.includes('`ASMARATY • ${model.category}`'), "Old redundant ASMARATY • prefix must be removed");
console.log("PASS: components/public/sections/YachtCollectionSection.js typography & eyebrow verified");

// 3. Check postgres.js
const postgresCode = fs.readFileSync('./lib/server/postgres.js', 'utf8');
assert.ok(postgresCode.includes("UPDATE yachts SET category = 'Motor Yacht' WHERE slug IN ('g77', 'g66', 'g50');"), "PostgreSQL auto-migration must update category");
assert.ok(postgresCode.includes("UPDATE yachts SET name = 'ASMARATY G77 Motor Yacht' WHERE slug = 'g77';"), "PostgreSQL auto-migration must update G77 name");
console.log("PASS: lib/server/postgres.js database sync verified");

// 4. Check admin yachts page
const adminCode = fs.readFileSync('./app/admin/yachts/page.js', 'utf8');
assert.ok(adminCode.includes('"motor-yacht": "Motor Yacht"'), "Admin yachts editor must label motor-yacht as Motor Yacht");
console.log("PASS: app/admin/yachts/page.js admin synchronization verified");

console.log("=========================================");
console.log("  ALL TESTS PASSED SUCCESSFULLY!");
console.log("=========================================");

