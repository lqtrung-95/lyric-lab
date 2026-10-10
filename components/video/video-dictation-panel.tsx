"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { pinyinHint } from "@/lib/practice/pinyin-answer";
import { compareDictation, dictationLines, expectedUnits, isPassing, type DictationMode, type DictationResult } from "@/lib/video/dictation";
import { dictationKey, emptyDictationProgress, firstUndone, parseDictationProgress, summarizeProgress, withScore, type DictationProgress } from "@/lib/video/dictation-progress";
import type { LessonDetail } from "@/lib/video/video-repo";
import { DictationFeedback } from "./dictation-feedback";
import { DictationSummary } from "./dictation-summary";
import { useLineClip } from "./use-line-clip";

const MODES: { id: DictationMode; label: string }[] = [{ id: "pinyin", label: "Gõ pinyin" }, { id: "hanzi", label: "Gõ chữ Hán" }];
const SLOW_RATE = 0.75;

function readProgress(videoId: string): DictationProgress {
  try {
    return parseDictationProgress(localStorage.getItem(dictationKey(videoId)));
  } catch {
    return emptyDictationProgress;
  }
}

/**
 * Chép chính tả theo video: nghe từng câu (nghe lại và phát chậm tùy ý), gõ pinyin hoặc chữ Hán, kiểm tra từng chữ rồi sang câu kế.
 * Là một tab của màn học video: khung video (luôn hiện theo điều khoản YouTube) và tiêu đề do màn cha dựng, tab này dùng chung trình phát qua `controller`.
 * Tiến độ lưu trong trình duyệt theo từng video.
 */
export function VideoDictationPanel({ lesson, controller }: { lesson: LessonDetail; controller: PlayerController | null }) {
  const lines = useMemo(() => dictationLines(lesson.lines), [lesson.lines]);
  const lineIdxs = useMemo(() => lines.map((l) => l.idx), [lines]);
  const clip = useLineClip(controller);
  const [progress, setProgress] = useState<DictationProgress>(emptyDictationProgress);
  const [position, setPosition] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [hint, setHint] = useState(false);
  const [summary, setSummary] = useState(false);
  const [slow, setSlow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const listen = useCallback(() => { if (line) clip.play(line.start, line.end, slow ? SLOW_RATE : 1); }, [clip, line, slow]);

  function check(answer = typed) {
    if (!line || result) return;
    const r = compareDictation(answer, line, progress.mode);
    setResult(r);
    persist(withScore(progress, line.idx, r.score));
    clip.stop();
  }

  function next() {
    if (position + 1 >= lines.length) { setSummary(true); return; }
    setPosition(position + 1);
    setTyped(""); setResult(null); setHint(false);
    // Phát luôn câu kế: người dùng vừa bấm nên trình duyệt cho phép tự phát.
    const nextLine = lines[position + 1];
    clip.play(nextLine.start, nextLine.end, slow ? SLOW_RATE : 1);
    inputRef.current?.focus();
  }

  function changeMode(mode: DictationMode) {
    persist({ ...progress, mode });
    setTyped(""); setHint(false);
  }

  function restart() {
    persist({ mode: progress.mode, scores: {} });
    setPosition(0); setTyped(""); setResult(null); setHint(false); setSummary(false);
  }

  if (lines.length === 0) {
    return <p role="status" className="mx-auto mt-space-xl max-w-md rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Video này chưa có đủ câu để chép chính tả.</p>;
  }

  const stats = summarizeProgress(lineIdxs, progress);
  const unitCount = line ? expectedUnits(line, progress.mode).length : 0;

  return (
    <div className="flex flex-col gap-space-md">
        {summary ? (
          <DictationSummary lesson={lesson} lines={lines} progress={progress} onRestart={restart} />
        ) : (
          <>
            <div role="radiogroup" aria-label="Chế độ gõ" className="flex flex-wrap gap-1">
              {MODES.map((m) => (
                <label key={m.id} className={`flex min-h-11 cursor-pointer items-center rounded-full px-4 text-label-md font-medium ${progress.mode === m.id ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}>
                  <input type="radio" name="dictation-mode" checked={progress.mode === m.id} onChange={() => changeMode(m.id)} className="sr-only" />
                  {m.label}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-label-md font-semibold text-on-surface-variant">Câu {position + 1} / {lines.length} · đã làm {stats.done}</p>
              <div className="flex items-center gap-2">
                <button type="button" aria-pressed={slow} onClick={() => setSlow((s) => !s)} className={`min-h-11 rounded-full px-4 text-label-md font-medium ${slow ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface"}`}>Chậm {String(SLOW_RATE).replace(".", ",")}x</button>
                <button type="button" onClick={listen} disabled={!controller} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-50">
                  <Icon name="play_arrow" filled size={20} /> Nghe câu này
                </button>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (result) next(); else check(); }} className="space-y-space-sm">
              <label htmlFor="dictation-input" className="block text-label-md font-medium text-on-surface">
                Gõ lại câu bạn nghe được ({unitCount} {progress.mode === "pinyin" ? "âm tiết" : "chữ Hán"})
              </label>
              <input
                id="dictation-input" ref={inputRef} value={typed} onChange={(e) => setTyped(e.target.value)} readOnly={!!result}
                lang={progress.mode === "hanzi" ? "zh" : undefined} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} inputMode="text"
                className="min-h-14 w-full rounded-2xl bg-surface-container-high px-4 text-body-lg text-on-surface outline-none ring-2 ring-transparent focus:ring-primary read-only:opacity-70"
                placeholder={progress.mode === "pinyin" ? "ví dụ: ni3 hao3 hoặc nǐ hǎo" : "gõ chữ Hán"}
              />
              {hint && !result && line && <p role="status" className="text-label-md text-on-surface-variant">Gợi ý: {pinyinHint(expectedUnits(line, "pinyin").join(" "), 2)}</p>}
              <div className="flex flex-wrap gap-2">
                {result ? (
                  <button type="submit" autoFocus className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">{position + 1 >= lines.length ? "Xem tổng kết" : "Câu tiếp"}</button>
                ) : (
                  <>
                    <button type="submit" className="min-h-12 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container">Kiểm tra</button>
                    <button type="button" onClick={() => setHint(true)} disabled={hint} className="min-h-12 rounded-full bg-surface-container-high px-5 text-label-md font-medium text-on-surface disabled:opacity-50">Gợi ý</button>
                    <button type="button" onClick={() => { setTyped(""); check(""); }} className="min-h-12 rounded-full px-5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container">Bỏ qua câu</button>
                  </>
                )}
              </div>
            </form>
            {result && line && <DictationFeedback line={line} mode={progress.mode} typed={typed} result={result} passed={isPassing(result)} />}
          </>
        )}
    </div>
  );
}
