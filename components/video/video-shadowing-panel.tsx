"use client";

import { useMemo, useState } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { alignPinyinToText } from "@/lib/rooms/align-pinyin";
import { dictationLines } from "@/lib/video/dictation";
import { lessonLinesToAnalyzed } from "@/lib/video/lesson-to-lines";
import { TONE_TEXT_CLASS, toneOfSyllable } from "@/lib/video/pinyin-tone";
import type { LessonDetail } from "@/lib/video/video-repo";
import { ClipAdjustControls } from "./clip-adjust-controls";
import { useClipAdjust } from "./use-clip-adjust";
import { ShadowingAttempts } from "./shadowing-attempts";
import { useShadowingTurn } from "./use-shadowing-turn";
import { useVoiceFeedback } from "./use-voice-feedback";

type Layer = "hanzi" | "pinyin" | "translation";
const LAYERS: { id: Layer; label: string }[] = [{ id: "hanzi", label: "Chữ Hán" }, { id: "pinyin", label: "Pinyin" }, { id: "translation", label: "Bản dịch" }];
const secondary = "min-h-11 rounded-full border border-outline-variant px-4 text-label-md font-medium text-on-surface hover:bg-surface-container disabled:opacity-50";

/**
 * Tab Luyện nói: "Bắt đầu lượt" phát câu mẫu rồi tự ghi âm giọng người học; có thể nghe mẫu hoặc ghi âm riêng, nghe lại giọng mình và so với mẫu. Có nhận dạng
 * giọng nói (Chrome/Edge) thì chấm sơ bộ theo số chữ Hán nghe đúng. Ghi âm chỉ giữ trong trình duyệt. Dùng chung trình phát của màn học video (`controller`).
 */
export function VideoShadowingPanel({ lesson, controller }: { lesson: LessonDetail; controller: PlayerController | null }) {
  const lessonLines = useMemo(() => dictationLines(lesson.lines), [lesson.lines]);
  const lines = useMemo(() => lessonLinesToAnalyzed(lessonLines), [lessonLines]);
  const [position, setPosition] = useState(0);
  const [slow, setSlow] = useState(false);
  const [hidden, setHidden] = useState<Set<Layer>>(new Set());
  const raw = lessonLines[position];
  const clipAdjust = useClipAdjust(lesson.videoId);
  const turn = useShadowingTurn(controller, raw, slow, raw ? clipAdjust.get(raw.idx) : undefined);
  const voice = useVoiceFeedback(lesson.videoId);
  const line = lines[position];
  const toggleLayer = (l: Layer) => setHidden((h) => { const n = new Set(h); if (n.has(l)) n.delete(l); else n.add(l); return n; });
  const go = (to: number) => { turn.stopAll(); setPosition(Math.min(lines.length - 1, Math.max(0, to))); };

  if (!line || !raw) {
    return <p role="status" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Video này chưa có đủ câu để luyện nói.</p>;
  }
  const busy = turn.phase !== "idle";
  const aligned = alignPinyinToText(line.text, line.pinyin);
  const textHidden = hidden.has("hanzi") && hidden.has("pinyin");
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-label-md font-semibold text-on-surface-variant">Câu <strong className="text-on-surface">{position + 1}</strong> / {lines.length}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => go(position - 1)} disabled={position === 0} className={secondary}>← Trước</button>
          <button type="button" onClick={() => go(position + 1)} disabled={position + 1 >= lines.length} className={secondary}>Sau →</button>
        </div>
      </div>

      <section aria-label="Câu đang luyện" className="min-h-40 rounded-2xl bg-surface-container-low px-space-md py-space-lg">
        {textHidden ? (
          <p className="text-center text-body-lg text-on-surface-variant">Đã ẩn chữ, hãy nghe thật kỹ rồi nói theo.</p>
        ) : (
          <p lang="zh" className="font-serif text-[1.75rem] leading-[2.2] text-on-surface md:text-[2.25rem]">
            {aligned
              ? aligned.map((c, i) => (c.py && !hidden.has("pinyin")
                ? <ruby key={i} className="mx-0.5">{hidden.has("hanzi") ? "◯" : c.ch}<rt className={`font-sans text-label-md font-medium tracking-wide ${TONE_TEXT_CLASS[toneOfSyllable(c.py)]}`}>{c.py}</rt></ruby>
                : <span key={i}>{hidden.has("hanzi") && c.py ? "◯" : c.ch}</span>))
              : (hidden.has("hanzi") ? line.pinyin : line.text)}
          </p>
        )}
        {!hidden.has("translation") && line.translation && <p className="mt-2 text-body-md italic text-on-surface-variant">&ldquo;{line.translation}&rdquo;</p>}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={turn.runTurn} disabled={busy || !controller} className="min-h-14 rounded-2xl bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
          {turn.phase === "listening" ? "Đang phát mẫu…" : turn.phase === "recording" ? "Đang ghi…" : "Bắt đầu lượt"}
        </button>
        <button type="button" onClick={() => turn.listen()} disabled={turn.phase === "recording" || !controller} className={secondary}>Nghe mẫu</button>
        {turn.phase === "recording" ? (
          <button type="button" onClick={() => void turn.stopRecording()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-error-container px-4 text-label-md font-semibold text-on-error-container">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-error" /> Dừng{turn.countdown > 0 && ` (${turn.countdown}s)`}
          </button>
        ) : (
          <button type="button" onClick={() => void turn.beginRecording()} disabled={busy} className={`${secondary} inline-flex items-center gap-2`}>
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-error" /> Tự ghi âm
          </button>
        )}
        <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" checked={turn.loop} onChange={(e) => turn.setLoop(e.target.checked)} className="h-4 w-4 accent-primary" />Lặp mẫu</label>
        <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="h-4 w-4 accent-primary" />Chậm 0,75×</label>
      </div>
      <ClipAdjustControls adjust={clipAdjust.get(raw.idx)} onNudge={(edge, delta) => turn.listen(clipAdjust.nudge(raw.idx, edge, delta))} onReset={() => turn.listen(clipAdjust.reset(raw.idx))} />
      <p className="text-label-md text-on-surface-variant">&ldquo;Bắt đầu lượt&rdquo;: phát câu mẫu, xong tự ghi âm giọng bạn. Nói đè theo (shadow) hoặc nói ngay sau khi mẫu dừng.</p>

      {turn.micError && <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">{turn.micError}</p>}
      {!turn.canRecognize && <p role="note" className="rounded-xl bg-surface-container-low p-3 text-label-md text-on-surface-variant">Trình duyệt này không có nhận dạng giọng nói nên chỉ ghi âm để bạn tự nghe so sánh. Dùng Chrome hoặc Edge để có điểm.</p>}
      {turn.phase === "recording" && turn.canRecognize && <p lang="zh" role="status" className="rounded-xl bg-surface-container-low p-3 text-body-md">{turn.heardLive || <span className="text-on-surface-variant">Đang nghe…</span>}</p>}

      <ShadowingAttempts attempts={turn.attempts[raw.idx] ?? []} canRecognize={turn.canRecognize} onPlayMine={(url) => turn.playMine(url)} onCompare={turn.compare}
        feedback={voice.byAttempt} onFeedback={(a) => void voice.request(a.at, a.blob, raw.idx)} />
      {(turn.attempts[raw.idx]?.length ?? 0) > 0 && <p className="text-label-sm text-on-surface-variant">&ldquo;Nhờ AI nhận xét&rdquo; gửi đúng lần ghi âm đó sang AI để nghe và nhận xét; chúng tôi không lưu giọng nói của bạn.</p>}

      <div role="group" aria-label="Ẩn bớt để luyện nghe" className="flex flex-wrap items-center gap-1 border-t border-outline-variant/40 pt-space-sm">
        <span className="mr-1 text-label-md text-on-surface-variant">Hiện:</span>
        {LAYERS.map((l) => (
          <button key={l.id} type="button" aria-pressed={!hidden.has(l.id)} onClick={() => toggleLayer(l.id)}
            className={`min-h-11 rounded-full px-4 text-label-md font-medium ${hidden.has(l.id) ? "text-on-surface-variant hover:bg-surface-container" : "bg-surface-container-high text-on-surface"}`}>{l.label}</button>
        ))}
      </div>
    </div>
  );
}
