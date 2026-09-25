/**
 * Morphological Analyzer, Lemmatizer & Stemmer
 * Combines npm lemmatizer with domain-specific irregular maps for 0ms offline lookup.
 */

// @ts-expect-error lemmatizer doesn't provide types
import Lemmatizer from "lemmatizer";

let lemmatizerInstance: { only_lemmas?: (w: string) => string[] } | null = null;
try {
  if (typeof Lemmatizer === "function") {
    lemmatizerInstance = new Lemmatizer();
  }
} catch {
  lemmatizerInstance = null;
}

// Common English irregular verb & noun mappings
const IRREGULAR_EN_MAP: Record<string, string> = {
  // Verbs
  was: "be",
  were: "be",
  been: "be",
  being: "be",
  is: "be",
  am: "be",
  are: "be",
  has: "have",
  had: "have",
  having: "have",
  does: "do",
  did: "do",
  done: "do",
  doing: "do",
  goes: "go",
  went: "go",
  gone: "go",
  going: "go",
  given: "give",
  gave: "give",
  gives: "give",
  giving: "give",
  wasted: "waste",
  wasting: "waste",
  wastes: "waste",
  wasteful: "waste",
  made: "make",
  making: "make",
  makes: "make",
  took: "take",
  taken: "take",
  taking: "take",
  takes: "take",
  seen: "see",
  saw: "see",
  seeing: "see",
  sees: "see",
  came: "come",
  coming: "come",
  comes: "come",
  knew: "know",
  known: "know",
  knowing: "know",
  knows: "know",
  thought: "think",
  thinking: "think",
  thinks: "think",
  felt: "feel",
  feeling: "feel",
  feels: "feel",
  found: "find",
  finding: "find",
  finds: "find",
  read: "read",
  reading: "read",
  reads: "read",
  written: "write",
  wrote: "write",
  writing: "write",
  writes: "write",
  spoken: "speak",
  spoke: "speak",
  speaking: "speak",
  speaks: "speak",
  supplied: "supply",
  supplying: "supply",
  supplies: "supply",
  achieved: "achieve",
  achieving: "achieve",
  achieves: "achieve",
  achievements: "achievement",
  shortness: "short",
  shorter: "short",
  shortest: "short",
  longer: "long",
  longest: "long",
  lives: "live",
  lived: "live",
  living: "live",
  better: "good",
  best: "good",
  worse: "bad",
  worst: "bad",
  greater: "great",
  greatest: "great",
  generously: "generous",
  generosity: "generous",
};

/** Normalizes English word and extracts lemmas via npm lemmatizer + rule engine */
export function lemmatizeEnglish(rawWord: string): string[] {
  const clean = rawWord
    .toLowerCase()
    .replace(/[^\w'-]/g, "")
    .trim();

  if (!clean) return [];

  const candidates = new Set<string>();
  candidates.add(clean);

  // 1. Run npm lemmatizer
  if (lemmatizerInstance && typeof lemmatizerInstance.only_lemmas === "function") {
    try {
      const lemmas = lemmatizerInstance.only_lemmas(clean);
      if (Array.isArray(lemmas)) {
        lemmas.forEach((lem) => {
          if (lem && typeof lem === "string") candidates.add(lem.toLowerCase());
        });
      }
    } catch {
      // ignore
    }
  }

  // 2. Check irregular map
  if (IRREGULAR_EN_MAP[clean]) {
    candidates.add(IRREGULAR_EN_MAP[clean]!);
  }

  // 3. Morphological suffix rules
  if (clean.endsWith("ies") && clean.length > 4) {
    candidates.add(clean.slice(0, -3) + "y");
  }
  if (clean.endsWith("es") && clean.length > 4) {
    candidates.add(clean.slice(0, -2));
    candidates.add(clean.slice(0, -1));
  }
  if (clean.endsWith("s") && !clean.endsWith("ss") && clean.length > 3) {
    candidates.add(clean.slice(0, -1));
  }
  if (clean.endsWith("ed") && clean.length > 4) {
    candidates.add(clean.slice(0, -2));
    candidates.add(clean.slice(0, -1));
  }
  if (clean.endsWith("ing") && clean.length > 5) {
    candidates.add(clean.slice(0, -3));
    candidates.add(clean.slice(0, -3) + "e");
  }
  if (clean.endsWith("ness") && clean.length > 6) {
    candidates.add(clean.slice(0, -4));
  }
  if (clean.endsWith("ful") && clean.length > 5) {
    candidates.add(clean.slice(0, -3));
  }
  if (clean.endsWith("ly") && clean.length > 4) {
    candidates.add(clean.slice(0, -2));
    candidates.add(clean.slice(0, -2) + "e");
  }
  if (clean.endsWith("ment") && clean.length > 6) {
    candidates.add(clean.slice(0, -4));
  }
  if (clean.endsWith("able") && clean.length > 6) {
    candidates.add(clean.slice(0, -4));
  }

  return Array.from(candidates);
}

/** Removes Arabic diacritics (tashkeel, tatweel) and normalizes character variants */
export function removeArabicDiacritics(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // remove fathah, dammah, kasrah, sukoon, shaddah, tatweel
    .replace(/[إأآٱ]/g, "ا") // normalize alef
    .replace(/ى/g, "ي") // normalize alef maksura
    .trim();
}

/** Strips Arabic common prefixes and suffixes */
export function stemArabic(rawWord: string): string[] {
  const clean = removeArabicDiacritics(rawWord)
    .replace(/[^\u0600-\u06FF]/g, "")
    .trim();
  if (!clean) return [];

  const candidates = new Set<string>();
  candidates.add(clean);

  // 1. Prefixes stripping: ال, وال, فال, بال, كال, لل, و, ف, ب, ل, س
  const prefixes = ["ال", "وال", "فال", "بال", "كال", "لل", "و", "ف", "ب", "ل", "س"];
  for (const p of prefixes) {
    if (clean.startsWith(p) && clean.length - p.length >= 3) {
      candidates.add(clean.slice(p.length));
    }
  }

  // 2. Suffixes stripping: ها, هم, هن, نا, كم, كن, ين, ون, ات, ه, ك, ي
  const suffixes = ["ها", "هم", "هن", "نا", "كم", "كن", "ين", "ون", "ات", "ه", "ك", "ي", "ان"];
  const currentList = Array.from(candidates);
  for (const word of currentList) {
    for (const s of suffixes) {
      if (word.endsWith(s) && word.length - s.length >= 3) {
        candidates.add(word.slice(0, -s.length));
      }
    }
  }

  return Array.from(candidates);
}
