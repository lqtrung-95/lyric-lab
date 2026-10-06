import { Icon } from "@/components/ui/icon";
import { alignPinyinToText } from "@/lib/rooms/align-pinyin";
import type { DictationMode, DictationResult, UnitStatus } from "@/lib/video/dictation";
import type { LessonLine } from "@/lib/video/video-lesson-types";

// Trạng thái không chỉ dựa vào màu: mỗi trạng thái có biểu tượng và nhãn cho trình đọc màn hình (WCAG).
const STATUS: Record<UnitStatus, { label: string; chip: string; mark: string }> = {
  correct: { label: "đúng", chip: "bg-secondary-container text-on-secondary-container", mark: "✓" },
  tone: { label: "đúng chữ, sai hoặc thiếu thanh", chip: "border border-dashed border-primary bg-surface-container text-on-surface", mark: "~" },
  wrong: { label: "sai", chip: "bg-error-container text-on-error-container", mark: "✗" },
  missing: { label: "chưa gõ", chip: "bg-surface-container-high text-on-surface-variant", mark: "…" },
};

/**
 * Kết quả một câu sau khi kiểm tra: câu gốc (chữ Hán có pinyin trên từng chữ), nghĩa tiếng Việt, và từng đơn vị đáp án
 * (âm tiết hoặc chữ Hán) tô theo đúng/gần đúng/sai/thiếu kèm điều bạn đã gõ.
 */
export function DictationFeedback({ line, mode, typed, result, passed }: { line: LessonLine; mode: DictationMode; typed: string; result: DictationResult; passed: boolean }) {
  const aligned = alignPinyinToText(line.text, line.pinyin);
  return (
    <section aria-label="Kết quả câu này" className="space-y-space-sm rounded-2xl bg-surface-container-low p-space-md">
      <p role="status" className={`flex items-center gap-2 text-body-lg font-semibold ${passed ? "text-secondary" : "text-error"}`}>
        <Icon name={passed ? "check_circle" : "close"} filled={passed} size={22} />
        {passed ? (result.score === 1 ? "Chính xác!" : "Đúng chữ, chú ý thanh điệu nhé") : "Chưa đúng, xem đáp án bên dưới"}
        <span className="text-label-md font-normal text-on-surface-variant">({Math.round(result.score * 100)}%)</span>
      </p>
      <p lang="zh" className="font-serif text-[1.75rem] leading-[2.1] text-on-surface">
        {aligned
          ? aligned.map((c, i) => (c.py ? <ruby key={i} className="mx-0.5">{c.ch}<rt className="font-sans text-label-md font-normal tracking-wide text-on-surface-variant">{c.py}</rt></ruby> : <span key={i}>{c.ch}</span>))
          : line.text}
      </p>
      {line.translation && <p className="text-body-md italic text-on-surface-variant">&ldquo;{line.translation}&rdquo;</p>}
      <div>
        <p className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Đáp án từng {mode === "pinyin" ? "âm tiết" : "chữ"}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {result.units.map((u, i) => (
            <li key={i} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-body-md ${STATUS[u.status].chip}`}>
              <span aria-hidden="true" className="text-label-sm font-bold">{STATUS[u.status].mark}</span>
              <span lang={mode === "hanzi" ? "zh" : undefined}>{u.expected}</span>
              <span className="sr-only">: {STATUS[u.status].label}</span>
            </li>
          ))}
        </ul>
        {result.extra > 0 && <p className="mt-1 text-label-md text-on-surface-variant">Bạn gõ thừa một vài ký tự.</p>}
      </div>
      <p className="text-label-md text-on-surface-variant">Bạn đã gõ: <span lang={mode === "hanzi" ? "zh" : undefined} className="font-medium text-on-surface">{typed.trim() || "(chưa gõ gì)"}</span></p>
    </section>
  );
}
