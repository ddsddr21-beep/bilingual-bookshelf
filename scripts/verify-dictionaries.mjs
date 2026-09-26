#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "lib", "dictionaries", "data");
const freedictDir = path.join(dataDir, "freedict");

console.log("\n========================================================");
console.log("   MIHRAB LEXICON BUILD & DATA VERIFICATION (STAGE 1)");
console.log("========================================================");

if (!fs.existsSync(freedictDir)) {
  console.error("❌ ERROR: FreeDict directory missing at " + freedictDir);
  process.exit(1);
}

const files = fs.readdirSync(freedictDir);
let chunkFileCount = 0;
let totalEntriesFromContent = 0;
const emptyFiles = [];
const unreadableFiles = [];
const headwordSet = new Set();

for (const file of files) {
  // Skip manifests/caches in letter chunks tally
  if (!file.endsWith(".json") || file === "manifest.json" || file === "core.json") continue;

  chunkFileCount++;
  const filePath = path.join(freedictDir, file);

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim() || raw.trim() === "{}") {
      emptyFiles.push(file);
      continue;
    }
    const data = JSON.parse(raw);
    const keys = Object.keys(data);
    if (keys.length === 0) {
      emptyFiles.push(file);
    } else {
      totalEntriesFromContent += keys.length;
      keys.forEach((k) => headwordSet.add(k));
    }
  } catch (err) {
    unreadableFiles.push({ file, error: err?.message || String(err) });
  }
}

console.log(`✓ FreeDict letter chunks:   ${chunkFileCount} files`);
console.log(`✓ Actual entries in files:  ${totalEntriesFromContent.toLocaleString()} entries`);
console.log(`✓ Unique Arabic headwords:  ${headwordSet.size.toLocaleString()}`);
console.log(`✓ Empty files:              ${emptyFiles.length === 0 ? "None (0)" : emptyFiles.join(", ")}`);
console.log(`✓ Unreadable/corrupt files: ${unreadableFiles.length === 0 ? "None (0)" : JSON.stringify(unreadableFiles)}`);

// Also verify core.json exists and is valid
const corePath = path.join(freedictDir, "core.json");
if (fs.existsSync(corePath)) {
  const coreData = JSON.parse(fs.readFileSync(corePath, "utf-8"));
  console.log(`✓ Synchronous Core cache:   ${Object.keys(coreData).length.toLocaleString()} entries`);
} else {
  console.warn("⚠️ Warning: core.json missing, lookups will rely solely on async chunks.");
}

console.log("========================================================");

if (unreadableFiles.length > 0 || emptyFiles.length > 0 || totalEntriesFromContent < 50000) {
  console.error("❌ Verification failed: FreeDict data files are missing or incomplete!");
  process.exit(1);
}

console.log("✓ Stage 1 FreeDict data files verified from actual disk contents.\n");
