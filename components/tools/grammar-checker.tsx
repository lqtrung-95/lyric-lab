"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import type { GrammarOutput } from "@/lib/tools/grammar-check/grammar-schema";
import { MAX_GRAMMAR_CHARS } from "@/lib/tools/grammar-check/grammar-schema";

type Result = GrammarOutput & { model: string; pinyin: { minimalFix: string | null; natural: string | null } };

const ERRORS: Record<string, string> = {
  invalid_sentence: `Hãy nhập một câu tiếng Trung (2 đến ${MAX_GRAMMAR_CHARS} ký tự).`,
  rate_limited: "Bạn đã dùng hết lượt kiểm tra AI hôm nay. Hãy quay lại vào ngày mai, hoặc đăng nhập trong app để có thêm lượt.",
  check_failed: "AI chưa chấm được câu này, thử lại sau một lát nhé.",
};
const QUICK = ["我昨天去商店", "他比我很高", "我很喜欢吃苹果。", "我吃饭了没有", "她是很漂亮"];
/** So sánh hai câu bỏ khoảng trắng và dấu câu để không hiện hai khung giống nhau. */
const plain = (t: string) => t.replace(/[\s\p{P}]/gu, "");
const VERDICT: Record<GrammarOutput["verdict"], { label: string; cls: string }> = {
  ok: { label: "Câu đúng và tự nhiên", cls: "bg-primary-container text-on-primary-container" },
  awkward: { label: "Đúng ngữ pháp nhưng chưa tự nhiên", cls: "bg-secondary-container text-on-secondary-container" },
  wrong: { label: "Câu có lỗi", cls: "bg-error-container text-on-error-container" },
};

function Suggestion({ title, zh, pinyin }: { title: string; zh: string; pinyin: string | null }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-container p-3">
      <div className="min-w-0 flex-1">
        <p className="text-label-md text-on-surface-variant">{title}</p>
        <p lang="zh" className="font-serif text-headline-md">{zh}</p>
        {pinyin && <p className="text-body-md text-primary">{pinyin}</p>}
      </div>
      <PronounceButton text={zh} className="size-10" />
    </div>
  );
}

/** Dán một câu tiếng Trung để AI chấm (gọi `/api/tools/grammar-check`): kết luận, câu sửa ít nhất, cách nói tự nhiên và giải thích từng lỗi bằng tiếng Việt. Pinyin của câu sửa lấy từ từ điển. */
export function GrammarChecker() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [checked, setChecked] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(value = sentence) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/grammar-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sentence: value }) });
      const body = (await res.json().catch(() => ({}))) as { result?: Result; error?: string };
      if (!res.ok || !body.result) throw new Error(ERRORS[body.error ?? ""] ?? "Chưa kiểm tra được, thử lại sau nhé.");
      setResult(body.result);
      setChecked(value.trim());
    } catch (e) {
      setResult(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const v = result ? VERDICT[result.verdict] : null;
  return (
    <div className="space-y-space-md">
      <form onSubmit={(e) => { e.preventDefault(); void check(); }} className="space-y-3">
        <label htmlFor="grammar-input" className="block text-label-md font-medium text-on-surface">Nhập một câu tiếng Trung (tối đa {MAX_GRAMMAR_CHARS} ký tự)</label>
        <textarea id="grammar-input" lang="zh" rows={2} value={sentence} maxLength={MAX_GRAMMAR_CHARS} onChange={(e) => setSentence(e.target.value)} placeholder="Ví dụ: 我昨天去商店"
          className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 font-serif text-body-lg text-on-surface focus:border-primary focus:outline-none" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label-md text-on-surface-variant">Thử nhanh:</span>
          {QUICK.map((q) => <button key={q} type="button" lang="zh" onClick={() => { setSentence(q); void check(q); }} className="min-h-11 rounded-full border border-outline-variant px-4 font-serif text-body-md text-on-surface hover:bg-surface-container-high">{q}</button>)}
        </div>
        <button type="submit" disabled={busy || sentence.trim().length < 2} className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:brightness-110 disabled:opacity-50">{busy ? "AI đang chấm…" : "Kiểm tra câu"}</button>
      </form>
      {error && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{error}</p>}
      {result && v && (
        <section aria-label="Kết quả" className="card-ink space-y-space-sm p-space-md">
          <p className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-label-md font-semibold ${v.cls}`}>{v.label}</span><span lang="zh" className="font-serif text-body-lg text-on-surface-variant">{checked}</span></p>
          <p className="text-body-lg text-on-surface">{result.summary}</p>
          {result.minimalFix && <Suggestion title="Sửa ít nhất (giữ nguyên ý và từ của bạn)" zh={result.minimalFix} pinyin={result.pinyin.minimalFix} />}
          {plain(result.natural) !== plain(result.minimalFix ?? checked) && <Suggestion title="Cách nói tự nhiên" zh={result.natural} pinyin={result.pinyin.natural} />}
          {result.issues.length > 0 && (
            <ul className="space-y-2">
              {result.issues.map((i) => (
                <li key={i.snippet} className="rounded-xl border border-outline-variant p-3">
                  <p><span lang="zh" className="rounded bg-error-container px-1 font-serif text-body-lg text-on-error-container">{i.snippet}</span>{i.fix && <> → <span lang="zh" className="rounded bg-primary-container px-1 font-serif text-body-lg text-on-primary-container">{i.fix}</span></>}</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">{i.problem}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-body-sm text-on-surface-variant">Kết quả do AI tạo, có thể chưa hoàn hảo. Hãy đối chiếu với giáo viên hoặc sách ngữ pháp khi không chắc. Pinyin lấy từ từ điển.</p>
        </section>
      )}
    </div>
  );
}
