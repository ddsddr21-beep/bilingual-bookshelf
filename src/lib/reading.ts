// Core domain logic for the bilingual reading sanctuary.

export type Pair = { en: string; ar: string };

export type ReaderLayout = "stacked" | "side" | "single";
export type SanctuaryTheme = "parchment" | "midnight" | "emerald" | "sand" | "royal";
export type EnFont = "literary" | "editorial" | "cormorant" | "modern" | "mono";
export type ArFont = "naskh" | "amiri" | "kufi" | "tajawal" | "aref";
export type SingleSide = "en" | "ar";

export type Settings = {
  layout: ReaderLayout;
  theme: SanctuaryTheme;
  enFont: EnFont;
  arFont: ArFont;
  single: SingleSide;
  fontSize: number;
  lineHeight: number;
  revealTranslation: boolean;
  separator: string;
};

export type TextDoc = {
  id?: string;
  title: string;
  en: string;
  ar: string;
  separator: string;
  updatedAt: number;
  isFavorite?: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  layout: "stacked",
  theme: "parchment",
  enFont: "literary",
  arFont: "naskh",
  single: "en",
  fontSize: 19,
  lineHeight: 1.9,
  revealTranslation: true,
  separator: "#",
};

const DOC_KEY = "mihrab.doc.v1";
const HISTORY_KEY = "mihrab.alignment_history.v2";
const ACTIVE_ID_KEY = "mihrab.active_doc_id.v2";
const SETTINGS_KEY = "mihrab.settings.v1";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split a text into segments using a user-chosen marker placed before sentences or after commas/newlines inside paragraphs. */
export function splitByMarker(raw: string, separator: string): string[] {
  const text = (raw ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];
  const marker = separator.trim();
  if (!marker) {
    return text
      .split(/\n\s*\n|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // Regex to match the marker whether at line start, after commas (`,`, `،`), or inside paragraphs
  const escaped = escapeRegExp(marker);
  const parts = text.split(new RegExp(escaped, "g"));
  const segments = parts.map((s) => s.trim()).filter(Boolean);

  if (segments.length > 0) return segments;
  return [text];
}

/** Utility to automatically insert separator markers after commas (`,`, `،`) or at start of lines for paragraph text. */
export function autoInsertMarkersAfterCommasAndLines(text: string, marker: string = "#"): string {
  if (!text) return "";
  const sep = marker.trim() || "#";
  // Replace newlines that don't already have marker
  let formatted = text.replace(/^([^\n#])/gm, `${sep} $1`);
  // Insert marker after commas followed by whitespace if marker not already present
  formatted = formatted.replace(/([,،])\s*(?!#)/g, `$1 ${sep} `);
  return formatted;
}

export function buildPairs(en: string, ar: string, separator: string): Pair[] {
  const enParts = splitByMarker(en, separator);
  const arParts = splitByMarker(ar, separator);
  const length = Math.max(enParts.length, arParts.length);
  const pairs: Pair[] = [];
  for (let i = 0; i < length; i += 1) {
    pairs.push({ en: enParts[i] ?? "", ar: arParts[i] ?? "" });
  }
  return pairs;
}

export const SAMPLE: TextDoc = {
  id: "sample_seneca",
  title: "Seneca — On the Shortness of Life",
  separator: "#",
  updatedAt: 1700000000000,
  en: `# It is not that we have a short time to live, # but that we waste a lot of it.
# Life is long enough, # and a sufficiently generous amount has been given to us for the highest achievements.
# We are not given a short life, # but we make it short, # and we are not ill-supplied but wasteful of it.`,
  ar: `# ليست المشكلة أن حياتنا قصيرة، # بل أننا نُهدر كثيراً منها.
# الحياة طويلة بما يكفي، # وقد أُعطينا منها قدراً سخياً يتّسع لأعظم الإنجازات.
# لم تُمنح لنا حياة قصيرة، # لكننا نجعلها قصيرة، # ولسنا فقراء فيها بل مسرفون.`,
};

export function getAlignmentHistory(): TextDoc[] {
  if (typeof window === "undefined") return [SAMPLE];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TextDoc[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
      }
    }
    // Migration check: if old DOC_KEY exists, wrap it as first history item
    const oldRaw = window.localStorage.getItem(DOC_KEY);
    if (oldRaw) {
      const oldDoc = JSON.parse(oldRaw) as TextDoc;
      if (oldDoc && (oldDoc.en || oldDoc.ar)) {
        const migrated: TextDoc = {
          ...oldDoc,
          id: oldDoc.id || `doc_${Date.now()}`,
          updatedAt: oldDoc.updatedAt || Date.now(),
        };
        const initialList = [migrated, SAMPLE];
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(initialList));
        window.localStorage.setItem(ACTIVE_ID_KEY, migrated.id);
        return initialList;
      }
    }
    // Default fallback
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([SAMPLE]));
    window.localStorage.setItem(ACTIVE_ID_KEY, SAMPLE.id!);
    return [SAMPLE];
  } catch {
    return [SAMPLE];
  }
}

export function saveAlignmentHistory(history: TextDoc[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // quota exceeded or private mode
  }
}

export function getActiveDocId(): string {
  if (typeof window === "undefined") return SAMPLE.id!;
  return window.localStorage.getItem(ACTIVE_ID_KEY) || SAMPLE.id!;
}

export function setActiveDocId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function loadDoc(): TextDoc {
  const history = getAlignmentHistory();
  const activeId = getActiveDocId();
  const found = history.find((d) => d.id === activeId);
  if (found) return found;
  return history[0] || SAMPLE;
}

export function saveDoc(doc: TextDoc): TextDoc {
  if (typeof window === "undefined") return doc;

  const docId = doc.id || `doc_${Date.now()}`;
  const updatedDoc: TextDoc = {
    ...doc,
    id: docId,
    updatedAt: Date.now(),
  };

  const history = getAlignmentHistory();
  const existingIdx = history.findIndex((d) => d.id === docId);

  let newHistory: TextDoc[];
  if (existingIdx >= 0) {
    newHistory = [...history];
    newHistory[existingIdx] = updatedDoc;
  } else {
    newHistory = [updatedDoc, ...history];
  }

  saveAlignmentHistory(newHistory);
  setActiveDocId(docId);
  window.localStorage.setItem(DOC_KEY, JSON.stringify(updatedDoc));

  return updatedDoc;
}

export function deleteDocFromHistory(id: string): TextDoc[] {
  if (typeof window === "undefined") return [SAMPLE];
  const history = getAlignmentHistory();
  const filtered = history.filter((d) => d.id !== id);
  const finalList = filtered.length > 0 ? filtered : [SAMPLE];

  saveAlignmentHistory(finalList);

  if (getActiveDocId() === id) {
    setActiveDocId(finalList[0].id || SAMPLE.id!);
  }

  return finalList;
}

export function createNewAlignmentDoc(): TextDoc {
  const newDoc: TextDoc = {
    id: `doc_${Date.now()}`,
    title: "نص محاذاة جديد",
    en: "",
    ar: "",
    separator: "#",
    updatedAt: Date.now(),
  };
  return saveDoc(newDoc);
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export const EN_FONT_CLASS: Record<EnFont, string> = {
  literary: "font-literary",
  editorial: "font-editorial",
  cormorant: "font-cormorant",
  modern: "font-modern",
  mono: "font-mono",
};

export const AR_FONT_CLASS: Record<ArFont, string> = {
  naskh: "font-naskh",
  amiri: "font-amiri",
  kufi: "font-kufi",
  tajawal: "font-tajawal",
  aref: "font-aref",
};

export const THEME_CLASS: Record<SanctuaryTheme, string> = {
  parchment: "",
  midnight: "dark",
  emerald: "",
  sand: "",
  royal: "dark",
};
