/**
 * Arabic Morphological Analyzer & Lemmatizer
 * Pure algorithmic Arabic morphological decomposition (Light10 + proclitic/enclitic peeling +
 * morphophonemic reconstruction).
 * Validates candidate lemmas against authentic dictionary headwords without hardcoded word overrides.
 */

// Proclitics (prepositions, conjunctions, future marker, definite article)
const PROCLITICS = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل", "س"];

// Enclitics (pronominal, dual, and plural suffixes)
const ENCLITICS = [
  "تما",
  "كما",
  "هما",
  "تين",
  "تان",
  "ين",
  "ون",
  "ات",
  "ان",
  "ها",
  "هم",
  "هن",
  "نا",
  "كم",
  "كن",
  "وا",
  "تم",
  "تن",
  "ني",
  "ت",
  "ه",
  "ك",
  "ي",
];

// Verbal present prefixes
const VERBAL_PREFIXES = ["ي", "ت", "ن", "ا"];

// Derivational prefixes
const DERIV_PREFIXES = ["است", "ان", "م", "ت"];

/**
 * Normalizes Arabic letters: strips tashkeel, tatweel, and harmonizes alef variants.
 * CRITICAL: Preserves teh marbuta ('ة') as 'ة' (does not mutate to 'ه').
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // remove tashkeel & tatweel
    .replace(/[إأآٱ]/g, "ا") // harmonize alef forms
    .replace(/ى/g, "ي") // alef maksura to yaa
    .replace(/[^\u0600-\u06FF]/g, "") // keep only Arabic script
    .trim();
}

/**
 * Systematically decomposes an Arabic word into morphological candidate stems and lemmas.
 * Handles morphophonemic alternations (e.g., 'حياتنا' -> 'حياة', 'الإنجازات' -> 'انجاز').
 */
export function generateArabicCandidates(rawWord: string): string[] {
  const norm = normalizeArabic(rawWord);
  if (!norm || norm.length < 2) return norm ? [norm] : [];

  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (c: string) => {
    if (c && c.length >= 2 && !seen.has(c)) {
      seen.add(c);
      candidates.push(c);
    }
  };

  // 1. Direct normalized word
  addCandidate(norm);

  // 2. Strip proclitics (e.g. 'ال', 'بال', 'وال', etc.)
  let stemAfterProclitic = norm;
  for (const p of PROCLITICS) {
    if (norm.startsWith(p) && norm.length - p.length >= 2) {
      const s = norm.slice(p.length);
      addCandidate(s);
      stemAfterProclitic = s;
      break;
    }
  }

  // 3. Strip enclitics & perform morphophonemic reconstruction
  const basePool = [norm, stemAfterProclitic];
  for (const base of basePool) {
    for (const enc of ENCLITICS) {
      if (base.endsWith(enc) && base.length - enc.length >= 2) {
        const stripped = base.slice(0, -enc.length);
        addCandidate(stripped);

        // Morphophonemic rule: 'ت' before possessive pronouns is reconstructed to 'ة'
        // (e.g. حيات + نا -> حياة, فكرت + هم -> فكرة, رغبت + كم -> رغبة)
        if (stripped.endsWith("ت") && stripped.length >= 2) {
          const withTeh = stripped.slice(0, -1) + "ة";
          addCandidate(withTeh);
        }

        // Feminine plural 'ات' stripped: try both bare masculine stem and feminine with 'ة'
        if (enc === "ات") {
          addCandidate(stripped + "ة");
        }

        // Further strip verbal conjugation prefixes from the enclitic-stripped stem
        for (const vp of VERBAL_PREFIXES) {
          if (stripped.startsWith(vp) && stripped.length - vp.length >= 2) {
            const vs = stripped.slice(vp.length);
            addCandidate(vs);
            addCandidate("ا" + vs); // Form IV / verbal noun: ينجز -> انجز
          }
        }
      }
    }
  }

  // 4. Strip verbal prefixes from base stems (e.g. 'نهدر' -> 'هدر', 'ينجز' -> 'انجز')
  for (const vp of VERBAL_PREFIXES) {
    if (stemAfterProclitic.startsWith(vp) && stemAfterProclitic.length - vp.length >= 2) {
      const vs = stemAfterProclitic.slice(vp.length);
      addCandidate(vs);
      addCandidate("ا" + vs);
    }
  }

  // 5. Strip derivational prefixes (e.g. 'الانضباط' -> 'انضباط' -> 'ضبط')
  for (const dp of DERIV_PREFIXES) {
    if (stemAfterProclitic.startsWith(dp) && stemAfterProclitic.length - dp.length >= 2) {
      const ds = stemAfterProclitic.slice(dp.length);
      addCandidate(ds);
    }
  }

  // 6. Terminal teh marbuta 'ة' toggle to check bare masculine lemma (e.g. 'قصيرة' -> 'قصير')
  if (norm.endsWith("ة") && norm.length >= 3) {
    addCandidate(norm.slice(0, -1));
  }
  if (stemAfterProclitic.endsWith("ة") && stemAfterProclitic.length >= 3) {
    addCandidate(stemAfterProclitic.slice(0, -1));
  }

  return candidates;
}

export type MorphologicalAnalysis = {
  raw: string;
  normalized: string;
  lemma: string;
  candidates: string[];
};

/**
 * Analyzes an Arabic word and resolves the primary lemma.
 * If a dictionary validator function is provided, selects the highest-ranking verified lemma in the dictionary.
 */
export function analyzeArabic(
  rawWord: string,
  isValidInDictionary?: (word: string) => boolean,
): MorphologicalAnalysis {
  const normalized = normalizeArabic(rawWord);
  const candidates = generateArabicCandidates(rawWord);

  if (!isValidInDictionary) {
    return {
      raw: rawWord,
      normalized,
      lemma: candidates[1] || candidates[0] || normalized,
      candidates,
    };
  }

  // Test candidates against real dictionary
  for (const cand of candidates) {
    if (isValidInDictionary(cand)) {
      return {
        raw: rawWord,
        normalized,
        lemma: cand,
        candidates,
      };
    }
  }

  // Fallback to top morphological candidate if not in dictionary
  return {
    raw: rawWord,
    normalized,
    lemma: candidates[1] || candidates[0] || normalized,
    candidates,
  };
}
