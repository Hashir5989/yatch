import fs from "fs";
import path from "path";

function reorderDeckPlans(deckPlans) {
  if (!Array.isArray(deckPlans) || deckPlans.length < 2) return deckPlans;
  const orderRank = { "main-deck": 1, "main": 1, "lower-deck": 2, "lower": 2, "flybridge": 3, "flybridge-deck": 3 };
  return [...deckPlans].sort((a, b) => (orderRank[a.id] || 99) - (orderRank[b.id] || 99));
}

// 1. data/yachts.json
const yachtsJsonPath = path.resolve("data/yachts.json");
const yachts = JSON.parse(fs.readFileSync(yachtsJsonPath, "utf8"));
for (const yacht of yachts) {
  if (yacht.deckPlans) {
    yacht.deckPlans = reorderDeckPlans(yacht.deckPlans);
    console.log(`yachts.json [${yacht.slug}]:`, yacht.deckPlans.map(d => `${d.id} (${d.name})`));
  }
}
fs.writeFileSync(yachtsJsonPath, JSON.stringify(yachts, null, 2) + "\n", "utf8");
console.log("Updated data/yachts.json successfully.");

// 2. lib/data/defaultYachts.js
const defaultYachtsPath = path.resolve("lib/data/defaultYachts.js");
const defaultYachtsHeader = `/**
 * ASMARATY Official Fleet Data
 * Automatically synchronized authoritative baseline records.
 */

export const DEFAULT_YACHTS = `;
fs.writeFileSync(defaultYachtsPath, defaultYachtsHeader + JSON.stringify(yachts, null, 2) + ";\n", "utf8");
console.log("Updated lib/data/defaultYachts.js successfully.");
