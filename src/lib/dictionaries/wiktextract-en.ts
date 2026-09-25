/**
 * Wiktextract / Local Wiktionary Dataset
 * Provides lexical etymologies, phonetic notation, linguistic usage notes, and literary examples.
 */

export type WiktextractSense = {
  pos: string;
  definition: string;
  arabicTranslation: string;
  arabicDefinition: string;
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

export const WIKTEXTRACT_DATA: Record<string, WiktextractEntry> = {
  play: {
    word: "play",
    phonetic: "/pleɪ/",
    etymology:
      "From Middle English pleyen, from Old English plegan, plegian (“to play, exercise, frolic”).",
    senses: [
      {
        pos: "verb",
        definition: "To engage in recreation, sport, or amusement; to frolic.",
        arabicTranslation: "لعب / يلهو / يمرح",
        arabicDefinition: "ممارسة الألعاب والأنشطة الترويحية المسلية.",
        examples: [
          "The team played with exceptional discipline and camaraderie.",
          "We played along the riverbank as children.",
        ],
        synonyms: ["frolic", "sport", "recreate", "compete"],
      },
    ],
  },
  shortness: {
    word: "shortness",
    phonetic: "/ˈʃɔːrt.nəs/",
    etymology:
      "From Middle English shortness, from Old English sceortnes; equivalent to short +‎ -ness.",
    senses: [
      {
        pos: "noun",
        definition:
          "The state, quality, or condition of being short in duration or small in length.",
        arabicTranslation: "قِصَر / وجازة / ضيق المدى الزمني",
        arabicDefinition: "خاصية أو حالة قلة المدى الزمني أو ضيق الأجل وعجلة فناء اللحظات.",
        examples: [
          "Seneca wrote extensively on the shortness of mortal existence.",
          "The shortness of time compels us to focus on what is truly essential.",
        ],
        synonyms: ["brevity", "briefness", "fleetingness", "ephemerality"],
      },
    ],
  },
  short: {
    word: "short",
    phonetic: "/ʃɔːrt/",
    etymology:
      "From Middle English short, from Old English sceort (“short”), from Proto-Germanic *skurtaz.",
    senses: [
      {
        pos: "adjective",
        definition: "Having a small distance from one end to the other; lasting a brief time.",
        arabicTranslation: "قصير / وجيز / عابر",
        arabicDefinition: "ما كان قليل الامتداد في الزمان أو المكان وسريع الانقضاء.",
        examples: [
          "We are not given a short life, but we make it short.",
          "A short statement clarified the entire situation.",
        ],
        synonyms: ["brief", "compact", "fleeting", "transitory"],
      },
    ],
  },
  waste: {
    word: "waste",
    phonetic: "/weɪst/",
    etymology:
      "From Anglo-Norman wast, from Old Northern French waster, from Latin vastāre (“to lay waste”).",
    senses: [
      {
        pos: "verb",
        definition: "To expend carelessly, extravagantly, or to no purpose; squander.",
        arabicTranslation: "يهدر / يبدد / يُضيع",
        arabicDefinition: "صرف الموارد الثمينة والأوقات في غير موضعها وبلا نفع أو بصيرة.",
        examples: [
          "We waste a great portion of our days on trivial pursuits.",
          "Never waste energy on things outside your moral control.",
        ],
        synonyms: ["squander", "dissipate", "misspend", "fritter away"],
      },
    ],
  },
  wasteful: {
    word: "wasteful",
    phonetic: "/ˈweɪst.fəl/",
    etymology: "From waste +‎ -ful.",
    senses: [
      {
        pos: "adjective",
        definition: "Disposed to waste; spending carelessly or prodigally.",
        arabicTranslation: "مسرف / مفرط / مبذر",
        arabicDefinition: "صفة من يتجاوز حد القصد والاعتدال في إنفاق وقته أو جهده أو ماله.",
        examples: [
          "We are not ill-supplied with time, but wasteful of it.",
          "A wasteful society disregards the intrinsic value of time.",
        ],
        synonyms: ["extravagant", "prodigal", "spendthrift", "lavish"],
      },
    ],
  },
  generous: {
    word: "generous",
    phonetic: "/ˈdʒen.ər.əs/",
    etymology:
      "From Latin generōsus (“of noble birth, noble-minded”), from genus (“kin, race, birth”).",
    senses: [
      {
        pos: "adjective",
        definition:
          "Noble in origin; high-minded; liberal in bestowing gifts or bounties; abundant in quantity.",
        arabicTranslation: "سخي / وافر / كريم / معطاء",
        arabicDefinition:
          "الفيض في العطاء والوفرة في المقدار؛ ما يتجاوز حد الكفاية ويسع أعظم الغايات.",
        examples: [
          "A sufficiently generous lifespan has been granted to human beings.",
          "Her generous spirit inspired everyone around her.",
        ],
        synonyms: ["bountiful", "magnanimous", "charitable", "abundant", "ample"],
      },
    ],
  },
  achievement: {
    word: "achievement",
    phonetic: "/əˈtʃiːv.mənt/",
    etymology: "From achieve +‎ -ment; ultimately from Old French achever (“to finish”).",
    senses: [
      {
        pos: "noun",
        definition: "The act of achieving or performing; an accomplishment of great significance.",
        arabicTranslation: "إنجاز / مأثرة / كسب معرفي",
        arabicDefinition: "العمل العظيم المتحقق بفضل العزيمة الصادقة والمهارة الرفيعة.",
        examples: [
          "Life is long enough for the highest intellectual achievements.",
          "The completion of the bilingual library was a historic achievement.",
        ],
        synonyms: ["accomplishment", "attainment", "feat", "triumph"],
      },
    ],
  },
  wisdom: {
    word: "wisdom",
    phonetic: "/ˈwɪz.dəm/",
    etymology:
      "From Middle English wisdom, from Old English wīsdōm, from wīs (“wise”) + -dōm (“-dom”).",
    senses: [
      {
        pos: "noun",
        definition:
          "The ability to think and act using knowledge, experience, understanding, and common sense.",
        arabicTranslation: "حكمة / بصيرة نافذة / رجاحة عقل",
        arabicDefinition: "وضع الأمور في نصابها الصحيح، وسداد الرأي، وإدراك حقائق الوجود والفضيلة.",
        examples: [
          "True wisdom is the tranquil haven of the philosophic soul.",
          "He sought wisdom from the venerable masters of ancient philosophy.",
        ],
        synonyms: ["sagacity", "prudence", "insight", "discernment"],
      },
    ],
  },
  knowledge: {
    word: "knowledge",
    phonetic: "/ˈnɒl.ɪdʒ/",
    etymology: "From Middle English knouleche, knowleche, equivalent to know +‎ -leche.",
    senses: [
      {
        pos: "noun",
        definition:
          "Familiarity, awareness, or understanding of someone or something, such as facts or skills.",
        arabicTranslation: "معرفة / علم / إدراك ودراية",
        arabicDefinition: "مجموع الحقائق والعلوم والأصول المستخلصة بالبحث والدراسة الواعية.",
        examples: [
          "Knowledge transforms human existence into purposeful striving.",
          "The pursuit of philosophical knowledge is a lifelong endeavor.",
        ],
        synonyms: ["learning", "erudition", "scholarship", "understanding"],
      },
    ],
  },
  soul: {
    word: "soul",
    phonetic: "/soʊl/",
    etymology:
      "From Middle English soule, saule, from Old English sāwol, from Proto-West Germanic *saiwalu.",
    senses: [
      {
        pos: "noun",
        definition: "The spirit or essence of a person, usually considered immortal.",
        arabicTranslation: "روح / نفس / مهجة باطنية",
        arabicDefinition:
          "الجوهر اللطيف والسر الإلهي غير المادي في الكيان البشري؛ مركز الوعي والضمير.",
        examples: [
          "Philosophy is the medicine and sanctuary of the soul.",
          "Peace of soul is achieved through moral integrity.",
        ],
        synonyms: ["spirit", "psyche", "inner self", "essence"],
      },
    ],
  },
  mind: {
    word: "mind",
    phonetic: "/maɪnd/",
    etymology:
      "From Middle English mind, mynd, from Old English gemynd (“memory, thought, intention”).",
    senses: [
      {
        pos: "noun",
        definition:
          "The element of conscious reasoning and cognition that enables a person to think and judge.",
        arabicTranslation: "عقل / ذهن / قوة التفكير",
        arabicDefinition:
          "الملكة الإدراكية المفكرة التي تميز الإنسان وتمكنه من الفهم والتحليل والموازنة.",
        examples: [
          "A well-governed mind is invulnerable to outer turbulence.",
          "Cultivating the mind is the highest human duty.",
        ],
        synonyms: ["intellect", "reason", "brain", "understanding"],
      },
    ],
  },
  virtue: {
    word: "virtue",
    phonetic: "/ˈvɜːr.tʃuː/",
    etymology:
      "From Anglo-Norman vertu, from Latin virtūs (“manliness, excellence, moral worth”), from vir (“man”).",
    senses: [
      {
        pos: "noun",
        definition:
          "Moral excellence and righteousness; goodness; a beneficial quality or attribute.",
        arabicTranslation: "فضيلة / مكرمة / استقامة وخلق رفيع",
        arabicDefinition:
          "التمسك بأسمى الأخلاق والمروءة والعدل؛ الصفة الجامعة للخير في النفس البشرية.",
        examples: [
          "Virtue is self-sufficient for a noble and tranquil life.",
          "He lived in strict accordance with the classical principles of virtue.",
        ],
        synonyms: ["righteousness", "integrity", "nobility", "goodness"],
      },
    ],
  },
  discipline: {
    word: "discipline",
    phonetic: "/ˈdɪs.ə.plɪn/",
    etymology:
      "From Old French descepline, from Latin disciplīna (“instruction, training, knowledge”).",
    senses: [
      {
        pos: "noun",
        definition: "The practice of training people or oneself to obey rules or codes of conduct.",
        arabicTranslation: "انضباط / سيطرة ذاتية وحزم",
        arabicDefinition: "الالتزام بالنظام والقواعد ومجاهدة النفس على التقيد بالسلوك القويم.",
        examples: [
          "Discipline transforms intentions into enduring results.",
          "Daily reading requires intellectual discipline.",
        ],
        synonyms: ["self-control", "orderliness", "regulation"],
      },
    ],
  },
  productive: {
    word: "productive",
    phonetic: "/prəˈdʌk.tɪv/",
    etymology: "From Medieval Latin prōductīvus, from Latin prōdūcere (“to bring forth, produce”).",
    senses: [
      {
        pos: "adjective",
        definition: "Yielding favorable or useful results; constructive.",
        arabicTranslation: "مُنْتِج / مثمر وذو نفع كبير",
        arabicDefinition: "ما كان ذا نفع وعائد إيجابي ومردود ملموس على الجهد والوقت.",
        examples: [
          "Careful study makes time profoundly productive.",
          "A productive mind focuses on what can be achieved.",
        ],
        synonyms: ["fruitful", "efficient", "constructive"],
      },
    ],
  },
  productivity: {
    word: "productivity",
    phonetic: "/ˌproʊ.dʌkˈtɪv.ə.t̬i/",
    etymology: "From productive + -ity.",
    senses: [
      {
        pos: "noun",
        definition: "The state or quality of being productive; effectiveness of effort.",
        arabicTranslation: "الإنتاجية / كفاءة العمل ومعدل الإنجاز",
        arabicDefinition: "مستوى الكفاءة في تحويل الموارد والجهد إلى نتائج وثمار ملموسة.",
        examples: ["Focus and discipline multiply personal productivity."],
        synonyms: ["output", "yield", "efficiency"],
      },
    ],
  },
  sustainable: {
    word: "sustainable",
    phonetic: "/səˈsteɪ.nə.bəl/",
    etymology: "From sustain + -able.",
    senses: [
      {
        pos: "adjective",
        definition: "Able to be maintained at a certain rate or level without exhaustion.",
        arabicTranslation: "مستدام / قابل للبقاء والاستمرار",
        arabicDefinition: "القادر على الدوام والاستمرار دون إنهاك للموارد أو تضييع للطاقة.",
        examples: ["Consistent daily effort creates a sustainable routine."],
        synonyms: ["maintainable", "durable", "viable"],
      },
    ],
  },
};

/** Look up an English lemma in Wiktextract */
export function lookupWiktextract(word: string): WiktextractEntry | null {
  const clean = word.toLowerCase().trim();
  if (WIKTEXTRACT_DATA[clean]) return WIKTEXTRACT_DATA[clean]!;
  return null;
}
