"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";
import { Icon } from "@/components/ui/icon";
import { PLAYER_SIZE_CLASS } from "@/components/listen/player-size-class";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { pinyinHint } from "@/lib/practice/pinyin-answer";
import { compareDictation, dictationLines, expectedUnits, isPassing, type DictationMode, type DictationResult } from "@/lib/video/dictation";
import { dictationKey, emptyDictationProgress, firstUndone, parseDictationProgress, summarizeProgress, withScore, type DictationProgress } from "@/lib/video/dictation-progress";
import type { LessonDetail } from "@/lib/video/video-repo";
import { DictationFeedback } from "./dictation-feedback";
import { DictationSummary } from "./dictation-summary";
import { VideoModeNav } from "./video-mode-nav";
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
 * Khung video luôn hiện (điều khoản YouTube), người học có thể nhìn hình. Tiến độ lưu trong trình duyệt theo từng video.
 */
export function VideoDictationScreen({ lesson }: { lesson: LessonDetail }) {
  const lines = useMemo(() => dictationLines(lesson.lines), [lesson.lines]);
  const lineIdxs = useMemo(() => lines.map((l) => l.idx), [lines]);
  const { containerRef, controller, failed } = useYouTubePlayer(lesson.videoId);
  const { prefs } = useListenPrefs();
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
    <>
      <h1 className="sr-only">Chép chính tả: {lesson.title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low px-gutter py-2 md:px-6 lg:px-12">
        <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
          <Link href={`/video/${lesson.videoId}`} aria-label="Về màn xem video" className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-surface-container-high md:flex"><Icon name="arrow_back" size={22} /></Link>
          <div className="min-w-0">
            <p lang="zh" title={lesson.title} className="truncate font-serif text-headline-md text-primary">{lesson.title}</p>
            <p className="truncate text-label-sm text-on-surface-variant">Chép chính tả · {stats.done}/{stats.total} câu</p>
          </div>
        </div>
        <VideoModeNav videoId={lesson.videoId} current="dictation" />
      </div>
      <div className="mx-auto flex max-w-2xl flex-col gap-space-md px-gutter py-space-lg pb-32 md:px-6">
        <div className={`mx-auto w-full ${PLAYER_SIZE_CLASS[prefs.playerSize === "large" ? "medium" : prefs.playerSize]}`}>
          <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-xl bg-inverse-surface [&_iframe]:h-full [&_iframe]:w-full" />
          {failed && (
            <p role="alert" className="mt-2 rounded-xl bg-error-container p-3 text-label-md text-on-error-container">
              Không phát được video này.{" "}
              <a className="font-semibold underline" href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer">Mở trên YouTube</a>
            </p>
          )}
        </div>

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
              <p className="text-label-md font-semibold text-on-surface-variant">Câu {position + 1} / {lines.length}</p>
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
    </>
  );
}
