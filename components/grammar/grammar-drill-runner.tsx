"use client";

import Link from "next/link";
import { useState } from "react";
import { useGrammarStats } from "@/components/grammar/use-grammar-stats";
import { Icon } from "@/components/ui/icon";
import { playSfx } from "@/lib/feedback/sfx";
import { answerText, isCorrect, type Drill } from "@/lib/grammar/drills";
import { grammarById } from "@/lib/grammar/grammar-patterns";

const opt = "min-h-12 rounded-2xl border-2 border-ink bg-surface-container-lowest px-4 py-2 text-body-lg font-bold shadow-[0_3px_0_var(--shadow-ink)] cursor-pointer hover:brightness-105 active:translate-y-0.5 active:shadow-none disabled:cursor-default";

/** Chạy một chuỗi bài tập ngữ pháp (xếp từ, điền chỗ trống, chọn câu đúng), ghi đúng/sai vào bản đồ lỗi cá nhân. */
export function GrammarDrillRunner({ drills, title, onAgain }: { drills: Drill[]; title: string; onAgain: () => void }) {
  const { record } = useGrammarStats();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<null | { ok: boolean }>(null);
  const [score, setScore] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);

  if (i >= drills.length) {
    const weak = [...new Set(wrongIds)];
    return (
      <section className="card-ink p-space-lg text-center" aria-labelledby="gr-done">
        <h2 id="gr-done" className="font-serif text-headline-md">{title}</h2>
        <p className="mt-space-sm text-headline-lg font-extrabold">{score}/{drills.length}</p>
        <p className="text-body-md text-on-surface-variant">{score === drills.length ? "Trọn điểm. Mẫu này bạn nắm chắc rồi." : "Xem lại các mẫu dưới đây rồi làm lại để chắc hơn."}</p>
        {weak.length > 0 && (
          <ul className="mt-space-md flex flex-wrap justify-center gap-2">
            {weak.map((id) => { const p = grammarById(id); return p ? <li key={id}><Link href={`/grammar/${id}`} className="inline-flex min-h-11 items-center rounded-full border-2 border-ink bg-surface-container px-4 text-label-md font-bold">{p.title}</Link></li> : null; })}
          </ul>
        )}
        <button type="button" onClick={onAgain} className="btn-3d btn-3d-primary mt-space-md min-h-12 px-6 font-extrabold">Làm lại</button>
      </section>
    );
  }

  const d = drills[i];
  const finish = (response: string[] | string) => {
    if (verdict) return;
    const ok = isCorrect(d, response);
    record(d.patternId, ok);
    playSfx(ok ? "correct" : "wrong");
    setVerdict({ ok });
    if (ok) setScore((s) => s + 1); else setWrongIds((w) => [...w, d.patternId]);
  };
  const next = () => { setI((n) => n + 1); setPicked([]); setVerdict(null); };
  const pat = grammarById(d.patternId);

  return (
    <section aria-label={title} className="card-ink p-space-md sm:p-space-lg">
      <p className="text-label-md text-on-surface-variant">Câu {i + 1}/{drills.length}{pat ? ` · ${pat.title}` : ""}</p>
      <h2 className="mt-1 text-body-lg font-bold">
        {d.kind === "order" && <>Xếp thành câu: <span className="font-normal">{d.prompt}</span></>}
        {d.kind === "fill" && <>Điền từ còn thiếu: <span className="font-normal">{d.prompt}</span></>}
        {d.kind === "choose" && d.prompt}
      </h2>

      {d.kind === "order" && (
        <div className="mt-space-md space-y-space-sm">
          <p lang="zh-Hans" aria-live="polite" className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant p-2 font-serif text-headline-sm">
            {picked.length === 0 ? <span className="text-body-md text-on-surface-variant">Bấm các từ bên dưới theo thứ tự</span> : picked.map((idx, k) => <span key={k} className="rounded-xl bg-primary-container px-3 py-1">{d.tokens[idx]}</span>)}
          </p>
          <div lang="zh-Hans" className="flex flex-wrap gap-2">
            {d.tokens.map((t, k) => (
              <button key={k} type="button" disabled={picked.includes(k) || !!verdict} onClick={() => setPicked((p) => [...p, k])} className={`${opt} font-serif text-headline-sm disabled:opacity-40`}>{t}</button>
            ))}
          </div>
          {!verdict && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setPicked([])} disabled={picked.length === 0} className="min-h-11 rounded-full px-4 text-label-md font-bold underline disabled:opacity-40">Xóa</button>
              <button type="button" disabled={picked.length !== d.answer.length} onClick={() => finish(picked.map((idx) => d.tokens[idx]))} className="btn-3d btn-3d-primary min-h-11 px-6 font-extrabold disabled:opacity-50">Kiểm tra</button>
            </div>
          )}
        </div>
      )}

      {d.kind === "fill" && (
        <div className="mt-space-md space-y-space-md">
          <p lang="zh-Hans" className="font-serif text-headline-md">{d.before}<span className="mx-1 inline-block min-w-12 border-b-4 border-primary text-center text-primary">{verdict ? d.answer : "＿"}</span>{d.after}</p>
          <div lang="zh-Hans" className="flex flex-wrap gap-2">{d.options.map((o) => <button key={o} type="button" disabled={!!verdict} onClick={() => finish(o)} className={`${opt} font-serif text-headline-sm`}>{o}</button>)}</div>
        </div>
      )}

      {d.kind === "choose" && (
        <div lang="zh-Hans" className="mt-space-md grid gap-2">
          {d.options.map((o) => <button key={o} type="button" disabled={!!verdict} onClick={() => finish(o)} className={`${opt} text-left font-serif text-headline-sm`}>{o}</button>)}
        </div>
      )}

      {verdict && (
        <div role="status" className={`mt-space-md rounded-2xl border-2 p-space-sm ${verdict.ok ? "border-secondary bg-secondary-container" : "border-error bg-error-container"}`}>
          <p className="flex items-center gap-1 font-extrabold"><Icon name={verdict.ok ? "check_circle" : "close"} size={20} filled />{verdict.ok ? "Đúng rồi!" : "Chưa đúng"}</p>
          {!verdict.ok && <p lang="zh-Hans" className="mt-1 font-serif text-body-lg">Đáp án: {answerText(d)}</p>}
          <p className="mt-1 text-body-md">{d.explain}</p>
          <button type="button" onClick={next} className="btn-3d btn-3d-primary mt-space-sm min-h-11 px-5 font-extrabold">{i + 1 >= drills.length ? "Xem kết quả" : "Câu tiếp"}</button>
        </div>
      )}
    </section>
  );
}
