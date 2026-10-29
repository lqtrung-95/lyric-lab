"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyChars, RubyLine } from "@/components/ui/ruby-text";
import { alignPinyin } from "@/lib/pinyin/align-ruby";
import { itemKey } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useWordGameScore } from "@/components/practice/use-word-game-score";
import type { Scenario } from "@/lib/roleplay/scenarios";
import { MAX_ROLEPLAY_TURNS } from "@/lib/roleplay/turn-schema";
import { RoleplaySummaryModal } from "./roleplay-summary-modal";
import { SpeakBox } from "./speak-box";
import { WordTapPanel, type TappedWord } from "./word-tap-panel";
import { useRoleplaySession, type Msg, type SessionError } from "./use-roleplay-session";

const ERROR_TEXT: Record<SessionError, string> = {
  rate_limited: "Bạn đã dùng hết lượt trò chuyện với AI hôm nay. Mai quay lại nhé, hoặc luyện Hỏi nhanh – Đáp nhanh.",
  account_required: "Cần đăng nhập Google để trò chuyện với AI.",
  failed: "AI chưa trả lời được. Bấm Thử lại.",
  no_speech: "Chưa nghe rõ câu bạn nói. Thử nói lại nhé.",
};

/** Câu của AI chia theo từ: từ có chữ Hán là nút bấm để tra nghĩa/lưu thẻ (gạch chân chấm), pinyin (nếu bật) nằm ngay dưới từng chữ. */
function TappableLine({ m, showPinyin, onWord, active }: { m: Msg; showPinyin: boolean; onWord: (term: string) => void; active: string | null }) {
  const py = showPinyin && m.pinyin ? alignPinyin(m.zh, m.pinyin) : null;
  const tokens = m.tokens ?? [];
  // Vị trí chữ đầu của từng từ trong câu (để lấy đúng pinyin từng chữ), tính trước để không gán lại biến trong lúc vẽ.
  const starts = tokens.reduce<number[]>((acc, t, i) => [...acc, i === 0 ? 0 : acc[i - 1] + Array.from(tokens[i - 1].text).length], []);
  return (
    <>
      {tokens.map((t, i) => {
        const at = starts[i];
        const inner = py ? <RubyChars text={t.text} py={py} offset={at} /> : t.text;
        if (!t.han) return <span key={i}>{inner}</span>;
        return (
          <button key={i} type="button" onClick={() => onWord(t.text)} aria-label={`Tra từ ${t.text}`} aria-pressed={active === t.text}
            className={`mx-px inline rounded-md px-0.5 underline decoration-dotted decoration-2 underline-offset-[6px] hover:bg-primary-container/60 ${active === t.text ? "bg-primary-container" : ""}`}>{inner}</button>
        );
      })}
    </>
  );
}

/**
 * AI đang nghĩ: bong bóng có ba chấm nhún nhảy (như đang gõ) để người học thấy hệ thống đang làm việc chứ không treo. Hoạt ảnh chỉ chạy khi người dùng không chọn giảm chuyển động;
 * chữ cho trình đọc màn hình luôn có (`role=status`).
 */
function ThinkingBubble({ said }: { said: string }) {
  return (
    <div role="status" className="flex flex-col gap-1">
      <style>{`@media (prefers-reduced-motion: no-preference) { @keyframes think-dot { 0%,80%,100% { transform: translateY(0); opacity: .45 } 40% { transform: translateY(-6px); opacity: 1 } } .think-dot { animation: think-dot 1.1s ease-in-out infinite } }`}</style>
      <p className="text-body-md text-on-surface-variant">Bạn nói: <span lang="zh-Hans" className="font-bold">{said}</span></p>
      <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm border-2 border-ink bg-surface-container-lowest px-4 py-3 shadow-[0_2px_0_var(--shadow-ink)]">
        {[0, 0.18, 0.36].map((d) => <span key={d} aria-hidden="true" className="think-dot size-2.5 rounded-full bg-primary" style={{ animationDelay: `${d}s` }} />)}
        <span className="sr-only">AI đang nghĩ…</span>
      </div>
    </div>
  );
}

function Bubble({ m, showPinyin, onWord, active }: { m: Msg; showPinyin: boolean; onWord?: (term: string) => void; active?: string | null }) {
  const ai = m.role === "ai";
  const tappable = ai && onWord && m.tokens && m.tokens.length > 0;
  return (
    <li className={`flex flex-col gap-1 ${ai ? "items-start" : "items-end"}`}>
      <div className={`max-w-[85%] rounded-2xl border-2 border-ink px-space-sm py-2 ${ai ? "bg-surface-container-lowest" : "bg-primary-container"}`}>
        <div className="flex items-center gap-2">
          <p lang="zh-Hans" className={`text-body-lg font-bold ${showPinyin && ai ? "leading-[2.2]" : ""}`}>
            {tappable ? <TappableLine m={m} showPinyin={showPinyin} onWord={onWord} active={active ?? null} /> : <RubyLine zh={m.zh} pinyin={m.pinyin} show={showPinyin && ai} />}
          </p>
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

/** Một từ đã tra trong buổi, ở màn tổng kết: lưu/bỏ lưu thẻ ôn ngay tại đó. */
function LookedRow({ w }: { w: TappedWord }) {
  const { state, toggleSaved } = useLearnerState();
  const saved = state.saved.some((x) => x.key === itemKey({ type: "vocab", term: w.term }));
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-surface-container-lowest px-3 py-2">
      <span lang="zh-Hans" className="font-serif text-headline-md">{w.term}</span>
      <span className="text-pinyin-reading text-primary">{w.pinyin}</span>
      <span className="min-w-0 flex-1 text-body-md">{w.meaning}</span>
      <PronounceButton text={w.term} />
      <button type="button" aria-pressed={saved} disabled={!w.item && !saved} onClick={() => w.item && toggleSaved(w.item)}
        className="min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-bold disabled:opacity-60">{saved ? "Đã lưu" : w.item ? "Lưu thẻ ôn" : "Chưa lưu được"}</button>
    </li>
  );
}

/** Buổi trò chuyện tự do với AI đóng vai: nghe → nói (micro tự bật) → AI đáp, tối đa 8 lượt. Có Pinyin, gợi ý câu nói tiếp, lời sửa nhẹ sau mỗi lượt. */
export function RoleplayChat({ scenario, level, openingPinyin, typingOnly, onExit, exitLabel = "Chọn tình huống khác", summaryModal = false }: { scenario: Scenario; level: number; openingPinyin?: string; typingOnly: boolean; onExit: () => void; exitLabel?: string; /** Hiện tổng kết cuối buổi trong hộp thoại (nói chuyện với linh vật) thay vì thay nội dung trang. */ summaryModal?: boolean }) {
  const s = useRoleplaySession(scenario, level, openingPinyin, typingOnly);
  const [showPinyin, setShowPinyin] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [tapped, setTapped] = useState<string | null>(null);
  const [looked, setLooked] = useState<TappedWord[]>([]);
  const onLooked = (w: TappedWord) => setLooked((prev) => (prev.some((x) => x.term === w.term) ? prev : [...prev, w]));
  const { saved } = useWordGameScore({ mode: "roleplay", done: s.status === "ended", correct: s.turns, total: Math.max(1, s.turns) });
  const lastAi = [...s.msgs].reverse().find((m) => m.role === "ai");

  if (s.status === "ended") {
    const avg = s.reactions.length ? (s.reactions.reduce((a, b) => a + b, 0) / s.reactions.length / 1000).toFixed(1) : null;
    const fixes = s.msgs.filter((m) => m.feedback);
    const userLines = s.msgs.filter((m) => m.role === "user");
    const avgChars = userLines.length ? Math.round(s.han / userLines.length) : 0;
    const summary = (
      <div className={`flex flex-col gap-space-md p-space-lg ${summaryModal ? "" : "rounded-2xl bg-surface-container-low"}`} data-testid="roleplay-done">
        <div>
          <p className="font-serif text-headline-md">Bạn đã nói {s.turns} lượt trong “{scenario.title}”</p>
          {saved && <p role="status" className="mt-1 text-label-lg font-bold text-secondary">Đã ghi +{s.turns * 100} điểm luyện tập</p>}
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Số lượt", String(s.turns)],
            ["Tổng chữ Hán", String(s.han)],
            ["Trung bình mỗi câu", `${avgChars} chữ`],
            ["Bắt đầu nói sau", avg ? `${avg} giây` : "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-surface-container-lowest px-3 py-2"><dt className="text-label-md text-on-surface-variant">{k}</dt><dd className="text-headline-md font-extrabold">{v}</dd></div>
          ))}
        </dl>
        <p role="status" className="text-body-lg font-bold">{fixes.length === 0 ? "Không có câu nào cần sửa, bạn nói rất tự nhiên!" : `${fixes.length} câu có thể nói lại cho chuẩn hơn.`}</p>
        {fixes.length > 0 && (
          <section aria-label="Câu nên nói lại">
            <h3 className="text-label-lg font-extrabold">Nên nói lại cho đúng</h3>
            <ul className="mt-1 space-y-2">
              {fixes.map((m) => (
                <li key={m.id} className="rounded-xl bg-surface-container-lowest px-3 py-2">
                  <p className="text-body-md"><span className="text-on-surface-variant">Bạn nói: </span><span lang="zh-Hans" className="line-through opacity-70">{m.zh}</span></p>
                  <p className="flex flex-wrap items-center gap-2 text-body-lg"><span className="text-on-surface-variant">Nên nói: </span><span lang="zh-Hans" className="font-bold"><RubyLine zh={m.feedback!.better} pinyin={m.feedback!.pinyin} show /></span><PronounceButton text={m.feedback!.better} /></p>
                  <p className="text-body-md text-on-surface-variant">{m.feedback!.issue}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        {looked.length > 0 && (
          <section aria-label="Từ đã tra">
            <h3 className="text-label-lg font-extrabold">Từ bạn đã tra trong buổi này</h3>
            <ul className="mt-1 space-y-2">{looked.map((w) => <LookedRow key={w.term} w={w} />)}</ul>
          </section>
        )}
        <section aria-label="Xem lại cuộc trò chuyện">
          <h3 className="text-label-lg font-extrabold">Xem lại cuộc trò chuyện</h3>
          <ul className="mt-1 flex flex-col gap-2">{s.msgs.map((m) => <Bubble key={m.id} m={m} showPinyin />)}</ul>
        </section>
        <button type="button" onClick={onExit} className="min-h-11 w-fit rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">{exitLabel}</button>
      </div>
    );
    return summaryModal ? <RoleplaySummaryModal label={`Tổng kết: ${scenario.title}`} onClose={onExit}>{summary}</RoleplaySummaryModal> : summary;
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
      <ul className="flex flex-col gap-2" aria-live="polite">{s.msgs.map((m) => <Bubble key={m.id} m={m} showPinyin={showPinyin} onWord={setTapped} active={tapped} />)}</ul>
      {tapped && <WordTapPanel key={tapped} term={tapped} onLooked={onLooked} onClose={() => setTapped(null)} />}
      {s.pending && s.status === "thinking" && <ThinkingBubble said={s.pending} />}
      {s.error && <p role="alert" className="text-center text-body-md text-error">{ERROR_TEXT[s.error]}{s.error === "failed" && s.pending && <> <button type="button" onClick={s.retry} className="ml-1 min-h-11 font-bold underline">Thử lại</button></>}</p>}
      {typingNow && !(s.error === "rate_limited" || s.error === "account_required") && (
        <>
          <SpeakBox phase={s.speak.phase} error={s.speak.error} typingOnly={typingOnly} onStart={() => { s.clearError(); void s.speak.start(); }} onStop={() => void s.speak.stop()} onType={(t) => s.submit(t)} startLabel="Bấm để nói" />
          {lastAi?.tips && lastAi.tips.length > 0 && (
            <div className="text-center">
              <button type="button" onClick={() => setShowTips((v) => !v)} aria-expanded={showTips} className="min-h-11 px-3 text-label-lg font-bold text-primary underline">{showTips ? "Ẩn gợi ý" : "Bí rồi? Xem gợi ý câu nói"}</button>
              {showTips && (
                <ul className="mt-2 flex flex-col items-center gap-2">
                  {lastAi.tips.map((t) => (
                    <li key={t.zh} className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-surface-container-lowest px-space-sm py-2">
                      <span lang="zh-Hans" className="text-headline-md font-bold leading-[2.3]"><RubyLine zh={t.zh} pinyin={t.pinyin} show /></span>
                      <PronounceButton text={t.zh} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
