"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { submitVideoStudy } from "@/lib/practice/submit-video-study";
import { recognitionSupported, startMicRecording, startRecognition, type MicRecording } from "@/lib/practice/mic-recording";
import { compareDictation, type DictationResult } from "@/lib/video/dictation";
import type { LessonLine } from "@/lib/video/video-lesson-types";
import { useLineClip } from "./use-line-clip";

export type ShadowPhase = "idle" | "listening" | "recording";

export interface ShadowAttempt {
  url: string;
  /** Chữ máy nghe được (rỗng khi trình duyệt không nhận dạng được hoặc không nghe ra). */
  heard: string;
  /** Chấm sơ bộ theo số chữ Hán nghe đúng; null khi không có chữ nhận dạng. */
  result: DictationResult | null;
  at: number;
}

const MAX_ATTEMPTS = 3;
/** Điểm nhận dạng từ mức này trở lên được tính là nói tốt khi ghi nhận hoạt động học. */
const SHADOW_GOOD_SCORE = 0.6;
const SLOW_RATE = 0.75;
/** Thời gian ghi tự động sau câu mẫu = độ dài câu (theo tốc độ phát) cộng thêm chừng này giây. */
const TAIL_SECONDS = 1.5;

/**
 * Một lượt luyện nói theo câu của video: nghe mẫu rồi tự ghi âm giọng người học ("Bắt đầu lượt"), hoặc nghe mẫu / ghi âm riêng lẻ, rồi nghe lại
 * giọng mình và so với mẫu. Có nhận dạng giọng nói (Chrome/Edge) thì chấm sơ bộ theo số chữ Hán nghe đúng. Ghi âm chỉ giữ trong trình duyệt.
 */
export function useShadowingTurn(controller: PlayerController | null, line: LessonLine | undefined, slow: boolean) {
  const clip = useLineClip(controller);
  const [phase, setPhase] = useState<ShadowPhase>("idle");
  const [loop, setLoop] = useState(false);
  const [heardLive, setHeardLive] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<number, ShadowAttempt[]>>({});
  const rec = useRef<MicRecording | null>(null);
  const recognition = useRef<{ stop(): void } | null>(null);
  const heard = useRef("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef(loop);
  useEffect(() => { loopRef.current = loop; }, [loop]);
  const canRecognize = typeof window !== "undefined" && recognitionSupported();
  const rate = slow ? SLOW_RATE : 1;

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setCountdown(0);
  };

  const stopRecording = useCallback(async () => {
    clearTimer();
    const current = rec.current;
    rec.current = null;
    recognition.current?.stop();
    recognition.current = null;
    if (!current || !line) { setPhase("idle"); return; }
    const blob = await current.stop();
    await new Promise((r) => setTimeout(r, 450)); // chờ kết quả nhận dạng cuối cùng
    const text = heard.current.trim();
    const attempt: ShadowAttempt = {
      url: URL.createObjectURL(blob), heard: text, at: Date.now(),
      result: canRecognize && text ? compareDictation(text, line, "hanzi") : null,
    };
    setAttempts((all) => {
      const list = [attempt, ...(all[line.idx] ?? [])];
      list.slice(MAX_ATTEMPTS).forEach((a) => URL.revokeObjectURL(a.url));
      return { ...all, [line.idx]: list.slice(0, MAX_ATTEMPTS) };
    });
    void submitVideoStudy("shadowing", (attempt.result?.score ?? 0) >= SHADOW_GOOD_SCORE);
    setPhase("idle");
  }, [line, canRecognize]);

  const beginRecording = useCallback(async (autoStopSec?: number) => {
    setMicError(null);
    heard.current = "";
    setHeardLive("");
    try {
      rec.current = await startMicRecording();
    } catch (e) {
      setMicError((e as { name?: string })?.name === "NotAllowedError"
        ? "Trình duyệt chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ để cho phép."
        : "Không mở được micro.");
      setPhase("idle");
      return;
    }
    if (canRecognize) recognition.current = startRecognition((text) => { heard.current = text; setHeardLive(text); });
    setPhase("recording");
    if (autoStopSec) {
      const until = Date.now() + autoStopSec * 1000;
      setCountdown(Math.ceil(autoStopSec));
      timer.current = setInterval(() => {
        const left = (until - Date.now()) / 1000;
        if (left <= 0) void stopRecording();
        else setCountdown(Math.ceil(left));
      }, 100);
    }
  }, [canRecognize, stopRecording]);

  /** Một lượt: phát câu mẫu rồi tự ghi âm trong khoảng bằng câu mẫu cộng ít giây. Phát chỉ bắt đầu từ thao tác của người dùng (trình duyệt chặn tự phát). */
  const runTurn = useCallback(() => {
    if (!line) return;
    setPhase("listening");
    clip.play(line.start, line.end, rate, () => void beginRecording((line.end - line.start) / rate + TAIL_SECONDS));
  }, [beginRecording, clip, line, rate]);

  const listen = useCallback(() => {
    if (!line) return;
    setPhase("idle");
    const again = () => clip.play(line.start, line.end, rate, () => { if (loopRef.current) again(); });
    again();
  }, [clip, line, rate]);

  const playMine = useCallback((url: string, after?: () => void) => {
    audio.current?.pause();
    const a = new Audio(url);
    audio.current = a;
    a.onended = () => after?.();
    void a.play();
  }, []);

  /** Nghe mẫu rồi nghe giọng mình ngay sau đó để so sánh. */
  const compare = useCallback((url: string) => {
    if (!line) return;
    clip.play(line.start, line.end, rate, () => setTimeout(() => playMine(url), 300));
  }, [clip, line, playMine, rate]);

  /** Dừng mọi thứ đang chạy (khi sang câu khác hoặc rời tab). */
  const stopAll = useCallback(() => {
    clip.stop();
    controller?.pause();
    audio.current?.pause();
    void stopRecording();
  }, [clip, controller, stopRecording]);

  const latest = useRef(attempts);
  useEffect(() => { latest.current = attempts; }, [attempts]);
  useEffect(() => () => {
    clearTimer();
    recognition.current?.stop();
    void rec.current?.stop();
    audio.current?.pause();
    Object.values(latest.current).flat().forEach((a) => URL.revokeObjectURL(a.url));
  }, []);

  return { phase, loop, setLoop, heardLive, countdown, micError, canRecognize, attempts, runTurn, listen, beginRecording, stopRecording, playMine, compare, stopAll };
}
