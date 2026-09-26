import { isArabicWord, extractContextualTargetFn } from "@/lib/ai-explain";
import { analyzeFarahidi } from "@/lib/dictionaries/farahidi-stemmer";
import {
  lookupFreeDict,
  resolveArabicLemmaWithFreeDict,
} from "@/lib/dictionaries/freedict-ar-en";
import {
  lookupWordNet,
  OPEN_WORDNET_DATA,
  type WordNetEntry,
} from "@/lib/dictionaries/open-wordnet";
import { lookupWiktextract, type WiktextractEntry } from "@/lib/dictionaries/wiktextract-en";
import { lemmatizeEnglish } from "@/lib/dictionaries/stemmer";

export type WordMeaningSense = {
  partOfSpeech: string;
  arabicTranslation: string; // The Arabic meaning associated with this English sense
  englishDefinition: string; // From WordNet or Wiktextract
  arabicDefinition: string; // Arabic explanation from local lexicographical data
  examples: string[]; // Real usage examples from WordNet/Wiktextract (deduplicated)
  synonyms: string[];
  etymology?: string;
};

export type WordReferenceEntry = {
  word: string; // The original clicked word
  targetEnglishWord: string; // The primary English word or lemma
  contextualEnglishWord?: string; // If resolved via AI context (e.g. "played")
  phonetic?: string;
  meanings: WordMeaningSense[];
  candidateTranslations?: string[]; // Multiple candidate translations in offline mode (e.g. ["play", "game", "sport"])
  arabicLemma?: string; // Farahidi root/lemma (e.g. "لعب")
  sourceMode: "ai_context_with_local_lexicon" | "local_farahidi_freedict_wordnet" | "cache";
  sourceLabel: string;
  contextExplanation?: string;
  timestamp: number;
};

export type SentenceContextParam = {
  currentSentenceAr?: string;
  contextSentencesAr?: string[];
  currentSentenceEn?: string;
  contextSentencesEn?: string[];
};

const CACHE_KEY = "mihrab.lexicon_v15_pure_wordnet_wiktextract";

/** Clean & normalize token (keep English letters, Arabic letters, hyphens, and apostrophes) */
export function cleanWord(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF'-]/g, "")
    .trim();
}

/** Generate context-aware cache key to ensure different sentence contexts never collide */
export function getContextCacheKey(word: string, context?: SentenceContextParam): string {
  if (context?.currentSentenceAr && context?.currentSentenceEn) {
    const arSnippet = cleanWord(context.currentSentenceAr).slice(0, 30);
    const enSnippet = cleanWord(context.currentSentenceEn).slice(0, 30);
    return `ctx::${word.toLowerCase()}::${arSnippet}::${enSnippet}`;
  }
  return `word::${word.toLowerCase()}`;
}

/** Get persistent local dictionary cache */
export function getLocalCache(): Record<string, WordReferenceEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, WordReferenceEntry>) : {};
  } catch {
    return {};
  }
}

/** Save entry to persistent local dictionary cache */
export function saveToLocalCache(key: string, entry: WordReferenceEntry) {
  if (typeof window === "undefined") return;
  try {
    const cache = getLocalCache();
    cache[key] = entry;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded
  }
}

/** Deduplicate example sentences based on normalized text */
export function deduplicateExamples(examples: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const ex of examples) {
    if (!ex || ex.trim().length === 0) continue;
    const norm = ex
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "");
    if (!seen.has(norm)) {
      seen.add(norm);
      result.push(ex.trim());
    }
  }
  return result;
}

/**
 * Local Lexical Aggregator:
 * Queries ONLY authentic Open English WordNet + Local Wiktextract for a given English lemma.
 * Extracts authentic definitions, Arabic meanings, and deduplicated examples.
 * Never invents or generates fallback definitions.
 */
export function queryLocalEnglishDatabases(lemma: string): {
  senses: WordMeaningSense[];
  matchedLemma: string;
  phonetic?: string;
  etymology?: string;
} {
  const cleanLemma = lemma.toLowerCase().trim();
  const candidates = lemmatizeEnglish(cleanLemma);
  if (!candidates.includes(cleanLemma)) {
    candidates.unshift(cleanLemma);
  }

  let wordnet: WordNetEntry | null = null;
  let wiktextract: WiktextractEntry | null = null;
  let matchedLemma = cleanLemma;

  for (const c of candidates) {
    const wn = lookupWordNet(c);
    const wx = lookupWiktextract(c);
    if ((wn && wn.senses.length > 0) || (wx && wx.senses.length > 0)) {
      wordnet = wn;
      wiktextract = wx;
      matchedLemma = c;
      break;
    }
  }

  const phonetic = wiktextract?.phonetic;
  const etymology = wiktextract?.etymology;

  const senses: WordMeaningSense[] = [];

  // 1. From Open English WordNet
  if (wordnet && wordnet.senses.length > 0) {
    wordnet.senses.forEach((wnSense) => {
      const allExamples = [...wnSense.examples];
      if (wiktextract?.senses) {
        wiktextract.senses.forEach((ws) => {
          allExamples.push(...ws.examples);
        });
      }

      senses.push({
        partOfSpeech:
          wnSense.pos === "verb"
            ? "فعل (verb)"
            : wnSense.pos === "noun"
              ? "اسم (noun)"
              : wnSense.pos === "adjective"
                ? "صفة (adjective)"
                : "ظرف (adverb)",
        arabicTranslation: wnSense.arabicGloss.split("/")[0]?.trim() || wnSense.arabicGloss,
        englishDefinition: wnSense.definition,
        arabicDefinition: wnSense.arabicGloss,
        examples: deduplicateExamples(allExamples).slice(0, 4),
        synonyms: wnSense.synonyms,
        etymology,
      });
    });
  }

  // 2. From Wiktextract (if not in WordNet)
  if (senses.length === 0 && wiktextract && wiktextract.senses.length > 0) {
    wiktextract.senses.forEach((ws) => {
      senses.push({
        partOfSpeech: ws.pos.includes("verb")
          ? "فعل (verb)"
          : ws.pos.includes("noun")
            ? "اسم (noun)"
            : ws.pos.includes("adj")
              ? "صفة (adjective)"
              : ws.pos,
        arabicTranslation: ws.arabicTranslation,
        englishDefinition: ws.definition,
        arabicDefinition: ws.arabicDefinition,
        examples: deduplicateExamples(ws.examples).slice(0, 4),
        synonyms: ws.synonyms,
        etymology: ws.etymology || etymology,
      });
    });
  }

  return { senses, matchedLemma, phonetic, etymology };
}

/**
 * PATH 1: AI-Powered Contextual Determination + Local Lexicographical Lookup
 * AI ONLY determines the contextual English counterpart and lemma in the parallel text.
 * Lexical definitions and examples are retrieved solely from WordNet/Wiktextract.
 */
async function executePath1AiContext(
  word: string,
  context: SentenceContextParam,
): Promise<WordReferenceEntry | null> {
  try {
    if (!context.currentSentenceAr || !context.currentSentenceEn) {
      return null;
    }

    const aiResult = await extractContextualTargetFn({
      data: {
        word,
        currentSentenceAr: context.currentSentenceAr,
        contextSentencesAr: context.contextSentencesAr,
        currentSentenceEn: context.currentSentenceEn,
        contextSentencesEn: context.contextSentencesEn,
      },
    });

    if (!aiResult || !aiResult.contextualEnglishWord) {
      return null;
    }

    const targetEnglish = aiResult.contextualEnglishWord;
    const targetLemma =
      aiResult.englishLemma || lemmatizeEnglish(targetEnglish)[0] || targetEnglish;

    // Look up in authentic local lexicographical databases (WordNet + Wiktextract)
    const localData = queryLocalEnglishDatabases(targetLemma);

    return {
      word,
      targetEnglishWord: targetLemma,
      contextualEnglishWord: targetEnglish,
      phonetic: localData.phonetic,
      meanings: localData.senses, // Genuine local data only; empty array if not in local sources
      sourceMode: "ai_context_with_local_lexicon",
      sourceLabel:
        "المقابل محدد سياقياً بالذكاء الاصطناعي • المعاني من WordNet و Wiktextract المحلية",
      contextExplanation: aiResult.explanation,
      timestamp: Date.now(),
    };
  } catch {
    // Gracefully fall back to Path 2 (Local Morphological)
    return null;
  }
}

/**
 * PATH 2: Offline Farahidi Morphological Analysis + FreeDict + Open WordNet + Wiktextract
 * Operates 100% offline without network calls or synthetic fallbacks.
 */
export async function executePath2LocalMorphology(rawWord: string): Promise<WordReferenceEntry> {
  const isAr = isArabicWord(rawWord);

  if (isAr) {
    // 1. Farahidi Morphological Resolution against authentic FreeDict
    const resolved = await resolveArabicLemmaWithFreeDict(rawWord);
    const primaryLemma = resolved.lemma;
    const freedictMatch = resolved.entry || (await lookupFreeDict(primaryLemma)) || (await lookupFreeDict(rawWord));
    const candidateTranslations: string[] = freedictMatch ? freedictMatch.translations : [];

    // 2. Multi-candidate local WordNet analysis
    const combinedMeanings: WordMeaningSense[] = [];
    let primaryPhonetic: string | undefined;

    candidateTranslations.slice(0, 3).forEach((cand) => {
      const candData = queryLocalEnglishDatabases(cand);
      if (!primaryPhonetic && candData.phonetic) primaryPhonetic = candData.phonetic;

      candData.senses.forEach((s) => {
        combinedMeanings.push({
          partOfSpeech: s.partOfSpeech,
          arabicTranslation: freedictMatch ? `${cand} (${freedictMatch.arLemma})` : cand,
          englishDefinition: s.englishDefinition,
          arabicDefinition: s.arabicDefinition,
          examples: s.examples,
          synonyms: s.synonyms,
          etymology: s.etymology,
        });
      });
    });

    return {
      word: rawWord,
      targetEnglishWord: candidateTranslations[0] || primaryLemma,
      arabicLemma: primaryLemma,
      candidateTranslations,
      phonetic: primaryPhonetic,
      meanings: combinedMeanings, // Genuine local data only; empty array if not found
      sourceMode: "local_farahidi_freedict_wordnet",
      sourceLabel: "المسار المحلي: فراهيدي (Farahidi) + معجم FreeDict الأصلي",
      timestamp: Date.now(),
    };
  }

  // If English word clicked
  const localData = queryLocalEnglishDatabases(rawWord);
  const targetLemma = localData.matchedLemma || rawWord;
  const freedictMatch = (await lookupFreeDict(rawWord)) || (await lookupFreeDict(targetLemma));

  return {
    word: rawWord,
    targetEnglishWord: targetLemma,
    phonetic: localData.phonetic,
    meanings: localData.senses, // Genuine local data only; empty array if not found
    candidateTranslations: freedictMatch?.translations || [targetLemma],
    sourceMode: "local_farahidi_freedict_wordnet",
    sourceLabel: "المسار المحلي: FreeDict + Open English WordNet",
    timestamp: Date.now(),
  };
}

/**
 * Main Entry Point:
 * Orchestrates Path 1 (AI Contextual + Local Lexicon) with seamless fallback to Path 2 (Farahidi + FreeDict + WordNet)
 * Never returns stale cache when context is present.
 */
export async function getWordReferenceEntry(
  rawWord: string,
  context?: SentenceContextParam,
): Promise<WordReferenceEntry> {
  const word = cleanWord(rawWord);
  if (!word) {
    return {
      word: rawWord,
      targetEnglishWord: rawWord,
      meanings: [],
      sourceMode: "local_farahidi_freedict_wordnet",
      sourceLabel: "المسار المحلي",
      timestamp: Date.now(),
    };
  }

  const hasContext = !!(context?.currentSentenceAr && context?.currentSentenceEn);
  const cacheKey = getContextCacheKey(word, context);
  const cache = getLocalCache();

  // 1. If sentence context is provided, ALWAYS run Contextual AI Resolution first.
  // We NEVER return old cache before attempting contextual resolution!
  if (hasContext) {
    const aiEntry = await executePath1AiContext(word, context!);
    if (aiEntry && aiEntry.contextualEnglishWord) {
      saveToLocalCache(cacheKey, aiEntry);
      return aiEntry;
    }
    // If AI fails to determine counterpart, transition cleanly to local morphological analysis
  } else {
    // Only check cache when there is NO sentence context (offline mode)
    if (cache[cacheKey]) {
      return cache[cacheKey]!;
    }
  }

  // 2. Fallback to local offline morphological analysis (Farahidi + FreeDict)
  const offlineEntry = await executePath2LocalMorphology(word);
  saveToLocalCache(cacheKey, offlineEntry);
  return offlineEntry;
}

/** Pre-fetch dictionary entries for key vocabulary in background */
export async function preloadDocVocabulary(pairs: Array<{ en: string; ar: string }>) {
  if (typeof window === "undefined" || !pairs || pairs.length === 0) return;

  const stopWords = new Set([
    "the",
    "and",
    "that",
    "this",
    "with",
    "from",
    "for",
    "not",
    "have",
    "had",
    "was",
    "were",
    "been",
    "there",
    "their",
    "they",
    "them",
    "she",
    "her",
    "him",
    "his",
    "you",
    "your",
    "our",
    "are",
    "can",
    "could",
    "would",
    "shall",
    "will",
    "may",
    "might",
    "في",
    "من",
    "على",
    "إلى",
    "عن",
    "مع",
    "هذا",
    "هذه",
    "تلك",
    "ذلك",
    "كان",
    "كانت",
    "يكون",
    "تكون",
    "أن",
    "إن",
    "ما",
    "لا",
    "لم",
    "لن",
    "ثم",
    "أو",
    "هو",
    "هي",
    "هم",
    "هن",
  ]);

  const wordsToWarm: string[] = [];

  for (const pair of pairs.slice(0, 15)) {
    const enTokens = pair.en.split(/\s+/).map(cleanWord).filter(Boolean);
    const arTokens = pair.ar.split(/\s+/).map(cleanWord).filter(Boolean);

    enTokens.forEach((t) => {
      const lower = t.toLowerCase();
      if (lower.length > 3 && !stopWords.has(lower) && !wordsToWarm.includes(lower)) {
        wordsToWarm.push(lower);
      }
    });

    arTokens.forEach((t) => {
      if (t.length > 2 && !stopWords.has(t) && !wordsToWarm.includes(t)) {
        wordsToWarm.push(t);
      }
    });

    if (wordsToWarm.length >= 25) break;
  }

  // Warm up offline entries in cache in idle time
  const warmUp = async () => {
    for (const w of wordsToWarm) {
      const entry = await executePath2LocalMorphology(w);
      const key = getContextCacheKey(w);
      saveToLocalCache(key, entry);
    }
  };

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
      warmUp,
    );
  } else {
    setTimeout(warmUp, 1000);
  }
}

/** Search authentic local entries (WordNet & FreeDict) matching a prefix or query */
export function searchLexiconEntries(
  query: string,
): Array<{ word: string; targetEnglishWord?: string }> {
  const clean = cleanWord(query).toLowerCase();
  if (!clean || clean.length < 2) return [];

  const results: Array<{ word: string; targetEnglishWord?: string }> = [];

  // 1. Search Open WordNet lemmas
  for (const key of Object.keys(OPEN_WORDNET_DATA)) {
    if (key.startsWith(clean)) {
      results.push({ word: key, targetEnglishWord: key });
      if (results.length >= 8) return results;
    }
  }

  // 2. Search FreeDict Arabic lemmas
  for (const [arKey, entry] of Object.entries(FREEDICT_AR_EN)) {
    if (arKey.startsWith(clean)) {
      results.push({ word: arKey, targetEnglishWord: entry.translations[0] });
      if (results.length >= 8) return results;
    }
  }

  return results;
}
