import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, Settings2, Sparkles, X, Type, Sliders } from "lucide-react";
import {
  AR_FONT_CLASS,
  DEFAULT_SETTINGS,
  EN_FONT_CLASS,
  loadDoc,
  loadSettings,
  SAMPLE,
  saveSettings,
  THEME_CLASS,
  type ArFont,
  type EnFont,
  type ReaderLayout,
  type SanctuaryTheme,
  type Settings,
  type TextDoc,
} from "@/lib/reading";
import { cleanWord } from "@/lib/dictionary";
import { WordInspector, type WordTarget } from "@/components/WordInspector";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "محراب القراءة الموازية" },
      {
        name: "description",
        content: "بيئة قراءة ورقية أنيقة للنصوص الإنجليزية مع ترجمتها العربية جنباً إلى جنب.",
      },
    ],
  }),
  component: ReaderComponent,
});

function ReaderComponent() {
  const [doc, setDoc] = useState<TextDoc | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [panel, setPanel] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<WordTarget | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
    setDoc(loadDoc() ?? SAMPLE);
  }, []);

  const pairs = useMemo(() => (doc ? buildPairs(doc.en, doc.ar, doc.separator) : []), [doc]);

  function patch(next: Partial<Settings>) {
    setSettings((prev) => {
      const updated = { ...prev, ...next };
      saveSettings(updated);
      return updated;
    });
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
      <header className="sticky top-0 z-20 rule-line border-b backdrop-blur-md bg-[var(--paper)]/85 px-5 py-3.5 transition-colors">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            to="/"
            className="ink-soft hover:ink font-naskh flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للاستوديو</span>
          </Link>

          <h1 className="font-amiri ink text-base font-bold sm:text-lg tracking-wide truncate max-w-[200px] sm:max-w-xs text-center">
            {doc?.title ?? "محراب القراءة"}
          </h1>

          <div className="flex items-center gap-1.5">
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
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-6">
        {/* Helper Hint Banner */}
        <div className="mb-6 flex items-center gap-2.5 rounded-2xl border rule-line bg-[var(--paper-raised)]/90 p-3.5 text-xs ink-soft font-naskh shadow-xs">
          <Sparkles className="h-4 w-4 text-[var(--glow)] shrink-0" />
          <span>
            اضغط على أي كلمة في النص لعرض القاموس اللغوي المضمن أو استخراج ترجمتها المباشرة من النص
            العربي المقابل عبر الذكاء الاصطناعي.
          </span>
        </div>

        {pairs.length === 0 ? (
          <p className="ink-soft font-naskh text-center text-sm py-12">
            لا يوجد نص بعد — عد إلى الاستوديو وألصق نصّيك.
          </p>
        ) : settings.layout === "single" ? (
          <article style={bodyStyle} className={settings.single === "en" ? enClass : arClass}>
            <div dir={settings.single === "en" ? "ltr" : "rtl"} className="ink space-y-6">
              {pairs.map((pair, i) =>
                settings.single === "en" ? (
                  <InteractiveText
                    key={i}
                    text={pair.en}
                    pairIndex={i}
                    allPairs={pairs}
                    onWordClick={setSelectedWord}
                    style={bodyStyle}
                    className="ink leading-relaxed"
                  />
                ) : (
                  <p key={i} className="leading-relaxed">
                    {pair.ar}
                  </p>
                ),
              )}
            </div>
          </article>
        ) : settings.layout === "side" ? (
          <div className="space-y-7">
            {pairs.map((pair, i) => (
              <div key={i} className="rule-line grid grid-cols-2 gap-5 border-b pb-6 last:border-0">
                <InteractiveText
                  text={pair.en}
                  pairIndex={i}
                  allPairs={pairs}
                  onWordClick={setSelectedWord}
                  style={bodyStyle}
                  className={`${enClass} ink`}
                  dir="ltr"
                />
                <p
                  onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                  style={bodyStyle}
                  className={`${arClass} ${arVisible(i) ? "ink-soft" : "ink-soft opacity-0"} transition-opacity cursor-pointer`}
                >
                  {pair.ar}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {pairs.map((pair, i) => (
              <div key={i} className="group">
                <InteractiveText
                  text={pair.en}
                  pairIndex={i}
                  allPairs={pairs}
                  onWordClick={setSelectedWord}
                  style={bodyStyle}
                  className={`${enClass} ink`}
                  dir="ltr"
                />
                {arVisible(i) ? (
                  <p
                    style={{ ...bodyStyle, fontSize: `${settings.fontSize - 1}px` }}
                    className={`${arClass} ink-soft mt-2.5 transition-colors`}
                  >
                    {pair.ar}
                  </p>
                ) : (
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                    className="glow-text font-naskh mt-2 text-xs underline font-semibold"
                  >
                    إظهار الترجمة المقابلة
                  </button>
                )}
                <div className="rule-line mt-6 border-b opacity-60" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Word Inspector Modal Popover */}
      {selectedWord && (
        <WordInspector target={selectedWord} onClose={() => setSelectedWord(null)} />
      )}

      {/* Settings Drawer Panel */}
      {panel && (
        <div
          className="fixed inset-0 z-30 flex items-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPanel(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="paper-raised rule-line max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t p-6 shadow-2xl transition-all"
          >
            <div className="mb-6 flex items-center justify-between border-b rule-line pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-[var(--glow)]" />
                <h2 className="font-amiri ink text-xl font-bold">إعدادات تخصيص المِحراب</h2>
              </div>
              <button
                aria-label="إغلاق"
                onClick={() => setPanel(false)}
                className="ink-soft hover:ink p-1.5 rounded-xl border rule-line"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Layout Options */}
            <Group label="تنسيق وشكل الصفحة">
              <Choices<ReaderLayout>
                value={settings.layout}
                onChange={(layout) => patch({ layout })}
                options={[
                  ["stacked", "متتالي (سياقي)"],
                  ["side", "عمودين (متجاور)"],
                  ["single", "نص واحد فقط"],
                ]}
              />
            </Group>

            {settings.layout === "single" && (
              <Group label="اللغة المعروضة">
                <Choices<"en" | "ar">
                  value={settings.single}
                  onChange={(single) => patch({ single })}
                  options={[
                    ["en", "النص الإنجليزي"],
                    ["ar", "الترجمة العربية"],
                  ]}
                />
              </Group>
            )}

            {/* Theme Picker */}
            <Group label="لون وثيم محراب القراءة">
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
  className,
  style,
  dir = "ltr",
}: {
  text: string;
  pairIndex: number;
  allPairs: Array<{ en: string; ar: string }>;
  onWordClick: (target: WordTarget) => void;
  className?: string;
  style?: React.CSSProperties;
  dir?: string;
}) {
  const { englishText, arabicText } = useMemo(() => {
    const currentPair = allPairs[pairIndex];
    if (!currentPair) {
      return { englishText: text, arabicText: "" };
    }
    const enList: string[] = [];
    const arList: string[] = [];

    if (pairIndex > 0 && allPairs[pairIndex - 1]) {
      enList.push(allPairs[pairIndex - 1]!.en);
      arList.push(allPairs[pairIndex - 1]!.ar);
    }

    enList.push(currentPair.en);
    arList.push(currentPair.ar);

    if (pairIndex < allPairs.length - 1 && allPairs[pairIndex + 1]) {
      enList.push(allPairs[pairIndex + 1]!.en);
      arList.push(allPairs[pairIndex + 1]!.ar);
    }

    return {
      englishText: enList.join(" "),
      arabicText: arList.join(" "),
    };
  }, [pairIndex, allPairs, text]);

  const tokens = useMemo(() => {
    return text.split(/(\s+|[^\w\s'-]+)/);
  }, [text]);

  return (
    <p dir={dir} style={style} className={className}>
      {tokens.map((token, idx) => {
        const clean = cleanWord(token);
        if (!clean) {
          return <span key={idx}>{token}</span>;
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
                englishText,
                arabicText,
                rect: e.currentTarget.getBoundingClientRect(),
              });
            }}
            className="cursor-pointer hover:bg-[var(--glow)]/20 hover:text-[var(--glow)] rounded-md px-[2px] py-[1px] transition-all underline-offset-4 hover:underline"
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

function buildPairs(en: string, ar: string, separator: string) {
  const cleanSep = separator || "\n\n";
  const enBlocks = en
    .split(cleanSep)
    .map((s) => s.trim())
    .filter(Boolean);
  const arBlocks = ar
    .split(cleanSep)
    .map((s) => s.trim())
    .filter(Boolean);

  const len = Math.max(enBlocks.length, arBlocks.length);
  const res: Array<{ en: string; ar: string }> = [];

  for (let i = 0; i < len; i++) {
    res.push({
      en: enBlocks[i] ?? "",
      ar: arBlocks[i] ?? "",
    });
  }

  return res;
}
