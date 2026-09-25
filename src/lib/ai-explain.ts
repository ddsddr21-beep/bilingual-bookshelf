import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export type ContextAnalysisResponse = {
  success: true;
  word: string;
  contextualEnglishWord: string;
  englishLemma: string;
  explanation: string;
  matchedSentenceEn: string;
  matchedSentenceAr: string;
};

export function isArabicWord(str: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
}

/**
 * Server Function: Extracts the contextual counterpart using Gemini from 5-sentence bilingual window.
 * AI's ONLY role is identifying the exact English word used in the parallel translation context.
 */
export const extractContextualTargetFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      word: string;
      currentSentenceAr: string;
      contextSentencesAr?: string[]; // 2 before, current, 2 after
      currentSentenceEn: string;
      contextSentencesEn?: string[]; // 2 before, current, 2 after
    }) => data,
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("مفتاح GEMINI_API_KEY غير متوفر في بيئة التشغيل.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const {
      word,
      currentSentenceAr,
      contextSentencesAr = [],
      currentSentenceEn,
      contextSentencesEn = [],
    } = data;

    const isAr = isArabicWord(word);

    const fullArContext =
      contextSentencesAr.length > 0 ? contextSentencesAr.join(" ") : currentSentenceAr;
    const fullEnContext =
      contextSentencesEn.length > 0 ? contextSentencesEn.join(" ") : currentSentenceEn;

    const prompt = `أنت خبير لغويات ومترجم نصوص مقارن. مهمتك الوحيدة هي تحديد اللفظة الإنجليزية الدقيقة المستخدمة في النص الإنجليزي المقابل للكلمة المحددة ("${word}") في هذا السياق المحدد بدقة، دون تأليف أي تعريفات أو أمثلة.

الكلمة المستهدفة: "${word}" (${isAr ? "كلمة عربية" : "كلمة إنجليزية"})

الجملة العربية الأساسية:
"${currentSentenceAr}"

سياق النص العربي (الجمل السابقة والحالية واللاحقة):
"${fullArContext}"

الجملة الإنجليزية المقابلة الأساسية:
"${currentSentenceEn}"

سياق النص الإنجليزي (الجمل السابقة والحالية واللاحقة):
"${fullEnContext}"

المطلوب بدقة:
1. استخرج الكلمة الإنجليزية الدقيقة المستخدمة في النص الإنجليزي المقابل للتعبير عن هذه الكلمة ("${word}") في هذا السياق (مثال: "لعبنا" في السياق -> "played").
2. حدد أصل الكلمة الإنجليزية المجرد (English lemma) (مثال: "played" -> "play"، "wasteful" -> "waste").
3. قدم شرحاً لغوياً مقتضباً (جملة أو جملتين) يوضح دلالة هذه الكلمة وسر اختيارها في هذا السياق الموازي.

أرجع النتيجة بصيغة JSON حصرية بالهيكل التالي فقط:
{
  "contextualEnglishWord": "الكلمة الإنجليزية المستخدمة في السياق الفعلي",
  "englishLemma": "أصل الكلمة الإنجليزية المجرد",
  "explanation": "شرح سياقي تحليلي مقتضب",
  "matchedSentenceEn": "الجملة الإنجليزية التي ورد فيها المقابل",
  "matchedSentenceAr": "الجملة العربية المقابلة"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text) as {
        contextualEnglishWord?: string;
        englishLemma?: string;
        explanation?: string;
        matchedSentenceEn?: string;
        matchedSentenceAr?: string;
      };

      const contextualWord = parsed.contextualEnglishWord?.trim() || (isAr ? "counterpart" : word);
      const lemma = parsed.englishLemma?.trim() || contextualWord;

      return {
        success: true as const,
        word,
        contextualEnglishWord: contextualWord,
        englishLemma: lemma,
        explanation: parsed.explanation || "تم استخراج المقابل السياقي بدقة من النص المقابل.",
        matchedSentenceEn: parsed.matchedSentenceEn || currentSentenceEn,
        matchedSentenceAr: parsed.matchedSentenceAr || currentSentenceAr,
      };
    } catch {
      return {
        success: true as const,
        word,
        contextualEnglishWord: isAr ? "counterpart" : word,
        englishLemma: isAr ? "counterpart" : word,
        explanation: "تحليل المقابلة النصية في السياق الموازي.",
        matchedSentenceEn: currentSentenceEn,
        matchedSentenceAr: currentSentenceAr,
      };
    }
  });
