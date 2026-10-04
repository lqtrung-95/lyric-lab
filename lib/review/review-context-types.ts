/** Câu hát và thông tin bài cho các thẻ ôn của một video (lời lấy từ cache toàn cục, không lưu trong thẻ). */
export interface ReviewLine {
  text: string;
  pinyin: string;
  translation?: string;
  start: number;
  end: number;
}

export interface ReviewContext {
  videoId: string;
  title: string;
  artist: string;
  /** Độ lệch lời mặc định của bài (admin đặt), đã cộng sẵn vào `start`/`end` của `lines`. */
  lyricOffsetSec: number;
  /** Khóa là chỉ số dòng; chỉ gồm các dòng mà người dùng có thẻ tham chiếu. */
  lines: Record<number, ReviewLine>;
}
