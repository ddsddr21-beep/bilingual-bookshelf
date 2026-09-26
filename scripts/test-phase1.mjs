#!/usr/bin/env node
/**
 * Test Phase 1: FreeDict Arabic-English + Farahidi Algorithmic Morphological Analyzer
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "lib", "dictionaries", "data", "freedict");

// Algorithmic morphology implementation in pure JS/TS
const PROCLITICS = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل", "س"];
const ENCLITICS = [
  "تما", "كما", "هما", "تين", "تان", "ين", "ون", "ات", "ان",
  "ها", "هم", "هن", "نا", "كم", "كن", "وا", "تم", "تن", "ني",
  "ت", "ه", "ك", "ي",
];
const VERBAL_PREFIXES = ["ي", "ت", "ن", "ا"];
const DERIV_PREFIXES = ["است", "ان", "م", "ت"];

function normalizeArabic(text) {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FF]/g, "")
    .trim();
}

function generateArabicCandidates(rawWord) {
  const norm = normalizeArabic(rawWord);
  if (!norm || norm.length < 2) return norm ? [norm] : [];

  const candidates = [];
  const seen = new Set();

  const addCandidate = (c) => {
    if (c && c.length >= 2 && !seen.has(c)) {
      seen.add(c);
      candidates.push(c);
    }
  };

  addCandidate(norm);

  let stemAfterProclitic = norm;
  for (const p of PROCLITICS) {
    if (norm.startsWith(p) && norm.length - p.length >= 2) {
      const s = norm.slice(p.length);
      addCandidate(s);
      stemAfterProclitic = s;
      break;
    }
  }

  const basePool = [norm, stemAfterProclitic];
  for (const base of basePool) {
    for (const enc of ENCLITICS) {
      if (base.endsWith(enc) && base.length - enc.length >= 2) {
        const stripped = base.slice(0, -enc.length);
        addCandidate(stripped);

        if (stripped.endsWith("ت") && stripped.length >= 2) {
          addCandidate(stripped.slice(0, -1) + "ة");
        }
        if (enc === "ات") {
          addCandidate(stripped + "ة");
        }
        for (const vp of VERBAL_PREFIXES) {
          if (stripped.startsWith(vp) && stripped.length - vp.length >= 2) {
            const vs = stripped.slice(vp.length);
            addCandidate(vs);
            addCandidate("ا" + vs);
          }
        }
      }
    }
  }

  for (const vp of VERBAL_PREFIXES) {
    if (stemAfterProclitic.startsWith(vp) && stemAfterProclitic.length - vp.length >= 2) {
      const vs = stemAfterProclitic.slice(vp.length);
      addCandidate(vs);
      addCandidate("ا" + vs);
    }
  }

  for (const dp of DERIV_PREFIXES) {
    if (stemAfterProclitic.startsWith(dp) && stemAfterProclitic.length - dp.length >= 2) {
      const ds = stemAfterProclitic.slice(dp.length);
      addCandidate(ds);
    }
  }

  if (norm.endsWith("ة") && norm.length >= 3) addCandidate(norm.slice(0, -1));
  if (stemAfterProclitic.endsWith("ة") && stemAfterProclitic.length >= 3) addCandidate(stemAfterProclitic.slice(0, -1));

  return candidates;
}

const chunkCache = new Map();
function loadChunk(char) {
  const hex = char.charCodeAt(0).toString(16).padStart(4, "0");
  if (chunkCache.has(hex)) return chunkCache.get(hex);
  const chunkPath = path.join(dataDir, `${hex}.json`);
  if (!fs.existsSync(chunkPath)) return null;
  const data = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
  chunkCache.set(hex, data);
  return data;
}

function lookupFreeDict(word) {
  const norm = normalizeArabic(word);
  if (!norm) return null;
  const chunk = loadChunk(norm[0]);
  if (chunk && chunk[norm]) {
    return { arLemma: norm, translations: chunk[norm] };
  }
  return null;
}

function resolveArabic(word) {
  const candidates = generateArabicCandidates(word);
  for (const cand of candidates) {
    const entry = lookupFreeDict(cand);
    if (entry && entry.translations.length > 0) {
      return { lemma: cand, entry };
    }
  }
  return { lemma: candidates[1] || candidates[0] || normalizeArabic(word), entry: null };
}

async function main() {
  console.log("\n========================================================");
  console.log("   PHASE 1: FREEDICT ARABIC-ENGLISH VERIFICATION TEST");
  console.log("========================================================\n");

  const testCases = [
    // 1. Core morphological test cases requested by user
    "حياتنا",
    "الإنجازات",
    "نهدر",
    "قصيرة",
    "بالانضباط",

    // 2. Real-world unseen words across domains
    "زراعية",
    "المكتبات",
    "يعملون",
    "صداقتهم",
    "الفلكية",
    "المواطنون",
    "أرواحهم",
    "تجاربنا",
    "فلسفة",
    "اقتصادية",
    "الشمسية"
  ];

  let passed = 0;

  for (const word of testCases) {
    const resolved = resolveArabic(word);
    const hasTrans = resolved.entry && resolved.entry.translations.length > 0;
    if (hasTrans) passed++;
    const status = hasTrans ? "✓ PASS" : "✗ FAIL";
    console.log(
      `${status} | Word: ${word.padEnd(12)} -> Resolved Lemma: ${resolved.lemma.padEnd(10)} | Translations: ${JSON.stringify(resolved.entry?.translations || [])}`
    );
  }

  console.log(`\nResults: ${passed}/${testCases.length} words verified with authentic FreeDict translations.`);
  console.log("========================================================\n");
}

main();
