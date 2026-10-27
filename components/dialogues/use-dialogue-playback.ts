"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playChineseSequence, setChinesePlaybackRate, stopChinese } from "@/lib/speech/play-chinese";

interface Options {
  zh: readonly string[];
  who: readonly number[];
  /** Lặp đi lặp lại câu đang chọn thay vì đọc tiếp. */
  loop: boolean;
  /** Vai người học đóng (0/1) hoặc null: câu của vai này không được máy đọc, dừng chờ người học nói. */
  myRole: number | null;
  rate: number;
}

/**
 * Điều khiển phát hội thoại từng câu: đọc nối tiếp từ câu đang chọn, lặp một câu, và khi người học đóng vai thì dừng ở câu của họ ("đến lượt bạn").
 * Mỗi lượt phát có số riêng (`run`); báo cũ của lượt đã bị thay thế hoặc dừng thì bỏ qua.
 */
export function useDialoguePlayback({ zh, who, loop, myRole, rate }: Options) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const run = useRef(0);
  const restart = useRef<(from: number) => void>(() => undefined);
  const last = zh.length - 1;
  const mine = useCallback((i: number) => myRole !== null && who[i] === myRole, [myRole, who]);

  useEffect(() => { setChinesePlaybackRate(rate); }, [rate]);
  useEffect(() => () => { run.current++; stopChinese(); }, []);

  const stop = useCallback(() => { run.current++; stopChinese(); setPlaying(false); }, []);

  const start = useCallback((from: number) => {
    const id = ++run.current;
    stopChinese();
    setIndex(from);
    if (mine(from)) { setPlaying(false); return; } // đến lượt người học
    const seq: number[] = [];
    for (let j = from; j <= last && !mine(j) && (!loop || j === from); j++) seq.push(j);
    setPlaying(true);
    void playChineseSequence(seq.map((k) => zh[k]), (k) => {
      if (id !== run.current) return;
      if (k >= 0) { setIndex(seq[k]); return; }
      // Hết lượt đọc tự nhiên (không bị dừng): lặp lại, hoặc dừng; nếu câu kế là của người học thì chọn sẵn câu đó.
      if (loop) { restart.current(from); return; }
      const next = seq[seq.length - 1] + 1;
      if (next <= last) setIndex(next);
      setPlaying(false);
    });
  }, [last, loop, mine, zh]);

  useEffect(() => { restart.current = start; }, [start]);

  const toggle = useCallback(() => (playing ? stop() : start(index)), [index, playing, start, stop]);
  const go = useCallback((i: number) => {
    const to = Math.min(last, Math.max(0, i));
    // Đang nghe hoặc đang đến lượt người học thì sang câu mới là đọc tiếp luôn.
    if (playing || mine(index)) start(to);
    else { stop(); setIndex(to); }
  }, [index, last, mine, playing, start, stop]);

  return { index, playing, yourTurn: mine(index), toggle, go, stop, atStart: index === 0, atEnd: index === last };
}
