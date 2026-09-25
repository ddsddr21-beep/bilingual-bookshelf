/**
 * Farahidi Arabic Morphological Analyzer & Lemmatizer
 * Implements classical Arabic morphological decomposition, proclitic/enclitic peeling,
 * and root/lemma extraction for offline Arabic lexicography.
 */

import { lemmatizeEnglish } from "./stemmer";

export type FarahidiAnalysis = {
  raw: string;
  normalized: string;
  lemma: string;
  stems: string[];
  prefixes: string[];
  suffixes: string[];
  possibleRoots: string[];
};

/** Normalize Arabic letters and strip tashkeel, tatweel, and variants */
export function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "") // remove fathah, dammah, kasrah, sukoon, shaddah, tatweel
    .replace(/[إأآٱ]/g, "ا") // normalize alef
    .replace(/ة/g, "ه") // normalize teh marbuta
    .replace(/ى/g, "ي") // normalize alef maksura
    .replace(/[^\u0600-\u06FF]/g, "") // keep only Arabic letters
    .trim();
}

// Proclitics (الزوائد الأمامية)
const PROCLITICS = ["وال", "فال", "بال", "كال", "لل", "ال", "و", "ف", "ب", "ك", "ل", "س"];

// Enclitics (الضمائر واللواحق الخلفية)
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

// Irregular and common lemma overrides for classical Arabic
const ARABIC_LEMMA_OVERRIDES: Record<string, string> = {
  لعبنا: "لعب",
  لعبتم: "لعب",
  يلعبون: "لعب",
  يلعبان: "لعب",
  تلعبين: "لعب",
  يلعب: "لعب",
  تلعب: "لعب",
  اللعاب: "لعب",
  العاب: "لعب",
  لاعب: "لعب",
  لاعبون: "لعب",
  لاعبين: "لعب",
  نهدر: "هدر",
  يهدر: "هدر",
  يهدرون: "هدر",
  اهدار: "هدر",
  مهدر: "هدر",
  اسراف: "سرف",
  مسرف: "سرف",
  مسرفون: "سرف",
  مسرفين: "سرف",
  نسرف: "سرف",
  اعطينا: "اعطى",
  يعطون: "اعطى",
  عطاء: "اعطى",
  معطاء: "اعطى",
  انجاز: "انجز",
  انجازات: "انجز",
  ينجزون: "انجز",
  منجز: "انجز",
  قصيرة: "قصير",
  قصر: "قصر",
  طويلة: "طويل",
  حياة: "حياة",
  حكمه: "حكمة",
  فضائل: "فضيلة",
  فضيله: "فضيلة",
  كتابه: "كتاب",
  كتب: "كتاب",
  كتابات: "كتاب",
  قراءه: "قراءة",
  قراءات: "قراءة",
  يقرا: "قرا",
  يقراون: "قرا",
  معارف: "معرفة",
  علوم: "علم",
  ارواح: "روح",
  عقول: "عقل",
};

/** Perform Farahidi morphological analysis on an Arabic word */
export function analyzeFarahidi(rawWord: string): FarahidiAnalysis {
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

  // Check known lemma overrides
  if (ARABIC_LEMMA_OVERRIDES[norm]) {
    const directLemma = ARABIC_LEMMA_OVERRIDES[norm]!;
    return {
      raw: rawWord,
      normalized: norm,
      lemma: directLemma,
      stems: [directLemma, norm],
      prefixes: [],
      suffixes: [],
      possibleRoots: [directLemma],
    };
  }

  const stemsSet = new Set<string>();
  stemsSet.add(norm);

  const matchedPrefixes: string[] = [];
  const matchedSuffixes: string[] = [];

  // Strip prefixes
  let strippedPrefix = norm;
  for (const p of PROCLITICS) {
    if (norm.startsWith(p) && norm.length - p.length >= 2) {
      const candidate = norm.slice(p.length);
      stemsSet.add(candidate);
      matchedPrefixes.push(p);
      strippedPrefix = candidate;
      break;
    }
  }

  // Strip suffixes
  let strippedSuffix = strippedPrefix;
  for (const s of ENCLITICS) {
    if (strippedPrefix.endsWith(s) && strippedPrefix.length - s.length >= 2) {
      const candidate = strippedPrefix.slice(0, -s.length);
      stemsSet.add(candidate);
      matchedSuffixes.push(s);
      strippedSuffix = candidate;
      break;
    }
  }

  const allStems = Array.from(stemsSet).filter((s) => s.length >= 2);
  const primaryLemma = strippedSuffix || allStems[allStems.length - 1] || norm;

  return {
    raw: rawWord,
    normalized: norm,
    lemma: primaryLemma,
    stems: allStems,
    prefixes: matchedPrefixes,
    suffixes: matchedSuffixes,
    possibleRoots: allStems.filter((s) => s.length === 3 || s.length === 4),
  };
}

export { lemmatizeEnglish };
