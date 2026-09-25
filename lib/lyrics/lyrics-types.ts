import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import type { ChineseScript } from "@/lib/captions/assess-lyric-quality";

export type LyricsSource = "youtube_caption" | "lrclib";

export interface VideoMeta {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSec: number;
}

/** Một bước thử lấy lời, để log và thống kê tỉ lệ thành công theo nguồn. */
export interface LyricsAttempt {
  source: LyricsSource;
  outcome: "used" | "no_data" | "low_quality" | "no_match" | "error";
  detail?: string;
}

/** Tên bài và nghệ sĩ sạch (chỉ có khi lời đến từ kho LRCLIB; tiêu đề video YouTube thường lẫn nhãn MV). */
export interface TrackInfo {
  title: string;
  artist: string;
}

export interface LyricsResult {
  source: LyricsSource;
  track?: TrackInfo;
  lines: CaptionLine[];
  script: ChineseScript;
  attempts: LyricsAttempt[];
}

export class NoLyricsError extends Error {
  constructor(public readonly attempts: LyricsAttempt[]) {
    super("Không tìm được lời bài hát dùng được cho video này");
    this.name = "NoLyricsError";
  }
}

/** Kết quả từ kho lời đồng bộ LRCLIB. */
export interface LrclibItem {
  id: number;
  trackName: string;
  artistName: string;
  duration: number;
  instrumental: boolean;
  syncedLyrics: string | null;
}

/** Dòng lời sau chuẩn hóa: `text` giữ bản gốc để hiển thị, `simplified` dùng để tra từ điển và so khớp. */
export interface NormalizedLyricLine {
  index: number;
  text: string;
  simplified: string;
  start: number;
  end: number;
  hasHan: boolean;
}
