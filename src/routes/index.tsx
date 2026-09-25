import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Columns2,
  Rows3,
  FileText,
  Sparkles,
  ArrowLeft,
  Palette,
  RotateCcw,
} from "lucide-react";
import {
  DEFAULT_SETTINGS,
  SAMPLE,
  buildPairs,
  loadDoc,
  loadSettings,
  saveDoc,
  saveSettings,
  type Settings,
  type TextDoc,
  type SanctuaryTheme,
} from "@/lib/reading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "استوديو النصوص — محراب القراءة الموازية" },
      {
        name: "description",
        content:
          "الصق النص الإنجليزي وترجمته العربية، حدّد رمز الفصل، وابدأ القراءة الموازية على صفحة ورقية أنيقة.",
      },
      { property: "og:title", content: "استوديو النصوص — محراب القراءة الموازية" },
      {
        property: "og:description",
        content: "بيئة قراءة ورقية أنيقة تجمع النص الأصلي وترجمته بدقة جملة بجملة.",
      },
    ],
  }),
  component: Studio,
});

function Studio() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"en" | "ar">("en");
  const [doc, setDoc] = useState<TextDoc>({
    title: "",
    en: "",
    ar: "",
    separator: DEFAULT_SETTINGS.separator,
    updatedAt: 0,
  });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadDoc();
    const storedSettings = loadSettings();
    setSettings(storedSettings);
    setDoc(stored ?? { ...SAMPLE, separator: storedSettings.separator, updatedAt: Date.now() });
    setReady(true);
  }, []);

  const pairs = buildPairs(doc.en, doc.ar, doc.separator);
  const mismatch = pairs.filter((p) => !p.en || !p.ar).length;

  function update(patch: Partial<TextDoc>) {
    setDoc((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
  }

  function start() {
    saveDoc({ ...doc, updatedAt: Date.now() });
    saveSettings({ ...settings, separator: doc.separator });
    navigate({ to: "/read" });
  }

  return (
    <div
      dir="rtl"
      className="sanctuary min-h-screen transition-colors duration-300"
      data-theme={settings.theme}
    >
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-10">
        {/* Header Hero Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <span className="glow-gradient flex h-12 w-12 items-center justify-center rounded-2xl shadow-md text-[var(--paper)] transition-transform hover:scale-105">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-amiri text-2xl font-bold leading-tight ink">
                  محراب القراءة الموازية
                </h1>
                <span className="rounded-full bg-[var(--glow)]/10 px-2.5 py-0.5 font-naskh text-[11px] font-semibold text-[var(--glow)]">
                  الجيل الثالث
                </span>
              </div>
              <p className="ink-soft font-naskh text-xs sm:text-sm mt-0.5">
                نصٌّ أصيل وترجمته، على صفحة ورقية أنيقة تدعم القاموس التفاعلي والمقارنة الآلية.
              </p>
            </div>
          </div>
        </div>

        {/* Text Input Card */}
        <section className="paper-raised rule-line mt-8 rounded-3xl border p-5 sm:p-6 shadow-xl transition-all">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="ink-soft font-naskh text-xs font-semibold">
                عنوان النص أو الكتاب
              </label>
              <input
                value={doc.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="مثال: تأملات سينيكا في قصر الحياة"
                className="rule-line font-naskh ink mt-1.5 w-full rounded-2xl border bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--glow)] focus:ring-2 focus:ring-[var(--glow)]/20"
              />
            </div>

            <div>
              <label className="ink-soft font-naskh text-xs font-semibold">رمز الفاصل للجمل</label>
              <input
                value={doc.separator}
                onChange={(e) => update({ separator: e.target.value })}
                placeholder="#"
                className="rule-line ink mt-1.5 w-full rounded-2xl border bg-[var(--paper)] px-3.5 py-2.5 text-center font-mono text-base font-bold outline-none transition-all focus:border-[var(--glow)] focus:ring-2 focus:ring-[var(--glow)]/20"
              />
            </div>
          </div>

          {/* Language Tabs */}
          <div className="rule-line mt-6 flex gap-1 rounded-2xl border bg-[var(--paper)] p-1.5">
            {(
              [
                ["en", "النص الإنجليزي الأصلي"],
                ["ar", "الترجمة العربية المقابلة"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`font-naskh flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                  tab === key ? "glow-gradient text-[var(--paper)] shadow-md" : "ink-soft hover:ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Text Area Input */}
          {tab === "en" ? (
            <textarea
              dir="ltr"
              value={doc.en}
              onChange={(e) => update({ en: e.target.value })}
              rows={11}
              placeholder={"# First sentence.\n# Second sentence."}
              className="rule-line font-literary ink mt-4 w-full rounded-2xl border bg-[var(--paper)] p-4 text-[17px] leading-relaxed outline-none transition-all focus:border-[var(--glow)] focus:ring-2 focus:ring-[var(--glow)]/15"
            />
          ) : (
            <textarea
              value={doc.ar}
              onChange={(e) => update({ ar: e.target.value })}
              rows={11}
              placeholder={"# الجملة الأولى.\n# الجملة الثانية."}
              className="rule-line font-naskh ink mt-4 w-full rounded-2xl border bg-[var(--paper)] p-4 text-[17px] leading-loose outline-none transition-all focus:border-[var(--glow)] focus:ring-2 focus:ring-[var(--glow)]/15"
            />
          )}

          {/* Realtime Alignment Status Counter */}
          <div className="mt-4 flex items-center justify-between border-t rule-line pt-3 text-xs">
            <div className="ink-soft font-naskh flex items-center gap-1.5 font-medium">
              <Sparkles className="h-4 w-4 text-[var(--glow)]" />
              {ready ? (
                <span>
                  {pairs.length} مقطع مزدوج
                  {mismatch > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold ms-1">
                      ({mismatch} غير متطابق)
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ms-1">
                      (تطابق كامل 1:1)
                    </span>
                  )}
                </span>
              ) : (
                <span>جارٍ التحضير…</span>
              )}
            </div>

            <button
              onClick={() => update({ ...SAMPLE, updatedAt: Date.now() })}
              className="ink-soft hover:ink font-naskh flex items-center gap-1 text-xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>تحميل نص تجريبي (سينيكا)</span>
            </button>
          </div>
        </section>

        {/* Display Layout Picker */}
        <section className="mt-8">
          <p className="ink-soft font-naskh mb-3 text-xs font-semibold">شكل العرض والتنسيق</p>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["stacked", "متتالي", Rows3, "مقطع تحت مقطع"],
                ["side", "متجاور", Columns2, "عمودين متوازيين"],
                ["single", "نص واحد", FileText, "نص منفرد مدمج"],
              ] as const
            ).map(([key, label, Icon, desc]) => (
              <button
                key={key}
                onClick={() => setSettings((s) => ({ ...s, layout: key }))}
                className={`rule-line flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 transition-all ${
                  settings.layout === key
                    ? "paper-raised border-[var(--glow)] shadow-md ring-1 ring-[var(--glow)]"
                    : "hover:bg-[var(--paper-raised)]"
                }`}
              >
                <Icon className={`h-5 w-5 ${settings.layout === key ? "glow-text" : "ink-soft"}`} />
                <span className="font-naskh ink text-xs font-bold">{label}</span>
                <span className="font-naskh text-[10px] ink-soft opacity-80">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Theme Preview Swatches */}
        <section className="mt-6">
          <p className="ink-soft font-naskh mb-3 text-xs font-semibold flex items-center gap-1">
            <Palette className="h-3.5 w-3.5" />
            <span>اختر ثيم محراب القراءة</span>
          </p>
          <div className="grid grid-cols-5 gap-2">
            {(
              [
                ["parchment", "ورقي دافئ"],
                ["midnight", "ليلي هادئ"],
                ["emerald", "زمردي فاخر"],
                ["sand", "صحراوي"],
                ["royal", "ملكي"],
              ] as const
            ).map(([themeKey, label]) => (
              <button
                key={themeKey}
                onClick={() => setSettings((s) => ({ ...s, theme: themeKey as SanctuaryTheme }))}
                className={`font-naskh text-xs py-2 px-1 rounded-xl border rule-line text-center transition-all ${
                  settings.theme === themeKey
                    ? "border-[var(--glow)] font-bold shadow-xs ring-1 ring-[var(--glow)]"
                    : "ink-soft hover:ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <button
          onClick={start}
          className="glow-gradient font-naskh mt-8 w-full rounded-2xl py-4 text-base font-bold text-[var(--paper)] shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>ابدأ القراءة الموازية الان</span>
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
