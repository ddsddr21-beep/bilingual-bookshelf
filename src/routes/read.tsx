import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, EyeOff, Settings2, X } from "lucide-react";
import {
  AR_FONT_CLASS,
  DEFAULT_SETTINGS,
  EN_FONT_CLASS,
  SAMPLE,
  buildPairs,
  loadDoc,
  loadSettings,
  saveSettings,
  type ArFont,
  type EnFont,
  type ReaderLayout,
  type SanctuaryTheme,
  type Settings,
  type TextDoc,
} from "@/lib/reading";

export const Route = createFileRoute("/read")({
  head: () => ({
    meta: [
      { title: "شاشة القراءة — محراب القراءة الموازية" },
      {
        name: "description",
        content: "اقرأ النص وترجمته على صفحة ورقية متصلة بثيمات مريحة للعين وثلاثة أشكال للعرض.",
      },
      { property: "og:title", content: "شاشة القراءة — محراب القراءة الموازية" },
      {
        property: "og:description",
        content: "صفحة ورقية متصلة تجمع النص الإنجليزي وترجمته العربية بدقة جملة بجملة.",
      },
    ],
  }),
  component: Reader,
});

function Reader() {
  const [doc, setDoc] = useState<TextDoc | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [panel, setPanel] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSettings(loadSettings());
    setDoc(loadDoc() ?? SAMPLE);
  }, []);

  const pairs = useMemo(
    () => (doc ? buildPairs(doc.en, doc.ar, doc.separator) : []),
    [doc],
  );

  function patch(next: Partial<Settings>) {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      saveSettings(merged);
      return merged;
    });
  }

  const enClass = EN_FONT_CLASS[settings.enFont];
  const arClass = AR_FONT_CLASS[settings.arFont];
  const bodyStyle = { fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight };

  function arVisible(index: number) {
    return settings.revealTranslation || revealed[index];
  }

  return (
    <div dir="rtl" className="sanctuary min-h-screen" data-theme={settings.theme}>
      <header className="rule-line paper sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="ink-soft flex items-center gap-1 text-sm">
            <ArrowRight className="h-4 w-4" />
            <span className="font-naskh">الاستوديو</span>
          </Link>
          <h1 className="font-amiri ink truncate px-2 text-base">{doc?.title || "نص بلا عنوان"}</h1>
          <div className="flex items-center gap-1">
            <button
              aria-label="كشف الترجمة"
              onClick={() => patch({ revealTranslation: !settings.revealTranslation })}
              className="ink-soft p-2"
            >
              {settings.revealTranslation ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button aria-label="الإعدادات" onClick={() => setPanel(true)} className="ink-soft p-2">
              <Settings2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-8">
        {pairs.length === 0 ? (
          <p className="ink-soft font-naskh text-center text-sm">لا يوجد نص بعد — عد إلى الاستوديو وألصق نصّيك.</p>
        ) : settings.layout === "single" ? (
          <article style={bodyStyle} className={settings.single === "en" ? enClass : arClass}>
            <div dir={settings.single === "en" ? "ltr" : "rtl"} className="ink space-y-5">
              {pairs.map((pair, i) => (
                <p key={i}>{settings.single === "en" ? pair.en : pair.ar}</p>
              ))}
            </div>
          </article>
        ) : settings.layout === "side" ? (
          <div className="space-y-7">
            {pairs.map((pair, i) => (
              <div key={i} className="rule-line grid grid-cols-2 gap-4 border-b pb-6 last:border-0">
                <p dir="ltr" style={bodyStyle} className={`${enClass} ink`}>
                  {pair.en}
                </p>
                <p
                  onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                  style={bodyStyle}
                  className={`${arClass} ${arVisible(i) ? "ink-soft" : "ink-soft opacity-0"} transition-opacity`}
                >
                  {pair.ar}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {pairs.map((pair, i) => (
              <div key={i}>
                <p dir="ltr" style={bodyStyle} className={`${enClass} ink`}>
                  {pair.en}
                </p>
                {arVisible(i) ? (
                  <p
                    style={{ ...bodyStyle, fontSize: `${settings.fontSize - 1}px` }}
                    className={`${arClass} ink-soft mt-2`}
                  >
                    {pair.ar}
                  </p>
                ) : (
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
                    className="glow-text font-naskh mt-2 text-xs underline"
                  >
                    إظهار الترجمة
                  </button>
                )}
                <div className="rule-line mt-6 border-b" />
              </div>
            ))}
          </div>
        )}
      </main>

      {panel && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={() => setPanel(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="paper-raised rule-line max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-amiri ink text-lg">إعدادات القراءة</h2>
              <button aria-label="إغلاق" onClick={() => setPanel(false)} className="ink-soft p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Group label="شكل العرض">
              <Choices<ReaderLayout>
                value={settings.layout}
                onChange={(layout) => patch({ layout })}
                options={[
                  ["stacked", "متتالي"],
                  ["side", "متجاور"],
                  ["single", "نص واحد"],
                ]}
              />
            </Group>

            {settings.layout === "single" && (
              <Group label="النص المعروض">
                <Choices<"en" | "ar">
                  value={settings.single}
                  onChange={(single) => patch({ single })}
                  options={[
                    ["en", "الإنجليزي"],
                    ["ar", "العربي"],
                  ]}
                />
              </Group>
            )}

            <Group label="الثيم">
              <Choices<SanctuaryTheme>
                value={settings.theme}
                onChange={(theme) => patch({ theme })}
                options={[
                  ["parchment", "ورقي دافئ"],
                  ["midnight", "ليلي"],
                  ["emerald", "زمردي"],
                ]}
              />
            </Group>

            <Group label="الخط الإنجليزي">
              <Choices<EnFont>
                value={settings.enFont}
                onChange={(enFont) => patch({ enFont })}
                options={[
                  ["literary", "روائي"],
                  ["editorial", "صحفي"],
                  ["modern", "عصري"],
                ]}
              />
            </Group>

            <Group label="الخط العربي">
              <Choices<ArFont>
                value={settings.arFont}
                onChange={(arFont) => patch({ arFont })}
                options={[
                  ["naskh", "نسخ حديث"],
                  ["amiri", "أميري"],
                ]}
              />
            </Group>

            <Group label={`حجم الخط — ${settings.fontSize}`}>
              <input
                type="range"
                min={15}
                max={30}
                value={settings.fontSize}
                onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                className="w-full accent-[var(--glow)]"
              />
            </Group>

            <Group label={`تباعد الأسطر — ${settings.lineHeight.toFixed(1)}`}>
              <input
                type="range"
                min={1.4}
                max={2.6}
                step={0.1}
                value={settings.lineHeight}
                onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
                className="w-full accent-[var(--glow)]"
              />
            </Group>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="ink-soft font-naskh mb-2 text-xs">{label}</p>
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
    <div className="rule-line flex gap-1 rounded-xl border p-1">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`font-naskh flex-1 rounded-lg py-2 text-xs transition-colors ${
            value === key ? "glow-bg text-[var(--paper)]" : "ink-soft"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
