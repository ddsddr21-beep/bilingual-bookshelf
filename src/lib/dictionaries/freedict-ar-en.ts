/**
 * FreeDict Arabic -> English Lexicon Database
 * Provides multi-candidate English translation mappings for Arabic lemmas and roots.
 */

import { normalizeArabic } from "./farahidi-stemmer";

export type FreeDictEntry = {
  arLemma: string;
  pos: string;
  translations: string[]; // Potential English counterparts
  arExplanation: string;
};

export const FREEDICT_AR_EN: Record<string, FreeDictEntry> = {
  لعب: {
    arLemma: "لعب",
    pos: "فعل / اسم",
    translations: ["play", "game", "sport", "act", "frolic"],
    arExplanation: "ضد الجد، اللهو والمرح، وممارسة الألعاب الرياضية والتمثيل.",
  },
  هدر: {
    arLemma: "هدر",
    pos: "فعل / اسم",
    translations: ["waste", "squander", "dissipate", "forfeit", "nullify"],
    arExplanation: "إضاعة الشيء وإتلافه وصرفه في غير طائل ولا منفعة.",
  },
  سرف: {
    arLemma: "سرف",
    pos: "فعل / مصدر",
    translations: ["wasteful", "extravagant", "excessive", "squander", "prodigal"],
    arExplanation: "مجاوزة الحد والاعتدال في إنفاق الموارد والوقت.",
  },
  قصر: {
    arLemma: "قصر",
    pos: "اسم / مصدر",
    translations: ["shortness", "brevity", "palace", "short", "curtailment"],
    arExplanation: "قلة المدى الزمني أو المكاني، وضد الطول والامتداد.",
  },
  قصير: {
    arLemma: "قصير",
    pos: "صفة",
    translations: ["short", "brief", "fleeting", "curt", "limited"],
    arExplanation: "ما كان قليل المدة أو الحجم؛ العابر سريع الانقضاء.",
  },
  طول: {
    arLemma: "طول",
    pos: "اسم / مصدر",
    translations: ["length", "long", "duration", "span", "longevity"],
    arExplanation: "الامتداد في الزمان أو المكان.",
  },
  طويل: {
    arLemma: "طويل",
    pos: "صفة",
    translations: ["long", "extended", "lengthy", "prolonged", "enduring"],
    arExplanation: "الممتد في الأجل والزمان، ضد القصير.",
  },
  اعطى: {
    arLemma: "اعطى",
    pos: "فعل",
    translations: ["give", "grant", "bestow", "supply", "furnish"],
    arExplanation: "بذل الشيء ومنحه طواعية للغير.",
  },
  جعل: {
    arLemma: "جعل",
    pos: "فعل",
    translations: ["make", "render", "create", "appoint", "cause"],
    arExplanation: "صير الشيء أو أوجده وصنعه على هيئة معينة.",
  },
  حياة: {
    arLemma: "حياة",
    pos: "اسم",
    translations: ["life", "existence", "living", "vitality", "being"],
    arExplanation: "الوجود والعيش والمدة التي يقضيها الكائن الحي قبل الممات.",
  },
  وقت: {
    arLemma: "وقت",
    pos: "اسم",
    translations: ["time", "period", "season", "moment", "era"],
    arExplanation: "المقدار المحدد من الزمان، والأوان المناسب للأعمال.",
  },
  زمن: {
    arLemma: "زمن",
    pos: "اسم",
    translations: ["time", "era", "age", "period", "epoch"],
    arExplanation: "الامتداد المستمر للوجود واللحظات المتتالية.",
  },
  كرم: {
    arLemma: "كرم",
    pos: "مصدر / اسم",
    translations: ["generosity", "nobility", "honor", "bounty", "largesse"],
    arExplanation: "الجود والسخاء وبذل الفضل برحابة صدر.",
  },
  سخي: {
    arLemma: "سخي",
    pos: "صفة",
    translations: ["generous", "bountiful", "magnanimous", "liberal", "ample"],
    arExplanation: "الكريم الوافر العطاء الذي لا يقتر في البذل.",
  },
  انجز: {
    arLemma: "انجز",
    pos: "فعل",
    translations: ["achieve", "accomplish", "attain", "fulfill", "execute"],
    arExplanation: "إتمام العمل وبلوغ الغاية المرجوة منه بنجاح.",
  },
  انجاز: {
    arLemma: "انجاز",
    pos: "اسم / مصدر",
    translations: ["achievement", "accomplishment", "feat", "attainment", "success"],
    arExplanation: "المأثرة والعمل المكتمل بنجاح وتفوق.",
  },
  حكم: {
    arLemma: "حكم",
    pos: "فعل / اسم",
    translations: ["judge", "rule", "govern", "decide"],
    arExplanation: "الفصل بين الأمور بالقسط وإصدار القرار.",
  },
  حكمة: {
    arLemma: "حكمة",
    pos: "اسم",
    translations: ["wisdom", "sagacity", "prudence", "insight", "philosophy"],
    arExplanation: "وضع الشيء في موضعه وسداد الرأي وإدراك كنه الأمور.",
  },
  علم: {
    arLemma: "علم",
    pos: "اسم / مصدر",
    translations: ["knowledge", "science", "learning", "scholarship", "erudition"],
    arExplanation: "إدراك الشيء على حقيقته واكتساب المعارف البينة.",
  },
  عرف: {
    arLemma: "عرف",
    pos: "فعل",
    translations: ["know", "recognize", "perceive", "acknowledge", "identify"],
    arExplanation: "الإدراك والتمييز بالبصيرة والعقل.",
  },
  معرفة: {
    arLemma: "معرفة",
    pos: "اسم",
    translations: ["knowledge", "awareness", "understanding", "cognition", "insight"],
    arExplanation: "مجموع الفهم والخبرات المكتسبة بالتعلم والتجربة.",
  },
  عقل: {
    arLemma: "عقل",
    pos: "اسم / مصدر",
    translations: ["mind", "intellect", "reason", "brain", "wit"],
    arExplanation: "الملكة الإدراكية المفكرة المانعة من ارتكاب القبيح.",
  },
  فكر: {
    arLemma: "فكر",
    pos: "اسم / مصدر",
    translations: ["thought", "mind", "intellect", "thinking", "reflection"],
    arExplanation: "إعمال الخاطر في الشيء للوصول إلى الحقيقة والصواب.",
  },
  روح: {
    arLemma: "روح",
    pos: "اسم",
    translations: ["soul", "spirit", "psyche", "animus", "ghost"],
    arExplanation: "الجوهر الإلهي اللطيف الذي به حياة الجسد ووعيه.",
  },
  نفس: {
    arLemma: "نفس",
    pos: "اسم",
    translations: ["soul", "self", "psyche", "mind", "person"],
    arExplanation: "الذات الإنسانية ومقر المشاعر والرغبات.",
  },
  فضيلة: {
    arLemma: "فضيلة",
    pos: "اسم",
    translations: ["virtue", "righteousness", "merit", "excellence", "goodness"],
    arExplanation: "الدرجة الرفيعة في حسن الخلق والاستقامة.",
  },
  جمال: {
    arLemma: "جمال",
    pos: "اسم",
    translations: ["beauty", "grace", "splendor", "elegance", "loveliness"],
    arExplanation: "حسن الصورة والصفات الباعث على البهجة والاستحسان.",
  },
  كتاب: {
    arLemma: "كتاب",
    pos: "اسم",
    translations: ["book", "volume", "tome", "treatise", "scripture"],
    arExplanation: "الصحف المجموعة المكتوبة المشتملة على العلوم والآداب.",
  },
  قرا: {
    arLemma: "قرا",
    pos: "فعل",
    translations: ["read", "recite", "study", "peruse"],
    arExplanation: "تتبع الكلمات المكتوبة والاطلاع على معانيها.",
  },
  قراءة: {
    arLemma: "قراءة",
    pos: "اسم / مصدر",
    translations: ["reading", "perusal", "recitation", "study", "interpretation"],
    arExplanation: "فعل المطالعة وتدبر النصوص المكتوبة.",
  },
  ترجم: {
    arLemma: "ترجم",
    pos: "فعل",
    translations: ["translate", "interpret", "render", "explain"],
    arExplanation: "نقل الكلام من لغة إلى لغة أخرى.",
  },
  ترجمة: {
    arLemma: "ترجمة",
    pos: "اسم / مصدر",
    translations: ["translation", "rendering", "interpretation", "biography"],
    arExplanation: "فن نقل الأفكار والنصوص بين اللغات.",
  },
  كفى: {
    arLemma: "كفى",
    pos: "فعل",
    translations: ["suffice", "satisfy", "adequate", "sufficiently"],
    arExplanation: "بلوغ حد الحاجة والاستغناء عن الزيادة.",
  },
  فقر: {
    arLemma: "فقر",
    pos: "اسم / مصدر",
    translations: ["poverty", "ill-supplied", "lack", "need", "scarcity"],
    arExplanation: "العوز وقلة الموارد والحاجة الماسة.",
  },
  قدر: {
    arLemma: "قدر",
    pos: "اسم",
    translations: ["amount", "measure", "destiny", "fate", "degree"],
    arExplanation: "المقدار والكمية أو الشأن والمكانة.",
  },
  ضبط: {
    arLemma: "ضبط",
    pos: "فعل / مصدر",
    translations: ["discipline", "control", "regulate", "adjust", "precision"],
    arExplanation: "إحكام الشيء وحفظه بحزم ومنع الخلل فيه.",
  },
  انضباط: {
    arLemma: "انضباط",
    pos: "اسم / مصدر",
    translations: ["discipline", "self-control", "orderliness", "regularity"],
    arExplanation: "الالتزام بالنظام والقواعد والتحكم بالنفس.",
  },
};

/** Look up an Arabic lemma in FreeDict */
export function lookupFreeDict(arLemma: string): FreeDictEntry | null {
  const norm = normalizeArabic(arLemma);
  if (FREEDICT_AR_EN[norm]) return FREEDICT_AR_EN[norm]!;
  return null;
}
