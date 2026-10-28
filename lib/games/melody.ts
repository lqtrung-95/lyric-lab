import { isArcadeMuted } from "./arcade-sfx";
import { getAudioContext } from "./audio-context";

// Giai điệu "Mạt Lỵ Hoa" (茉莉花, dân ca Trung Quốc, thuộc phạm vi công cộng) cho Nhạc rơi: mỗi lần chạm đúng phát nốt kế tiếp, nên chơi đúng là "đánh" được bài hát.
// Ghi bằng số nửa cung so với nốt Đô giữa (C4); gam ngũ cung nên chạm nhịp nào nghe cũng êm.
const MELODY = [4, 4, 7, 9, 12, 9, 7, 7, 4, 7, 9, 7, 4, 4, 7, 9, 12, 9, 7, 7, 4, 7, 9, 7, 7, 7, 4, 7, 9, 12, 9, 7, 4, 2, 4, 2, 0];

/** Nốt thứ `i` của giai điệu (lặp vòng). */
export const melodyNote = (i: number): number => MELODY[((i % MELODY.length) + MELODY.length) % MELODY.length];
export const melodyLength = MELODY.length;
export const noteFrequency = (semitonesFromC4: number): number => 261.63 * 2 ** (semitonesFromC4 / 12);

/** Phát một nốt nhạc ngắn (sóng tam giác, tắt dần), tôn trọng công tắc âm thanh của game. Phải gọi sau thao tác người dùng; mọi lỗi âm thanh bị nuốt vì đây chỉ là phần thưởng. */
export function playNote(semitonesFromC4: number): void {
  try {
    if (isArcadeMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = noteFrequency(semitonesFromC4);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  } catch { /* không có âm thanh: bỏ qua */ }
}
