import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Columns2, Rows3, FileText, Sparkles } from "lucide-react";
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
} from "@/lib/reading";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "استوديو النصوص — محراب القراءة الموازية" },
      {
        name: "description",
        content: "الصق النص الإنجليزي وترجمته العربية، حدّد رمز الفصل، وابدأ القراءة الموازية على صفحة ورقية أنيقة.",
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
    <div dir="rtl" className="sanctuary min-h-screen" data-theme={settings.theme}>
      <div className="mx-auto max-w-2xl px-5 pb-28 pt-10">
        <div className="flex items-center gap-3">
          <span className="rule-line flex h-11 w-11 items-center justify-center rounded-full border">
            <BookOpen className="h-5 w-5 glow-text" />
          </span>
          <div>
            <h1 className="font-amiri text-2xl leading-tight ink">محراب القراءة الموازية</h1>
            <p className="ink-soft font-naskh text-sm">نصٌّ أصيل وترجمته، على صفحة واحدة هادئة.</p>
          </div>
        </div>

        <section className="paper-raised rule-line mt-8 rounded-2xl border p-5">
          <label className="ink-soft font-naskh text-xs">عنوان النص</label>
          <input
            value={doc.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="مثال: تأملات سينيكا"
            className="rule-line font-naskh ink mt-2 w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--glow)]"
          />

          <label className="ink-soft font-naskh mt-5 block text-xs">رمز الفصل قبل كل جملة</label>
          <input
            value={doc.separator}
            onChange={(e) => update({ separator: e.target.value })}
            placeholder="#"
            className="rule-line ink mt-2 w-24 rounded-xl border bg-transparent px-3 py-2 text-center text-lg outline-none focus:border-[var(--glow)]"
          />

          <div className="rule-line mt-5 flex gap-1 rounded-xl border p-1">
            {(
              [
                ["en", "النص الإنجليزي"],
                ["ar", "الترجمة العربية"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`font-naskh flex-1 rounded-lg py-2 text-sm transition-colors ${
                  tab === key ? "glow-bg text-[var(--paper)]" : "ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "en" ? (
            <textarea
              dir="ltr"
              value={doc.en}
              onChange={(e) => update({ en: e.target.value })}
              rows={12}
              placeholder={"# First sentence.\n# Second sentence."}
              className="rule-line font-literary ink mt-4 w-full rounded-xl border bg-transparent p-4 text-[17px] leading-relaxed outline-none focus:border-[var(--glow)]"
            />
          ) : (
            <textarea
              value={doc.ar}
              onChange={(e) => update({ ar: e.target.value })}
              rows={12}
              placeholder={"# الجملة الأولى.\n# الجملة الثانية."}
              className="rule-line font-naskh ink mt-4 w-full rounded-xl border bg-transparent p-4 text-[17px] leading-loose outline-none focus:border-[var(--glow)]"
            />
          )}

          <div className="ink-soft font-naskh mt-3 flex items-center gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            {ready ? (
              <span>
                {pairs.length} مقطع مزدوج
                {mismatch > 0 ? ` — ${mismatch} مقطع بلا مقابل` : " — تطابق كامل ١:١"}
              </span>
            ) : (
              <span>جارٍ التحضير…</span>
            )}
          </div>
        </section>

        <section className="mt-6">
          <p className="ink-soft font-naskh mb-3 text-xs">شكل العرض</p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["stacked", "متتالي", Rows3],
                ["side", "متجاور", Columns2],
                ["single", "نص واحد", FileText],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setSettings((s) => ({ ...s, layout: key }))}
                className={`rule-line flex flex-col items-center gap-2 rounded-2xl border py-4 transition-colors ${
                  settings.layout === key ? "paper-raised border-[var(--glow)]" : ""
                }`}
              >
                <Icon className={`h-5 w-5 ${settings.layout === key ? "glow-text" : "ink-soft"}`} />
                <span className="font-naskh ink text-xs">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={start}
          className="glow-bg font-naskh mt-8 w-full rounded-2xl py-4 text-base font-semibold text-[var(--paper)]"
        >
          ابدأ القراءة
        </button>

        <button
          onClick={() => update({ ...SAMPLE, updatedAt: Date.now() })}
          className="ink-soft font-naskh mt-4 w-full text-center text-xs underline"
        >
          تحميل نص تجريبي (سينيكا)
        </button>
      </div>
    </div>
  );
}
