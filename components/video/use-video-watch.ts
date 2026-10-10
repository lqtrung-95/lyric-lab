"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { WordSelection } from "@/components/listen/lyric-line-row";
import { useTermLookup } from "@/components/listen/use-term-lookup";
import { usePlaybackSync } from "@/components/listen/use-playback-sync";
import { useListenShortcuts } from "@/components/listen/use-listen-shortcuts";
import { defaultRepeatConfig, type RepeatConfig } from "@/lib/listen/repeat-config";
import { itemKey, type CardSnapshot } from "@/lib/user-state/learner-state";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { lessonLinesToAnalyzed } from "@/lib/video/lesson-to-lines";
import type { LessonDetail } from "@/lib/video/video-repo";

/**
 * Trạng thái và hành động của tab Phụ đề: bản chép chạy theo thời gian, lặp câu, tra từ rồi lưu thẻ, báo bản dịch sai. Trình phát do màn học video
 * giữ và truyền vào (dùng chung với hai tab luyện). `active` bật phím tắt chỉ khi đang ở tab này, để không tranh phím với ô gõ của tab Nghe – chép.
 */
export function useVideoWatch(lesson: LessonDetail, controller: PlayerController | null, startAt: number | undefined, active: boolean) {
  // Bản dịch AI vừa dịch lại sau khi người học báo sai: thay ngay trên màn này mà không cần tải lại bài.
  const [retranslated, setRetranslated] = useState<Record<number, string>>({});
  const lines = useMemo(() => lessonLinesToAnalyzed(lesson.lines).map((l) => (retranslated[l.index] ? { ...l, translation: retranslated[l.index] } : l)), [lesson.lines, retranslated]);
  const { prefs, update } = useListenPrefs();
  const learner = useLearnerState();
  const [loopIndex, setLoopIndex] = useState<number | null>(null);
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(defaultRepeatConfig);
  const [word, setWord] = useState<WordSelection | null>(null);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const [reportToast, setReportToast] = useState<string | null>(null);
  // Dòng đang chờ xác nhận báo sai: báo là AI dịch lại và bản mới hiện cho mọi người, nên hỏi lại để tránh bấm nhầm (nút cờ nằm cạnh nút chia sẻ).
  const [confirmReport, setConfirmReport] = useState<number | null>(null);
  const reporting = useRef(new Set<number>());
  const onRepeatsExhausted = useCallback(() => setLoopIndex(null), []);
  const { currentIndex, playing, cancelPendingResume } = usePlaybackSync(controller, lines, loopIndex, repeatConfig, onRepeatsExhausted);
  const lookup = useTermLookup(lesson.videoId, word);
  const savedKeys = useMemo(() => new Set(learner.state.saved.map((s) => s.key)), [learner.state.saved]);

  // `active` trong deps: các tab luyện đổi tốc độ phát tạm thời, quay lại tab Phụ đề thì trả về tốc độ người học đã chọn.
  useEffect(() => { if (active) controller?.setRate(prefs.rate); }, [controller, prefs.rate, active]);
  useEffect(() => { if (controller && startAt) controller.seekTo(startAt); }, [controller, startAt]);

  const pause = useCallback(() => {
    cancelPendingResume();
    controller?.pause();
  }, [cancelPendingResume, controller]);

  const seekToLine = useCallback((index: number) => {
    const line = lines[index];
    if (!controller || !line) return;
    controller.seekTo(line.start);
    controller.play();
    setLoopIndex((prev) => (prev === null ? prev : index));
  }, [controller, lines]);

  const togglePlay = useCallback(() => {
    if (!controller) return;
    if (controller.isPlaying()) controller.pause();
    else controller.play();
  }, [controller]);

  const toggleLoop = useCallback(() => setLoopIndex((prev) => (prev !== null ? null : currentIndex >= 0 ? currentIndex : 0)), [currentIndex]);

  const toggleAutoScroll = useCallback(() => {
    const next = !prefs.autoScroll;
    update({ autoScroll: next });
    setPinToast(next ? "Đã bỏ ghim: phụ đề tự cuộn theo câu đang phát" : "Đã ghim: phụ đề sẽ không tự cuộn theo câu đang phát nữa");
  }, [prefs.autoScroll, update]);

  const reportTranslation = useCallback(async (index: number) => {
    if (reporting.current.has(index)) return;
    reporting.current.add(index);
    setReportToast("Đang nhờ AI dịch lại câu này…");
    const post = () => fetch(`/api/videos/${lesson.videoId}/report-translation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lineIndex: index }) });
    try {
      await ensureAnonymousSession();
      let res = await post();
      if (res.status === 401 && (await ensureAnonymousSession())) res = await post();
      const data = (await res.json().catch(() => ({}))) as { kind?: string; translation?: string; error?: string };
      if (res.ok && data.kind === "retranslated" && data.translation) {
        setRetranslated((prev) => ({ ...prev, [index]: data.translation! }));
        setReportToast("Đã dịch lại câu này. Cảm ơn bạn đã báo!");
      } else if (res.ok && data.kind === "duplicate") setReportToast("Bạn đã báo câu này rồi.");
      else if (res.ok) setReportToast("Đã ghi nhận, quản trị viên sẽ xem lại bản dịch này.");
      else if (data.error === "user_limit") setReportToast("Hôm nay bạn đã báo nhiều rồi, mai báo tiếp nhé.");
      else setReportToast("Chưa gửi được báo cáo, thử lại sau nhé.");
    } catch {
      setReportToast("Chưa gửi được báo cáo, thử lại sau nhé.");
    } finally {
      reporting.current.delete(index);
    }
  }, [lesson.videoId]);

  const selectWord = useCallback((selection: WordSelection) => {
    pause();
    setWord(selection);
  }, [pause]);

  const saveWord = (term: string, snapshot: CardSnapshot) => {
    if (!word) return;
    learner.toggleSaved({
      key: itemKey({ type: "vocab", term }), videoId: lesson.videoId, type: "vocab", term,
      lineIndex: word.lineIndex, start: lines[word.lineIndex]?.start ?? 0, savedAt: Date.now(), ...snapshot,
    });
  };

  const shortcuts = useMemo(() => ({
    togglePlay, toggleLoop,
    prevLine: () => seekToLine(Math.max(0, currentIndex - 1)),
    nextLine: () => seekToLine(Math.min(lines.length - 1, currentIndex + 1)),
    replayLine: () => { if (currentIndex >= 0) seekToLine(currentIndex); },
    togglePinyin: () => update({ showPinyin: !prefs.showPinyin }),
    toggleTranslation: () => update({ showTranslation: !prefs.showTranslation }),
  }), [togglePlay, toggleLoop, seekToLine, currentIndex, lines.length, update, prefs.showPinyin, prefs.showTranslation]);
  useListenShortcuts(shortcuts, active);

  const savedTerm = word ? (lookup.entry?.ok && lookup.entry.value ? lookup.entry.value.term : word.term) : "";


  const stopLoop = useCallback(() => setLoopIndex(null), []);

  return {
    stopLoop, lines, prefs, update, currentIndex, playing, loopIndex, repeatConfig, setRepeatConfig, toggleLoop, togglePlay, toggleAutoScroll, seekToLine, pause,
    pinToast, setPinToast, reportToast, setReportToast, confirmReport, setConfirmReport, reportTranslation, word, setWord, selectWord, saveWord, savedTerm, savedKeys, lookup,
  };
}
