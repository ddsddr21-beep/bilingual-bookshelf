import { useState, useEffect, useMemo } from "react";
import {
  X,
  Volume2,
  Sparkles,
  BookOpen,
  Download,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowLeftRight,
  BookMarked,
} from "lucide-react";
import {
  getLexicalDefinition,
  isExpandedDictionaryLoaded,
  setExpandedDictionaryState,
  type LexicalDefinition,
} from "@/lib/dictionary";
import { explainContextFn, type ContextAnalysisResponse } from "@/lib/ai-explain";

export type WordTarget = {
  word: string;
  clean: string;
  pairIndex: number;
  englishText: string;
  arabicText: string;
  rect?: DOMRect | null;
};

type Props = {
  target: WordTarget;
  onClose: () => void;
};

export function WordInspector({ target, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"lexical" | "context">("lexical");

  // Lexical state
  const [lexical, setLexical] = useState<LexicalDefinition | null>(null);
  const [loadingLexical, setLoadingLexical] = useState(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedDictionaryLoaded());
  const [downloadingDict, setDownloadingDict] = useState(false);

  // AI Context state
  const [aiResult, setAiResult] = useState<ContextAnalysisResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Copy state
  const [copied, setCopied] = useState(false);

  // Fetch lexical definition whenever word or isExpanded changes
  useEffect(() => {
    let active = true;
    setLoadingLexical(true);

    getLexicalDefinition(target.clean, isExpanded)
      .then((def) => {
        if (active) {
          setLexical(def);
          setLoadingLexical(false);
        }
      })
      .catch(() => {
        if (active) setLoadingLexical(false);
      });

    return () => {
      active = false;
    };
  }, [target.clean, isExpanded]);

  // Handle playing pronunciation
  function handlePlayAudio() {
    if (!target.clean) return;
    if (lexical?.audioUrl) {
      const audio = new Audio(lexical.audioUrl);
      audio.play().catch(() => speakWord(target.clean));
    } else {
      speakWord(target.clean);
    }
  }

  function speakWord(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Handle Downloading / Activating Expanded Dictionary
  function handleToggleExpanded() {
    if (isExpanded) {
      setExpandedDictionaryState(false);
      setIsExpanded(false);
    } else {
      setDownloadingDict(true);
      setTimeout(() => {
        setExpandedDictionaryState(true);
        setIsExpanded(true);
        setDownloadingDict(false);
      }, 500);
    }
  }

  // Handle fetching AI Contextual Meaning by comparing parallel texts
  async function fetchAiContext() {
    if (loadingAi) return;
    setLoadingAi(true);
    setAiError(null);

    try {
      const result = await explainContextFn({
        data: {
          word: target.clean,
          englishText: target.englishText,
          arabicText: target.arabicText,
        },
      });
      setAiResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "تعذر الاتصال بالذكاء الاصطناعي";
      setAiError(message);
    } finally {
      setLoadingAi(false);
    }
  }

  // Auto trigger AI context when switching to context tab if not fetched yet
  function handleTabChange(tab: "lexical" | "context") {
    setActiveTab(tab);
    if (tab === "context" && !aiResult && !loadingAi && !aiError) {
      fetchAiContext();
    }
  }

  function handleCopyExplanation() {
    if (!aiResult) return;
    const text = `الكلمة: ${aiResult.word}\nترجمتها في النص المقابل: ${aiResult.arabicWordInTranslation}\nالشرح السياقي: ${aiResult.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const highlightedEnglishText = useMemo(() => {
    return target.englishText.split(new RegExp(`(${target.clean})`, "gi")).map((part, pIdx) =>
      part.toLowerCase() === target.clean.toLowerCase() ? (
        <mark key={pIdx} className="bg-[var(--glow)] text-[var(--paper)] px-1 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }, [target.englishText, target.clean]);

  const highlightedArabicText = useMemo(() => {
    const highlight = aiResult?.arabicWordInTranslation;
    if (!highlight || !target.arabicText.includes(highlight)) {
      return target.arabicText;
    }
    const parts = target.arabicText.split(highlight);
    return parts.map((part, idx) => (
      <span key={idx}>
        {part}
        {idx < parts.length - 1 && (
          <mark className="bg-[var(--glow)] text-[var(--paper)] px-1.5 py-0.5 rounded-md font-bold">
            {highlight}
          </mark>
        )}
      </span>
    ));
  }, [aiResult, target.arabicText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        dir="rtl"
        className="paper-raised rule-line relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="rule-line flex items-center justify-between border-b px-6 py-4 bg-[var(--paper)]">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-2xl font-bold tracking-tight text-[var(--glow)] dir-ltr">
              {target.clean}
            </span>
            <button
              onClick={handlePlayAudio}
              title="استمع لنطق الكلمة"
              className="glow-gradient rounded-full p-2 text-[var(--paper)] transition-transform active:scale-95 shadow-xs"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="ink-soft hover:ink rounded-xl p-1.5 border rule-line transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="rule-line flex border-b bg-[var(--paper)] px-3 pt-2">
          <button
            onClick={() => handleTabChange("lexical")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 font-naskh text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "lexical"
                ? "border-[var(--glow)] text-[var(--glow)]"
                : "border-transparent ink-soft hover:ink"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>المعنى اللغوي المعجمي</span>
          </button>

          <button
            onClick={() => handleTabChange("context")}
            className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-3 font-naskh text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "context"
                ? "border-[var(--glow)] text-[var(--glow)]"
                : "border-transparent ink-soft hover:ink"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>الترجمة من النص المقابل (AI)</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {activeTab === "lexical" && (
            <div className="space-y-4">
              {loadingLexical ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-[var(--glow)]" />
                  <p className="font-naskh text-xs ink-soft">جاري البحث في المعجم...</p>
                </div>
              ) : lexical ? (
                <>
                  {/* Word Details Header */}
                  <div className="flex items-baseline justify-between border-b rule-line pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-xl ink font-bold dir-ltr">
                          {lexical.word}
                        </span>
                        {lexical.phonetic && (
                          <span className="font-mono text-xs ink-soft dir-ltr">
                            {lexical.phonetic}
                          </span>
                        )}
                      </div>
                      {lexical.partOfSpeech && (
                        <span className="mt-1 inline-block rounded-lg bg-[var(--glow)]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--glow)]">
                          {lexical.partOfSpeech}
                        </span>
                      )}
                    </div>

                    <div className="text-left">
                      <span className="font-amiri text-2xl font-bold ink">
                        {lexical.arabicTranslation}
                      </span>
                    </div>
                  </div>

                  {/* English Definition */}
                  {lexical.englishDefinition && (
                    <div className="space-y-1">
                      <p className="font-naskh text-xs ink-soft font-semibold">
                        التاريخ والمعنى بالإنجليزية:
                      </p>
                      <p className="font-editorial text-sm ink dir-ltr bg-[var(--paper)] p-3.5 rounded-2xl border rule-line">
                        {lexical.englishDefinition}
                      </p>
                    </div>
                  )}

                  {/* Example */}
                  {lexical.example && (
                    <div className="space-y-1">
                      <p className="font-naskh text-xs ink-soft font-semibold">مثال استشهادي:</p>
                      <p className="font-editorial text-xs italic ink-soft dir-ltr bg-[var(--paper)]/50 p-3 rounded-2xl border rule-line">
                        "{lexical.example}"
                      </p>
                    </div>
                  )}

                  {/* Synonyms */}
                  {lexical.synonyms && lexical.synonyms.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="font-naskh text-xs ink-soft font-semibold">مرادفات لغوية:</p>
                      <div className="flex flex-wrap gap-1.5 dir-ltr">
                        {lexical.synonyms.map((syn, i) => (
                          <span
                            key={i}
                            className="rounded-full border rule-line px-3 py-0.5 font-editorial text-xs ink bg-[var(--paper)] shadow-2xs"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expanded Dictionary Toggle Section */}
                  <div className="mt-4 pt-4 border-t rule-line">
                    <div className="flex items-center justify-between bg-[var(--paper)] p-3.5 rounded-2xl border rule-line">
                      <div className="flex items-center gap-2.5">
                        <BookMarked className="h-5 w-5 text-[var(--glow)] shrink-0" />
                        <div>
                          <p className="font-naskh text-xs font-bold ink">القاموس الموسع المضمن</p>
                          <p className="font-naskh text-[11px] ink-soft">
                            {isExpanded
                              ? "تم تفعيل القاموس الموسع لجميع المفردات والمصطلحات"
                              : "تفعيل المعجم الموسع المدمج للعمل السريع دون إنترنت"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleExpanded}
                        disabled={downloadingDict}
                        className={`font-naskh text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                          isExpanded
                            ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-600/20"
                            : "glow-gradient text-[var(--paper)] font-semibold shadow-xs"
                        }`}
                      >
                        {downloadingDict ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>جاري التفعيل...</span>
                          </>
                        ) : isExpanded ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>مُفعّل</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>تفعيل القاموس</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {activeTab === "context" && (
            <div className="space-y-4">
              {/* Parallel Comparison Texts Display */}
              <div className="space-y-3">
                {/* English original block */}
                <div className="space-y-1">
                  <p className="font-naskh text-xs font-semibold ink-soft flex items-center gap-1">
                    <span>1. النص الإنجليزي الأصلي:</span>
                  </p>
                  <div className="dir-ltr font-literary text-xs sm:text-sm ink bg-[var(--paper)] p-3.5 rounded-2xl border rule-line leading-relaxed">
                    {highlightedEnglishText}
                  </div>
                </div>

                {/* Arabic parallel translation block */}
                <div className="space-y-1">
                  <p className="font-naskh text-xs font-semibold ink-soft flex items-center gap-1">
                    <span>2. النص العربي المقابل (الترجمة الموازية):</span>
                  </p>
                  <div className="font-naskh text-xs sm:text-sm ink bg-[var(--paper)] p-3.5 rounded-2xl border rule-line leading-relaxed">
                    {highlightedArabicText}
                  </div>
                </div>
              </div>

              {/* AI Parallel Context Extractor */}
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 bg-[var(--paper)] rounded-2xl border rule-line">
                  <Sparkles className="h-7 w-7 animate-pulse text-[var(--glow)]" />
                  <p className="font-naskh text-xs ink font-medium text-center">
                    جاري استخراج موضع ترجمة الكلمة من النص العربي المقابل بالذكاء الاصطناعي...
                  </p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2 text-center">
                  <p className="font-naskh text-xs text-rose-600 dark:text-rose-400">{aiError}</p>
                  <button
                    onClick={fetchAiContext}
                    className="glow-gradient text-[var(--paper)] font-naskh text-xs px-3.5 py-2 rounded-xl font-semibold"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : aiResult ? (
                <div className="space-y-4 animate-in fade-in">
                  {/* Extracted Arabic Word Highlight Box */}
                  <div className="p-4 bg-[var(--glow)]/10 rounded-2xl border border-[var(--glow)]/20 space-y-1">
                    <p className="font-naskh text-xs font-bold text-[var(--glow)]">
                      الترجمة المستخرجة من النص المقابل:
                    </p>
                    <p className="font-amiri text-2xl font-bold ink">
                      "{aiResult.arabicWordInTranslation}"
                    </p>
                  </div>

                  {/* AI Explanation of translator choice */}
                  <div className="space-y-1">
                    <p className="font-naskh text-xs font-bold ink-soft">
                      تحليل خيار المترجم والسياق:
                    </p>
                    <p className="font-naskh text-sm ink leading-relaxed bg-[var(--paper)] p-3.5 rounded-2xl border rule-line">
                      {aiResult.explanation}
                    </p>
                  </div>

                  {/* Matched Sentences Comparison */}
                  {aiResult.matchedSentenceEn && aiResult.matchedSentenceAr && (
                    <div className="space-y-2 border-t rule-line pt-3">
                      <p className="font-naskh text-xs font-bold ink-soft">
                        الجملة المقابلة بالكامل:
                      </p>
                      <div className="space-y-1.5 font-naskh text-xs bg-[var(--paper)] p-3.5 rounded-2xl border rule-line">
                        <p className="dir-ltr font-literary ink font-semibold">
                          EN: {aiResult.matchedSentenceEn}
                        </p>
                        <p className="ink">AR: {aiResult.matchedSentenceAr}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={fetchAiContext}
                      className="ink-soft hover:ink font-naskh text-xs flex items-center gap-1.5 font-semibold"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>إعادة المقارنة</span>
                    </button>

                    <button
                      onClick={handleCopyExplanation}
                      className="glow-gradient text-[var(--paper)] font-naskh text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs font-semibold"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>نسخ التحليل</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
