export type SfxKind = "correct" | "wrong" | "complete" | "xp" | "quest" | "streak" | "levelup" | "perfect" | "fail" | "tap";
export interface SfxNote { /** Tần số (Hz). */ freq: number; /** Thời điểm bắt đầu, giây tính từ lúc phát. */ at: number; /** Độ dài (giây). */ dur: number; type: OscillatorType; /** Âm lượng đỉnh (0–1); luôn rất nhỏ để không át giọng đọc. */ gain: number; /** Thêm một lớp bồi âm quãng tám cao, nhỏ hơn, cho tiếng "chuông" tròn và sáng hơn. */ bell?: boolean }

const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568, B6 = 1975.5;

/** Ba hiệu ứng ngắn tổng hợp bằng Web Audio (không tải file): "ting" hai nốt đi lên khi đúng, "bộp" trầm đi xuống khi sai, vài nốt rải khi qua chặng. Mọi hiệu ứng dưới nửa giây (trừ lúc qua chặng ~0.5s). */
/** Tỉ lệ cao độ theo số câu đúng liên tiếp (thang ngũ cung): mỗi câu đúng liền nhau "ting" cao hơn một nấc, tối đa một quãng tám. */
const COMBO_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
export const comboRatio = (combo: number): number => COMBO_RATIOS[Math.max(0, Math.min(COMBO_RATIOS.length - 1, combo))];

export function sfxNotes(kind: SfxKind, combo = 0): SfxNote[] {
  switch (kind) {
    case "correct": { const r = comboRatio(combo); return [{ freq: C6 * r, at: 0, dur: 0.1, type: "sine", gain: 0.06, bell: true }, { freq: E6 * r, at: 0.09, dur: 0.2, type: "sine", gain: 0.06, bell: true }]; }
    // Chạm chọn: tiếng "tách" rất khẽ.
    case "tap": return [{ freq: 880, at: 0, dur: 0.04, type: "sine", gain: 0.03 }];
    // Đạt 100%: rải lên rồi chốt bằng hợp âm, dài nhất bộ hiệu ứng làm bài (dưới 0,9 giây).
    case "perfect": return ([C5, E5, G5, C6].map((freq, i) => ({ freq, at: i * 0.08, dur: 0.14, type: "triangle" as const, gain: 0.065, bell: true })) as SfxNote[]).concat([C6, E6, G6].map((freq) => ({ freq, at: 0.34, dur: 0.5, type: "sine" as const, gain: 0.05, bell: true })));
    // Chưa đạt: hai nốt đi xuống nhẹ nhàng (không chê trách như tiếng "sai").
    case "fail": return [G5, E5, C5].map((freq, i) => ({ freq, at: i * 0.12, dur: i === 2 ? 0.32 : 0.14, type: "sine" as const, gain: 0.055 }));
    case "wrong": return [{ freq: 196, at: 0, dur: 0.12, type: "triangle", gain: 0.08 }, { freq: 147, at: 0.1, dur: 0.2, type: "triangle", gain: 0.08 }];
    case "complete": return [C5, E5, G5, C6].map((freq, i) => ({ freq, at: i * 0.09, dur: i === 3 ? 0.28 : 0.12, type: "sine" as const, gain: 0.06, bell: true }));
    // Nhận XP: hai nốt cao liền nhau như đồng xu "ting-ting".
    case "xp": return [{ freq: G6, at: 0, dur: 0.08, type: "triangle", gain: 0.07 }, { freq: B6, at: 0.07, dur: 0.22, type: "triangle", gain: 0.07 }];
    // Hoàn thành nhiệm vụ: ba nốt rải lên, nốt cuối ngân.
    case "quest": return [E5, G5, C6].map((freq, i) => ({ freq, at: i * 0.1, dur: i === 2 ? 0.34 : 0.12, type: "triangle" as const, gain: 0.07 }));
    // Tăng chuỗi ngày: giai điệu ấm đi lên.
    case "streak": return [G5, C6, E6].map((freq, i) => ({ freq, at: i * 0.08, dur: i === 2 ? 0.3 : 0.1, type: "sine" as const, gain: 0.07 }));
    // Lên cấp hoặc nhận huy hiệu: năm nốt rải đi lên, dài nhất trong các hiệu ứng.
    case "levelup": return [C5, E5, G5, C6, E6].map((freq, i) => ({ freq, at: i * 0.09, dur: i === 4 ? 0.5 : 0.14, type: "triangle" as const, gain: 0.075 }));
  }
}
