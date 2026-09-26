/**
 * FreeDict Arabic -> English Real Database Adapter
 * Backed by 69,191 authentic entries parsed from official FreeDict ara-eng and eng-ara TEI XMLs.
 * Uses synchronous core memory cache for instant lookups + dynamic letter chunk loading.
 */

import { normalizeArabic, generateArabicCandidates } from "./arabic-morphology";
import coreFreeDictData from "./data/freedict/core.json";

export type FreeDictEntry = {
  arLemma: string;
  translations: string[];
};

// Core high-frequency entries loaded synchronously in memory
const coreFreeDict = coreFreeDictData as Record<string, string[]>;

// In-memory cache of loaded character chunks
const loadedChunks = new Map<string, Record<string, string[]>>();

// Vite glob import of all FreeDict letter chunks (when running in Vite)
const chunkLoaders: Record<string, () => Promise<unknown>> =
  typeof import.meta !== "undefined" && typeof (import.meta as any).glob === "function"
    ? (import.meta as any).glob("./data/freedict/*.json")
    : {};

/** Convert Arabic character to 4-digit hex filename (e.g. 'ح' -> '062d') */
function getCharHex(char: string): string {
  if (!char) return "";
  return char.charCodeAt(0).toString(16).padStart(4, "0");
}

/** Asynchronously loads the FreeDict chunk for a given Arabic letter */
async function loadFreeDictChunk(firstChar: string): Promise<Record<string, string[]> | null> {
  const hex = getCharHex(firstChar);
  if (!hex) return null;

  if (loadedChunks.has(hex)) {
    return loadedChunks.get(hex)!;
  }

  const chunkPath = `./data/freedict/${hex}.json`;
  const loader = chunkLoaders[chunkPath];
  if (loader) {
    try {
      const mod = (await loader()) as { default?: Record<string, string[]> } | Record<string, string[]>;
      const data = (mod && "default" in mod && mod.default ? mod.default : mod) as Record<string, string[]>;
      loadedChunks.set(hex, data);
      return data;
    } catch {
      return null;
    }
  }

  // Node.js runtime fallback
  if (typeof process !== "undefined" && process.versions?.node) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const fullPath = path.resolve(__dirname, `data/freedict/${hex}.json`);
      if (fs.existsSync(fullPath)) {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const data = JSON.parse(raw) as Record<string, string[]>;
        loadedChunks.set(hex, data);
        return data;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/** Synchronous lookup in core memory cache */
export function lookupFreeDictSync(arWord: string): FreeDictEntry | null {
  const norm = normalizeArabic(arWord);
  if (!norm) return null;

  if (coreFreeDict[norm]) {
    return {
      arLemma: norm,
      translations: coreFreeDict[norm]!,
    };
  }

  // Check loaded chunks in memory
  const hex = getCharHex(norm[0] || "");
  if (hex && loadedChunks.has(hex)) {
    const chunk = loadedChunks.get(hex)!;
    if (chunk[norm]) {
      return {
        arLemma: norm,
        translations: chunk[norm]!,
      };
    }
  }

  return null;
}

/** Full asynchronous lookup against all 69,191 FreeDict entries */
export async function lookupFreeDict(arWord: string): Promise<FreeDictEntry | null> {
  const norm = normalizeArabic(arWord);
  if (!norm) return null;

  // 1. Check synchronous memory cache
  const syncMatch = lookupFreeDictSync(norm);
  if (syncMatch) return syncMatch;

  // 2. Load chunk for this character
  const chunk = await loadFreeDictChunk(norm[0] || "");
  if (chunk && chunk[norm]) {
    return {
      arLemma: norm,
      translations: chunk[norm]!,
    };
  }

  return null;
}

/**
 * High-performance morphological resolver:
 * Generates valid Arabic candidate stems and queries FreeDict chunks to find the true verified lemma.
 */
export async function resolveArabicLemmaWithFreeDict(
  rawWord: string,
): Promise<{ lemma: string; entry: FreeDictEntry | null }> {
  const candidates = generateArabicCandidates(rawWord);
  if (candidates.length === 0) {
    const norm = normalizeArabic(rawWord);
    return { lemma: norm, entry: null };
  }

  // Group candidates by first character to minimize chunk loads
  const byFirstChar = new Map<string, string[]>();
  for (const cand of candidates) {
    const ch = cand[0];
    if (ch) {
      if (!byFirstChar.has(ch)) byFirstChar.set(ch, []);
      byFirstChar.get(ch)!.push(cand);
    }
  }

  // Pre-load all required chunks in parallel
  await Promise.all(Array.from(byFirstChar.keys()).map((ch) => loadFreeDictChunk(ch)));

  // Find first candidate that exists in FreeDict
  for (const cand of candidates) {
    const match = await lookupFreeDict(cand);
    if (match && match.translations.length > 0) {
      return {
        lemma: cand,
        entry: match,
      };
    }
  }

  // If no dictionary match found, return the most probable morphological stem
  const fallbackLemma = candidates[1] || candidates[0] || normalizeArabic(rawWord);
  return {
    lemma: fallbackLemma,
    entry: null,
  };
}
