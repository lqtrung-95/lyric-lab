"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { compareDictation, detectTypedMode, dictationLines, expectedUnits, isPassing, type DictationMode, type DictationResult } from "@/lib/video/dictation";
import { dictationKey, emptyDictationProgress, firstUndone, parseDictationProgress, summarizeProgress, withScore, type DictationProgress } from "@/lib/video/dictation-progress";
import type { LessonDetail } from "@/lib/video/video-repo";
import { submitVideoStudy } from "@/lib/practice/submit-video-study";
import { DictationFeedback } from "./dictation-feedback";
import { DictationProgressGrid } from "./dictation-progress-grid";
import { DictationSummary } from "./dictation-summary";
import { useLineClip } from "./use-line-clip";

type HintLevel = "none" | "count" | "pinyin";
const HINTS: { id: HintLevel; label: string }[] = [{ id: "none", label: "Không gợi ý" }, { id: "count", label: "Số chữ" }, { id: "pinyin", label: "Pinyin" }];
const SLOW_RATE = 0.75;
const secondary = "min-h-11 rounded-full border border-outline-variant px-4 text-label-md font-medium text-on-surface hover:bg-surface-container disabled:opacity-50";

function readProgress(videoId: string): DictationProgress {
  try {
    return parseDictationProgress(localStorage.getItem(dictationKey(videoId)));
  } catch {
    return emptyDictationProgress;
  }
}

/**
 * Tab Nghe – chép: nghe từng câu (nghe lại và phát chậm tùy ý), gõ lại bằng chữ Hán HOẶC pinyin trong cùng một ô (tự nhận theo điều gõ), kiểm tra từng chữ
 * rồi sang câu kế. Lưới chấm cho thấy cả bài và nhảy tới câu bất kỳ; gợi ý theo ba mức; "Xem đáp án" bỏ qua câu mà vẫn thấy đáp án. Dùng chung trình phát của
 * màn học video (`controller`). Tiến độ lưu trong trình duyệt theo từng video.
 */
export function VideoDictationPanel({ lesson, controller }: { lesson: LessonDetail; controller: PlayerController | null }) {
  const lines = useMemo(() => dictationLines(lesson.lines), [lesson.lines]);
  const lineIdxs = useMemo(() => lines.map((l) => l.idx), [lines]);
  const clip = useLineClip(controller);
  const [progress, setProgress] = useState<DictationProgress>(emptyDictationProgress);
  const [position, setPosition] = useState(0);
  const [typed, setTyped] = useState("");
  const [checked, setChecked] = useState<{ result: DictationResult; mode: DictationMode } | null>(null);
  const [hint, setHint] = useState<HintLevel>("none");
  const [plays, setPlays] = useState(0);
  const [summary, setSummary] = useState(false);
  const [slow, setSlow] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const line = lines[position];

  // Đọc tiến độ đã lưu (sau khi tải, tránh lệch giữa server và client) và đứng ở câu đầu tiên chưa làm.
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = readProgress(lesson.videoId);
      setProgress(saved);
      const next = firstUndone(lineIdxs, saved);
      if (next < 0) setSummary(lineIdxs.length > 0);
      else setPosition(next);
    }, 0);
    return () => clearTimeout(timer);
  }, [lesson.videoId, lineIdxs]);

  const persist = useCallback((p: DictationProgress) => {
    setProgress(p);
    try { localStorage.setItem(dictationKey(lesson.videoId), JSON.stringify(p)); } catch { /* không lưu được: tiến độ chỉ giữ trong phiên này */ }
  }, [lesson.videoId]);

  const listen = useCallback(() => {
    if (!line) return;
    setPlays((n) => n + 1);
    clip.play(line.start, line.end, slow ? SLOW_RATE : 1);
  }, [clip, line, slow]);

  function resetAnswer() { setTyped(""); setChecked(null); setPlays(0); }

  function check(answer = typed) {
    if (!line || checked) return;
    const mode = detectTypedMode(answer);
    const result = compareDictation(answer, line, answer.trim() ? mode : "hanzi"); // bỏ trống (xem đáp án): hiện đáp án theo chữ Hán
    setChecked({ result, mode: answer.trim() ? mode : "hanzi" });
    persist(withScore(progress, line.idx, result.score));
    void submitVideoStudy("dictation", isPassing(result));
    clip.stop();
  }

  function next() {
    if (position + 1 >= lines.length) { setSummary(true); return; }
    setPosition(position + 1);
    resetAnswer();
    // Phát luôn câu kế: người dùng vừa bấm nên trình duyệt cho phép tự phát.
    const nextLine = lines[position + 1];
    setPlays(1);
    clip.play(nextLine.start, nextLine.end, slow ? SLOW_RATE : 1);
    inputRef.current?.focus();
  }

  function jump(to: number) {
    clip.stop();
    controller?.pause();
    setSummary(false);
    setPosition(to);
    resetAnswer();
  }

  function restart() {
    persist({ scores: {} });
    jump(0);
  }

  // Enter kiểm tra hoặc sang câu kế (không chặn khi đang gõ dở bằng bộ gõ tiếng Trung); Shift+Enter xuống dòng; Esc nghe lại.
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); if (checked) next(); else check(); }
    else if (e.key === "Escape") { e.preventDefault(); listen(); }
  }

  if (lines.length === 0) {
    return <p role="status" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Video này chưa có đủ câu để chép chính tả.</p>;
  }

  const stats = summarizeProgress(lineIdxs, progress);
  const hanCount = line ? expectedUnits(line, "hanzi").length : 0;
  return (
    <div className="flex flex-col gap-space-md">
      {summary ? (
        <DictationSummary lesson={lesson} lines={lines} progress={progress} onRestart={restart} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-label-md text-on-surface-variant">
              Câu <strong className="text-on-surface">{position + 1}</strong> / {lines.length} · đã làm {stats.done} câu{stats.done > 0 && `, điểm TB ${Math.round(stats.average * 100)}`}
            </p>
            <div className="flex gap-1">
              <button type="button" onClick={() => jump(position - 1)} disabled={position === 0} className={secondary}>← Trước</button>
              <button type="button" onClick={() => jump(position + 1)} disabled={position + 1 >= lines.length} className={secondary}>Sau →</button>
            </div>
          </div>
          <DictationProgressGrid idxs={lineIdxs} scores={progress.scores} position={position} onJump={jump} />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={listen} disabled={!controller} className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
              <Icon name="play_arrow" filled size={20} /> Nghe{plays > 0 && <span className="font-normal opacity-80"> ×{plays}</span>}
            </button>
            <label className="flex min-h-11 items-center gap-2 text-label-md text-on-surface"><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="h-4 w-4 accent-primary" />Chậm 0,75×</label>
            <div role="radiogroup" aria-label="Mức gợi ý" className="flex gap-0.5 rounded-full bg-surface-container-high p-1">
              {HINTS.map((h) => (
                <label key={h.id} className={`flex min-h-9 cursor-pointer items-center rounded-full px-3 text-label-md font-medium ${hint === h.id ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <input type="radio" name="dictation-hint" checked={hint === h.id} onChange={() => setHint(h.id)} className="sr-only" />{h.label}
                </label>
              ))}
            </div>
          </div>
          {hint !== "none" && !checked && line && (
            <p role="status" className="text-label-md text-on-surface-variant">
              {hint === "count" ? `${hanCount} chữ Hán` : <>Pinyin: <span className="font-medium text-on-surface">{expectedUnits(line, "pinyin").join(" ")}</span></>}
            </p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (checked) next(); else check(); }} className="space-y-space-sm">
            <label htmlFor="dictation-input" className="sr-only">Gõ lại câu bạn nghe được, bằng chữ Hán hoặc pinyin</label>
            <textarea
              id="dictation-input" ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={onKeyDown} readOnly={!!checked} rows={3}
              autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              className="w-full resize-y rounded-2xl bg-surface-container-high px-4 py-3 text-body-lg text-on-surface outline-none ring-2 ring-transparent focus:ring-primary read-only:opacity-70"
              placeholder="Gõ lại câu vừa nghe (chữ Hán, hoặc pinyin: ni hao)…"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-label-md text-on-surface-variant">
                <kbd className="rounded border border-outline-variant px-1.5 font-mono text-label-sm">Enter</kbd> kiểm tra / câu sau · <kbd className="rounded border border-outline-variant px-1.5 font-mono text-label-sm">Esc</kbd> nghe lại
              </p>
              <div className="flex gap-2">
                {!checked && <button type="button" onClick={() => check()} className={secondary}>Xem đáp án</button>}
                {/* Một nút gửi duy nhất, chỉ đổi nhãn: thay nút khác vào đúng chỗ con trỏ đang bấm thì cú bấm "Xem đáp án" kích hoạt luôn nút mới và nhảy sang câu kế. */}
                <button type="submit" className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">
                  {checked ? (position + 1 >= lines.length ? "Xem tổng kết" : "Câu tiếp") : "Kiểm tra"}
                </button>
              </div>
            </div>
          </form>
          {checked && line && <DictationFeedback line={line} mode={checked.mode} typed={typed} result={checked.result} passed={isPassing(checked.result)} />}
        </>
      )}
    </div>
  );
}
