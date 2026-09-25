import { useState, useEffect, useMemo } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Search,
  Layers,
  Link as LinkIcon,
  Cpu,
  BookmarkCheck,
  Languages,
} from "lucide-react";
import {
  getWordReferenceEntry,
  cleanWord,
  searchLexiconEntries,
  type WordReferenceEntry,
} from "@/lib/dictionary";
import { isArabicWord } from "@/lib/ai-explain";

export type WordTarget = {
  word: string;
  clean: string;
  pairIndex: number;
  englishText: string;
  arabicText: string;
  currentSentenceAr?: string;
  currentSentenceEn?: string;
  contextSentencesAr?: string[];
  contextSentencesEn?: string[];
  rect?: DOMRect | null;
};

type Props = {
  target: WordTarget;
  onClose: () => void;
};

export function WordInspector({ target, onClose }: Props) {
  // Current active word being inspected
  const [currentWord, setCurrentWord] = useState<string>(target.clean || target.word);
  const [searchInput, setSearchInput] = useState<string>("");

  // Lexicon Entry State
  const [entry, setEntry] = useState<WordReferenceEntry | null>(null);
  const [loadingLexical, setLoadingLexical] = useState(true);

  // Copy state
  const [copied, setCopied] = useState(false);

  const isAr = useMemo(() => isArabicWord(currentWord), [currentWord]);

  // Search live suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    return searchLexiconEntries(searchInput).slice(0, 5);
  }, [searchInput]);

  // Fetch Entry whenever currentWord changes
  useEffect(() => {
    let active = true;
    setLoadingLexical(true);

    getWordReferenceEntry(currentWord, {
      currentSentenceAr: target.currentSentenceAr,
      currentSentenceEn: target.currentSentenceEn,
      contextSentencesAr: target.contextSentencesAr,
      contextSentencesEn: target.contextSentencesEn,
    })
      .then((res) => {
        if (active) {
          setEntry(res);
          setLoadingLexical(false);
        }
      })
      .catch(() => {
        if (active) setLoadingLexical(false);
      });

    return () => {
      active = false;
    };
  }, [currentWord, target]);

  // Handle Search Input Submission for manual lookup
  function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = cleanWord(searchInput);
    if (cleaned) {
      setCurrentWord(cleaned);
      setSearchInput("");
    }
  }

  function handleCopyEntry() {
    if (!entry) return;
    const text = `الكلمة: ${entry.word}\nالمقابل الإنجليزي: ${entry.contextualEnglishWord || entry.targetEnglishWord}\nالمعنى العربي: ${entry.meanings[0]?.arabicDefinition || ""}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        dir="rtl"
        className="paper-raised rule-line relative w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar & Search */}
        <div className="rule-line border-b px-5 py-3.5 bg-[var(--paper)] space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="glow-gradient flex h-9 w-9 items-center justify-center rounded-xl text-[var(--paper)] shadow-xs">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <span className="font-amiri text-lg font-bold ink">
                  المعجم المقارن للقراءة الموازية
                </span>
                <p className="font-naskh text-[11px] ink-soft">
                  استخراج المقابل السياقي مع المعاني والأمثلة من قواعد البيانات المحلية
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="ink-soft hover:ink rounded-xl p-1.5 border rule-line transition-colors"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Word Search Bar */}
          <form onSubmit={handleManualSearch} className="flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-2.5 h-4 w-4 ink-soft" />
                <input
                  type="text"
                  dir={isAr ? "rtl" : "ltr"}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن أي مفردة بالعربية أو الإنجليزية..."
                  className="rule-line font-naskh ink w-full rounded-xl border bg-[var(--paper-raised)] pr-9 pl-3 py-1.5 text-sm outline-none focus:border-[var(--glow)] focus:ring-1 focus:ring-[var(--glow)]"
                />
              </div>
              <button
                type="submit"
                className="glow-gradient text-[var(--paper)] font-naskh text-xs px-3.5 py-2 rounded-xl font-semibold shadow-xs"
              >
                بحث
              </button>
            </div>

            {/* Live Search Auto-suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="font-naskh text-[10px] ink-soft">اقتراحات المعجم:</span>
                {searchSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentWord(s.word);
                      setSearchInput("");
                    }}
                    className="font-naskh text-[11px] px-2 py-0.5 rounded-md border rule-line bg-[var(--paper)] hover:border-[var(--glow)] hover:text-[var(--glow)] transition-colors"
                  >
                    {s.word} {s.targetEnglishWord && `(${s.targetEnglishWord})`}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Word Title & Source Badge Bar */}
        <div className="px-6 py-3.5 bg-[var(--paper-raised)]/70 border-b rule-line flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-2xl font-bold tracking-tight text-[var(--glow)] ${
                isAr ? "font-amiri" : "font-editorial dir-ltr"
              }`}
            >
              {currentWord}
            </span>

            {/* Farahidi Lemma if Arabic */}
            {entry?.arabicLemma && isAr && (
              <span className="font-naskh text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                الجذر الصرفي: {entry.arabicLemma}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEntry}
              className="ink-soft hover:ink p-1.5 rounded-lg border rule-line text-xs flex items-center gap-1"
              title="نسخ البطاقة"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="font-naskh text-[10px] hidden sm:inline">
                {copied ? "تم النسخ" : "نسخ"}
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {loadingLexical ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[var(--glow)] border-t-transparent" />
              <p className="font-naskh text-sm ink-soft">
                جاري مطابقة المعنى واستخراج البيانات المعجمية...
              </p>
            </div>
          ) : !entry ? (
            <div className="py-12 text-center space-y-2">
              <p className="font-naskh text-sm ink">
                لم يتم العثور على مدخل معجمي مطابق لهذه اللفظة.
              </p>
              <p className="font-naskh text-xs ink-soft">
                يمكنك تجربة كتابة أصل الكلمة في مربع البحث أعلاه.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* SECTION 1: Contextual Translation OR Multiple Candidate Translations */}
              {entry.sourceMode === "ai_context_with_local_lexicon" &&
              entry.contextualEnglishWord ? (
                <div className="p-4 rounded-2xl bg-[var(--paper)] border rule-line space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="font-naskh">الترجمة السياقية في النص المقابل:</span>
                    </div>
                    <span className="text-[10px] font-naskh bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      تم التحديد بواسطة الذكاء الاصطناعي
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="font-editorial dir-ltr text-2xl font-bold text-[var(--glow)]">
                      {entry.contextualEnglishWord}
                    </span>
                    {entry.targetEnglishWord !== entry.contextualEnglishWord && (
                      <span className="font-naskh text-xs ink-soft">
                        (الأصل المعجمي:{" "}
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 dir-ltr">
                          {entry.targetEnglishWord}
                        </span>
                        )
                      </span>
                    )}
                  </div>

                  {entry.contextExplanation && (
                    <div className="pt-2 border-t rule-line space-y-1">
                      <span className="font-naskh text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        ملاحظة سياقية من الذكاء الاصطناعي (خاصة بموضع النص):
                      </span>
                      <p className="font-naskh text-xs ink-soft leading-relaxed">
                        {entry.contextExplanation}
                      </p>
                    </div>
                  )}

                  {/* Current Reading Sentence as Text Context (Not Lexical Example) */}
                  {target.currentSentenceAr && target.currentSentenceEn && (
                    <div className="pt-2 border-t rule-line space-y-1.5">
                      <span className="font-naskh text-[10px] font-bold ink-soft">
                        السياق الحالي في النص:
                      </span>
                      <div className="p-2.5 rounded-xl bg-[var(--paper-raised)] border rule-line space-y-1 text-xs">
                        <p className="font-amiri leading-relaxed ink text-right">
                          {target.currentSentenceAr}
                        </p>
                        <p className="font-editorial dir-ltr leading-relaxed ink-soft italic text-left">
                          "{target.currentSentenceEn}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : entry.candidateTranslations && entry.candidateTranslations.length > 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--paper)] border rule-line space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <Cpu className="h-4 w-4 text-indigo-500" />
                      <span className="font-naskh">الاحتمالات المعجمية (المسار المحلي):</span>
                    </div>
                    <span className="text-[10px] font-naskh bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                      فراهيدي + FreeDict
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.candidateTranslations.map((cand, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentWord(cand)}
                        className="font-editorial dir-ltr text-sm font-bold bg-[var(--paper-raised)] hover:bg-[var(--glow)]/10 hover:text-[var(--glow)] border rule-line px-3 py-1 rounded-xl transition-all"
                      >
                        {cand}
                      </button>
                    ))}
                  </div>

                  <p className="font-naskh text-[11px] ink-soft leading-relaxed">
                    يعرض المسار المحلي عدة مقابلات محتملة من قاموس FreeDict وقواعد بيانات Open
                    WordNet دون افتراض ترجيح سياقي واحد.
                  </p>
                </div>
              ) : null}

              {/* SECTION 2: Local Linguistic Meaning & Definitions (Open English WordNet & Wiktextract) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-[var(--glow)]" />
                  <h3 className="font-amiri text-base font-bold ink">
                    التعريف المعجمي المحلي (Open English WordNet & Wiktextract)
                  </h3>
                </div>

                {entry.meanings.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[var(--paper)] border rule-line text-center space-y-1.5">
                    <span className="font-naskh text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
                      لا توجد بيانات معجمية محلية
                    </span>
                    <p className="font-naskh text-xs ink-soft">
                      لم يتم العثور على مدخل معجمي مسجل لهذه المفردة في قواعد بيانات WordNet أو
                      Wiktextract المحلية.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {entry.meanings.map((meaning, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-4 rounded-2xl bg-[var(--paper)] border rule-line space-y-3 transition-all hover:border-[var(--glow)]/30"
                      >
                        {/* POS and Arabic Translation Header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b rule-line">
                          <div className="flex items-center gap-2">
                            <span className="font-naskh text-xs px-2.5 py-0.5 rounded-full bg-[var(--glow)]/10 text-[var(--glow)] font-bold">
                              {meaning.partOfSpeech}
                            </span>
                            <span className="font-amiri text-base font-bold ink">
                              {meaning.arabicTranslation}
                            </span>
                          </div>
                        </div>

                        {/* English Definition */}
                        <div className="space-y-1">
                          <p className="font-naskh text-[10px] ink-soft font-medium">
                            التعريف الإنجليزي المعجمي (WordNet Definition):
                          </p>
                          <p className="font-editorial dir-ltr text-sm leading-relaxed ink text-left">
                            {meaning.englishDefinition}
                          </p>
                        </div>

                        {/* Arabic Gloss / Definition */}
                        {meaning.arabicDefinition && (
                          <div className="space-y-1">
                            <p className="font-naskh text-[10px] ink-soft font-medium">
                              المعنى والدلالة بالعربية:
                            </p>
                            <p className="font-naskh text-xs leading-relaxed ink-soft">
                              {meaning.arabicDefinition}
                            </p>
                          </div>
                        )}

                        {/* Real Usage Examples from local databases */}
                        {meaning.examples && meaning.examples.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t rule-line">
                            <p className="font-naskh text-[10px] ink-soft font-medium">
                              أمثلة استخدام حقيقية (WordNet & Wiktextract):
                            </p>
                            <div className="space-y-1.5">
                              {meaning.examples.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="p-2.5 rounded-xl bg-[var(--paper-raised)] border rule-line"
                                >
                                  <p className="font-editorial dir-ltr text-xs leading-relaxed ink italic text-left">
                                    "{ex}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Synonyms & Semantic Relations */}
                        {meaning.synonyms && meaning.synonyms.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t rule-line">
                            <p className="font-naskh text-[10px] ink-soft font-medium">
                              المرادفات والعلاقات الدلالية:
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {meaning.synonyms.map((syn, synIdx) => (
                                <button
                                  key={synIdx}
                                  type="button"
                                  onClick={() => setCurrentWord(syn)}
                                  className="font-editorial dir-ltr text-xs px-2.5 py-1 rounded-lg border rule-line bg-[var(--paper-raised)] hover:border-[var(--glow)] hover:text-[var(--glow)] transition-colors"
                                >
                                  {syn}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Etymology & Root History */}
                        {meaning.etymology && (
                          <div className="space-y-1 pt-2 border-t rule-line">
                            <p className="font-naskh text-[10px] ink-soft font-medium">
                              أصل واشتقاق اللفظة (Etymology):
                            </p>
                            <p className="font-editorial dir-ltr text-xs text-amber-800 dark:text-amber-200/90 italic text-left">
                              {meaning.etymology}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Provenance Footer */}
              <div className="p-3 rounded-xl bg-[var(--paper-raised)] border rule-line flex items-center justify-between text-[11px] font-naskh ink-soft">
                <div className="flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5 text-[var(--glow)]" />
                  <span>{entry.sourceLabel}</span>
                </div>
                <span>قواعد بيانات محلية 100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
