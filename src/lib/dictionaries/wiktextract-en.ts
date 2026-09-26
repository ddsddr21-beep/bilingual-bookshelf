/**
 * Wiktextract & IPA Phonetic Real Database Adapter
 * Backed by 145,388 words and 125,927 authentic IPA pronunciations extracted from Wiktextract and IPA-dict.
 * Supports synchronous lookups on high-frequency core lexicon + dynamic letter chunk loading.
 */

import coreWiktextractData from "./data/wiktextract/core.json";

export type WiktextractSense = {
  pos: string;
  definition: string;
  arabicTranslation?: string;
  arabicDefinition?: string;
  etymology?: string;
  phonetic?: string;
  examples: string[];
  synonyms: string[];
};

export type WiktextractEntry = {
  word: string;
  phonetic?: string;
  etymology?: string;
  senses: WiktextractSense[];
};

type RawWiktextractEntry = {
  ipa?: string;
  senses: Array<{
    pos: string;
    gloss: string;
    examples: string[];
  }>;
};

// Core high-frequency entries loaded synchronously
const coreWiktextract = coreWiktextractData as Record<string, RawWiktextractEntry>;

// In-memory cache of loaded character chunks
const loadedWiktextractChunks = new Map<string, Record<string, RawWiktextractEntry>>();

// Vite glob import for all Wiktextract letter chunks
const wiktextractChunkLoaders: Record<string, () => Promise<unknown>> =
  typeof (
    import.meta as unknown as { glob?: (pattern: string) => Record<string, () => Promise<unknown>> }
  ).glob === "function"
    ? (
        import.meta as unknown as {
          glob: (pattern: string) => Record<string, () => Promise<unknown>>;
        }
      ).glob("./data/wiktextract/*.json")
    : {};

function getCharKey(word: string): string {
  if (!word) return "_other";
  const first = word[0]!.toLowerCase();
  if (first >= "a" && first <= "z") return first;
  return "_other";
}

/** Asynchronously loads a Wiktextract letter chunk into memory */
export async function loadWiktextractChunk(
  charKey: string,
): Promise<Record<string, RawWiktextractEntry> | null> {
  const key = charKey.toLowerCase();
  if (loadedWiktextractChunks.has(key)) {
    return loadedWiktextractChunks.get(key)!;
  }

  const chunkPath = `./data/wiktextract/${key}.json`;
  const loader = wiktextractChunkLoaders[chunkPath];

  try {
    let data: Record<string, RawWiktextractEntry> | null = null;
    if (loader) {
      const mod = (await loader()) as
        { default?: Record<string, RawWiktextractEntry> } | Record<string, RawWiktextractEntry>;
      data = (mod && "default" in mod && mod.default ? mod.default : mod) as Record<
        string,
        RawWiktextractEntry
      >;
    } else {
      const mod = (await import(`./data/wiktextract/${key}.json`)) as {
        default?: Record<string, RawWiktextractEntry>;
      };
      data = mod.default || (mod as unknown as Record<string, RawWiktextractEntry>);
    }

    if (data) {
      loadedWiktextractChunks.set(key, data);
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

function formatWiktextractEntry(word: string, raw: RawWiktextractEntry): WiktextractEntry {
  return {
    word,
    phonetic: raw.ipa || undefined,
    senses: (raw.senses || []).map((s) => ({
      pos: s.pos || "word",
      definition: s.gloss,
      examples: s.examples || [],
      synonyms: [],
    })),
  };
}

/** Synchronous lookup against core cache and already loaded chunks */
export function lookupWiktextractSync(word: string): WiktextractEntry | null {
  const clean = word.toLowerCase().trim();
  if (!clean) return null;

  if (coreWiktextract[clean]) {
    return formatWiktextractEntry(clean, coreWiktextract[clean]!);
  }

  const charKey = getCharKey(clean);
  if (loadedWiktextractChunks.has(charKey)) {
    const chunk = loadedWiktextractChunks.get(charKey)!;
    if (chunk[clean]) {
      return formatWiktextractEntry(clean, chunk[clean]!);
    }
  }

  return null;
}

/** Full asynchronous lookup against Wiktextract and IPA databases */
export async function lookupWiktextract(word: string): Promise<WiktextractEntry | null> {
  const clean = word.toLowerCase().trim();
  if (!clean) return null;

  // 1. Check synchronous cache
  const syncMatch = lookupWiktextractSync(clean);
  if (syncMatch) return syncMatch;

  // 2. Load chunk
  const charKey = getCharKey(clean);
  const chunk = await loadWiktextractChunk(charKey);
  if (chunk && chunk[clean]) {
    return formatWiktextractEntry(clean, chunk[clean]!);
  }

  return null;
}
