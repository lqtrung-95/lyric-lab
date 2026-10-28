"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import type { Scenario } from "@/lib/roleplay/scenarios";
import { MAX_ROLEPLAY_TURNS } from "@/lib/roleplay/turn-schema";
import { SpeakBox } from "./speak-box";
import { useRoleplaySession, type Msg, type SessionError } from "./use-roleplay-session";

const ERROR_TEXT: Record<SessionError, string> = {
  rate_limited: "Bạn đã dùng hết lượt trò chuyện với AI hôm nay. Mai quay lại nhé, hoặc luyện Hỏi nhanh – Đáp nhanh.",
  account_required: "Cần đăng nhập Google để trò chuyện với AI.",
  failed: "AI chưa trả lời được. Bấm Thử lại.",
  no_speech: "Chưa nghe rõ câu bạn nói. Thử nói lại nhé.",
};

function Bubble({ m, showPinyin }: { m: Msg; showPinyin: boolean }) {
  const ai = m.role === "ai";
  return (
    <li className={`flex flex-col gap-1 ${ai ? "items-start" : "items-end"}`}>
      <div className={`max-w-[85%] rounded-2xl border-2 border-ink px-space-sm py-2 ${ai ? "bg-surface-container-lowest" : "bg-primary-container"}`}>
        <div className="flex items-center gap-2">
          <p lang="zh-Hans" className={`text-body-lg font-bold ${showPinyin && ai ? "leading-[2.2]" : ""}`}><RubyLine zh={m.zh} pinyin={m.pinyin} show={showPinyin && ai} /></p>
          {ai && <PronounceButton text={m.zh} />}
        </div>
        {m.vi && <p className="text-body-sm text-on-surface-variant">{m.vi}</p>}
      </div>
      {m.feedback && (
        <p className="max-w-[85%] rounded-xl bg-tertiary-container px-3 py-2 text-body-sm text-on-tertiary-container">
          <span className="font-extrabold">Gợi ý sửa: </span>{m.feedback.issue} <span lang="zh-Hans" className="font-bold">{m.feedback.better}</span>
        </p>
      )}
    </li>
  );
}

/** Buổi trò chuyện tự do với AI đóng vai: nghe → nói (micro tự bật) → AI đáp, tối đa 8 lượt. Có Pinyin, gợi ý câu nói tiếp, lời sửa nhẹ sau mỗi lượt. */
export function RoleplayChat({ scenario, level, openingPinyin, typingOnly, onExit }: { scenario: Scenario; level: number; openingPinyin?: string; typingOnly: boolean; onExit: () => void }) {
  const s = useRoleplaySession(scenario, level, openingPinyin, typingOnly);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const { saved } = useWordGameScore({ mode: "roleplay", done: s.status === "ended", correct: s.turns, total: Math.max(1, s.turns) });
  const lastAi = [...s.msgs].reverse().find((m) => m.role === "ai");

  if (s.status === "ended") {
    const avg = s.reactions.length ? (s.reactions.reduce((a, b) => a + b, 0) / s.reactions.length / 1000).toFixed(1) : null;
    const fixes = s.msgs.filter((m) => m.feedback);
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-lg" data-testid="roleplay-done">
        <p className="font-serif text-headline-md">Bạn đã nói {s.turns} lượt trong “{scenario.title}”</p>
        <p className="mt-1 text-body-md">Tổng {s.han} chữ Hán{avg && <> · bắt đầu nói sau trung bình {avg} giây</>}</p>
        {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi +{s.turns * 100} điểm luyện tập</p>}
        {fixes.length > 0 && (
          <div className="mt-space-sm">
            <p className="text-label-lg font-extrabold">Nên nói lại cho đúng:</p>
            <ul className="mt-1 space-y-1">{fixes.map((m) => <li key={m.id} className="text-body-md"><span lang="zh-Hans" className="line-through opacity-70">{m.zh}</span> → <span lang="zh-Hans" className="font-bold">{m.feedback?.better}</span></li>)}</ul>
          </div>
        )}
        <button type="button" onClick={onExit} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Chọn tình huống khác</button>
      </div>
    );
  }
  const typingNow = s.status === "your_turn";
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-lg font-extrabold">{scenario.emoji} {scenario.title} · HSK {level} · lượt {Math.min(s.turns + 1, MAX_ROLEPLAY_TURNS)}/{MAX_ROLEPLAY_TURNS}</p>
        <div className="flex gap-1.5">
          <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`min-h-11 rounded-full border-2 border-ink px-4 text-label-md font-extrabold ${showPinyin ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>Pinyin</button>
          <button type="button" onClick={s.end} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-extrabold">Kết thúc</button>
        </div>
      </div>
      <ul className="flex flex-col gap-2" aria-live="polite">{s.msgs.map((m) => <Bubble key={m.id} m={m} showPinyin={showPinyin} />)}</ul>
      {s.pending && s.status === "thinking" && <p role="status" className="text-body-md text-on-surface-variant">Bạn nói: <span lang="zh-Hans" className="font-bold">{s.pending}</span>. AI đang nghĩ…</p>}
      {s.error && <p role="alert" className="text-center text-body-md text-error">{ERROR_TEXT[s.error]}{s.error === "failed" && s.pending && <> <button type="button" onClick={s.retry} className="ml-1 min-h-11 font-bold underline">Thử lại</button></>}</p>}
      {typingNow && !(s.error === "rate_limited" || s.error === "account_required") && (
        <>
          <SpeakBox phase={s.speak.phase} error={s.speak.error} typingOnly={typingOnly} onStart={() => { s.clearError(); void s.speak.start(); }} onStop={() => void s.speak.stop()} onType={(t) => s.submit(t)} startLabel="Bấm để nói" />
          {lastAi?.tips && lastAi.tips.length > 0 && (
            <div className="text-center">
              <button type="button" onClick={() => setShowTips((v) => !v)} aria-expanded={showTips} className="min-h-11 px-3 text-label-md font-semibold text-primary underline">{showTips ? "Ẩn gợi ý" : "Bí rồi? Xem gợi ý câu nói"}</button>
              {showTips && <ul className="mt-1 flex flex-col items-center gap-1">{lastAi.tips.map((t) => <li key={t.zh} lang="zh-Hans" className="text-body-md font-bold"><RubyLine zh={t.zh} pinyin={t.pinyin} show /></li>)}</ul>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
