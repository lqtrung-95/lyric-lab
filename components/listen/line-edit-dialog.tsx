"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

const ERRORS: Record<string, string> = {
  invalid_text: "Lời tiếng Trung không hợp lệ (cần có chữ Hán, tối đa 200 ký tự).",
  invalid_line: "Dữ liệu không hợp lệ (pinyin hoặc bản dịch quá dài).",
  analysis_not_found: "Không tìm thấy bản phân tích của bài.",
  line_not_found: "Không tìm thấy dòng này.",
  forbidden: "Chỉ quản trị viên được sửa lời.",
};

/**
 * Hộp thoại quản trị viên sửa lời một dòng: chữ Hán, pinyin và bản dịch. Đổi chữ Hán mà không đụng ô pinyin thì pinyin tự tính lại từ từ điển;
 * gõ pinyin tay thì giữ đúng bản gõ. Giữ nguyên chữ Hán thì pinyin hiện có được giữ (không bị tính lại). Lưu xong tải lại trang để thấy bản mới.
 */
export function LineEditDialog({ videoId, line, onClose }: { videoId: string; line: AnalyzedLine; onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState(line.text);
  const [pinyin, setPinyin] = useState(line.pinyin);
  const [translation, setTranslation] = useState(line.translation ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  async function save() {
    setBusy(true);
    setError(null);
    const textChanged = text.trim() !== line.text;
    const pinyinEdited = pinyin.trim() !== line.pinyin;
    // Giữ pinyin hiện có khi chữ Hán không đổi (nếu không gửi thì server tính lại và có thể ghi đè pinyin gõ tay trước đó).
    const body: Record<string, unknown> = { action: "edit_line", lineIndex: line.index, text, translation };
    if (pinyinEdited || !textChanged) body.pinyin = pinyin;
    const res = await fetch(`/api/admin/songs/${videoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (res?.ok) {
      onClose();
      router.refresh();
      return;
    }
    const data = res ? ((await res.json().catch(() => null)) as { error?: string } | null) : null;
    setError(ERRORS[data?.error ?? ""] ?? "Chưa lưu được. Thử lại sau nhé.");
    setBusy(false);
  }

  const field = "mt-1 w-full rounded-xl bg-surface-container px-3 py-2 text-body-md text-on-surface outline-none ring-2 ring-transparent focus:ring-secondary";
  return (
    <dialog
      ref={ref} aria-labelledby="line-edit-title" onClose={onClose} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,32rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <h2 id="line-edit-title" className="font-serif text-headline-md">Sửa lời câu {line.index + 1}</h2>
        <label className="block text-label-md font-medium">
          Lời tiếng Trung
          <textarea lang="zh" rows={2} value={text} onChange={(e) => setText(e.target.value)} className={`${field} font-serif text-body-lg`} />
        </label>
        <label className="block text-label-md font-medium">
          Pinyin
          <input value={pinyin} onChange={(e) => setPinyin(e.target.value)} className={field} />
          <span className="mt-1 block text-label-sm font-normal text-on-surface-variant">Đổi chữ Hán mà không sửa ô này thì pinyin tự tính lại từ từ điển. Gõ tay thì giữ đúng như đã gõ.</span>
        </label>
        <label className="block text-label-md font-medium">
          Bản dịch tiếng Việt
          <input value={translation} onChange={(e) => setTranslation(e.target.value)} className={field} />
        </label>
        {error && <p role="alert" className="text-label-md text-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full px-5 text-label-md font-medium hover:bg-surface-container-high">Hủy</button>
          <button type="button" disabled={busy || !text.trim()} onClick={() => void save()} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary disabled:opacity-60">{busy ? "Đang lưu…" : "Lưu"}</button>
        </div>
      </div>
    </dialog>
  );
}
