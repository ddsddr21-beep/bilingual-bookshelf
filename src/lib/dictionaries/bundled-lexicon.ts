export type LexiconDefinition = {
  partOfSpeech: string;
  arabicTranslation: string;
  englishDefinition: string;
  arabicDefinition: string;
  exampleEn?: string;
  exampleAr?: string;
  compoundForms?: string[];
  synonyms?: string[];
  etymology?: string;
};

export type LexiconEntry = {
  word: string;
  targetEnglishWord: string;
  phonetic?: string;
  meanings: LexiconDefinition[];
  tierSource?: string;
};

/**
 * Deep Encyclopedic Bilingual Lexicon (Primary Engine - المحرك المعجمي الموسوعي الأساسي)
 * Provides comprehensive, nuanced, and detailed definitions for reading, philosophy, and literature.
 */
export const BUNDLED_LEXICON: Record<string, LexiconEntry> = {
  // --- Core Seneca & Classical Literature Vocabulary ---
  shortness: {
    word: "shortness",
    targetEnglishWord: "shortness",
    phonetic: "/ˈʃɔːrt.nəs/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم معنوي (abstract noun)",
        arabicTranslation: "قِصَر / وجازة / ضيق المدى الزمني",
        englishDefinition:
          "The condition or property of having a brief duration, small physical length, or limited extent; especially the ephemeral and transient quality of mortal existence or time.",
        arabicDefinition:
          "خاصية أو حالة محدودية المدى الزمني أو ضيق الأجل؛ وتُطلق فلسفياً على سرعة انقضاء العمر البشري وعجلة فناء اللحظات والأوقات إن لم تُستغل بحكمة.",
        exampleEn: "On the Shortness of Life by Lucius Annaeus Seneca.",
        exampleAr: "في قصر الحياة للفيلسوف الرواقي لوسيوس آنيوس سينيكا.",
        synonyms: [
          "brevity",
          "briefness",
          "fleetingness",
          "ephemerality",
          "transience",
          "conciseness",
        ],
        etymology: "From Old English sceort (short) + -ness (quality/state)",
      },
    ],
  },
  short: {
    word: "short",
    targetEnglishWord: "short",
    phonetic: "/ʃɔːrt/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "قصير / وجيز / عابر / محدود الأمد",
        englishDefinition:
          "Measuring a relatively small distance from end to end; lasting only a brief span of time; insufficient or falling below a required or expected standard.",
        arabicDefinition:
          "ما كان قليل الامتداد في الزمان أو المكان؛ ما ينقضي سريعاً دون أن يترك أثراً مديداً، أو ما يقصر عن بلوغ الغاية والوفاء بالمطلب.",
        exampleEn: "We are not given a short life, but we make it short by our wasteful habits.",
        exampleAr: "لم يُكتب علينا أن نعيش حياة قصيرة، بل نحن الذين نقصرها بسوء تدبيرنا وإسرافنا.",
        synonyms: ["brief", "compact", "fleeting", "transitory", "curtailed", "ephemeral"],
      },
    ],
  },
  waste: {
    word: "waste",
    targetEnglishWord: "waste",
    phonetic: "/weɪst/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "فعل متعدٍ ولازم (transitive/intransitive verb)",
        arabicTranslation: "يهدر / يبدد / يُضيع / يسرف بلا طائل",
        englishDefinition:
          "To use, consume, or spend carelessly, extravagantly, or for no constructive purpose; to allow valuable resources or moments of life to pass away unutilized.",
        arabicDefinition:
          "صرف الموارد الثمينة والأوقات في غير موضعها وبلا نفع أو بصيرة؛ والتفريط في الساعات والفرص حتى تتلاشى هباءً منثوراً.",
        exampleEn: "We waste a great portion of our days on trivial pursuits.",
        exampleAr: "نحن نبدد جزءاً عظيماً من أيامنا في ملاحقة التوافه والسفاسف.",
        synonyms: ["squander", "dissipate", "misspend", "fritter away", "lavish", "exhaust"],
      },
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "إهدار / تبديد / ضياع / هباء",
        englishDefinition:
          "An act or instance of expending something precious without gain; a devastating loss of time, vitality, or intellectual potential.",
        arabicDefinition:
          "فعل التضييع والتفريط غير المحسوب؛ ويضرب مثلاً لخسارة الطاقات الذهنية والعمرية التي لا يمكن استرجاعها أبداً.",
        exampleEn: "The tragic waste of human intellect in vanity.",
        exampleAr: "الإهدار المأساوي لطاقات الفكر الإنساني في دروب الغرور والعبث.",
        synonyms: ["dissipation", "squandering", "loss", "forfeiture", "devastation"],
      },
    ],
  },
  wasteful: {
    word: "wasteful",
    targetEnglishWord: "wasteful",
    phonetic: "/ˈweɪst.fəl/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "مسرف / مفرط / مبذر / متلف للأوقات",
        englishDefinition:
          "Given to or marked by careless, unmeasured expenditure; utilizing resources or precious time inefficiently and with reckless abundance.",
        arabicDefinition:
          "صفة من يتجاوز حد القصد والاعتدال في إنفاق وقته أو جهده أو ماله دون تدبر للعواقب؛ التبذير الجالب للندم.",
        exampleEn: "We are not ill-supplied with time, but wasteful of it.",
        exampleAr: "لسنا فقراء في حظوظنا من الوقت، بل نحن المسرفون والمفرطون فيه.",
        synonyms: ["extravagant", "prodigal", "spendthrift", "lavish", "imprudent", "profligate"],
      },
    ],
  },
  generous: {
    word: "generous",
    targetEnglishWord: "generous",
    phonetic: "/ˈdʒen.ər.əs/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "صفة (adjective)",
        arabicTranslation: "سخي / وافر / كريم / معطاء بجود",
        englishDefinition:
          "Showing readiness to give more of something than is strictly necessary; abundant, ample, and bountiful in quantity, measure, or spirit.",
        arabicDefinition:
          "الفيض في العطاء والوفرة في المقدار؛ ما كان وفيراً يتجاوز حد الكفاية ويسع أعظم المطالب والغايات الإنسانية.",
        exampleEn: "A sufficiently generous lifespan has been granted to human beings.",
        exampleAr: "قد أُتيح للإنسان نصيب سخي ووافر من العمر يتسع لأجلّ المقاصد.",
        synonyms: [
          "bountiful",
          "magnanimous",
          "charitable",
          "abundant",
          "ample",
          "copious",
          "munificent",
        ],
      },
    ],
  },
  sufficiently: {
    word: "sufficiently",
    targetEnglishWord: "sufficiently",
    phonetic: "/səˈfɪʃ.ənt.li/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "ظرف (adverb)",
        arabicTranslation: "بقدر كافٍ / بما يفي بالمطلب / على نحو وافٍ",
        englishDefinition:
          "To an adequate degree; enough to meet the requirements of a specific end, purpose, or standard.",
        arabicDefinition:
          "بدرجة تحقق الغرض وتبلغ الكفاية دون نقص؛ بحيث تسع تحقيق الأهداف المنشودة على أتم وجه.",
        exampleEn: "The time given to us is sufficiently long for great deeds.",
        exampleAr: "الوقت الممنوح لنا مديد بما يكفي لإنجاز جلائل الأعمال والمآثر.",
        synonyms: ["adequately", "enough", "satisfactorily", "competently", "amply"],
      },
    ],
  },
  achievement: {
    word: "achievement",
    targetEnglishWord: "achievement",
    phonetic: "/əˈtʃiːv.mənt/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "إنجاز / مأثرة / كسب معرفي رفيع",
        englishDefinition:
          "A noteworthy result brought to a successful conclusion through sustained exertion, skill, perseverance, or moral courage.",
        arabicDefinition:
          "العمل العظيم المتحقق بفضل العزيمة الصادقة، المهارة الرفيعة، والمثابرة؛ كل مأثرة تخلد ذكر صاحبها في سجلات المعرفة والفضيلة.",
        exampleEn: "Life is long enough for the highest intellectual achievements.",
        exampleAr: "الحياة متسعة بما يكفي لبلوغ أرفع الإنجازات والفتوحات الفكرية.",
        synonyms: ["accomplishment", "attainment", "feat", "triumph", "masterpiece", "culmination"],
      },
    ],
  },
  wisdom: {
    word: "wisdom",
    targetEnglishWord: "wisdom",
    phonetic: "/ˈwɪz.dəm/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حكمة / بصيرة نافذة / رجاحة عقل",
        englishDefinition:
          "The capacity to judge rightly in matters relating to life and conduct; the soundness of perspective arising from deep knowledge, philosophical contemplation, and ethical maturity.",
        arabicDefinition:
          "وضع الأمور في نصابها الصحيح، وسداد الرأي، وإدراك حقائق الوجود والفضيلة؛ وهي أعلى مراتب النضج الإنساني والفكري.",
        exampleEn: "True wisdom is the tranquil haven of the philosophic soul.",
        exampleAr: "الحكمة الحقة هي الملاذ الآمن والسكينة الهادئة للروح المتأملة.",
        synonyms: ["sagacity", "prudence", "insight", "discernment", "enlightenment", "erudition"],
      },
    ],
  },
  knowledge: {
    word: "knowledge",
    targetEnglishWord: "knowledge",
    phonetic: "/ˈnɒl.ɪdʒ/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "معرفة / علم / إدراك ودراية عميقة",
        englishDefinition:
          "The sum of what is known; the body of truths, principles, and information accumulated through investigation, scholarly discipline, and lived experience.",
        arabicDefinition:
          "مجموع الحقائق والعلوم والأصول المستخلصة بالبحث والدراسة الواعية؛ النور الذي ينير العقول ويزيل غشاوة الجهل والوهم.",
        exampleEn: "Knowledge transforms human existence into purposeful striving.",
        exampleAr: "المعرفة ترتقي بالوجود الإنساني إلى آفاق السعي الهادف والنبيل.",
        synonyms: [
          "learning",
          "erudition",
          "scholarship",
          "understanding",
          "illumination",
          "comprehension",
        ],
      },
    ],
  },
  soul: {
    word: "soul",
    targetEnglishWord: "soul",
    phonetic: "/soʊl/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "روح / نفس / مهجة ووجدان باطني",
        englishDefinition:
          "The spiritual, rational, or immaterial essence of a human being, regarded as immortal, sentient, and the seat of moral sensibility and emotion.",
        arabicDefinition:
          "الجوهر اللطيف والسر الإلهي غير المادي في الكيان البشري؛ مركز الوعي، الضمير، والسمو الروحي والأخلاقي.",
        exampleEn: "Philosophy is the medicine and sanctuary of the soul.",
        exampleAr: "الفلسفة والتأمل هما دواء الروح ومحراب سكينتها.",
        synonyms: ["spirit", "psyche", "inner self", "essence", "vital principle", "heart"],
      },
    ],
  },
  mind: {
    word: "mind",
    targetEnglishWord: "mind",
    phonetic: "/maɪnd/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "عقل / ذهن / قوة التفكير والإدراك",
        englishDefinition:
          "The element of conscious reasoning and cognition that enables a person to think, perceive, analyze, and formulate rational judgments.",
        arabicDefinition:
          "الملكة الإدراكية المفكرة التي تميز الإنسان وتمكنه من الفهم والتحليل والموازنة بين الحق والباطل والنافع والضار.",
        exampleEn: "A well-governed mind is invulnerable to outer turbulence.",
        exampleAr: "العقل الرشيد الحصيف لا تزعزعه عواصف الظروف وتقلبات الدهر.",
        synonyms: ["intellect", "reason", "brain", "understanding", "psyche", "cognition"],
      },
    ],
  },
  truth: {
    word: "truth",
    targetEnglishWord: "truth",
    phonetic: "/truːθ/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "حقيقة / صدق / صواب مطابق للواقع",
        englishDefinition:
          "The state of being in strict accord with fact, reality, or actuality; a transcendent principle of verity and philosophical honesty.",
        arabicDefinition:
          "القول أو الأمر الثابت المطابق للواقع والحق، العاري عن الزيغ والتلبيس؛ أسمى ما تسعى إليه العقول الحرة.",
        exampleEn: "Devotion to truth requires courage and intellectual discipline.",
        exampleAr: "الانحياز للحقيقة يتطلب شجاعة أدبية وانضباطاً فكرياً صارماً.",
        synonyms: ["verity", "factuality", "reality", "authenticity", "honesty", "righteousness"],
      },
    ],
  },
  virtue: {
    word: "virtue",
    targetEnglishWord: "virtue",
    phonetic: "/ˈvɜːr.tʃuː/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "فضيلة / مكرمة / استقامة وخلق رفيع",
        englishDefinition:
          "Conformity of life and conduct with the principles of moral excellence, righteousness, and goodness; an enduring disposition toward the good.",
        arabicDefinition:
          "التمسك بأسمى الأخلاق والمروءة والعدل؛ الصفة الجامعة للخير في النفس البشرية التي ترقى بها فوق الأطماع والشهوات.",
        exampleEn: "Virtue is self-sufficient for a noble and tranquil life.",
        exampleAr: "الفضيلة كافية بذاتها لتمنح صاحبها حياة كريمة ومطمئنة.",
        synonyms: [
          "righteousness",
          "integrity",
          "nobility",
          "moral excellence",
          "goodness",
          "honor",
        ],
      },
    ],
  },
  translation: {
    word: "translation",
    targetEnglishWord: "translation",
    phonetic: "/trænzˈleɪ.ʃən/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "ترجمة / تعريب / نقل دلالي وبياني",
        englishDefinition:
          "The act, process, or art of rendering text or speech from one linguistic medium into another while preserving semantic nuance, stylistic elegance, and cultural resonance.",
        arabicDefinition:
          "فن وعلم نقل الأفكار والنصوص من لغة إلى أخرى بأمانة فكرية ودقة بيانية تجسر التباين الثقافي بين الأمم.",
        exampleEn: "Parallel translation illuminates the subtleties of literature.",
        exampleAr: "تضيء الترجمة الموازية دقائق النصوص وخفايا الأساليب الأدبية.",
        synonyms: ["rendering", "interpretation", "transposition", "adaptation", "paraphrase"],
      },
    ],
  },
  book: {
    word: "book",
    targetEnglishWord: "book",
    phonetic: "/bʊk/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "اسم (noun)",
        arabicTranslation: "كتاب / سفر / مصنَّف فكري",
        englishDefinition:
          "A written or printed work of substantial length, preserving knowledge, literary imagination, and philosophical treatises across generations.",
        arabicDefinition:
          "المؤلَّف الجامع للعلوم والآداب والأفكار؛ الوعاء الخالد الذي يحمل خلاصة العقول الإنسانية عبر الأزمنة.",
        exampleEn: "A great book is a timeless dialogue with enlightened minds.",
        exampleAr: "الكتاب العظيم حوار عابر للأزمان مع أصفى العقول وأرقاها.",
        synonyms: ["volume", "tome", "treatise", "publication", "manuscript", "work"],
      },
    ],
  },
  read: {
    word: "read",
    targetEnglishWord: "read",
    phonetic: "/riːd/",
    tierSource: "المعجم الموسوعي الأساسي (Oxford/Wiktionary Standard)",
    meanings: [
      {
        partOfSpeech: "فعل (verb)",
        arabicTranslation: "يقرأ / يطالع / يتدبر ويتأمل السطور",
        englishDefinition:
          "To look at and interpret written or printed characters; to grasp deeply the philosophical, aesthetic, and intellectual concepts conveyed in written language.",
        arabicDefinition:
          "تتبع الكلمات المكتوبة بالغوص في معانيها وتدبر دلالاتها؛ الاستبصار الفكري الذي يوسع مدارك الوعي الإنساني.",
        exampleEn: "To read attentively is to engage in fellowship with the wise.",
        exampleAr: "أن تقرأ بتدبر يعني أن تجالس الحكماء وتنهل من صفو عقولهم.",
        synonyms: ["peruse", "pore over", "study", "decipher", "scrutinize", "comprehend"],
      },
    ],
  },
};

/** Quick mapping from Arabic roots/words to English target words for instant Arabic click lookup */
export const ARABIC_TO_ENGLISH_MAP: Record<string, string> = {
  مشكلة: "problem",
  حياة: "life",
  قصير: "short",
  قصيرة: "short",
  قصر: "shortness",
  نهدر: "waste",
  يهدر: "waste",
  اهدار: "waste",
  كثير: "lot",
  كثيرا: "lot",
  طويل: "long",
  طويلة: "long",
  يكفي: "sufficiently",
  اعطينا: "give",
  اعطى: "give",
  قدر: "amount",
  سخي: "generous",
  يتسع: "room",
  اعظم: "highest",
  انجاز: "achievement",
  انجازات: "achievement",
  تمنح: "give",
  منح: "give",
  نجعل: "make",
  جعل: "make",
  فقراء: "ill-supplied",
  فقير: "poor",
  مسرف: "wasteful",
  مسرفون: "wasteful",
  اسراف: "waste",
  علم: "knowledge",
  معرفة: "knowledge",
  حكمة: "wisdom",
  روح: "soul",
  نفس: "soul",
  عقل: "mind",
  فكر: "thought",
  حرية: "freedom",
  جمال: "beauty",
  كتاب: "book",
  قراءة: "read",
  يطالع: "read",
  ترجمة: "translation",
  فن: "art",
  طبيعة: "nature",
  نور: "light",
  ظلام: "darkness",
  امل: "hope",
  فضيلة: "virtue",
  عقلانية: "reason",
};
