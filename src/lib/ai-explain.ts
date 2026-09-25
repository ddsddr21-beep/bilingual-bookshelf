import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export type ContextAnalysisResponse = {
  success: true;
  word: string;
  arabicWordInTranslation: string;
  explanation: string;
  matchedSentenceEn: string;
  matchedSentenceAr: string;
  englishText: string;
  arabicText: string;
};

export type LexicalAiResponse = {
  success: true;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  arabicTranslation: string;
  englishDefinition: string;
  example: string;
  synonyms: string[];
};

export const explainContextFn = createServerFn({ method: "POST" })
  .validator((data: { word: string; englishText: string; arabicText: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر في متغيرات البيئة.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const { word, englishText, arabicText } = data;

    const prompt = `أنت أستاذ لغويات ومترجم أدبي خبير في المقارنة النصية بين الإنجليزية والعربية.

المطلوب: تحليل النص الإنجليزي والنص العربي المقابل له، واستخراج كيف أُدرجت ترجمة الكلمة الإنجليزية التالية داخل النص العربي المقابل.

الكلمة الإنجليزية المستهدفة: "${word}"

النص الإنجليزي الأصلي:
"${englishText}"

النص العربي المقابل (الترجمة الموازية):
"${arabicText}"

المهمة الدقيقة:
1. استخرج الكلمة أو العبارة العربية المحددة الموجودة داخل النص العربي المقابل والتي استخدمها المترجم لمقابلة الكلمة الإنجليزية "${word}".
2. حدد الجملة الإنجليزية التي وردت فيها الكلمة والجملة العربية المقابلة لها في الترجمة.
3. قدم شرحاً سياقياً ميسراً يوضح اختيار المترجم لهذه العبارة وكيف أدّت المعنى والمضمون في هذا السياق الأدبي/النصي.

أرجع النتيجة بصيغة JSON حصرية بالهيكل التالي:
{
  "arabicWordInTranslation": "الكلمة أو العبارة العربية المستخرجة نصياً من الترجمة المقابلة",
  "explanation": "شرح سياقي يوضح كيف عبر المترجم عن الكلمة الإنجليزية وما تضفيه على النص العربي",
  "matchedSentenceEn": "الجملة الإنجليزية المحتوية على الكلمة",
  "matchedSentenceAr": "الجملة العربية المقابلة لها"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text) as {
        arabicWordInTranslation?: string;
        explanation?: string;
        matchedSentenceEn?: string;
        matchedSentenceAr?: string;
      };
      return {
        success: true as const,
        word,
        arabicWordInTranslation: parsed.arabicWordInTranslation || "لم تُحدد الكلمة صراحة",
        explanation: parsed.explanation || "تم استخراج المعنى المقابل من النص العربي الموازي.",
        matchedSentenceEn: parsed.matchedSentenceEn || englishText,
        matchedSentenceAr: parsed.matchedSentenceAr || arabicText,
        englishText,
        arabicText,
      };
    } catch {
      return {
        success: true as const,
        word,
        arabicWordInTranslation: "المعنى المقابل",
        explanation: text,
        matchedSentenceEn: englishText,
        matchedSentenceAr: arabicText,
        englishText,
        arabicText,
      };
    }
  });

export const getAiLexicalFn = createServerFn({ method: "POST" })
  .validator((data: { word: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `قدم معجماً لغوياً دقيقاً وشاملاً باللغة العربية للكلمة الإنجليزية التالية: "${data.word}".

أرجع النتيجة بصيغة JSON فقط بهذا الهيكل:
{
  "phonetic": "/نطق صوتي دقيق/",
  "partOfSpeech": "نوع الكلمة بالعربية (اسم / فعل / صفة / ظرف...)",
  "arabicTranslation": "الترجمات العربية المعجمية الشائعة والدقيقة مفصولة بـ /",
  "englishDefinition": "تعريف معجمي بالإنجليزية ميسر ودقيق",
  "example": "جملة إنجليزية توضيحية مع ترجمتها العربية بين قوسين",
  "synonyms": ["مرادف1", "مرادف2", "مرادف3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text) as {
        phonetic?: string;
        partOfSpeech?: string;
        arabicTranslation?: string;
        englishDefinition?: string;
        example?: string;
        synonyms?: string[];
      };

      return {
        success: true as const,
        word: data.word,
        phonetic: parsed.phonetic || "",
        partOfSpeech: parsed.partOfSpeech || "مفردة إنجليزية",
        arabicTranslation: parsed.arabicTranslation || data.word,
        englishDefinition: parsed.englishDefinition || "",
        example: parsed.example || "",
        synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms : [],
      };
    } catch {
      return {
        success: true as const,
        word: data.word,
        phonetic: "",
        partOfSpeech: "مفردة",
        arabicTranslation: data.word,
        englishDefinition: "",
        example: "",
        synonyms: [],
      };
    }
  });
