import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export type ContextAnalysisResponse =
  | {
      success: true;
      word: string;
      contextualEnglishWord: string;
      englishLemma: string;
      explanation?: string;
      matchedSentenceEn?: string;
      matchedSentenceAr?: string;
    }
  | {
      success: false;
      error?: string;
    };

export function isArabicWord(str: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
}

/**
 * Server Function: Extracts the contextual counterpart using Gemini from 7-sentence bilingual window (3 before + current + 3 after).
 * AI's ONLY role is identifying the exact English word used in the parallel translation context and its base lemma.
 * AI is NOT allowed to invent dictionary definitions, examples, or synonyms.
 * If AI fails or returns empty, returns failure without inventing synthetic fallbacks.
 */
export const extractContextualTargetFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      word: string;
      currentSentenceAr: string;
      contextSentencesAr?: string[]; // 3 before, current, 3 after
      currentSentenceEn: string;
      contextSentencesEn?: string[]; // 3 before, current, 3 after
    }) => data,
  )
  .handler(async ({ data }): Promise<ContextAnalysisResponse> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "مفتاح GEMINI_API_KEY غير متوفر" };
    }

    try {
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

      const prompt = `أنت خبير لغويات ومترجم نصوص مقارن. مهمتك الوحيدة هي تحديد اللفظة الإنجليزية الدقيقة المستخدمة في النص الإنجليزي المقابل للكلمة المحددة ("${word}") في هذا السياق المحدد بدقة، دون تأليف أي تعريفات أو أمثلة قاموسية.

الكلمة المستهدفة: "${word}" (${isAr ? "كلمة عربية" : "كلمة إنجليزية"})

الجملة العربية الأساسية:
"${currentSentenceAr}"

سياق النص العربي:
"${fullArContext}"

الجملة الإنجليزية المقابلة الأساسية:
"${currentSentenceEn}"

سياق النص الإنجليزي:
"${fullEnContext}"

المطلوب بدقة:
1. استخرج الكلمة الإنجليزية الدقيقة المستخدمة في النص الإنجليزي المقابل للتعبير عن هذه الكلمة ("${word}") في هذا السياق فقط.
2. حدد أصل الكلمة الإنجليزية المجرد (English lemma).
3. قدم شرحاً لغوياً مقتضباً (جملة واحدة) يوضح دلالة هذه الكلمة في هذا الموضع من النص.

أرجع النتيجة بصيغة JSON حصرية بالهيكل التالي فقط (دون أي نص خارجي):
{
  "contextualEnglishWord": "الكلمة الإنجليزية المستخدمة في السياق الفعلي",
  "englishLemma": "أصل الكلمة الإنجليزية المجرد",
  "explanation": "شرح سياقي مقتضب للموضع"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text) as {
        contextualEnglishWord?: string;
        englishLemma?: string;
        explanation?: string;
        matchedSentenceEn?: string;
        matchedSentenceAr?: string;
      };

      const contextualWord = parsed.contextualEnglishWord?.trim();
      if (!contextualWord || contextualWord.length === 0) {
        return { success: false, error: "No counterpart identified" };
      }

      const lemma = parsed.englishLemma?.trim() || contextualWord;

      return {
        success: true,
        word,
        contextualEnglishWord: contextualWord,
        englishLemma: lemma,
        explanation: parsed.explanation?.trim() || undefined,
        matchedSentenceEn: parsed.matchedSentenceEn?.trim() || currentSentenceEn,
        matchedSentenceAr: parsed.matchedSentenceAr?.trim() || currentSentenceAr,
      };
    } catch {
      return { success: false, error: "Context analysis failed" };
    }
  });
