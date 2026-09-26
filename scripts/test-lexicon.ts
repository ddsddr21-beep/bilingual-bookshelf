/**
 * Mihrab Comprehensive Lexicon Unit & Integration Tests
 * Validates authentic local FreeDict (69k), WordNet (147k), Wiktextract (145k),
 * and Arabic morphological analyzer against required test vocabulary.
 */

import { normalizeArabic, generateArabicCandidates, analyzeArabic } from "../src/lib/dictionaries/arabic-morphology";
import { lookupFreeDict, resolveArabicLemmaWithFreeDict } from "../src/lib/dictionaries/freedict-ar-en";
import { lookupWordNet } from "../src/lib/dictionaries/open-wordnet";
import { lookupWiktextract } from "../src/lib/dictionaries/wiktextract-en";
import { queryLocalEnglishDatabases, executePath2LocalMorphology } from "../src/lib/dictionary";

async function runTests() {
  console.log("================================================================");
  console.log("   RUNNING AUTHENTIC LEXICON TEST SUITE (ZERO MOCK DATA)");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Test Arabic Morphological Engine
  console.log("--- TEST SUITE 1: Arabic Morphological & Affix Peeling ---");
  const morphTests = [
    { input: "الإنجازات", expectedInCandidates: "انجاز" },
    { input: "ينجزون", expectedInCandidates: "انجز" },
    { input: "بالحياة", expectedInCandidates: "حياة" },
    { input: "حياتنا", expectedInCandidates: "حياة" },
    { input: "نهدر", expectedInCandidates: "هدر" },
    { input: "قصيرة", expectedInCandidates: "قصير" },
    { input: "الانضباط", expectedInCandidates: "انضباط" },
  ];

  for (const t of morphTests) {
    const candidates = generateArabicCandidates(t.input);
    const found = candidates.includes(t.expectedInCandidates);
    if (found) {
      console.log(`  ✓ [Morphology] '${t.input}' decomposed -> [${candidates.slice(0, 4).join(", ")}] (includes '${t.expectedInCandidates}')`);
      passed++;
    } else {
      console.error(`  ✗ [Morphology] '${t.input}' failed: expected '${t.expectedInCandidates}' in [${candidates.join(", ")}]`);
      failed++;
    }
  }

  // 2. Test Authentic FreeDict (69k) Arabic-English Resolution
  console.log("\n--- TEST SUITE 2: Authentic FreeDict Arabic-English Lookup ---");
  const arTests = [
    "حياتنا",
    "نهدر",
    "قصيرة",
    "الإنجازات",
    "الانضباط",
    "المعرفة",
    "الوقت",
    "البيئة",
  ];

  for (const arWord of arTests) {
    const { lemma, entry } = await resolveArabicLemmaWithFreeDict(arWord);
    if (entry && entry.translations.length > 0) {
      console.log(`  ✓ [FreeDict] '${arWord}' -> lemma '${lemma}' -> translations: [${entry.translations.slice(0, 4).join(", ")}]`);
      passed++;
    } else {
      console.error(`  ✗ [FreeDict] '${arWord}' -> no translation found!`);
      failed++;
    }
  }

  // 3. Test Authentic Princeton WordNet 3.1 (147k lemmas)
  console.log("\n--- TEST SUITE 3: Authentic Princeton WordNet 3.1 Queries ---");
  const enWordNetTests = [
    "productivity",
    "knowledge",
    "opportunity",
    "sustainable",
    "environment",
    "important",
    "achieve",
    "waste",
    "discipline",
    "life",
    "time",
    "short",
  ];

  for (const word of enWordNetTests) {
    const wn = await lookupWordNet(word);
    if (wn && wn.senses.length > 0) {
      const s1 = wn.senses[0]!;
      console.log(`  ✓ [WordNet] '${word}' (${wn.senses.length} senses) -> [${s1.pos}] "${s1.definition.slice(0, 60)}..."`);
      if (s1.synonyms.length > 0) {
        console.log(`      synonyms: [${s1.synonyms.slice(0, 3).join(", ")}]`);
      }
      if (s1.examples.length > 0) {
        console.log(`      example: "${s1.examples[0]}"`);
      }
      passed++;
    } else {
      console.error(`  ✗ [WordNet] '${word}' -> NOT FOUND in 147k lemmas!`);
      failed++;
    }
  }

  // 4. Test Authentic Wiktextract & IPA Database (145k words)
  console.log("\n--- TEST SUITE 4: Authentic Wiktextract & IPA Phonetics ---");
  const ipaTests = ["life", "waste", "productivity", "sustainable", "environment", "discipline"];
  for (const w of ipaTests) {
    const wx = await lookupWiktextract(w);
    if (wx && wx.phonetic) {
      console.log(`  ✓ [Wiktextract] '${w}' IPA: ${wx.phonetic}`);
      passed++;
    } else {
      console.error(`  ✗ [Wiktextract] '${w}' -> missing IPA!`);
      failed++;
    }
  }

  // 5. Test End-to-End Local Morphological Path (Offline)
  console.log("\n--- TEST SUITE 5: End-to-End Offline Lexical Reference Resolution ---");
  const e2eWords = [
    "الإنجازات",
    "حياتنا",
    "نهدر",
    "الانضباط",
    "productivity",
    "opportunity",
    "sustainable",
  ];

  for (const w of e2eWords) {
    const entry = await executePath2LocalMorphology(w);
    if (entry && entry.meanings.length > 0) {
      console.log(`  ✓ [E2E] '${w}' resolved -> target: '${entry.targetEnglishWord}' (${entry.meanings.length} meanings)`);
      passed++;
    } else {
      console.error(`  ✗ [E2E] '${w}' produced 0 meanings!`);
      failed++;
    }
  }

  console.log("\n================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
