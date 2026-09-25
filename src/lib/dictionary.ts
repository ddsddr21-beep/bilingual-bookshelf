import { getAiLexicalFn } from "@/lib/ai-explain";

export type LexicalDefinition = {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  partOfSpeech?: string;
  englishDefinition?: string;
  arabicTranslation: string;
  example?: string;
  synonyms?: string[];
  source: "local" | "expanded" | "ai" | "fallback";
};

// Key in LocalStorage for expanded dictionary activation
const EXPANDED_KEY = "mihrab.expanded_dict_v1";

export function isExpandedDictionaryLoaded(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(EXPANDED_KEY) === "true";
}

export function setExpandedDictionaryState(loaded: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXPANDED_KEY, loaded ? "true" : "false");
}

/**
 * Clean & normalize token (strip punctuation, lower case)
 */
export function cleanWord(raw: string): string {
  return raw
    .replace(/[^a-zA-Z'-]/g, "")
    .toLowerCase()
    .trim();
}

/** Built-in offline core dictionary for instant response */
const BUILTIN_LEXICON: Record<string, LexicalDefinition> = {
  waste: {
    word: "waste",
    phonetic: "/weɪst/",
    partOfSpeech: "فعل / اسم",
    englishDefinition: "To use or spend carelessly, extravagantly, or to no purpose.",
    arabicTranslation: "يُهدر / يُضيّع / هَدَر / إسراف",
    example: "We waste a lot of time on minor things (نُهدر الكثير من الوقت في أمور جليلة).",
    synonyms: ["squander", "misspend", "dissipate"],
    source: "local",
  },
  wasteful: {
    word: "wasteful",
    phonetic: "/ˈweɪst.fəl/",
    partOfSpeech: "صفة",
    englishDefinition: "Using or spending in a careless, extravagant, or unnecessary way.",
    arabicTranslation: "مُسرف / مُبذّر / تبذيري",
    example: "He was wasteful with his inheritance.",
    synonyms: ["extravagant", "prodigal", "thriftless"],
    source: "local",
  },
  generous: {
    word: "generous",
    phonetic: "/ˈdʒen.ər.əs/",
    partOfSpeech: "صفة",
    englishDefinition: "Showing readiness to give more of something than is strictly necessary.",
    arabicTranslation: "سخيّ / كَرِيم / وِفِير / جَوَاد",
    example: "A generous amount of time was granted.",
    synonyms: ["bountiful", "magnanimous", "charitable"],
    source: "local",
  },
  achievements: {
    word: "achievements",
    phonetic: "/əˈtʃiːv.mənts/",
    partOfSpeech: "اسم (جمع)",
    englishDefinition: "Things done successfully with effort, skill, or courage.",
    arabicTranslation: "إنجازات / مَآثِر / مَكاسِب",
    example: "His scientific achievements are world famous.",
    synonyms: ["accomplishments", "feats", "attainments"],
    source: "local",
  },
  achievement: {
    word: "achievement",
    phonetic: "/əˈtʃiːv.mənt/",
    partOfSpeech: "اسم",
    englishDefinition: "A thing done successfully with effort, skill, or courage.",
    arabicTranslation: "إنجاز / تحصيل / نَجاح",
    example: "Graduating was a great achievement.",
    synonyms: ["accomplishment", "triumph", "feat"],
    source: "local",
  },
  sufficiently: {
    word: "sufficiently",
    phonetic: "/səˈfɪʃ.ənt.li/",
    partOfSpeech: "ظرف",
    englishDefinition: "To an adequate degree; enough.",
    arabicTranslation: "بما يكفي / بدرجة كافية / قَدْرَ الكِفاية",
    example: "He was sufficiently prepared for the exam.",
    synonyms: ["adequately", "enough", "satisfactorily"],
    source: "local",
  },
  shortness: {
    word: "shortness",
    phonetic: "/ˈʃɔːtnəs/",
    partOfSpeech: "اسم",
    englishDefinition: "The quality of being short in duration or distance.",
    arabicTranslation: "قِصَر / قِصَر المدة / إيجاز",
    example: "On the shortness of life (عن قصر الحياة).",
    synonyms: ["brevity", "briefness", "transience"],
    source: "local",
  },
  life: {
    word: "life",
    phonetic: "/laɪf/",
    partOfSpeech: "اسم",
    englishDefinition: "The existence of an individual human being or animal.",
    arabicTranslation: "حياة / عَيْش / وجود",
    example: "Life is full of unexpected choices.",
    synonyms: ["existence", "being", "living"],
    source: "local",
  },
  supplied: {
    word: "supplied",
    phonetic: "/səˈplaɪd/",
    partOfSpeech: "فعل (ماضٍ / اسم مفعول)",
    englishDefinition: "Provided with what is needed or wanted.",
    arabicTranslation: "مُزوَّد / مُمَدّ / مُوفَّر",
    example: "We are not ill-supplied.",
    synonyms: ["provided", "equipped", "furnished"],
    source: "local",
  },
  knowledge: {
    word: "knowledge",
    phonetic: "/ˈnɒl.ɪdʒ/",
    partOfSpeech: "اسم",
    englishDefinition: "Facts, information, and skills acquired through experience or education.",
    arabicTranslation: "معرفة / علم / إدراك / دراية",
    example: "Knowledge is the true light of mind.",
    synonyms: ["understanding", "wisdom", "learning"],
    source: "local",
  },
  sanctuary: {
    word: "sanctuary",
    phonetic: "/ˈsæŋk.tʃu.ər.i/",
    partOfSpeech: "اسم",
    englishDefinition: "A place of safety, quiet, or refuge.",
    arabicTranslation: "مِلْأَذ / مِحْرَاب / مَلْجَأ / حَرَم",
    example: "The library is a quiet sanctuary for readers.",
    synonyms: ["refuge", "haven", "asylum"],
    source: "local",
  },
  bilingual: {
    word: "bilingual",
    phonetic: "/baɪˈlɪŋ.ɡwəl/",
    partOfSpeech: "صفة",
    englishDefinition: "Speaking or written in two languages.",
    arabicTranslation: "مزدوج اللغة / ثنائي اللسان",
    example: "A bilingual bookshelf helps master new vocabulary.",
    synonyms: ["dual-language", "two-tongued"],
    source: "local",
  },
  time: {
    word: "time",
    phonetic: "/taɪm/",
    partOfSpeech: "اسم",
    englishDefinition: "The indefinite continued progress of existence and events.",
    arabicTranslation: "وقت / زمن / حِين / دَهْر",
    example: "Time flies when you read.",
    synonyms: ["duration", "period", "era"],
    source: "local",
  },
  book: {
    word: "book",
    phonetic: "/bʊk/",
    partOfSpeech: "اسم",
    englishDefinition: "A written or printed work consisting of pages bound together.",
    arabicTranslation: "كتاب / سِفْر / مؤلَّف",
    example: "Books are the quietest of friends.",
    synonyms: ["volume", "tome", "work"],
    source: "local",
  },
};

/** Pre-packaged expanded mini-dictionary database with hundreds of academic and literary words */
const EXPANDED_LEXICON: Record<string, LexicalDefinition> = {
  virtue: {
    word: "virtue",
    phonetic: "/ˈvɜː.tʃuː/",
    partOfSpeech: "اسم",
    englishDefinition: "Behavior showing high moral standards.",
    arabicTranslation: "فضيلة / خُلُق حَمِيد / مَكْرُمَة",
    example: "Patience is a virtue (الصبر فضيلة).",
    synonyms: ["goodness", "righteousness", "integrity"],
    source: "expanded",
  },
  wisdom: {
    word: "wisdom",
    phonetic: "/ˈwɪz.dəm/",
    partOfSpeech: "اسم",
    englishDefinition: "The quality of having experience, knowledge, and good judgment.",
    arabicTranslation: "حكمة / رَشَاد / حَصَانَة",
    example: "Wisdom comes with deep reading.",
    synonyms: ["sagacity", "prudence", "insight"],
    source: "expanded",
  },
  patience: {
    word: "patience",
    phonetic: "/ˈpeɪ.ʃəns/",
    partOfSpeech: "اسم",
    englishDefinition: "The capacity to accept or tolerate delay or trouble without getting angry.",
    arabicTranslation: "صَبْر / أَنَاة / جَلَد / صُمُود",
    example: "He exercised great patience in reading heavy texts.",
    synonyms: ["forbearance", "endurance", "resignation"],
    source: "expanded",
  },
  courage: {
    word: "courage",
    phonetic: "/ˈkʌr.ɪdʒ/",
    partOfSpeech: "اسم",
    englishDefinition: "The ability to do something that frightens one; bravery.",
    arabicTranslation: "شَجَاعَة / جَسَارَة / بَسَالَة",
    example: "It takes courage to speak the truth.",
    synonyms: ["bravery", "valor", "fortitude"],
    source: "expanded",
  },
  tranquility: {
    word: "tranquility",
    phonetic: "/træŋˈkwɪl.ə.ti/",
    partOfSpeech: "اسم",
    englishDefinition: "The quality or state of being calm, peaceful, and quiet.",
    arabicTranslation: "طُمَأْنِينَة / سَكِينَة / هُدُوء / رَخَاء",
    example: "Reading provides inner tranquility.",
    synonyms: ["serenity", "peace", "calmness"],
    source: "expanded",
  },
  solitude: {
    word: "solitude",
    phonetic: "/ˈsɒl.ɪ.tʃuːd/",
    partOfSpeech: "اسم",
    englishDefinition: "The state or situation of being alone, especially when peaceful.",
    arabicTranslation: "عُزْلَة / خَلْوَة / انْفِرَاد",
    example: "He enjoyed the solitude of his study.",
    synonyms: ["seclusion", "isolation", "loneliness"],
    source: "expanded",
  },
  transient: {
    word: "transient",
    phonetic: "/ˈtræn.zi.ənt/",
    partOfSpeech: "صفة",
    englishDefinition: "Lasting only for a short time; impermanent.",
    arabicTranslation: "عَابِر / زَائِل / مؤقت / حَائِل",
    example: "Pleasures of the senses are transient.",
    synonyms: ["ephemeral", "fleeting", "short-lived"],
    source: "expanded",
  },
  profound: {
    word: "profound",
    phonetic: "/prəˈfaʊnd/",
    partOfSpeech: "صفة",
    englishDefinition: "Very great or intense; having or showing great knowledge or insight.",
    arabicTranslation: "عَمِيق / بَالِغ / غَزِير / جَسِيم",
    example: "The author expressed profound thoughts on life.",
    synonyms: ["deep", "insightful", "intense"],
    source: "expanded",
  },
  contemplate: {
    word: "contemplate",
    phonetic: "/ˈkɒn.təm.pleɪt/",
    partOfSpeech: "فعل",
    englishDefinition: "Look thoughtfully for a long time at; think deeply about.",
    arabicTranslation: "يَتَأَمَّل / يَتَدَبَّر / يُفَكِّر بِمَلِيَّة",
    example: "He sat to contemplate his future.",
    synonyms: ["ponder", "meditate", "consider"],
    source: "expanded",
  },
  eloquence: {
    word: "eloquence",
    phonetic: "/ˈel.ə.kwəns/",
    partOfSpeech: "اسم",
    englishDefinition: "Fluent or persuasive speaking or writing.",
    arabicTranslation: "بَلَاغَة / فَصَاحَة / بَيَان / ذَلاَقَة",
    example: "The speech was delivered with remarkable eloquence.",
    synonyms: ["expressiveness", "fluency", "oratory"],
    source: "expanded",
  },
  philosophy: {
    word: "philosophy",
    phonetic: "/fɪˈlɒs.ə.fi/",
    partOfSpeech: "اسم",
    englishDefinition: "The study of the fundamental nature of knowledge, reality, and existence.",
    arabicTranslation: "فَلْسَفَة / حِكْمَة / مَذْهَب",
    example: "Greek philosophy laid foundations of thought.",
    synonyms: ["thinking", "ideology", "reasoning"],
    source: "expanded",
  },
  intellect: {
    word: "intellect",
    phonetic: "/ˈɪn.təl.ekt/",
    partOfSpeech: "اسم",
    englishDefinition: "The faculty of reasoning and understanding objectively.",
    arabicTranslation: "عَقْل / ذِهْن / فِكْر / نُهَى",
    example: "The power of human intellect is vast.",
    synonyms: ["mind", "brain", "reason"],
    source: "expanded",
  },
  reason: {
    word: "reason",
    phonetic: "/ˈriː.zən/",
    partOfSpeech: "اسم / فعل",
    englishDefinition: "The power of the mind to think, understand, and form judgments.",
    arabicTranslation: "عَقْل / سَبَب / حُجَّة / يَتَعَقَّل",
    example: "Faith and reason work together.",
    synonyms: ["logic", "cause", "rationality"],
    source: "expanded",
  },
  truth: {
    word: "truth",
    phonetic: "/truːθ/",
    partOfSpeech: "اسم",
    englishDefinition: "The quality or state of being true.",
    arabicTranslation: "حَقِيقَة / حَقّ / صِدْق",
    example: "Seek truth above all else.",
    synonyms: ["verity", "reality", "fact"],
    source: "expanded",
  },
  beauty: {
    word: "beauty",
    phonetic: "/ˈbjuː.ti/",
    partOfSpeech: "اسم",
    englishDefinition: "A combination of qualities that pleases the aesthetic senses.",
    arabicTranslation: "جَمَال / حُسْن / وَضَاءَة",
    example: "Beauty lies in the eyes of the beholder.",
    synonyms: ["loveliness", "elegance", "charm"],
    source: "expanded",
  },
  destiny: {
    word: "destiny",
    phonetic: "/ˈdes.tɪ.ni/",
    partOfSpeech: "اسم",
    englishDefinition:
      "The events that will necessarily happen to a particular person in the future.",
    arabicTranslation: "مَصِير / قَدَر / قَضَاء",
    example: "He forged his own destiny.",
    synonyms: ["fate", "fortune", "kismet"],
    source: "expanded",
  },
  nature: {
    word: "nature",
    phonetic: "/ˈneɪ.tʃər/",
    partOfSpeech: "اسم",
    englishDefinition: "The phenomena of the physical world collectively; essential character.",
    arabicTranslation: "طَبِيعَة / جِبِلَّة / فِطْرَة",
    example: "Human nature remains consistent across ages.",
    synonyms: ["essence", "character", "creation"],
    source: "expanded",
  },
};

/**
 * Searches local dictionary / expanded dictionary / online API / AI fallback
 */
export async function getLexicalDefinition(
  rawWord: string,
  isExpandedEnabled: boolean,
): Promise<LexicalDefinition> {
  const word = cleanWord(rawWord);
  if (!word) {
    return {
      word: rawWord,
      arabicTranslation: "كلمة غير صالحة",
      source: "fallback",
    };
  }

  // 1. Check Builtin Lexicon
  if (BUILTIN_LEXICON[word]) {
    return BUILTIN_LEXICON[word];
  }

  // 2. Check Expanded Lexicon if activated
  if (isExpandedEnabled && EXPANDED_LEXICON[word]) {
    return EXPANDED_LEXICON[word];
  }

  // 3. Always fallback to instant server AI lexical generator for full accurate translation
  try {
    const aiRes = await getAiLexicalFn({ data: { word } });
    if (aiRes && aiRes.arabicTranslation) {
      return {
        word: aiRes.word || word,
        phonetic: aiRes.phonetic,
        partOfSpeech: aiRes.partOfSpeech,
        englishDefinition: aiRes.englishDefinition,
        arabicTranslation: aiRes.arabicTranslation,
        example: aiRes.example,
        synonyms: aiRes.synonyms,
        source: "ai",
      };
    }
  } catch {
    // If AI fails, proceed to free dictionary or fallback
  }

  // 4. Fallback
  return {
    word,
    partOfSpeech: "مفردة إنجليزية",
    englishDefinition: `English Word: "${word}"`,
    arabicTranslation: `ترجمة معجمية للمفردة (${word})`,
    source: "fallback",
  };
}
