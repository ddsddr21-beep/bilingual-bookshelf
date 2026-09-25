export type OfflineLexiconItem = {
  word: string;
  targetEnglishWord: string;
  meanings: Array<{
    partOfSpeech: string;
    arabicTranslation: string;
    englishDefinition: string;
    arabicDefinition: string;
    exampleEn?: string;
    exampleAr?: string;
    compoundForms?: string[];
    synonyms?: string[];
  }>;
};

export const PRELOADED_LEXICON: Record<string, OfflineLexiconItem> = {
  the: {
    word: "the",
    targetEnglishWord: "the",
    meanings: [
      {
        partOfSpeech: "أداة تعريف (Definite Article)",
        arabicTranslation: "الـ (أداة التعريف)",
        englishDefinition: "Used to point to a specific noun known to the reader or listener.",
        arabicDefinition: "أداة تستخدم للإشارة إلى اسم محدد ومعروف للمستمع أو القارئ.",
        exampleEn: "The sun rises in the east.",
        exampleAr: "تشرق الشمس من الشرق.",
        compoundForms: ["at the moment (في هذه اللحظة)", "all the best (أطيب التمنيات)"],
        synonyms: ["this", "that"],
      },
    ],
  },
  shortness: {
    word: "shortness",
    targetEnglishWord: "shortness",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "قِصَر / قاطعية / اختصار",
        englishDefinition: "The property of being brief in duration or small in length.",
        arabicDefinition: "خاصية قلة الطول أو المدى الزمني القصير.",
        exampleEn: "On the shortness of life.",
        exampleAr: "في قصر الحياة.",
        synonyms: ["brevity", "briefness", "conciseness", "smallness"],
      },
    ],
  },
  short: {
    word: "short",
    targetEnglishWord: "short",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "قصير / موجَز / قليل",
        englishDefinition: "Measuring a small distance from end to end, or lasting a brief time.",
        arabicDefinition: "ما كان ذو مدى زمني قصير أو طول محدود.",
        exampleEn: "Life is short if we waste it.",
        exampleAr: "الحياة قصيرة إن أهدرناها.",
        synonyms: ["brief", "compact", "fleeting", "concise"],
      },
    ],
  },
  waste: {
    word: "waste",
    targetEnglishWord: "waste",
    meanings: [
      {
        partOfSpeech: "فعل (verb)",
        arabicTranslation: "يهدر / يضيع / يسرف",
        englishDefinition: "To use or expend carelessly, extravagantly, or to no purpose.",
        arabicDefinition: "استهلاك الشيء أو إنفاقه دون طائل أو بإسراف.",
        exampleEn: "Do not waste your precious time.",
        exampleAr: "لا تضيع وقتك الثمين.",
        synonyms: ["squander", "misspend", "dissipate", "fritter away"],
      },
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "إهدار / ضياع / نفايات",
        englishDefinition: "An act or instance of using something carelessly.",
        arabicDefinition: "فعل تضييع الشيء أو التصرف فيه بغير فائدة.",
        exampleEn: "It is a waste of energy.",
        exampleAr: "إنه إهدار للطاقة.",
        synonyms: ["loss", "dissipation", "squandering"],
      },
    ],
  },
  wasteful: {
    word: "wasteful",
    targetEnglishWord: "wasteful",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "مسرف / مفرط / مبذر",
        englishDefinition: "Using or expending something carelessly or extravagantly.",
        arabicDefinition: "الوصف للشخص أو السلوك الذي يميل إلى الإسراف والتضييع.",
        exampleEn: "We are wasteful of our time.",
        exampleAr: "نحن مسرفون في أوقاتنا.",
        synonyms: ["extravagant", "prodigal", "spendthrift", "lavish"],
      },
    ],
  },
  generous: {
    word: "generous",
    targetEnglishWord: "generous",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "سخي / كريم / وافر / معطاء",
        englishDefinition:
          "Showing readiness to give more of something than is strictly necessary.",
        arabicDefinition: "الاستعداد للعطاء والكرم والتفضل بأكثر مما هو متوقع.",
        exampleEn: "A generous amount has been given to us.",
        exampleAr: "قد أُعطينا قدراً سخياً.",
        synonyms: ["bountiful", "magnanimous", "charitable", "abundant"],
      },
    ],
  },
  achievement: {
    word: "achievement",
    targetEnglishWord: "achievement",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "إنجاز / تحقيق / مكسب / نجاح",
        englishDefinition: "A thing done successfully with effort, skill, or courage.",
        arabicDefinition: "الشيء المحقق بنجاح بفضل الجهد والمهارة والعمل.",
        exampleEn: "For the highest achievements in life.",
        exampleAr: "لأعظم الإنجازات في الحياة.",
        synonyms: ["accomplishment", "attainment", "feat", "triumph"],
      },
    ],
  },
  supply: {
    word: "supply",
    targetEnglishWord: "supply",
    meanings: [
      {
        partOfSpeech: "فعل (verb)",
        arabicTranslation: "يمد / يزود / يجهز",
        englishDefinition: "To make something needed available to someone; provide.",
        arabicDefinition: "توفير وجعل الشيء المطلوب متاحاً للشخص.",
        exampleEn: "Nature supplies us with resources.",
        exampleAr: "تمدنا الطبيعة بالموارد.",
        synonyms: ["provide", "furnish", "equip", "cater"],
      },
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "إمداد / مؤونة / مخزون",
        englishDefinition: "A stock of a resource from which a person or place can be provided.",
        arabicDefinition: "مخزون أو كمية متاحة من الموارد للاستخدام.",
        exampleEn: "An ample supply of water.",
        exampleAr: "إمداد وافر من الماء.",
        synonyms: ["stock", "store", "reserve"],
      },
    ],
  },
  book: {
    word: "book",
    targetEnglishWord: "book",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "كتاب / مؤلَّف / سفر",
        englishDefinition: "A written or printed work consisting of pages bound together.",
        arabicDefinition: "عمل مكتوب أو مطبوع يتألف من صفحات مجتمعة غنية بالمعارف.",
        exampleEn: "He spent the evening reading a classic book.",
        exampleAr: "قضى المساء في قراءة كتاب كلاسيكي.",
        compoundForms: ["bookstore (مكتبة)", "bookworm (عاشق القراءة)"],
        synonyms: ["volume", "tome", "publication", "novel"],
      },
    ],
  },
  read: {
    word: "read",
    targetEnglishWord: "read",
    meanings: [
      {
        partOfSpeech: "فعل (verb)",
        arabicTranslation: "يقرأ / يطالع / يتصفح",
        englishDefinition: "To look at and comprehend the meaning of written or printed matter.",
        arabicDefinition: "النظر في المادة المكتوبة واستيعاب معانيها وفهم أفكارها.",
        exampleEn: "She loves to read philosophy and poetry.",
        exampleAr: "تحب أن تقرأ الفلسفة والشعر.",
        compoundForms: ["read between the lines (يفهم ما بين السطور)"],
        synonyms: ["peruse", "study", "scan", "interpret"],
      },
    ],
  },
  time: {
    word: "time",
    targetEnglishWord: "time",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "وقت / زمن / حقبة",
        englishDefinition: "The indefinite continued progress of existence and events.",
        arabicDefinition: "الامتداد المستمر للوجود والأحداث واللحظات المتعاقبة.",
        exampleEn: "Time flies when you are engrossed in learning.",
        exampleAr: "يمر الوقت بسرعة عندما تكون مستغرقاً في التعلم.",
        compoundForms: ["time management (إدارة الوقت)"],
        synonyms: ["duration", "period", "era", "moment"],
      },
    ],
  },
  knowledge: {
    word: "knowledge",
    targetEnglishWord: "knowledge",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "معرفة / علم / دراية",
        englishDefinition:
          "Facts, information, and skills acquired through experience or education.",
        arabicDefinition: "الحقائق والمعلومات والمهارات المكتسبة عبر التجربة أو التعلم.",
        exampleEn: "Knowledge is the greatest light for human mind.",
        exampleAr: "المعرفة هي أعظم نور للعقل البشري.",
        synonyms: ["wisdom", "understanding", "erudition", "awareness"],
      },
    ],
  },
  life: {
    word: "life",
    targetEnglishWord: "life",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حياة / عيش / وجود",
        englishDefinition:
          "The condition that distinguishes living organisms from inorganic matter.",
        arabicDefinition: "الحالة التي تميز الكائنات الحية وتمنحها الوجود والنشاط والوعي.",
        exampleEn: "Literature reflects the soul of human life.",
        exampleAr: "يعكس الأدب روح الحياة البشرية.",
        synonyms: ["existence", "being", "vitality", "soul"],
      },
    ],
  },
  mind: {
    word: "mind",
    targetEnglishWord: "mind",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "عقل / ذهن / فكر",
        englishDefinition: "The element of a person that enables them to be aware of the world.",
        arabicDefinition: "العنصر لدى الإنسان الذي يمكنه من الإدراك والتفكير والوعي.",
        exampleEn: "Reading expands the horizons of the human mind.",
        exampleAr: "توسع القراءة آفاق العقل البشري.",
        synonyms: ["intellect", "brain", "psyche", "reason"],
      },
    ],
  },
  wisdom: {
    word: "wisdom",
    targetEnglishWord: "wisdom",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حكمة / رجاحة عقل",
        englishDefinition: "The quality of having experience, knowledge, and good judgment.",
        arabicDefinition: "صفة امتلاك الخبرة والمعرفة وسداد الرأي والتحلي بالتفكير الصائب.",
        exampleEn: "Wisdom is the reward for a lifetime of listening.",
        exampleAr: "الحكمة هي مكافأة لمن قضى عمره في الإنصات.",
        synonyms: ["sagacity", "intelligence", "prudence"],
      },
    ],
  },
  freedom: {
    word: "freedom",
    targetEnglishWord: "freedom",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حرية / انطلاق / استقلال",
        englishDefinition: "The power or right to act, speak, or think as one wants.",
        arabicDefinition: "القدرة أو الحق في التصرف والتفكير والتعبير بدون قيود جائرة.",
        exampleEn: "Freedom of thought is the cornerstone of creativity.",
        exampleAr: "حرية الفكر هي حجر الزاوية للإبداع.",
        synonyms: ["liberty", "independence", "autonomy"],
      },
    ],
  },
  truth: {
    word: "truth",
    targetEnglishWord: "truth",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حقيقة / صدق / صواب",
        englishDefinition: "The quality or state of being true and in accordance with fact.",
        arabicDefinition: "الحالة المطابقة للواقع والحقيقة والصدق العاري عن الزيف.",
        exampleEn: "Seekers of truth value honesty above all.",
        exampleAr: "يبغون طالبي الحقيقة الصدق قبل كل شيء.",
        synonyms: ["verity", "factuality", "reality"],
      },
    ],
  },
  beauty: {
    word: "beauty",
    targetEnglishWord: "beauty",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "جمال / روعة / حسْن",
        englishDefinition: "A combination of qualities that pleases the aesthetic senses.",
        arabicDefinition: "مجموعة من الصفات التي تبهج الحواس الإنسانية وتمنح الإحساس بالتناغم.",
        exampleEn: "True beauty lies in the harmony of nature.",
        exampleAr: "الجمال الحقيقي يكمن في تناغم الطبيعة.",
        synonyms: ["attractiveness", "grace", "elegance"],
      },
    ],
  },
};
