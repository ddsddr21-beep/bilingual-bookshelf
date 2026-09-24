// Core domain logic for the bilingual reading sanctuary.

export type Pair = { en: string; ar: string };

export type ReaderLayout = "stacked" | "side" | "single";
export type SanctuaryTheme = "midnight" | "parchment" | "emerald";
export type EnFont = "literary" | "editorial" | "modern";
export type ArFont = "naskh" | "amiri";
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
  title: string;
  en: string;
  ar: string;
  separator: string;
  updatedAt: number;
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
const SETTINGS_KEY = "mihrab.settings.v1";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split a text into segments using a user-chosen marker placed before each sentence. */
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
  const parts = text.split(new RegExp(escapeRegExp(marker), "g"));
  const segments = parts.map((s) => s.trim()).filter(Boolean);
  if (segments.length > 0) return segments;
  return [text];
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

export function loadDoc(): TextDoc | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DOC_KEY);
    return raw ? (JSON.parse(raw) as TextDoc) : null;
  } catch {
    return null;
  }
}

export function saveDoc(doc: TextDoc) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOC_KEY, JSON.stringify(doc));
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
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
  modern: "font-modern",
};

export const AR_FONT_CLASS: Record<ArFont, string> = {
  naskh: "font-naskh",
  amiri: "font-amiri",
};

export const SAMPLE: TextDoc = {
  title: "Seneca — On the Shortness of Life",
  separator: "#",
  updatedAt: 0,
  en: `# It is not that we have a short time to live, but that we waste a lot of it.
# Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements.
# We are not given a short life, but we make it short, and we are not ill-supplied but wasteful of it.`,
  ar: `# ليست المشكلة أن حياتنا قصيرة، بل أننا نُهدر كثيراً منها.
# الحياة طويلة بما يكفي، وقد أُعطينا منها قدراً سخياً يتّسع لأعظم الإنجازات.
# لم تُمنح لنا حياة قصيرة، لكننا نجعلها قصيرة، ولسنا فقراء فيها بل مسرفون.`,
};
