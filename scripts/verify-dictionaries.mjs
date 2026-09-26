#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "lib", "dictionaries", "data");

const fdManifestPath = path.join(dataDir, "freedict", "manifest.json");
const wnManifestPath = path.join(dataDir, "wordnet", "manifest.json");
const wxManifestPath = path.join(dataDir, "wiktextract", "manifest.json");

if (!fs.existsSync(fdManifestPath) || !fs.existsSync(wnManifestPath) || !fs.existsSync(wxManifestPath)) {
  console.error("❌ ERROR: Dictionary manifests missing! Run python3 scripts/build-dictionaries.py first.");
  process.exit(1);
}

const fd = JSON.parse(fs.readFileSync(fdManifestPath, "utf-8"));
const wn = JSON.parse(fs.readFileSync(wnManifestPath, "utf-8"));
const wx = JSON.parse(fs.readFileSync(wxManifestPath, "utf-8"));

console.log("\n========================================================");
console.log("   MIHRAB AUTHENTIC LEXICON BUILD VERIFICATION");
console.log("========================================================");
console.log(`✓ FreeDict Arabic-English: ${fd.totalHeadwords.toLocaleString()} authentic headwords`);
console.log(`✓ Princeton WordNet 3.1:   ${wn.totalLemmas.toLocaleString()} lemmas (${wn.totalSynsets.toLocaleString()} synsets)`);
console.log(`✓ Wiktextract & IPA:       ${wx.totalWords.toLocaleString()} words (${wx.totalIpaPronunciations.toLocaleString()} IPA pronunciations)`);
console.log("========================================================\n");

if (fd.totalHeadwords < 50000) {
  console.error(`❌ FreeDict count too low: ${fd.totalHeadwords} < 50,000!`);
  process.exit(1);
}
if (wn.totalLemmas < 100000) {
  console.error(`❌ WordNet count too low: ${wn.totalLemmas} < 100,000!`);
  process.exit(1);
}
if (wx.totalWords < 50000) {
  console.error(`❌ Wiktextract count too low: ${wx.totalWords} < 50,000!`);
  process.exit(1);
}

console.log("✓ All linguistic databases exceed production thresholds. Build ready.\n");
