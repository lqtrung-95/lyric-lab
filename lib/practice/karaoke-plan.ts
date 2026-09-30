import { shiftLines } from "@/lib/listen/lyric-offset";

export const KARAOKE_LEAD_SEC = 3;
const SHOW_EARLY_SEC = 0.2;

export interface KaraokeLine {
  text: string;
  start: number;
  end: number;
  /** Có sẵn từ ngữ cảnh câu (ReviewLine) — dùng để hiện gợi ý pinyin/nghĩa cả câu khi người chơi bật tùy chọn. */
  pinyin?: string;
  translation?: string;
}

export interface KaraokeCandidate<T> {
  card: T;
  line: KaraokeLine;
  videoId: string;
  /** Chỉ số dòng trong bài; hai thẻ cùng một dòng chỉ được hỏi một lần. */
  lineIndex: number;
}

export interface KaraokeStep<T> {
  card: T;
  line: KaraokeLine;
  lineIndex: number;
  /** Tua tới đây trước khi câu hát bắt đầu để người chơi nghe dẫn vào. */
  seekTo: number;
  /** Tới mốc này thì hiện ô trống (sớm hơn câu hát một chút). */
  showAt: number;
  /** Hết câu hát: ở chế độ chạy liên tục, chưa trả lời thì tính là hụt. */
  endAt: number;
}

/**
 * Kế hoạch một lượt Karaoke cho một bài: mỗi dòng có thẻ là một câu hỏi, theo thứ tự thời gian, mốc đã cộng độ lệch lời của
 * người dùng. Hai thẻ cùng một dòng chỉ hỏi thẻ đầu (thẻ còn lại để các chế độ khác). Chỉ các dòng có thẻ nên không lộ cả bài hát.
 */
export function planKaraoke<T>(candidates: KaraokeCandidate<T>[], videoId: string, offset: number): KaraokeStep<T>[] {
  const seen = new Set<number>();
  const steps: KaraokeStep<T>[] = [];
  for (const c of candidates) {
    if (c.videoId !== videoId || seen.has(c.lineIndex)) continue;
    seen.add(c.lineIndex);
    const line = shiftLines([c.line], offset)[0];
    steps.push({
      card: c.card, line, lineIndex: c.lineIndex,
      seekTo: Math.max(0, line.start - KARAOKE_LEAD_SEC),
      showAt: Math.max(0, line.start - SHOW_EARLY_SEC),
      endAt: line.end,
    });
  }
  return steps.sort((a, b) => a.line.start - b.line.start);
}

/** Các bài có thể chơi Karaoke (từ 2 câu hỏi trở lên), bài nhiều câu hỏi nhất trước. */
export function karaokeSongs<T>(candidates: KaraokeCandidate<T>[], titles: Record<string, string>): { videoId: string; title: string; questions: number }[] {
  const lines = new Map<string, Set<number>>();
  for (const c of candidates) lines.set(c.videoId, (lines.get(c.videoId) ?? new Set()).add(c.lineIndex));
  return [...lines]
    .map(([videoId, set]) => ({ videoId, title: titles[videoId] || "Bài hát", questions: set.size }))
    .filter((s) => s.questions >= 2)
    .sort((a, b) => b.questions - a.questions);
}
