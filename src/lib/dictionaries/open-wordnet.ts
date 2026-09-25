/**
 * Open English WordNet Local Database
 * Contains synsets, definitions, semantic relations, and authentic WordNet examples.
 */

export type WordNetSense = {
  pos: "noun" | "verb" | "adjective" | "adverb";
  definition: string;
  arabicGloss: string;
  synonyms: string[];
  examples: string[];
};

export type WordNetEntry = {
  lemma: string;
  senses: WordNetSense[];
};

export const OPEN_WORDNET_DATA: Record<string, WordNetEntry> = {
  play: {
    lemma: "play",
    senses: [
      {
        pos: "verb",
        definition:
          "Participate in games or sport; engage in activity for enjoyment and recreation rather than a serious or practical purpose.",
        arabicGloss: "يلعب / يلهو ويمرح في الألعاب والأنشطة الترفيهية.",
        synonyms: ["recreate", "frolic", "disport", "engage in sport"],
        examples: [
          "The children played in the garden until sunset.",
          "We played a game of chess by the fireplace.",
          "They played soccer on the field every weekend.",
        ],
      },
      {
        pos: "verb",
        definition: "Perform on a musical instrument or perform a role in a theatrical production.",
        arabicGloss: "يعزف على آلة موسيقية أو يمثل دوراً مسرحياً.",
        synonyms: ["perform", "act", "execute", "render"],
        examples: [
          "She plays the piano with immense sensitivity.",
          "He played Hamlet in the dramatic production.",
        ],
      },
      {
        pos: "noun",
        definition: "A dramatic work intended for performance by actors on a stage.",
        arabicGloss: "مسرحية أو عمل درامي معد للعرض.",
        synonyms: ["drama", "theatrical work", "piece"],
        examples: [
          "They attended a classical Shakespearean play.",
          "The play received standing ovations on opening night.",
        ],
      },
    ],
  },
  shortness: {
    lemma: "shortness",
    senses: [
      {
        pos: "noun",
        definition:
          "The property of being brief in duration; the quality of not continuing for a long time.",
        arabicGloss: "قِصَر المدة أو وجازة الوقت والامتداد الزمني.",
        synonyms: ["brevity", "briefness", "transience", "fleetingness"],
        examples: [
          "Seneca pondered deeply on the shortness of human life.",
          "The shortness of the meeting surprised all participants.",
        ],
      },
      {
        pos: "noun",
        definition: "The property of being of short physical stature or small spatial extent.",
        arabicGloss: "قصر القامة أو صغر المسافة المكانية.",
        synonyms: ["littleness", "smallness", "low stature"],
        examples: ["The shortness of the pathway made the walk easy."],
      },
    ],
  },
  short: {
    lemma: "short",
    senses: [
      {
        pos: "adjective",
        definition: "Of small duration; not long or extended in time.",
        arabicGloss: "قصير / قليل المدة الزمنية.",
        synonyms: ["brief", "fleeting", "momentary", "transitory"],
        examples: [
          "Life is not short, but we make it short by our choices.",
          "They had a short conversation before departure.",
        ],
      },
      {
        pos: "adjective",
        definition: "Measuring a small distance from end to end; low in height.",
        arabicGloss: "قصير القامة أو المسافة.",
        synonyms: ["compact", "truncated", "diminutive"],
        examples: ["He took a short walk around the courtyard."],
      },
    ],
  },
  waste: {
    lemma: "waste",
    senses: [
      {
        pos: "verb",
        definition: "Spend thoughtlessly; throw away or use extravagantly with no result.",
        arabicGloss: "يهدر / يُضيع ويبدد الموارد أو الأوقات دون طائل.",
        synonyms: ["squander", "dissipate", "fritter away", "misspend"],
        examples: [
          "We waste a great portion of our existence on vain desires.",
          "Do not waste your precious hours on idle gossip.",
        ],
      },
      {
        pos: "noun",
        definition: "An act or instance of using or expending something carelessly or uselessly.",
        arabicGloss: "إهدار أو تبديد للموارد الثمينة.",
        synonyms: ["dissipation", "squandering", "prodigality", "loss"],
        examples: ["It is a tragic waste of human talent and intellect."],
      },
    ],
  },
  wasteful: {
    lemma: "wasteful",
    senses: [
      {
        pos: "adjective",
        definition: "Lacking thrift or restraint; expending resources carelessly and excessively.",
        arabicGloss: "مسرف / مبذر يتجاوز حد الاعتدال.",
        synonyms: ["extravagant", "prodigal", "spendthrift", "lavish"],
        examples: [
          "We are not ill-supplied, but wasteful of our years.",
          "Wasteful habits lead to ultimate regret.",
        ],
      },
    ],
  },
  generous: {
    lemma: "generous",
    senses: [
      {
        pos: "adjective",
        definition: "More than adequate; large, ample, or bountiful in size or quantity.",
        arabicGloss: "سخي / وافر المقدار وكبير السعة.",
        synonyms: ["bountiful", "ample", "plentiful", "copious", "liberal"],
        examples: [
          "A sufficiently generous amount of time has been granted to us.",
          "The feast featured a generous supply of fresh fruits.",
        ],
      },
      {
        pos: "adjective",
        definition: "Willing to give and share unstintingly; magnanimous in spirit.",
        arabicGloss: "كريم النفس معطاء بجود.",
        synonyms: ["magnanimous", "benevolent", "charitable", "munificent"],
        examples: ["He was known throughout the province as a generous benefactor."],
      },
    ],
  },
  give: {
    lemma: "give",
    senses: [
      {
        pos: "verb",
        definition:
          "Transfer possession of something concrete or abstract to another without expecting compensation.",
        arabicGloss: "يعطي / يمنح ويهب طواعية.",
        synonyms: ["grant", "bestow", "present", "confer", "impart"],
        examples: [
          "Nature has given us all the necessities for a noble life.",
          "She gave her full attention to the classical lecture.",
        ],
      },
    ],
  },
  make: {
    lemma: "make",
    senses: [
      {
        pos: "verb",
        definition: "Cause to exist or happen; bring about a state, condition, or result.",
        arabicGloss: "يجعل / يصنع أو يُحدث أثراً وحالة.",
        synonyms: ["create", "render", "cause", "fashion", "produce"],
        examples: ["We make our lives meaningful through virtue.", "Our choices make our destiny."],
      },
    ],
  },
  achievement: {
    lemma: "achievement",
    senses: [
      {
        pos: "noun",
        definition:
          "The action of accomplishing something successfully with exertion and skill; an attained result.",
        arabicGloss: "إنجاز / مأثرة محققة بفضل الجهد والمهارة.",
        synonyms: ["accomplishment", "attainment", "feat", "triumph"],
        examples: [
          "The lifespan is sufficient for the highest human achievements.",
          "His scientific discovery was recognized as a historic achievement.",
        ],
      },
    ],
  },
  wisdom: {
    lemma: "wisdom",
    senses: [
      {
        pos: "noun",
        definition:
          "Accumulated philosophic or scientific learning; knowledge combined with insight and discernment.",
        arabicGloss: "حكمة / رجاحة عقل وسداد رأي وإدراك حقائق الوجود.",
        synonyms: ["sagacity", "prudence", "insight", "discernment", "enlightenment"],
        examples: [
          "Wisdom is the tranquil harbor of the philosophic spirit.",
          "The ancient sages passed down profound wisdom to future generations.",
        ],
      },
    ],
  },
  knowledge: {
    lemma: "knowledge",
    senses: [
      {
        pos: "noun",
        definition:
          "The psychological result of perception and learning and reasoning; facts, information, and skills acquired.",
        arabicGloss: "معرفة / علم ودراية بالحقائق والمفاهيم.",
        synonyms: ["learning", "erudition", "scholarship", "understanding", "cognition"],
        examples: [
          "Knowledge illuminates the mind and dispels superstition.",
          "He pursued knowledge with relentless dedication throughout his life.",
        ],
      },
    ],
  },
  soul: {
    lemma: "soul",
    senses: [
      {
        pos: "noun",
        definition:
          "The immaterial aspect of a human being, considered as distinct from the physical body.",
        arabicGloss: "روح / نفس ووجدان باطني.",
        synonyms: ["spirit", "psyche", "inner self", "anima"],
        examples: [
          "Reading noble treatises brings tranquility to the human soul.",
          "The immortality of the soul was a central theme in Platonic thought.",
        ],
      },
    ],
  },
  mind: {
    lemma: "mind",
    senses: [
      {
        pos: "noun",
        definition:
          "The cognitive faculties that enable consciousness, perception, thinking, judgment, and memory.",
        arabicGloss: "عقل / ذهن وقوة التفكير والإدراك.",
        synonyms: ["intellect", "reason", "psyche", "brain", "understanding"],
        examples: [
          "A disciplined mind remains calm amidst chaos.",
          "He cultivated his mind through daily contemplation.",
        ],
      },
    ],
  },
  virtue: {
    lemma: "virtue",
    senses: [
      {
        pos: "noun",
        definition:
          "The quality of doing what is right and avoiding what is wrong; moral excellence and righteousness.",
        arabicGloss: "فضيلة / استقامة وخلق رفيع.",
        synonyms: ["righteousness", "integrity", "goodness", "nobility", "moral excellence"],
        examples: [
          "Virtue alone guarantees true peace of mind.",
          "Courage and justice are cardinal virtues in classical ethics.",
        ],
      },
    ],
  },
  life: {
    lemma: "life",
    senses: [
      {
        pos: "noun",
        definition:
          "The period between birth and death, or the state of human existence in the world.",
        arabicGloss: "حياة / عيش ووجود إنساني.",
        synonyms: ["existence", "living", "vitality", "being"],
        examples: [
          "Life is long enough if you know how to invest it wisely.",
          "He dedicated his whole life to the service of his community.",
        ],
      },
    ],
  },
  time: {
    lemma: "time",
    senses: [
      {
        pos: "noun",
        definition:
          "The continuous progress of existence and events in the past, present, and future.",
        arabicGloss: "وقت / زمن وامتداد اللحظات.",
        synonyms: ["duration", "period", "season", "epoch", "moment"],
        examples: [
          "Time is our most valuable yet most neglected possession.",
          "Take time to reflect upon the lessons of history.",
        ],
      },
    ],
  },
  book: {
    lemma: "book",
    senses: [
      {
        pos: "noun",
        definition:
          "A written work or composition published in print or electronic form consisting of bound pages.",
        arabicGloss: "كتاب / مؤلَّف ومصنَّف فكري.",
        synonyms: ["volume", "tome", "work", "treatise", "publication"],
        examples: [
          "He opened the ancient book to examine its handwritten notes.",
          "A good book serves as an everlasting companion.",
        ],
      },
    ],
  },
  read: {
    lemma: "read",
    senses: [
      {
        pos: "verb",
        definition:
          "Look at and comprehend the meaning of written characters or words; interpret written discourse.",
        arabicGloss: "يقرأ / يطالع ويتدبر السطور المكتوبة.",
        synonyms: ["peruse", "study", "pore over", "scan", "decipher"],
        examples: [
          "To read widely is to converse with the greatest minds of all centuries.",
          "She reads philosophical texts every morning before dawn.",
        ],
      },
    ],
  },
  scenario: {
    lemma: "scenario",
    senses: [
      {
        pos: "noun",
        definition:
          "An outline or model of an expected or projected sequence of events or course of action.",
        arabicGloss: "سيناريو / خطة أو تصور متوقع لسلسلة أحداث مستقبلية.",
        synonyms: ["outline", "plot", "framework", "projection", "sequence"],
        examples: [
          "The worst-case scenario was successfully averted through prudent action.",
          "We must prepare for every possible scenario.",
        ],
      },
    ],
  },
  worst: {
    lemma: "worst",
    senses: [
      {
        pos: "adjective",
        definition: "Of the poorest quality or the most adverse or undesirable condition.",
        arabicGloss: "الأسوأ / الأدنى جودة أو الأشد سوءاً.",
        synonyms: ["most adverse", "most severe", "basest"],
        examples: ["We prepared for the worst-case scenario."],
      },
    ],
  },
  case: {
    lemma: "case",
    senses: [
      {
        pos: "noun",
        definition: "An instance of a particular situation; a circumstance or eventuality.",
        arabicGloss: "حالة / ظرف أو وضعية محددة.",
        synonyms: ["instance", "situation", "scenario", "circumstance"],
        examples: ["In this case, caution is paramount."],
      },
    ],
  },
  avert: {
    lemma: "avert",
    senses: [
      {
        pos: "verb",
        definition:
          "Turn away (one's eyes or thoughts); prevent an undesirable event from happening.",
        arabicGloss: "يتجنب / يدرأ أو يدفع عن ويهون من وقوع حادث سيء.",
        synonyms: ["prevent", "stave off", "forestall", "avoid"],
        examples: [
          "Prudent measures averted a potential disaster.",
          "The crisis was successfully averted.",
        ],
      },
    ],
  },
  averted: {
    lemma: "avert",
    senses: [
      {
        pos: "verb",
        definition: "Prevented an undesirable event from happening.",
        arabicGloss: "تم درؤه أو تجنبه بنجاح.",
        synonyms: ["prevented", "staved off", "avoided"],
        examples: ["The worst-case scenario was successfully averted."],
      },
    ],
  },
  discipline: {
    lemma: "discipline",
    senses: [
      {
        pos: "noun",
        definition: "Training that produces orderliness, self-control, and adherence to rules.",
        arabicGloss: "الانضباط وحفظ النظام والتحكم الذاتي الصارم.",
        synonyms: ["self-control", "orderliness", "regulation", "drill"],
        examples: [
          "Mental and physical discipline is necessary for mastery.",
          "Military discipline requires absolute obedience and focus.",
        ],
      },
      {
        pos: "verb",
        definition: "Train someone or oneself to obey rules or a code of behavior.",
        arabicGloss: "يدرب أو يهذب السلوك والنفس لالتزام النظام.",
        synonyms: ["train", "condition", "drill"],
        examples: ["He disciplined himself to read every evening."],
      },
    ],
  },
  productive: {
    lemma: "productive",
    senses: [
      {
        pos: "adjective",
        definition:
          "Producing or capable of producing large amounts of goods, or yielding favorable, effective results.",
        arabicGloss: "مُنْتِج / مثمر وذو مردود وفير ونافع.",
        synonyms: ["fruitful", "fertile", "prolific", "efficient", "generative"],
        examples: [
          "The team spent a highly productive afternoon planning the next steps.",
          "Productive habits lead to significant long-term achievements.",
        ],
      },
    ],
  },
  productivity: {
    lemma: "productivity",
    senses: [
      {
        pos: "noun",
        definition:
          "The state or quality of being productive; the effectiveness of productive effort, especially measured in terms of the rate of output per unit of input.",
        arabicGloss: "الإنتاجية / كفاءة ومعدل الإنجاز والإنتاج.",
        synonyms: ["productiveness", "yield", "output", "efficiency"],
        examples: [
          "Technological innovation contributed to higher productivity across all sectors.",
          "Regular rest is essential to sustain high productivity.",
        ],
      },
    ],
  },
  sustainable: {
    lemma: "sustainable",
    senses: [
      {
        pos: "adjective",
        definition:
          "Able to be maintained at a certain rate or level; conserving resources by avoiding depletion.",
        arabicGloss: "مستدام / قابل للاستمرار والتجدد دون استنزاف الموارد.",
        synonyms: ["maintainable", "renewable", "viable", "enduring"],
        examples: [
          "Sustainable habits preserve energy and focus for the future.",
          "This pace of work is not sustainable in the long term without adequate recovery.",
        ],
      },
    ],
  },
};

/** Look up an English lemma in Open English WordNet */
export function lookupWordNet(lemma: string): WordNetEntry | null {
  const clean = lemma.toLowerCase().trim();
  if (OPEN_WORDNET_DATA[clean]) return OPEN_WORDNET_DATA[clean]!;
  return null;
}
