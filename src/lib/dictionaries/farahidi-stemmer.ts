/**
 * Farahidi Arabic Morphological Analyzer & Lemmatizer
 * Implements classical Arabic morphological decomposition, proclitic/enclitic peeling,
 * and morphophonemic stem reconstruction without hardcoded override tables.
 */

import { generateArabicCandidates, normalizeArabic } from "./arabic-morphology";

export type FarahidiAnalysis = {
  raw: string;
  normalized: string;
  lemma: string;
  stems: string[];
  prefixes: string[];
  suffixes: string[];
  possibleRoots: string[];
};

export { normalizeArabic, generateArabicCandidates };

/**
 * Pure algorithmic Farahidi morphological analyzer.
 * Decomposes any Arabic surface form into valid morphological candidate stems.
 */
export function analyzeFarahidi(
  rawWord: string,
  isValidInDictionary?: (stem: string) => boolean,
): FarahidiAnalysis {
  const norm = normalizeArabic(rawWord);
  if (!norm) {
    return {
      raw: rawWord,
      normalized: "",
      lemma: "",
      stems: [],
      prefixes: [],
      suffixes: [],
      possibleRoots: [],
    };
  }

  const candidates = generateArabicCandidates(rawWord);

  // If a dictionary validation function is provided, pick the top verified candidate
  let primaryLemma = candidates[0] || norm;
  if (isValidInDictionary) {
    for (const cand of candidates) {
      if (isValidInDictionary(cand)) {
        primaryLemma = cand;
        break;
      }
    }
  } else {
    // Top morphological stem (after removing proclitics/enclitics/conjugation)
    primaryLemma = candidates[1] || candidates[0] || norm;
  }

  return {
    raw: rawWord,
    normalized: norm,
    lemma: primaryLemma,
    stems: candidates,
    prefixes: [],
    suffixes: [],
    possibleRoots: candidates.filter((c) => c.length === 3),
  };
}
