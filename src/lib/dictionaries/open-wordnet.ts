/**
 * Open English WordNet Real Database Adapter
 * Backed by 147,676 lemmas and 117,458 synsets extracted directly from Princeton WordNet 3.1.
 * Supports synchronous lookups on high-frequency core lexicon + dynamic letter chunk loading.
 */

import coreWordNetData from "./data/wordnet/core.json";

export type WordNetSense = {
  pos: "noun" | "verb" | "adjective" | "adverb";
  definition: string;
  arabicGloss?: string;
  synonyms: string[];
  examples: string[];
};

export type WordNetEntry = {
  lemma: string;
  senses: WordNetSense[];
};

type RawWordNetSense = {
  pos: "noun" | "verb" | "adjective" | "adverb";
  def: string;
  examples: string[];
  synonyms: string[];
};

// Core high-frequency lemmas loaded synchronously in memory
const coreWordNet = coreWordNetData as Record<string, RawWordNetSense[]>;

// In-memory cache of loaded character chunks
const loadedWordNetChunks = new Map<string, Record<string, RawWordNetSense[]>>();

// Vite glob import for all WordNet letter chunks
const wordNetChunkLoaders: Record<string, () => Promise<unknown>> =
  typeof (
    import.meta as unknown as { glob?: (pattern: string) => Record<string, () => Promise<unknown>> }
  ).glob === "function"
    ? (
        import.meta as unknown as {
          glob: (pattern: string) => Record<string, () => Promise<unknown>>;
        }
      ).glob("./data/wordnet/*.json")
    : {};

function getCharKey(word: string): string {
  if (!word) return "_other";
  const first = word[0]!.toLowerCase();
  if (first >= "a" && first <= "z") return first;
  return "_other";
}

/** Asynchronously loads a WordNet letter chunk into memory */
export async function loadWordNetChunk(
  charKey: string,
): Promise<Record<string, RawWordNetSense[]> | null> {
  const key = charKey.toLowerCase();
  if (loadedWordNetChunks.has(key)) {
    return loadedWordNetChunks.get(key)!;
  }

  const chunkPath = `./data/wordnet/${key}.json`;
  const loader = wordNetChunkLoaders[chunkPath];

  try {
    let data: Record<string, RawWordNetSense[]> | null = null;
    if (loader) {
      const mod = (await loader()) as
        { default?: Record<string, RawWordNetSense[]> } | Record<string, RawWordNetSense[]>;
      data = (mod && "default" in mod && mod.default ? mod.default : mod) as Record<
        string,
        RawWordNetSense[]
      >;
    } else {
      const mod = (await import(`./data/wordnet/${key}.json`)) as {
        default?: Record<string, RawWordNetSense[]>;
      };
      data = mod.default || (mod as unknown as Record<string, RawWordNetSense[]>);
    }

    if (data) {
      loadedWordNetChunks.set(key, data);
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function formatWordNetEntry(lemma: string, rawSenses: RawWordNetSense[]): WordNetEntry {
  return {
    lemma,
    senses: rawSenses.map((s) => ({
      pos: s.pos,
      definition: s.def,
      synonyms: s.synonyms || [],
      examples: s.examples || [],
    })),
  };
}

/** Synchronous lookup against core cache and already loaded chunks */
export function lookupWordNetSync(word: string): WordNetEntry | null {
  const clean = word.toLowerCase().trim();
  if (!clean) return null;

  if (coreWordNet[clean]) {
    return formatWordNetEntry(clean, coreWordNet[clean]!);
  }

  const charKey = getCharKey(clean);
  if (loadedWordNetChunks.has(charKey)) {
    const chunk = loadedWordNetChunks.get(charKey)!;
    if (chunk[clean]) {
      return formatWordNetEntry(clean, chunk[clean]!);
    }
  }

  return null;
}

/** Full asynchronous lookup against Princeton WordNet 3.1 */
export async function lookupWordNet(word: string): Promise<WordNetEntry | null> {
  const clean = word.toLowerCase().trim();
  if (!clean) return null;

  // 1. Check synchronous cache
  const syncMatch = lookupWordNetSync(clean);
  if (syncMatch) return syncMatch;

  // 2. Load chunk
  const charKey = getCharKey(clean);
  const chunk = await loadWordNetChunk(charKey);
  if (chunk && chunk[clean]) {
    return formatWordNetEntry(clean, chunk[clean]!);
  }

  return null;
}
