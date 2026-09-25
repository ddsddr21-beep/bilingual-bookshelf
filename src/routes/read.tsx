import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Settings2,
  Sparkles,
  X,
  Type,
  Sliders,
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  FolderOpen,
  Plus,
} from "lucide-react";
import {
  AR_FONT_CLASS,
  DEFAULT_SETTINGS,
  EN_FONT_CLASS,
  buildPairs,
  loadDoc,
  loadSettings,
  SAMPLE,
  saveSettings,
  saveDoc,
  createNewAlignmentDoc,
  THEME_CLASS,
  type ArFont,
  type EnFont,
  type ReaderLayout,
  type SanctuaryTheme,
  type Settings,
  type TextDoc,
} from "@/lib/reading";
import { cleanWord, preloadDocVocabulary } from "@/lib/dictionary";
import { WordInspector, type WordTarget } from "@/components/WordInspector";
import { AlignmentHistoryDrawer } from "@/components/AlignmentHistoryDrawer";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "محراب القراءة الموازية" },
      {
        name: "description",
        content:
          "بيئة قراءة ورقية أنيقة للنصوص الإنجليزية مع ترجمتها العربية جنباً إلى جنب مع إمكانية البحث والقاموس التفاعلي للغتين.",
      },
    ],
  }),
  component: ReaderComponent,
});

function ReaderComponent() {
  const [doc, setDoc] = useState<TextDoc>(SAMPLE);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [panel, setPanel] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<WordTarget | null>(null);

  // In-paragraph search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterMatchingOnly, setFilterMatchingOnly] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  useEffect(() => {
    const loadedDoc = loadDoc();
    const loadedSettings = loadSettings();
    if (loadedDoc) setDoc(loadedDoc);
    if (loadedSettings) setSettings(loadedSettings);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", settings.theme);
      if (settings.theme === "midnight" || settings.theme === "royal") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [settings.theme]);

  const pairs = useMemo(() => (doc ? buildPairs(doc.en, doc.ar, doc.separator) : []), [doc]);

  // Pre-fetch key vocabulary in background when reading starts
  useEffect(() => {
    if (pairs && pairs.length > 0) {
      preloadDocVocabulary(pairs);
    }
  }, [pairs]);

  // Compute matching pair indices inside paragraphs
  const matchingPairIndices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return pairs
      .map((pair, idx) => {
        const matchEn = pair.en.toLowerCase().includes(q);
        const matchAr = pair.ar.toLowerCase().includes(q);
        return matchEn || matchAr ? idx : -1;
      })
      .filter((idx) => idx !== -1);
  }, [pairs, searchQuery]);

  // Auto-scroll to currently selected match
  const scrollToPair = (pairIndex: number) => {
    const el = document.getElementById(`pair-${pairIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleNextMatch = () => {
    if (matchingPairIndices.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matchingPairIndices.length;
    setActiveMatchIndex(nextIdx);
    scrollToPair(matchingPairIndices[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matchingPairIndices.length === 0) return;
    const prevIdx =
      (activeMatchIndex - 1 + matchingPairIndices.length) % matchingPairIndices.length;
    setActiveMatchIndex(prevIdx);
    scrollToPair(matchingPairIndices[prevIdx]);
  };

  const displayedPairs = useMemo(() => {
    if (!filterMatchingOnly || !searchQuery.trim()) {
      return pairs.map((pair, idx) => ({ pair, originalIndex: idx }));
    }
    return matchingPairIndices.map((idx) => ({
      pair: pairs[idx],
      originalIndex: idx,
    }));
  }, [pairs, filterMatchingOnly, searchQuery, matchingPairIndices]);

  function patch(next: Partial<Settings>) {
    setSettings((prev) => {
      const updated = { ...prev, ...next };
      saveSettings(updated);
      return updated;
    });
  }

  function handleSelectDoc(selected: TextDoc) {
    saveDoc(selected);
    setDoc(selected);
  }

  function handleCreateNewDoc() {
    const fresh = createNewAlignmentDoc();
    setDoc(fresh);
  }

  function arVisible(i: number) {
    if (settings.revealTranslation) return true;
    return Boolean(revealed[i]);
  }

  const enClass = EN_FONT_CLASS[settings.enFont];
  const arClass = AR_FONT_CLASS[settings.arFont];

  const bodyStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
  };

  return (
    <div
      className={`sanctuary min-h-screen font-serif transition-colors duration-300 ${THEME_CLASS[settings.theme]}`}
      data-theme={settings.theme}
    >
      <header className="sticky top-0 z-20 rule-line border-b backdrop-blur-md bg-[var(--paper)]/90 px-5 py-3 transition-colors shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Link
            to="/"
            className="ink-soft hover:ink font-naskh flex items-center gap-1.5 text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">العودة للاستوديو</span>
          </Link>

          <h1 className="font-amiri ink text-base font-bold sm:text-lg tracking-wide truncate max-w-[180px] sm:max-w-xs text-center">
            {doc?.title || "محراب القراءة"}
          </h1>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* History Drawer Trigger Button */}
            <button
              aria-label="سجل المحاذاة والنصوص"
              onClick={() => setShowHistoryDrawer(true)}
              title="سجل المحاذاة والنصوص المحفوظة"
              className="p-2 rounded-xl border rule-line ink-soft hover:ink hover:bg-[var(--paper-raised)] transition-all flex items-center gap-1 text-xs"
            >
              <FolderOpen className="h-4 w-4 text-[var(--glow)]" />
              <span className="font-naskh hidden md:inline font-bold">السجل</span>
            </button>

            <button
              aria-label="البحث داخل الفقرات"
              onClick={() => setShowSearch((prev) => !prev)}
              title="البحث داخل الفقرات والمقاطع"
              className={`p-2 rounded-xl border rule-line transition-all ${
                showSearch || searchQuery
                  ? "glow-gradient text-[var(--paper)] shadow-xs"
                  : "ink-soft hover:ink hover:bg-[var(--paper-raised)]"
              }`}
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              aria-label="تبديل الترجمة"
              onClick={() => patch({ revealTranslation: !settings.revealTranslation })}
              title="إظهار/إخفاء الترجمة"
              className="ink-soft hover:ink p-2 rounded-xl border rule-line hover:bg-[var(--paper-raised)] transition-all"
            >
              {settings.revealTranslation ? (
                <Eye className="h-4 w-4 text-[var(--glow)]" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>

            <button
              aria-label="الإعدادات"
              onClick={() => setPanel(true)}
              title="إعدادات القراءة والخطوط"
              className="glow-gradient text-[var(--paper)] p-2 rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* In-Paragraph Search Bar Header Extension */}
        {(showSearch || searchQuery) && (
          <div className="mx-auto max-w-4xl mt-3 pt-3 border-t rule-line animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ink-soft" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveMatchIndex(0);
                  }}
                  placeholder="ابحث عن كلمة بالإنجليزية أو العربية أو رمز الفاصل أينما وُجد..."
                  className="font-naskh ink w-full rounded-2xl border rule-line bg-[var(--paper)] py-2 pr-10 pl-9 text-xs outline-none transition-all focus:border-[var(--glow)] focus:ring-2 focus:ring-[var(--glow)]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveMatchIndex(0);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 ink-soft hover:ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Match status & Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2 font-naskh text-xs">
                {searchQuery.trim() && (
                  <div className="ink-soft flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[var(--paper-raised)] border rule-line text-[11px]">
                    <Sparkles className="h-3 w-3 text-[var(--glow)]" />
                    <span>
                      {matchingPairIndices.length > 0
                        ? `${activeMatchIndex + 1} من ${matchingPairIndices.length} نتيجة داخل الفقرات`
                        : "لا توجد نتائج مطابقة"}
                    </span>
                  </div>
                )}

                {matchingPairIndices.length > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMatch}
                      title="النتيجة السابقة"
                      className="p-1.5 rounded-lg border rule-line hover:bg-[var(--paper-raised)] ink-soft hover:ink transition-all"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleNextMatch}
                      title="النتيجة التالية"
                      className="p-1.5 rounded-lg border rule-line hover:bg-[var(--paper-raised)] ink-soft hover:ink transition-all"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setFilterMatchingOnly((prev) => !prev)}
                  title="تصفية وعرض النتائج المطابقة فقط"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border rule-line text-xs font-semibold transition-all ${
                    filterMatchingOnly
                      ? "glow-gradient text-[var(--paper)] shadow-xs"
                      : "ink-soft hover:ink hover:bg-[var(--paper-raised)]"
                  }`}
                >
                  <Filter className="h-3 w-3" />
                  <span>تصفية النتائج</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-5 py-8 pb-32">
        {displayedPairs.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Search className="h-10 w-10 mx-auto ink-soft opacity-30" />
            <p className="font-naskh text-base ink font-semibold">
              لا توجد مقاطع مطابقة لكلمة البحث "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterMatchingOnly(false);
              }}
              className="glow-gradient text-[var(--paper)] font-naskh text-xs px-4 py-2 rounded-xl font-bold"
            >
              إلغاء تصفية البحث
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedPairs.map(({ pair, originalIndex }) => {
              const active = arVisible(originalIndex);
              const isMatch = matchingPairIndices.includes(originalIndex);

              return (
                <article
                  key={originalIndex}
                  id={`pair-${originalIndex}`}
                  className={`paper-raised rule-line rounded-3xl border p-6 shadow-sm transition-all duration-300 ${
                    isMatch ? "ring-2 ring-[var(--glow)] border-[var(--glow)]" : ""
                  }`}
                >
                  {/* STACKED LAYOUT */}
                  {settings.layout === "stacked" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <InteractiveText
                          text={pair.en}
                          pairIndex={originalIndex}
                          allPairs={pairs}
                          onWordClick={setSelectedWord}
                          searchQuery={searchQuery}
                          className={`${enClass} ink leading-relaxed text-balance`}
                          style={bodyStyle}
                          dir="ltr"
                        />
                      </div>

                      {active ? (
                        <div className="border-t rule-line pt-4 animate-in fade-in duration-200">
                          <InteractiveText
                            text={pair.ar}
                            pairIndex={originalIndex}
                            allPairs={pairs}
                            onWordClick={setSelectedWord}
                            searchQuery={searchQuery}
                            className={`${arClass} ink-soft leading-relaxed text-balance`}
                            style={bodyStyle}
                            dir="rtl"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevealed((r) => ({ ...r, [originalIndex]: true }))}
                          className="ink-soft hover:ink font-naskh text-xs flex items-center gap-1.5 border border-dashed rule-line px-3 py-1.5 rounded-xl transition-colors mt-2"
                        >
                          <Eye className="h-3.5 w-3.5 text-[var(--glow)]" />
                          <span>إظهار الترجمة المقابلة</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* SIDE-BY-SIDE LAYOUT */}
                  {settings.layout === "side" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <InteractiveText
                        text={pair.en}
                        pairIndex={originalIndex}
                        allPairs={pairs}
                        onWordClick={setSelectedWord}
                        searchQuery={searchQuery}
                        className={`${enClass} ink leading-relaxed text-balance`}
                        style={bodyStyle}
                        dir="ltr"
                      />

                      {active ? (
                        <div className="border-t md:border-t-0 md:border-r rule-line pt-4 md:pt-0 md:pr-6">
                          <InteractiveText
                            text={pair.ar}
                            pairIndex={originalIndex}
                            allPairs={pairs}
                            onWordClick={setSelectedWord}
                            searchQuery={searchQuery}
                            className={`${arClass} ink-soft leading-relaxed text-balance`}
                            style={bodyStyle}
                            dir="rtl"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setRevealed((r) => ({ ...r, [originalIndex]: true }))}
                          className="ink-soft hover:ink font-naskh text-xs flex items-center gap-1.5 border border-dashed rule-line px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-[var(--glow)]" />
                          <span>إظهار الترجمة</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* SINGLE SIDE LAYOUT */}
                  {settings.layout === "single" && (
                    <div className="space-y-3">
                      {settings.single === "en" ? (
                        <InteractiveText
                          text={pair.en}
                          pairIndex={originalIndex}
                          allPairs={pairs}
                          onWordClick={setSelectedWord}
                          searchQuery={searchQuery}
                          className={`${enClass} ink leading-relaxed text-balance`}
                          style={bodyStyle}
                          dir="ltr"
                        />
                      ) : (
                        <InteractiveText
                          text={pair.ar}
                          pairIndex={originalIndex}
                          allPairs={pairs}
                          onWordClick={setSelectedWord}
                          searchQuery={searchQuery}
                          className={`${arClass} ink leading-relaxed text-balance`}
                          style={bodyStyle}
                          dir="rtl"
                        />
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Word Inspector Modal */}
      {selectedWord && (
        <WordInspector target={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {/* Alignment History Drawer */}
      <AlignmentHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        onSelectDoc={handleSelectDoc}
        onNewDoc={handleCreateNewDoc}
        activeDocId={doc?.id}
      />

      {/* Settings Panel Modal */}
      {panel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            dir="rtl"
            className="paper-raised rule-line relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b rule-line pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[var(--glow)]" />
                <h2 className="font-amiri text-xl font-bold ink">إعدادات محراب القراءة</h2>
              </div>
              <button
                onClick={() => setPanel(false)}
                className="ink-soft hover:ink p-1.5 rounded-xl border rule-line transition-colors"
                aria-label="إغلاق الإعدادات"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Layout Style */}
            <Group label="نمط عرض المحاذاة">
              <Choices<ReaderLayout>
                value={settings.layout}
                onChange={(layout) => patch({ layout })}
                options={[
                  ["stacked", "متتالي (مقطع تحت مقطع)"],
                  ["side", "عمودين متوازيين"],
                  ["single", "نص منفرد"],
                ]}
              />
            </Group>

            {/* Single Side Toggle */}
            {settings.layout === "single" && (
              <Group label="اللغة المعروضة في النص المنفرد">
                <Choices<"en" | "ar">
                  value={settings.single}
                  onChange={(single) => patch({ single })}
                  options={[
                    ["en", "الإنجليزية فقط"],
                    ["ar", "العربية فقط"],
                  ]}
                />
              </Group>
            )}

            {/* Themes */}
            <Group label="ثيم الصفحة الورقية">
              <Choices<SanctuaryTheme>
                value={settings.theme}
                onChange={(theme) => patch({ theme })}
                options={[
                  ["parchment", "ورقي دافئ"],
                  ["midnight", "ليلي هادئ"],
                  ["emerald", "زمردي فاخر"],
                  ["sand", "صحراوي"],
                  ["royal", "ملكي"],
                ]}
              />
            </Group>

            {/* English Font Family */}
            <Group label="خط النص الإنجليزي (English Typography)">
              <Choices<EnFont>
                value={settings.enFont}
                onChange={(enFont) => patch({ enFont })}
                options={[
                  ["literary", "روائي (Garamond)"],
                  ["editorial", "صحفي (Playfair)"],
                  ["cormorant", "كلاسيكي (Cormorant)"],
                  ["modern", "معاصر (Jakarta)"],
                  ["mono", "تقني (Mono)"],
                ]}
              />
            </Group>

            {/* Arabic Font Family */}
            <Group label="خط النص العربي (Arabic Typography)">
              <Choices<ArFont>
                value={settings.arFont}
                onChange={(arFont) => patch({ arFont })}
                options={[
                  ["naskh", "نسخ حديث (Naskh)"],
                  ["amiri", "أميري أصيل (Amiri)"],
                  ["kufi", "كوفي أنيق (Kufi)"],
                  ["tajawal", "تجوال معاصر (Tajawal)"],
                  ["aref", "رقعة تراثي (Ruqaa)"],
                ]}
              />
            </Group>

            {/* Font Preview Badge */}
            <div className="mb-6 p-4 bg-[var(--paper)] rounded-2xl border rule-line space-y-2 dir-ltr">
              <div className="flex items-center gap-1.5 font-naskh text-xs font-semibold ink-soft dir-rtl">
                <Type className="h-3.5 w-3.5 text-[var(--glow)]" />
                <span>معاينة الخطين المحددين:</span>
              </div>
              <p className={`${enClass} text-sm ink font-semibold`}>
                "Life is long enough if you know how to use it well."
              </p>
              <p dir="rtl" className={`${arClass} text-sm ink`}>
                "الحياة طويلة بما يكفي إذا أحسنت استغلالها."
              </p>
            </div>

            {/* Font Size Slider */}
            <Group label={`حجم الخط المقروء — ${settings.fontSize}px`}>
              <input
                type="range"
                min={15}
                max={32}
                value={settings.fontSize}
                onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                className="w-full accent-[var(--glow)] cursor-pointer"
              />
            </Group>

            {/* Line Height Slider */}
            <Group label={`تباعد الأسطر — ${settings.lineHeight.toFixed(1)}`}>
              <input
                type="range"
                min={1.4}
                max={2.6}
                step={0.1}
                value={settings.lineHeight}
                onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
                className="w-full accent-[var(--glow)] cursor-pointer"
              />
            </Group>
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveText({
  text,
  pairIndex,
  allPairs,
  onWordClick,
  searchQuery = "",
  className,
  style,
  dir = "ltr",
}: {
  text: string;
  pairIndex: number;
  allPairs: Array<{ en: string; ar: string }>;
  onWordClick: (target: WordTarget) => void;
  searchQuery?: string;
  className?: string;
  style?: React.CSSProperties;
  dir?: string;
}) {
  const contextData = useMemo(() => {
    const currentPair = allPairs[pairIndex];
    if (!currentPair) {
      return {
        englishText: text,
        arabicText: "",
        currentSentenceAr: "",
        currentSentenceEn: "",
        contextSentencesAr: [],
        contextSentencesEn: [],
      };
    }
    const contextAr: string[] = [];
    const contextEn: string[] = [];

    // Collect up to 3 previous sentences (Requirement 7: 3 before + 1 current + 3 after)
    for (let i = Math.max(0, pairIndex - 3); i < pairIndex; i++) {
      if (allPairs[i]) {
        contextAr.push(allPairs[i]!.ar);
        contextEn.push(allPairs[i]!.en);
      }
    }

    // Current sentence
    contextAr.push(currentPair.ar);
    contextEn.push(currentPair.en);

    // Collect up to 3 next sentences (Requirement 7: 3 before + 1 current + 3 after)
    for (let i = pairIndex + 1; i <= Math.min(allPairs.length - 1, pairIndex + 3); i++) {
      if (allPairs[i]) {
        contextAr.push(allPairs[i]!.ar);
        contextEn.push(allPairs[i]!.en);
      }
    }

    return {
      englishText: contextEn.join(" "),
      arabicText: contextAr.join(" "),
      currentSentenceAr: currentPair.ar,
      currentSentenceEn: currentPair.en,
      contextSentencesAr: contextAr,
      contextSentencesEn: contextEn,
    };
  }, [pairIndex, allPairs, text]);

  // Tokenize supporting English and Arabic letter ranges
  const tokens = useMemo(() => {
    return text.split(
      /(\s+|[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF'-]+)/,
    );
  }, [text]);

  const cleanQuery = searchQuery.trim().toLowerCase();

  return (
    <p dir={dir} style={style} className={className}>
      {tokens.map((token, idx) => {
        const clean = cleanWord(token);
        const isMatch = cleanQuery && token.toLowerCase().includes(cleanQuery);

        if (!clean) {
          return (
            <span
              key={idx}
              className={
                isMatch ? "bg-[var(--glow)]/30 text-[var(--glow)] font-bold rounded px-0.5" : ""
              }
            >
              {token}
            </span>
          );
        }

        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              onWordClick({
                word: token,
                clean,
                pairIndex,
                englishText: contextData.englishText,
                arabicText: contextData.arabicText,
                currentSentenceAr: contextData.currentSentenceAr,
                currentSentenceEn: contextData.currentSentenceEn,
                contextSentencesAr: contextData.contextSentencesAr,
                contextSentencesEn: contextData.contextSentencesEn,
                rect: e.currentTarget.getBoundingClientRect(),
              });
            }}
            className={`cursor-pointer hover:bg-[var(--glow)]/20 hover:text-[var(--glow)] rounded-md px-[2px] py-[1px] transition-all underline-offset-4 hover:underline ${
              isMatch
                ? "bg-[var(--glow)]/30 text-[var(--glow)] font-bold ring-1 ring-[var(--glow)]/40"
                : ""
            }`}
            title={`انقر لمعرفة معنى "${clean}"`}
          >
            {token}
          </span>
        );
      })}
    </p>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="ink-soft font-naskh mb-2 text-xs font-semibold">{label}</p>
      {children}
    </div>
  );
}

function Choices<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<readonly [T, string]>;
}) {
  return (
    <div className="rule-line flex flex-wrap gap-1.5 rounded-2xl border bg-[var(--paper)] p-1.5">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`font-naskh flex-1 min-w-[110px] rounded-xl py-2 px-2 text-xs font-semibold transition-all ${
            value === key ? "glow-gradient text-[var(--paper)] shadow-xs" : "ink-soft hover:ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
