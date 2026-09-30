/** Một kết quả tìm bài hát. Chỉ metadata công khai (tên, kênh, thời lượng), không có lời. */
export interface SearchSong {
  videoId: string;
  title: string;
  channelTitle: string;
  /** Có thể thiếu khi nguồn không trả thời lượng. */
  durationSec?: number;
}

export interface SearchResponse {
  /** Bài đã được phân tích trong SongHanzi: mở là học ngay. */
  library: SearchSong[];
  /** Kết quả từ YouTube (đã lọc và xếp hạng). */
  youtube: SearchSong[];
}

/** Từ khóa hợp lệ để tìm: bỏ ký tự điều khiển và ký tự đặc biệt của bộ lọc, gộp khoảng trắng, tối đa 60 ký tự; null nếu quá ngắn. */
export function normalizeSearchQuery(raw: string): string | null {
  const q = raw.replace(/[\u0000-\u001f%_\\,()"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return q.length >= 2 ? q : null;
}
