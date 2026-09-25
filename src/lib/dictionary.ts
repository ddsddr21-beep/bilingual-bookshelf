import { isArabicWord, extractContextualTargetFn } from "@/lib/ai-explain";
import { analyzeFarahidi } from "@/lib/dictionaries/farahidi-stemmer";
import { lookupFreeDict, FREEDICT_AR_EN } from "@/lib/dictionaries/freedict-ar-en";
import { lookupWordNet } from "@/lib/dictionaries/open-wordnet";
import { lookupWiktextract } from "@/lib/dictionaries/wiktextract-en";
import { BUNDLED_LEXICON } from "@/lib/dictionaries/bundled-lexicon";
import { lemmatizeEnglish } from "@/lib/dictionaries/stemmer";

export type WordMeaningSense = {
  partOfSpeech: string;
  arabicTranslation: string; // The Arabic meaning associated with this English sense
  englishDefinition: string; // From WordNet or Wiktextract
  arabicDefinition: string; // Arabic explanation from local lexicographical data
  examples: string[]; // Real usage examples (deduplicated)
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

const CACHE_KEY = "mihrab.lexicon_v9_farahidi_wordnet";

/** Clean & normalize token (keep English letters, Arabic letters, hyphens, and apostrophes) */
export function cleanWord(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF'-]/g, "")
    .trim();
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
export function saveToLocalCache(entry: WordReferenceEntry) {
  if (typeof window === "undefined") return;
  try {
    const cache = getLocalCache();
    const key = entry.word.toLowerCase();
    cache[key] = entry;
    if (entry.targetEnglishWord && entry.targetEnglishWord.toLowerCase() !== key) {
      cache[entry.targetEnglishWord.toLowerCase()] = entry;
    }
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
 * Queries Open English WordNet + Wiktextract + Bundled Lexicon for a given English lemma.
 * Extracts authentic definitions, Arabic meanings, and deduplicated examples.
 */
export function queryLocalEnglishDatabases(lemma: string): {
  senses: WordMeaningSense[];
  phonetic?: string;
  etymology?: string;
} {
  const cleanLemma = lemma.toLowerCase().trim();
  const candidates = lemmatizeEnglish(cleanLemma);
  if (!candidates.includes(cleanLemma)) {
    candidates.unshift(cleanLemma);
  }

  let wordnet = null;
  let wiktextract = null;
  let bundled = null;

  for (const c of candidates) {
    const wn = lookupWordNet(c);
    const wx = lookupWiktextract(c);
    const bd = BUNDLED_LEXICON[c];
    if (
      (wn && wn.senses.length > 0) ||
      (wx && wx.senses.length > 0) ||
      (bd && bd.meanings.length > 0)
    ) {
      wordnet = wn;
      wiktextract = wx;
      bundled = bd;
      break;
    }
  }

  const phonetic = wiktextract?.phonetic || bundled?.phonetic;
  const etymology = wiktextract?.etymology || bundled?.meanings[0]?.etymology;

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
      if (bundled?.meanings) {
        bundled.meanings.forEach((bm) => {
          if (bm.exampleEn) allExamples.push(bm.exampleEn);
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

  // 2. If not in WordNet, try Wiktextract
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

  // 3. If still empty, try Bundled Lexicon
  if (senses.length === 0 && bundled && bundled.meanings.length > 0) {
    bundled.meanings.forEach((bm) => {
      const examples: string[] = [];
      if (bm.exampleEn) examples.push(bm.exampleEn);
      senses.push({
        partOfSpeech: bm.partOfSpeech,
        arabicTranslation: bm.arabicTranslation,
        englishDefinition: bm.englishDefinition,
        arabicDefinition: bm.arabicDefinition,
        examples: deduplicateExamples(examples),
        synonyms: bm.synonyms || [],
        etymology: bm.etymology || etymology,
      });
    });
  }

  return { senses, phonetic, etymology };
}

/**
 * PATH 1: AI-Powered Contextual Determination + Local Lexicographical Lookup
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

    // Look up in local lexicographical databases
    const localData = queryLocalEnglishDatabases(targetLemma);
    const freedictMatch = lookupFreeDict(targetEnglish) || lookupFreeDict(targetLemma);

    const meanings =
      localData.senses.length > 0
        ? localData.senses
        : [
            {
              partOfSpeech: "مفردة سياقية (Contextual Lexical Item)",
              arabicTranslation: targetEnglish,
              englishDefinition: `Contextual translation equivalent "${targetEnglish}".`,
              arabicDefinition:
                aiResult.explanation ||
                freedictMatch?.arExplanation ||
                `المقابل السياقي في النص الموازي.`,
              examples: [context.currentSentenceEn || `Contextual usage of "${targetEnglish}".`],
              synonyms: freedictMatch?.translations || [targetEnglish],
              etymology: localData.etymology,
            },
          ];

    return {
      word,
      targetEnglishWord: targetLemma,
      contextualEnglishWord: targetEnglish,
      phonetic: localData.phonetic,
      meanings,
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
 */
export function executePath2LocalMorphology(rawWord: string): WordReferenceEntry {
  const isAr = isArabicWord(rawWord);

  if (isAr) {
    // 1. Farahidi Morphological Analysis
    const analysis = analyzeFarahidi(rawWord);
    const primaryLemma = analysis.lemma;

    // 2. FreeDict Arabic -> English lookup
    const freedictMatch = lookupFreeDict(primaryLemma) || lookupFreeDict(rawWord);
    const candidateTranslations: string[] = freedictMatch
      ? freedictMatch.translations
      : [primaryLemma];

    // 3. Multi-candidate local WordNet & Wiktextract analysis
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
          arabicDefinition: freedictMatch?.arExplanation || s.arabicDefinition,
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
      meanings:
        combinedMeanings.length > 0
          ? combinedMeanings
          : [
              {
                partOfSpeech: "جذر عربي (Farahidi Lemma)",
                arabicTranslation: candidateTranslations.join(" / "),
                englishDefinition: `Arabic root and lemma: "${primaryLemma}". Potential English equivalents: ${candidateTranslations.join(", ")}.`,
                arabicDefinition:
                  freedictMatch?.arExplanation ||
                  `التحليل الصرفي: الجذر الأساسي هو "${primaryLemma}".`,
                examples: [],
                synonyms: candidateTranslations,
              },
            ],
      sourceMode: "local_farahidi_freedict_wordnet",
      sourceLabel: "المسار المحلي: فراهيدي (Farahidi) + FreeDict + WordNet + Wiktextract",
      timestamp: Date.now(),
    };
  }

  // If English word clicked
  const lemmas = lemmatizeEnglish(rawWord);
  const targetLemma = lemmas[lemmas.length - 1] || rawWord;
  const localData = queryLocalEnglishDatabases(targetLemma);
  const freedictMatch = lookupFreeDict(rawWord) || lookupFreeDict(targetLemma);

  const meanings =
    localData.senses.length > 0
      ? localData.senses
      : [
          {
            partOfSpeech: "مفردة معجمية (Lexical entry)",
            arabicTranslation: freedictMatch ? freedictMatch.arLemma : rawWord,
            englishDefinition: `Lexical term "${rawWord}" in English lexica.`,
            arabicDefinition:
              freedictMatch?.arExplanation || `مفردة إنجليزية مسجلة في المصادر المحلية.`,
            examples: [`Example usage of "${rawWord}".`],
            synonyms: freedictMatch?.translations || [targetLemma],
            etymology: localData.etymology,
          },
        ];

  return {
    word: rawWord,
    targetEnglishWord: targetLemma,
    phonetic: localData.phonetic,
    meanings,
    candidateTranslations: freedictMatch?.translations || [targetLemma],
    sourceMode: "local_farahidi_freedict_wordnet",
    sourceLabel: "المسار المحلي: Open English WordNet + Wiktextract + FreeDict",
    timestamp: Date.now(),
  };
}

/**
 * Main Entry Point:
 * Orchestrates Path 1 (AI Contextual + Local Lexicon) with seamless fallback to Path 2 (Farahidi + FreeDict + WordNet)
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
      meanings: [
        {
          partOfSpeech: "غير متاح",
          arabicTranslation: "يرجى اختيار كلمة صالحة",
          englishDefinition: "Invalid token input",
          arabicDefinition: "رمز أو مفردة غير صالحة للبحث المعجمي.",
          examples: [],
          synonyms: [],
        },
      ],
      sourceMode: "local_farahidi_freedict_wordnet",
      sourceLabel: "المسار المحلي",
      timestamp: Date.now(),
    };
  }

  // 1. Check local persistent cache
  const cache = getLocalCache();
  const cacheKey = word.toLowerCase();
  if (cache[cacheKey]) {
    return cache[cacheKey]!;
  }

  // 2. PATH 1: If sentence context is provided and AI is available, try Contextual Determination
  if (context?.currentSentenceAr && context?.currentSentenceEn) {
    const aiEntry = await executePath1AiContext(word, context);
    if (aiEntry) {
      saveToLocalCache(aiEntry);
      return aiEntry;
    }
  }

  // 3. PATH 2: Offline Farahidi Morphological Analysis + FreeDict + WordNet + Wiktextract
  const offlineEntry = executePath2LocalMorphology(word);
  saveToLocalCache(offlineEntry);
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
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "will",
    "would",
    "could",
    "should",
    "than",
    "then",
    "into",
    "over",
    "after",
    "also",
    "some",
    "other",
    "about",
  ]);

  const wordCountMap = new Map<string, number>();

  pairs.forEach((pair) => {
    if (!pair.en) return;
    const tokens = pair.en.split(/\s+/);
    tokens.forEach((raw) => {
      const clean = cleanWord(raw).toLowerCase();
      if (clean.length >= 3 && !stopWords.has(clean) && !isArabicWord(clean)) {
        wordCountMap.set(clean, (wordCountMap.get(clean) || 0) + 1);
      }
    });
  });

  const topWords = Array.from(wordCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);

  const cache = getLocalCache();
  const uncached = topWords.filter((w) => !cache[w]);

  for (const w of uncached) {
    getWordReferenceEntry(w).catch(() => null);
  }
}

/** Search through all available cached and local entries */
export function searchLexiconEntries(query: string): WordReferenceEntry[] {
  const q = cleanWord(query).toLowerCase();
  const cache = getLocalCache();

  const combinedMap: Record<string, WordReferenceEntry> = {};

  // Load from FreeDict
  Object.entries(FREEDICT_AR_EN).forEach(([arKey, fd]) => {
    combinedMap[`fd_${arKey}`] = {
      word: arKey,
      targetEnglishWord: fd.translations[0] || arKey,
      arabicLemma: fd.arLemma,
      candidateTranslations: fd.translations,
      meanings: [
        {
          partOfSpeech: fd.pos,
          arabicTranslation: fd.translations.join(" / "),
          englishDefinition: `English candidates: ${fd.translations.join(", ")}`,
          arabicDefinition: fd.arExplanation,
          examples: [],
          synonyms: fd.translations,
        },
      ],
      sourceMode: "local_farahidi_freedict_wordnet",
      sourceLabel: "FreeDict Arabic -> English",
      timestamp: Date.now(),
    };
  });

  // Merge cache
  Object.assign(combinedMap, cache);

  if (!q) return Object.values(combinedMap);

  return Object.values(combinedMap).filter(
    (e) =>
      e.word.toLowerCase().includes(q) ||
      (e.targetEnglishWord && e.targetEnglishWord.toLowerCase().includes(q)) ||
      (e.arabicLemma && e.arabicLemma.toLowerCase().includes(q)) ||
      (e.candidateTranslations &&
        e.candidateTranslations.some((c) => c.toLowerCase().includes(q))) ||
      e.meanings.some(
        (m) =>
          m.arabicTranslation.toLowerCase().includes(q) ||
          m.englishDefinition.toLowerCase().includes(q) ||
          m.arabicDefinition.toLowerCase().includes(q),
      ),
  );
}
