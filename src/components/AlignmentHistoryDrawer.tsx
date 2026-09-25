import { useState, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  FileText,
  Clock,
  Search,
  CheckCircle2,
  BookOpen,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import {
  getAlignmentHistory,
  deleteDocFromHistory,
  createNewAlignmentDoc,
  buildPairs,
  type TextDoc,
} from "@/lib/reading";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (doc: TextDoc) => void;
  onNewDoc: () => void;
  activeDocId?: string;
};

export function AlignmentHistoryDrawer({
  isOpen,
  onClose,
  onSelectDoc,
  onNewDoc,
  activeDocId,
}: Props) {
  const [history, setHistory] = useState<TextDoc[]>(() => getAlignmentHistory());
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshHistory = () => {
    setHistory(getAlignmentHistory());
  };

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (doc) =>
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.en && doc.en.toLowerCase().includes(q)) ||
        (doc.ar && doc.ar.toLowerCase().includes(q)),
    );
  }, [history, searchQuery]);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("هل أنت أصلح في رغبتك بحذف هذا النص من السجل؟ لا يمكن التراجع عن هذه الخطوة.")) {
      const updated = deleteDocFromHistory(id);
      setHistory(updated);
      setDeletingId(null);
    }
  }

  function handleCreateNew() {
    onNewDoc();
    refreshHistory();
    onClose();
  }

  function handleSelect(doc: TextDoc) {
    onSelectDoc(doc);
    onClose();
  }

  function formatDate(timestamp: number) {
    if (!timestamp) return "سابقاً";
    try {
      return new Date(timestamp).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "سابقاً";
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        dir="rtl"
        className="paper-raised rule-line relative flex h-full w-full max-w-lg flex-col border-r shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="rule-line border-b p-5 bg-[var(--paper)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="glow-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-[var(--paper)] shadow-xs">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-amiri text-xl font-bold ink">سجل عمليات المحاذاة والنصوص</h2>
              <p className="font-naskh text-xs ink-soft">
                جميع النصوص والمحاذاة المحفوظة تلقائياً ({history.length})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ink-soft hover:ink rounded-xl p-2 border rule-line transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-4 space-y-3 bg-[var(--paper-raised)]/70 border-b rule-line">
          <button
            onClick={handleCreateNew}
            className="glow-gradient font-naskh w-full rounded-2xl py-3 px-4 text-xs sm:text-sm font-bold text-[var(--paper)] flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>إنشاء نص محاذاة جديد</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3.5 top-2.5 h-4 w-4 ink-soft" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في سجل المحاذاة والنصوص..."
              className="rule-line font-naskh ink w-full rounded-xl border bg-[var(--paper)] pr-10 pl-3 py-2 text-xs outline-none focus:border-[var(--glow)] focus:ring-1 focus:ring-[var(--glow)]"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <FileText className="h-10 w-10 ink-soft opacity-40" />
              <p className="font-naskh text-sm ink-soft">لم يتم العثور على أي نصوص في السجل</p>
            </div>
          ) : (
            filteredHistory.map((docItem) => {
              const isActive = docItem.id === activeDocId;
              const pairCount = buildPairs(docItem.en, docItem.ar, docItem.separator).length;
              const displayTitle =
                docItem.title?.trim() ||
                docItem.en?.slice(0, 40) ||
                docItem.ar?.slice(0, 40) ||
                "نص محاذاة جديد";

              return (
                <div
                  key={docItem.id}
                  onClick={() => handleSelect(docItem)}
                  className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                    isActive
                      ? "paper-raised border-[var(--glow)] ring-2 ring-[var(--glow)]/20 shadow-md"
                      : "bg-[var(--paper)] border-rule hover:border-[var(--glow)]/50 hover:bg-[var(--paper-raised)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-amiri font-bold text-base ink group-hover:text-[var(--glow)] transition-colors">
                          {displayTitle}
                        </span>
                        {isActive && (
                          <span className="font-naskh text-[10px] bg-[var(--glow)] text-[var(--paper)] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>مُفعّل حالياً</span>
                          </span>
                        )}
                      </div>

                      {/* Date & Metadata */}
                      <div className="flex items-center gap-3 text-[11px] ink-soft font-naskh">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(docItem.updatedAt)}</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[var(--glow)]">
                          <Sparkles className="h-3 w-3" />
                          <span>{pairCount} مقطع مزدوج</span>
                        </span>
                        <span className="font-mono bg-[var(--paper-raised)] px-1.5 py-0.2 rounded border rule-line">
                          فاصل: {docItem.separator || "#"}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(docItem.id!, e)}
                      title="حذف من السجل"
                      className="ink-soft hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Text Snippet Preview */}
                  <div className="mt-2.5 pt-2 border-t rule-line grid grid-cols-2 gap-2 text-[11px]">
                    <p className="dir-ltr font-literary ink-soft line-clamp-2 truncate">
                      {docItem.en || "لا يوجد نص إنجليزي"}
                    </p>
                    <p className="font-naskh ink-soft line-clamp-2 truncate">
                      {docItem.ar || "لا يوجد نص عربي"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="rule-line border-t p-3 bg-[var(--paper)] text-center font-naskh text-[11px] ink-soft flex items-center justify-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>يتم حفظ جميع النصوص والمحاذاة تلقائياً على متصفحك</span>
        </div>
      </div>
    </div>
  );
}
