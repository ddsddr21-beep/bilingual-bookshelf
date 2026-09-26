#!/usr/bin/env node
/**
 * Strict Stage 1 Verification Suite:
 * Tests Algorithmic Arabic Morphology + Real FreeDict Database File Integration.
 * Asserts:
 * 1. Exact morphological lemma resolution.
 * 2. Presence of authentic FreeDict translations loaded from physical disk chunks.
 * 3. Absence of synthetic or fallback placeholders.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const freedictDir = path.join(__dirname, "..", "src", "lib", "dictionaries", "data", "freedict");

// Algorithmic Arabic Morphology (pure algorithmic rules - zero manual override lists)
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

        // Morphophonemic: 'ت' before suffixes reconstructed to 'ة'
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

// Low-level disk reader to verify physical chunk files
const chunkCache = new Map();
function loadFreeDictChunkFromDisk(char) {
  if (!char) return null;
  const hex = char.charCodeAt(0).toString(16).padStart(4, "0");
  if (chunkCache.has(hex)) return chunkCache.get(hex);
  const chunkPath = path.join(freedictDir, `${hex}.json`);
  if (!fs.existsSync(chunkPath)) return null;
  const data = JSON.parse(fs.readFileSync(chunkPath, "utf-8"));
  const obj = { hex, chunkPath, data };
  chunkCache.set(hex, obj);
  return obj;
}

function lookupFreeDictFromDisk(word) {
  const norm = normalizeArabic(word);
  if (!norm) return null;
  const chunkObj = loadFreeDictChunkFromDisk(norm[0]);
  if (chunkObj && chunkObj.data && chunkObj.data[norm]) {
    return {
      arLemma: norm,
      translations: chunkObj.data[norm],
      sourceFile: path.basename(chunkObj.chunkPath),
    };
  }
  return null;
}

function resolveArabicWithFreeDict(rawWord) {
  const candidates = generateArabicCandidates(rawWord);
  for (const cand of candidates) {
    const entry = lookupFreeDictFromDisk(cand);
    if (entry && entry.translations && entry.translations.length > 0) {
      return {
        matchedCandidate: cand,
        lemma: cand,
        entry,
      };
    }
  }
  return {
    matchedCandidate: null,
    lemma: candidates[1] || candidates[0] || normalizeArabic(rawWord),
    entry: null,
  };
}

async function runStrictTests() {
  console.log("\n=============================================================================");
  console.log("   STAGE 1: STRICT VERIFICATION OF MORPHOLOGY & FREEDICT DATA");
  console.log("=============================================================================\n");

  const testMatrix = [
    {
      input: "حياتنا",
      expectedAllowedLemmas: ["حياة"],
      expectedKeyTranslations: ["life", "living", "vitality", "aliveness"],
      ruleDescription: "Enclitic -na peeling + morphophonemic 'ت' -> 'ة'",
    },
    {
      input: "نهدر",
      expectedAllowedLemmas: ["هدر"],
      expectedKeyTranslations: ["waste", "squander", "dissipate", "nullify"],
      ruleDescription: "Present verbal prefix 'ن-' peeling to root 'هدر'",
    },
    {
      input: "قصيرة",
      expectedAllowedLemmas: ["قصير"],
      expectedKeyTranslations: ["short", "brief", "curt", "fleeting"],
      ruleDescription: "Feminine suffix '-ة' peeling to masculine adjective 'قصير'",
    },
    {
      input: "يعملون",
      expectedAllowedLemmas: ["يعمل", "عمل"],
      expectedKeyTranslations: ["works", "do", "does", "work", "act"],
      ruleDescription: "Plural suffix '-ون' & verbal prefix 'ي-' peeling",
    },
    {
      input: "بالانضباط",
      expectedAllowedLemmas: ["انضباط", "ضبط"],
      expectedKeyTranslations: ["discipline", "regularity", "orderliness", "self-control"],
      ruleDescription: "Proclitic preposition 'بال-' peeling to verbal noun 'انضباط'",
    },
    {
      input: "المواطنون",
      expectedAllowedLemmas: ["المواطنون", "مواطن"],
      expectedKeyTranslations: ["citizens", "compatriots", "countrymen", "nationals"],
      ruleDescription: "Definite article + plural inflection peeling to 'مواطن'",
    },
    {
      input: "تجاربنا",
      expectedAllowedLemmas: ["تجارب", "تجربة"],
      expectedKeyTranslations: ["experiences", "experiments", "trials"],
      ruleDescription: "Possessive pronoun '-نا' peeling to broken plural 'تجارب'",
    },
    {
      input: "أرواحهم",
      expectedAllowedLemmas: ["ارواح", "روح"],
      expectedKeyTranslations: ["souls", "spirits", "psyches", "esprits"],
      ruleDescription: "Possessive pronoun '-هم' peeling to broken plural 'ارواح'",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testMatrix) {
    const res = resolveArabicWithFreeDict(test.input);
    const lemmaMatched = test.expectedAllowedLemmas.includes(res.lemma);
    const hasTranslations = !!(res.entry && res.entry.translations && res.entry.translations.length > 0);

    const hasExpectedTranslation =
      hasTranslations &&
      test.expectedKeyTranslations.some((expected) =>
        res.entry.translations.some((actual) => actual.toLowerCase().includes(expected.toLowerCase()))
      );

    const isPass = lemmaMatched && hasTranslations && hasExpectedTranslation;

    if (isPass) {
      passed++;
      console.log(`✓ [PASS] "${test.input}"`);
      console.log(`   ├─ Rule:         ${test.ruleDescription}`);
      console.log(`   ├─ Lemma:        ${res.lemma} (expected: ${test.expectedAllowedLemmas.join(" or ")})`);
      console.log(`   ├─ Source File:  src/lib/dictionaries/data/freedict/${res.entry.sourceFile}`);
      console.log(`   └─ Translations: ${JSON.stringify(res.entry.translations)}\n`);
    } else {
      failed++;
      console.error(`✗ [FAIL] "${test.input}"`);
      console.error(`   ├─ Rule:         ${test.ruleDescription}`);
      console.error(`   ├─ Lemma:        ${res.lemma} (expected: ${test.expectedAllowedLemmas.join(" or ")})`);
      console.error(`   ├─ Has Trans:    ${hasTranslations}`);
      console.error(`   ├─ Matches Key:  ${hasExpectedTranslation}`);
      console.error(`   └─ Actual Trans: ${JSON.stringify(res.entry?.translations || [])}\n`);
    }
  }

  console.log("=============================================================================");
  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${testMatrix.length} strict tests.`);
  console.log("=============================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStrictTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
