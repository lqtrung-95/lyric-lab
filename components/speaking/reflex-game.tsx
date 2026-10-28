"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { useCountdown } from "@/components/practice/use-countdown";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import { playSfx } from "@/lib/feedback/sfx";
import { recordFluency } from "@/lib/speaking/fluency-stats";
import { playAndWait, stopChinese } from "@/lib/speaking/play-and-wait";
import type { ReflexItem } from "@/lib/speaking/reflex-questions";
import { hanChars, judgeReply, reflexPoints, type ReplyVerdict } from "@/lib/speaking/reply-match";
import type { MicCheck } from "@/lib/speaking/vad-recorder";
import { MicIntro } from "./mic-intro";
import { SpeakBox } from "./speak-box";
import { useSpeakTurn } from "./use-speak-turn";

const ANSWER_SEC = 8;
const FAST_MS = 2500;
interface Outcome { verdict: ReplyVerdict; transcript: string; onsetMs: number | null }
const VERDICT = {
  matched: { icon: "✓", text: "Có từ khóa giống câu mẫu", cls: "bg-secondary-container text-on-secondary-container" },
  answered: { icon: "•", text: "Đã đáp (cách nói khác câu mẫu)", cls: "bg-surface-container-high text-on-surface" },
  silent: { icon: "✗", text: "Chưa kịp trả lời", cls: "bg-error-container text-on-error-container" },
} as const;

/**
 * Hỏi nhanh – Đáp nhanh: AI đọc một câu hỏi, micro tự bật, người học nói đáp ngay (tự dừng khi nói xong, tối đa 8 giây).
 * Chấm "đã đáp" và "khớp ý" (xem `judgeReply`), đo thời gian bắt đầu nói. Mic không dùng được thì gõ chữ. Xong lượt thì ghi XP và chỉ số lưu loát.
 */
export function ReflexGame({ items, pinyin }: { items: ReflexItem[]; pinyin: Record<string, string> }) {
  const router = useRouter();
  const [mic, setMic] = useState<MicCheck | null>(null);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"asking" | "answering" | "result">("asking");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [showPinyin, setShowPinyin] = useState(false);
  const item = items[i];
  const done = i >= items.length;
  const left = useCountdown(i, mic !== null && !done && phase === "answering", ANSWER_SEC);

  const finishTurn = useCallback((text: string, onsetMs: number | null) => {
    const { verdict } = judgeReply(text, item.a);
    playSfx(verdict === "silent" ? "wrong" : "correct");
    setOutcomes((o) => [...o, { verdict, transcript: text, onsetMs }]);
    setPhase("result");
  }, [item]);
  const speak = useSpeakTurn(ANSWER_SEC + 1, (r) => finishTurn(r.text, r.onsetMs));
  const startRef = useRef(speak.start);
  useEffect(() => { startRef.current = speak.start; });
  const typingOnly = mic !== null && mic !== "ok";

  useEffect(() => {
    if (mic === null || done || phase !== "asking") return;
    let live = true;
    void playAndWait(item.q).then(() => { if (live) { setPhase("answering"); if (mic === "ok") void startRef.current(); } });
    return () => { live = false; stopChinese(); };
  }, [mic, i, phase, done, item]);

  const answered = outcomes.filter((o) => o.verdict !== "silent");
  const points = outcomes.reduce((s, o) => s + reflexPoints(o.verdict), 0);
  const reactions = answered.flatMap((o) => (o.onsetMs === null ? [] : [o.onsetMs]));
  const { saved } = useWordGameScore({ mode: "reflex", done, correct: answered.length, total: items.length, points });
  const logged = useRef(false);
  useEffect(() => {
    if (!done || logged.current) return;
    logged.current = true;
    recordFluency({ source: "reflex", turns: answered.length, reactionMs: reactions, hanChars: answered.reduce((s, o) => s + hanChars(o.transcript).length, 0), words: [] });
  }, [done, answered, reactions]);

  if (mic === null) return <MicIntro title="Hỏi nhanh – Đáp nhanh" onStart={setMic} steps={["AI đọc một câu hỏi tiếng Trung.", "Micro tự bật: bạn nói câu trả lời ngay, không cần chờ nghĩ cho hoàn hảo (tối đa 8 giây).", "Cuối mỗi câu có câu mẫu để so. Không có đáp án duy nhất, miễn trả lời kịp."]} />;
  if (done) {
    const avg = reactions.length ? (reactions.reduce((s, x) => s + x, 0) / reactions.length / 1000).toFixed(1) : null;
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-lg text-center" data-testid="reflex-done">
        <p className="font-serif text-headline-md">Bạn đáp được {answered.length}/{items.length} câu</p>
        <p className="mt-1 text-body-md">Giống câu mẫu {outcomes.filter((o) => o.verdict === "matched").length} câu{avg && <> · bắt đầu nói sau trung bình {avg} giây</>}</p>
        {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi +{points} điểm luyện tập</p>}
        <button type="button" onClick={() => router.refresh()} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Chơi bộ khác</button>
      </div>
    );
  }
  const out = outcomes[i];
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-lg font-extrabold">Câu {i + 1}/{items.length}</p>
        <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${showPinyin ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>Pinyin</button>
      </div>
      <div className="rounded-2xl border-2 border-ink bg-surface-container-lowest p-space-md">
        <p lang="zh-Hans" className={`text-headline-md font-bold ${showPinyin ? "leading-[2.2]" : ""}`}><RubyLine zh={item.q} pinyin={pinyin[item.q]} show={showPinyin} /></p>
        {phase !== "asking" && <p className="mt-1 text-body-md text-on-surface-variant">{item.qVi}</p>}
        {phase === "asking" && <p role="status" className="mt-1 text-body-md text-on-surface-variant">Đang đọc câu hỏi… chuẩn bị trả lời</p>}
      </div>
      {phase === "answering" && (
        <>
          <p role="timer" aria-label={`Còn ${left} giây`} className={`mx-auto min-w-24 rounded-full border-2 border-ink px-4 py-1 text-center text-label-lg font-extrabold ${left <= 3 ? "animate-pulse bg-error text-on-error" : "bg-surface-container-lowest"}`}>⏱ {left}s</p>
          <SpeakBox phase={speak.phase} error={speak.error} typingOnly={typingOnly} onStart={() => void speak.start()} onStop={() => void speak.stop()} onType={(t) => { speak.cancel(); finishTurn(t, null); }} />
          <button type="button" onClick={() => { speak.cancel(); finishTurn("", null); }} className="mx-auto min-h-11 px-3 text-label-md font-semibold text-on-surface-variant underline">Bỏ qua câu này</button>
        </>
      )}
      {phase === "result" && out && (
        <div role="status" className="flex flex-col gap-2 rounded-xl bg-surface-container-low p-space-sm">
          <p className={`w-fit rounded-full px-3 py-1 text-label-lg font-extrabold ${VERDICT[out.verdict].cls}`}>{VERDICT[out.verdict].icon} {VERDICT[out.verdict].text}{out.onsetMs !== null && out.verdict !== "silent" && out.onsetMs <= FAST_MS ? " · ⚡ nhanh" : ""}</p>
          {out.transcript && <p lang="zh-Hans" className="text-body-md"><span className="font-bold">Bạn nói: </span>{out.transcript}</p>}
          <div className="flex items-center gap-2">
            <p lang="zh-Hans" className="text-body-md"><span className="font-bold">Câu mẫu: </span><RubyLine zh={item.a} pinyin={pinyin[item.a]} show={showPinyin} /> <span className="text-on-surface-variant">({item.aVi})</span></p>
            <PronounceButton text={item.a} />
          </div>
          <button type="button" onClick={() => { setI((n) => n + 1); setPhase("asking"); }} className="mt-1 min-h-11 w-fit rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">{i + 1 === items.length ? "Xem kết quả" : "Câu tiếp"}</button>
        </div>
      )}
    </div>
  );
}
